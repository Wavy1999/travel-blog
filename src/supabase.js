import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Stories API
export const StoriesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from("stories")
      .select(
        `
        *,
        comments:comments(count),
        story_likes(count)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stories:", error);
      throw error;
    }

    // Transform the data to match your app's format
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
      comments: [], // Will load separately
      likedBy: [], // Will load separately
    }));
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("stories")
      .select(
        `
        *,
        comments(*),
        story_likes(user_id)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      ...data,
      id: data.id,
      readTime: data.read_time,
      coverImage: data.cover_image,
      author: {
        id: data.author_id,
        name: data.author_name,
        avatar: data.author_avatar,
      },
      comments: data.comments || [],
      likedBy: data.story_likes?.map((like) => like.user_id) || [],
    };
  },

  async create(story) {
    const storyData = {
      title: story.title,
      excerpt: story.excerpt,
      content: story.content,
      category: story.category,
      location: story.location,
      read_time: story.readTime,
      images: story.images,
      cover_image: story.coverImage,
      author_id: story.author.id,
      author_name: story.author.name,
      author_avatar: story.author.avatar,
    };

    const { data, error } = await supabase
      .from("stories")
      .insert([storyData])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      id: data.id,
      readTime: data.read_time,
      coverImage: data.cover_image,
      author: {
        id: data.author_id,
        name: data.author_name,
        avatar: data.author_avatar,
      },
      comments: [],
      likedBy: [],
    };
  },

  async delete(id) {
    const { error } = await supabase.from("stories").delete().eq("id", id);

    if (error) throw error;
  },

  async updateViews(id) {
    const { error } = await supabase.rpc("increment_views", { story_id: id });
    if (error) console.error("Error updating views:", error);
  },
};

// Comments API
export const CommentsAPI = {
  async getByStory(storyId) {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(comment) {
    const commentData = {
      story_id: comment.storyId,
      user_id: comment.userId,
      author: comment.author,
      avatar: comment.avatar,
      text: comment.text,
    };

    const { data, error } = await supabase
      .from("comments")
      .insert([commentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) throw error;
  },
};

// Likes API
export const LikesAPI = {
  async toggleLike(storyId, userId) {
    // Check if already liked
    const { data: existing } = await supabase
      .from("story_likes")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      // Unlike
      await supabase.from("story_likes").delete().eq("id", existing.id);

      await supabase.rpc("decrement_likes", { story_id: storyId });
      return { liked: false };
    } else {
      // Like
      await supabase
        .from("story_likes")
        .insert([{ story_id: storyId, user_id: userId }]);

      await supabase.rpc("increment_likes", { story_id: storyId });
      return { liked: true };
    }
  },

  async getUserLikes(userId) {
    const { data, error } = await supabase
      .from("story_likes")
      .select("story_id")
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((like) => like.story_id);
  },
};

// Bookmarks API
export const BookmarksAPI = {
  async getUserBookmarks(userId) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("story_id")
      .eq("user_id", userId);

    if (error) throw error;
    return data.map((bookmark) => bookmark.story_id);
  },

  async toggleBookmark(storyId, userId) {
    // Check if already bookmarked
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      return { bookmarked: false };
    } else {
      await supabase
        .from("bookmarks")
        .insert([{ story_id: storyId, user_id: userId }]);
      return { bookmarked: true };
    }
  },
};

// Authentication helper
export const AuthAPI = {
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
