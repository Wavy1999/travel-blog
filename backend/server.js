const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Google OAuth
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(CLIENT_ID);

// Verify Google token
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Token verification error:", error);
    throw new Error("Invalid Google token");
  }
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isAdmin: user.isAdmin || false,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Admin middleware
function isAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// ============================================
// DATABASE FUNCTIONS
// ============================================

async function getStoriesFromDB(options = {}) {
  const { category, sortBy = "newest", search, limit } = options;

  let query = supabase.from("stories").select(`
      *,
      comments(count),
      story_likes(count)
    `);

  // Apply filters
  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`
    );
  }

  // Apply sorting
  switch (sortBy) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "popular":
      query = query.order("likes", { ascending: false });
      break;
    case "comments":
      query = query.order("comments(count)", { ascending: false });
      break;
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((story) => ({
    id: story.id,
    title: story.title,
    excerpt: story.excerpt,
    content: story.content,
    category: story.category,
    location: story.location,
    date: story.date,
    readTime: story.read_time,
    images: story.images || [],
    coverImage: story.cover_image,
    author: {
      id: story.author_id,
      name: story.author_name,
      avatar: story.author_avatar,
    },
    likes: story.likes || 0,
    views: story.views || 0,
    commentsCount: story.comments?.[0]?.count || 0,
    likedBy: [], // Will load separately if needed
  }));
}

async function getStoryById(id) {
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  if (storyError) throw storyError;

  // Get comments
  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .eq("story_id", id)
    .order("created_at", { ascending: true });

  if (commentsError) throw commentsError;

  // Get likes
  const { data: likes, error: likesError } = await supabase
    .from("story_likes")
    .select("user_id")
    .eq("story_id", id);

  if (likesError) throw likesError;

  return {
    ...story,
    id: story.id,
    readTime: story.read_time,
    coverImage: story.cover_image,
    author: {
      id: story.author_id,
      name: story.author_name,
      avatar: story.author_avatar,
    },
    comments: comments || [],
    likedBy: likes?.map((like) => like.user_id) || [],
  };
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Travel Blog API is running",
    timestamp: new Date().toISOString(),
    services: {
      database: "Supabase",
      auth: "Google OAuth + JWT",
    },
  });
});

// ========== AUTHENTICATION ROUTES ==========

// Google OAuth login
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token);

    // Check if user exists in Supabase
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", googleUser.email)
      .maybeSingle();

    let user;

    if (userError && userError.code !== "PGRST116") {
      throw userError;
    }

    if (!existingUser) {
      // Create new user in Supabase
      const newUser = {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        is_admin:
          googleUser.email.includes("@admin.com") ||
          googleUser.email === "krissane.alva@gmail.com",
        created_at: new Date().toISOString(),
        story_count: 0,
        comment_count: 0,
        bookmark_count: 0,
      };

      const { data: createdUser, error: createError } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (createError) throw createError;
      user = createdUser;
      console.log("New user created in database:", user.email);
    } else {
      user = existingUser;
    }

    // Update user picture if it changed
    if (user.picture !== googleUser.picture) {
      await supabase
        .from("users")
        .update({ picture: googleUser.picture })
        .eq("id", user.id);
    }

    // Generate JWT token
    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isAdmin: user.is_admin,
    });

    // Set HTTP-only cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.is_admin,
        token: jwtToken,
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Get current user
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, email, name, picture, is_admin, created_at, story_count, comment_count, bookmark_count"
      )
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
        stats: {
          stories: user.story_count,
          comments: user.comment_count,
          bookmarks: user.bookmark_count,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// ========== STORIES ROUTES ==========

// Get all stories
app.get("/api/stories", async (req, res) => {
  try {
    const { category = "All", sortBy = "newest", search, limit } = req.query;
    const stories = await getStoriesFromDB({ category, sortBy, search, limit });
    res.json({ success: true, stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch stories" });
  }
});

// Get single story
app.get("/api/stories/:id", async (req, res) => {
  try {
    const story = await getStoryById(req.params.id);

    // Increment views
    await supabase
      .from("stories")
      .update({ views: story.views + 1 })
      .eq("id", req.params.id);

    res.json({ success: true, story });
  } catch (error) {
    console.error("Error fetching story:", error);
    if (error.code === "PGRST116") {
      res.status(404).json({ success: false, message: "Story not found" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch story" });
    }
  }
});

// Create story
app.post("/api/stories", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      location,
      readTime,
      images,
      coverImage,
    } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required",
      });
    }

    const storyData = {
      title: title.trim(),
      excerpt: excerpt?.trim() || content.substring(0, 150) + "...",
      content: content.trim(),
      category: category.trim(),
      location: location?.trim() || "Unknown Location",
      read_time:
        readTime || Math.max(1, Math.ceil(content.split(/\s+/).length / 200)),
      images: images || [],
      cover_image: coverImage || images?.[0],
      author_id: req.user.id,
      author_name: req.user.name,
      author_avatar: req.user.picture,
      likes: 0,
      views: 0,
    };

    const { data: story, error } = await supabase
      .from("stories")
      .insert([storyData])
      .select()
      .single();

    if (error) throw error;

    // Update user's story count
    await supabase.rpc("increment_user_stories", { user_id: req.user.id });

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story: {
        ...story,
        id: story.id,
        readTime: story.read_time,
        coverImage: story.cover_image,
        author: {
          id: story.author_id,
          name: story.author_name,
          avatar: story.author_avatar,
        },
        comments: [],
        likedBy: [],
      },
    });
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ success: false, message: "Failed to create story" });
  }
});

// Update story
app.put("/api/stories/:id", authenticateToken, async (req, res) => {
  try {
    const storyId = req.params.id;

    // Check if user owns the story
    const { data: story, error: fetchError } = await supabase
      .from("stories")
      .select("author_id")
      .eq("id", storyId)
      .single();

    if (fetchError) throw fetchError;

    if (story.author_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own stories",
      });
    }

    const updateData = {};
    const fields = [
      "title",
      "excerpt",
      "content",
      "category",
      "location",
      "images",
      "cover_image",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.readTime !== undefined) {
      updateData.read_time = req.body.readTime;
    }

    const { data: updatedStory, error } = await supabase
      .from("stories")
      .update(updateData)
      .eq("id", storyId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Story updated successfully",
      story: updatedStory,
    });
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ success: false, message: "Failed to update story" });
  }
});

// Delete story
app.delete("/api/stories/:id", authenticateToken, async (req, res) => {
  try {
    const storyId = req.params.id;

    // Check if user owns the story or is admin
    const { data: story, error: fetchError } = await supabase
      .from("stories")
      .select("author_id")
      .eq("id", storyId)
      .single();

    if (fetchError) throw fetchError;

    if (story.author_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own stories",
      });
    }

    const { error } = await supabase.from("stories").delete().eq("id", storyId);

    if (error) throw error;

    // Decrement user's story count
    await supabase.rpc("decrement_user_stories", { user_id: story.author_id });

    res.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ success: false, message: "Failed to delete story" });
  }
});

// ========== COMMENTS ROUTES ==========

// Get comments for a story
app.get("/api/stories/:id/comments", async (req, res) => {
  try {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("story_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch comments" });
  }
});

// Add comment
app.post("/api/stories/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const commentData = {
      story_id: req.params.id,
      user_id: req.user.id,
      author: req.user.name,
      avatar: req.user.picture,
      text: text.trim(),
    };

    const { data: comment, error } = await supabase
      .from("comments")
      .insert([commentData])
      .select()
      .single();

    if (error) throw error;

    // Update user's comment count
    await supabase.rpc("increment_user_comments", { user_id: req.user.id });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
});

// Delete comment
app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;

    // Check if user owns the comment
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id, story_id")
      .eq("id", commentId)
      .single();

    if (fetchError) throw fetchError;

    if (comment.user_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;

    // Decrement user's comment count
    await supabase.rpc("decrement_user_comments", { user_id: comment.user_id });

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete comment" });
  }
});

// ========== LIKES ROUTES ==========

// Toggle like on a story
app.post("/api/stories/:id/like", authenticateToken, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from("story_likes")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") throw checkError;

    if (existingLike) {
      // Unlike
      await supabase.from("story_likes").delete().eq("id", existingLike.id);

      await supabase.rpc("decrement_likes", { story_id: storyId });

      res.json({
        success: true,
        liked: false,
        message: "Story unliked",
      });
    } else {
      // Like
      await supabase
        .from("story_likes")
        .insert([{ story_id: storyId, user_id: userId }]);

      await supabase.rpc("increment_likes", { story_id: storyId });

      res.json({
        success: true,
        liked: true,
        message: "Story liked",
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Failed to toggle like" });
  }
});

// Get user's liked stories
app.get("/api/user/likes", authenticateToken, async (req, res) => {
  try {
    const { data: likes, error } = await supabase
      .from("story_likes")
      .select("story_id")
      .eq("user_id", req.user.id);

    if (error) throw error;

    const storyIds = likes.map((like) => like.story_id);
    res.json({ success: true, storyIds });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch likes" });
  }
});

// ========== BOOKMARKS ROUTES ==========

// Toggle bookmark
app.post("/api/stories/:id/bookmark", authenticateToken, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    // Check if already bookmarked
    const { data: existingBookmark, error: checkError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") throw checkError;

    if (existingBookmark) {
      // Remove bookmark
      await supabase.from("bookmarks").delete().eq("id", existingBookmark.id);

      await supabase.rpc("decrement_user_bookmarks", { user_id: userId });

      res.json({
        success: true,
        bookmarked: false,
        message: "Bookmark removed",
      });
    } else {
      // Add bookmark
      await supabase
        .from("bookmarks")
        .insert([{ story_id: storyId, user_id: userId }]);

      await supabase.rpc("increment_user_bookmarks", { user_id: userId });

      res.json({
        success: true,
        bookmarked: true,
        message: "Story bookmarked",
      });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to toggle bookmark" });
  }
});

// Get user's bookmarks
app.get("/api/user/bookmarks", authenticateToken, async (req, res) => {
  try {
    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select("story_id")
      .eq("user_id", req.user.id);

    if (error) throw error;

    const storyIds = bookmarks.map((bookmark) => bookmark.story_id);
    res.json({ success: true, storyIds });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookmarks" });
  }
});

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select(
        "id, email, name, picture, is_admin, created_at, story_count, comment_count, bookmark_count"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// Get system stats (admin only)
app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [
      { count: storiesCount },
      { count: usersCount },
      { count: commentsCount },
      { count: likesCount },
    ] = await Promise.all([
      supabase.from("stories").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("story_likes").select("*", { count: "exact", head: true }),
    ]);

    res.json({
      success: true,
      stats: {
        stories: storiesCount || 0,
        users: usersCount || 0,
        comments: commentsCount || 0,
        likes: likesCount || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/google`);
  console.log(`📚 Stories API: http://localhost:${PORT}/api/stories`);
});
