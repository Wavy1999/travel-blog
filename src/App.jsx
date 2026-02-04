import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// CONFIGURATION
// ============================================
const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "89220882541-b29l85mftlq2t4e8k3r2972mvgivkuo2.apps.googleusercontent.com";

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: "Krissaneadmin",
  password: "krissane2026",
};

// Default images
const DEFAULT_IMAGES = {
  author:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  cover:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop",
};

// ============================================
// DATABASE SERVICE (SQLite)
// ============================================
class DatabaseService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init() {
    try {
      // Check if SQLite is available (in browser environment)
      if (typeof window !== "undefined" && window.sqlite) {
        this.db = await window.sqlite.openDatabase({
          name: "travel_blog.db",
          version: "1.0",
          displayName: "Travel Blog Database",
          estimatedSize: 50 * 1024 * 1024, // 50MB
        });

        await this.createTables();
        this.initialized = true;
        console.log("Database initialized successfully");
        return true;
      } else {
        // Fallback to localStorage if SQLite is not available
        console.log("SQLite not available, using localStorage fallback");
        return this.initLocalStorage();
      }
    } catch (error) {
      console.error("Database initialization error:", error);
      return this.initLocalStorage();
    }
  }

  initLocalStorage() {
    try {
      // Create localStorage keys if they don't exist
      if (!localStorage.getItem("krissane_stories")) {
        localStorage.setItem("krissane_stories", JSON.stringify([]));
      }
      if (!localStorage.getItem("krissane_users")) {
        localStorage.setItem("krissane_users", JSON.stringify([]));
      }
      if (!localStorage.getItem("krissane_likes")) {
        localStorage.setItem("krissane_likes", JSON.stringify({}));
      }
      if (!localStorage.getItem("krissane_bookmarks")) {
        localStorage.setItem("krissane_bookmarks", JSON.stringify({}));
      }
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("LocalStorage initialization error:", error);
      return false;
    }
  }

  async createTables() {
    if (!this.db) return;

    try {
      // Stories table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS stories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          category TEXT,
          location TEXT,
          date TEXT,
          readTime INTEGER,
          coverImage TEXT,
          images TEXT,
          authorId TEXT,
          authorName TEXT,
          authorAvatar TEXT,
          likes INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Comments table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          storyId INTEGER,
          author TEXT,
          avatar TEXT,
          text TEXT,
          date TEXT,
          userId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (storyId) REFERENCES stories (id) ON DELETE CASCADE
        )
      `);

      // Users table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          picture TEXT,
          isAdmin BOOLEAN DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Likes table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          storyId INTEGER,
          userId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(storyId, userId)
        )
      `);

      // Bookmarks table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          storyId INTEGER,
          userId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(storyId, userId)
        )
      `);

      console.log("Tables created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
    }
  }

  // ============================================
  // STORIES OPERATIONS
  // ============================================
  async getAllStories() {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        const result = await this.db.executeSql(
          "SELECT * FROM stories ORDER BY createdAt DESC"
        );
        const stories = result.rows._array || [];

        // Get comments for each story
        for (const story of stories) {
          const commentsResult = await this.db.executeSql(
            "SELECT * FROM comments WHERE storyId = ? ORDER BY createdAt ASC",
            [story.id]
          );
          story.comments = commentsResult.rows._array || [];

          // Parse images if they're stored as JSON string
          if (story.images) {
            try {
              story.images = JSON.parse(story.images);
            } catch (e) {
              story.images = [story.coverImage];
            }
          } else {
            story.images = [story.coverImage];
          }

          // Get like count
          const likesResult = await this.db.executeSql(
            "SELECT COUNT(*) as count FROM likes WHERE storyId = ?",
            [story.id]
          );
          story.likes = likesResult.rows._array[0]?.count || 0;
        }

        return stories;
      } catch (error) {
        console.error("Error getting stories from SQLite:", error);
        return this.getStoriesFromLocalStorage();
      }
    } else {
      return this.getStoriesFromLocalStorage();
    }
  }

  async getStoryById(id) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        const result = await this.db.executeSql(
          "SELECT * FROM stories WHERE id = ?",
          [id]
        );
        const story = result.rows._array[0];

        if (story) {
          const commentsResult = await this.db.executeSql(
            "SELECT * FROM comments WHERE storyId = ? ORDER BY createdAt ASC",
            [id]
          );
          story.comments = commentsResult.rows._array || [];

          if (story.images) {
            try {
              story.images = JSON.parse(story.images);
            } catch (e) {
              story.images = [story.coverImage];
            }
          } else {
            story.images = [story.coverImage];
          }

          const likesResult = await this.db.executeSql(
            "SELECT COUNT(*) as count FROM likes WHERE storyId = ?",
            [id]
          );
          story.likes = likesResult.rows._array[0]?.count || 0;
        }

        return story;
      } catch (error) {
        console.error("Error getting story from SQLite:", error);
        return this.getStoryFromLocalStorage(id);
      }
    } else {
      return this.getStoryFromLocalStorage(id);
    }
  }

  async saveStory(story) {
    if (!this.initialized) await this.init();

    const storyData = {
      title: story.title,
      excerpt: story.excerpt,
      content: story.content,
      category: story.category,
      location: story.location,
      date: story.date,
      readTime: story.readTime,
      coverImage: story.coverImage,
      images: JSON.stringify(story.images || []),
      authorId: story.author.id,
      authorName: story.author.name,
      authorAvatar: story.author.avatar,
      likes: story.likes || 0,
      views: story.views || 0,
    };

    if (this.db) {
      try {
        if (story.id) {
          // Update existing story
          await this.db.executeSql(
            `UPDATE stories SET 
              title = ?, excerpt = ?, content = ?, category = ?, location = ?, 
              date = ?, readTime = ?, coverImage = ?, images = ?, 
              authorId = ?, authorName = ?, authorAvatar = ?, likes = ?, views = ?
            WHERE id = ?`,
            [
              storyData.title,
              storyData.excerpt,
              storyData.content,
              storyData.category,
              storyData.location,
              storyData.date,
              storyData.readTime,
              storyData.coverImage,
              storyData.images,
              storyData.authorId,
              storyData.authorName,
              storyData.authorAvatar,
              storyData.likes,
              storyData.views,
              story.id,
            ]
          );
          return story.id;
        } else {
          // Insert new story
          const result = await this.db.executeSql(
            `INSERT INTO stories (
              title, excerpt, content, category, location, date, readTime, 
              coverImage, images, authorId, authorName, authorAvatar, likes, views
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              storyData.title,
              storyData.excerpt,
              storyData.content,
              storyData.category,
              storyData.location,
              storyData.date,
              storyData.readTime,
              storyData.coverImage,
              storyData.images,
              storyData.authorId,
              storyData.authorName,
              storyData.authorAvatar,
              storyData.likes,
              storyData.views,
            ]
          );
          return result.insertId;
        }
      } catch (error) {
        console.error("Error saving story to SQLite:", error);
        return this.saveStoryToLocalStorage(story);
      }
    } else {
      return this.saveStoryToLocalStorage(story);
    }
  }

  async deleteStory(id) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        await this.db.executeSql("DELETE FROM comments WHERE storyId = ?", [
          id,
        ]);
        await this.db.executeSql("DELETE FROM likes WHERE storyId = ?", [id]);
        await this.db.executeSql("DELETE FROM bookmarks WHERE storyId = ?", [
          id,
        ]);
        await this.db.executeSql("DELETE FROM stories WHERE id = ?", [id]);
        return true;
      } catch (error) {
        console.error("Error deleting story from SQLite:", error);
        return this.deleteStoryFromLocalStorage(id);
      }
    } else {
      return this.deleteStoryFromLocalStorage(id);
    }
  }

  // ============================================
  // COMMENTS OPERATIONS
  // ============================================
  async addComment(storyId, comment) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        await this.db.executeSql(
          `INSERT INTO comments (storyId, author, avatar, text, date, userId)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            storyId,
            comment.author,
            comment.avatar,
            comment.text,
            comment.date,
            comment.userId,
          ]
        );
        return true;
      } catch (error) {
        console.error("Error adding comment to SQLite:", error);
        return this.addCommentToLocalStorage(storyId, comment);
      }
    } else {
      return this.addCommentToLocalStorage(storyId, comment);
    }
  }

  async deleteComment(commentId) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        await this.db.executeSql("DELETE FROM comments WHERE id = ?", [
          commentId,
        ]);
        return true;
      } catch (error) {
        console.error("Error deleting comment from SQLite:", error);
        return this.deleteCommentFromLocalStorage(commentId);
      }
    } else {
      return this.deleteCommentFromLocalStorage(commentId);
    }
  }

  // ============================================
  // LIKES OPERATIONS
  // ============================================
  async toggleLike(storyId, userId) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        // Check if already liked
        const checkResult = await this.db.executeSql(
          "SELECT id FROM likes WHERE storyId = ? AND userId = ?",
          [storyId, userId]
        );

        if (checkResult.rows._array.length > 0) {
          // Unlike
          await this.db.executeSql(
            "DELETE FROM likes WHERE storyId = ? AND userId = ?",
            [storyId, userId]
          );
          return false;
        } else {
          // Like
          await this.db.executeSql(
            "INSERT INTO likes (storyId, userId) VALUES (?, ?)",
            [storyId, userId]
          );
          return true;
        }
      } catch (error) {
        console.error("Error toggling like in SQLite:", error);
        return this.toggleLikeInLocalStorage(storyId, userId);
      }
    } else {
      return this.toggleLikeInLocalStorage(storyId, userId);
    }
  }

  async getUserLikes(userId) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        const result = await this.db.executeSql(
          "SELECT storyId FROM likes WHERE userId = ?",
          [userId]
        );
        return new Set(result.rows._array.map((row) => row.storyId));
      } catch (error) {
        console.error("Error getting user likes from SQLite:", error);
        return this.getUserLikesFromLocalStorage(userId);
      }
    } else {
      return this.getUserLikesFromLocalStorage(userId);
    }
  }

  // ============================================
  // BOOKMARKS OPERATIONS
  // ============================================
  async toggleBookmark(storyId, userId) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        const checkResult = await this.db.executeSql(
          "SELECT id FROM bookmarks WHERE storyId = ? AND userId = ?",
          [storyId, userId]
        );

        if (checkResult.rows._array.length > 0) {
          await this.db.executeSql(
            "DELETE FROM bookmarks WHERE storyId = ? AND userId = ?",
            [storyId, userId]
          );
          return false;
        } else {
          await this.db.executeSql(
            "INSERT INTO bookmarks (storyId, userId) VALUES (?, ?)",
            [storyId, userId]
          );
          return true;
        }
      } catch (error) {
        console.error("Error toggling bookmark in SQLite:", error);
        return this.toggleBookmarkInLocalStorage(storyId, userId);
      }
    } else {
      return this.toggleBookmarkInLocalStorage(storyId, userId);
    }
  }

  async getUserBookmarks(userId) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        const result = await this.db.executeSql(
          "SELECT storyId FROM bookmarks WHERE userId = ?",
          [userId]
        );
        return new Set(result.rows._array.map((row) => row.storyId));
      } catch (error) {
        console.error("Error getting user bookmarks from SQLite:", error);
        return this.getUserBookmarksFromLocalStorage(userId);
      }
    } else {
      return this.getUserBookmarksFromLocalStorage(userId);
    }
  }

  // ============================================
  // USERS OPERATIONS
  // ============================================
  async saveUser(user) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        await this.db.executeSql(
          `INSERT OR REPLACE INTO users (id, name, email, picture, isAdmin)
           VALUES (?, ?, ?, ?, ?)`,
          [user.id, user.name, user.email, user.picture, user.isAdmin ? 1 : 0]
        );
        return true;
      } catch (error) {
        console.error("Error saving user to SQLite:", error);
        return this.saveUserToLocalStorage(user);
      }
    } else {
      return this.saveUserToLocalStorage(user);
    }
  }

  async getUser(userId) {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        const result = await this.db.executeSql(
          "SELECT * FROM users WHERE id = ?",
          [userId]
        );
        const user = result.rows._array[0];
        if (user) {
          user.isAdmin = Boolean(user.isAdmin);
        }
        return user;
      } catch (error) {
        console.error("Error getting user from SQLite:", error);
        return this.getUserFromLocalStorage(userId);
      }
    } else {
      return this.getUserFromLocalStorage(userId);
    }
  }

  // ============================================
  // LOCALSTORAGE FALLBACK METHODS
  // ============================================
  getStoriesFromLocalStorage() {
    try {
      const stories = JSON.parse(
        localStorage.getItem("krissane_stories") || "[]"
      );
      return stories;
    } catch (error) {
      console.error("Error reading stories from localStorage:", error);
      return [];
    }
  }

  getStoryFromLocalStorage(id) {
    try {
      const stories = JSON.parse(
        localStorage.getItem("krissane_stories") || "[]"
      );
      return stories.find((story) => story.id === id) || null;
    } catch (error) {
      console.error("Error reading story from localStorage:", error);
      return null;
    }
  }

  saveStoryToLocalStorage(story) {
    try {
      const stories = JSON.parse(
        localStorage.getItem("krissane_stories") || "[]"
      );

      if (story.id) {
        // Update existing story
        const index = stories.findIndex((s) => s.id === story.id);
        if (index !== -1) {
          stories[index] = story;
        }
      } else {
        // Add new story with auto-increment ID
        const maxId =
          stories.length > 0 ? Math.max(...stories.map((s) => s.id)) : 0;
        story.id = maxId + 1;
        stories.unshift(story);
      }

      localStorage.setItem("krissane_stories", JSON.stringify(stories));
      return story.id;
    } catch (error) {
      console.error("Error saving story to localStorage:", error);
      return null;
    }
  }

  deleteStoryFromLocalStorage(id) {
    try {
      const stories = JSON.parse(
        localStorage.getItem("krissane_stories") || "[]"
      );
      const filteredStories = stories.filter((story) => story.id !== id);
      localStorage.setItem("krissane_stories", JSON.stringify(filteredStories));
      return true;
    } catch (error) {
      console.error("Error deleting story from localStorage:", error);
      return false;
    }
  }

  addCommentToLocalStorage(storyId, comment) {
    try {
      const stories = JSON.parse(
        localStorage.getItem("krissane_stories") || "[]"
      );
      const storyIndex = stories.findIndex((story) => story.id === storyId);

      if (storyIndex !== -1) {
        if (!stories[storyIndex].comments) {
          stories[storyIndex].comments = [];
        }

        const maxId =
          stories[storyIndex].comments.length > 0
            ? Math.max(...stories[storyIndex].comments.map((c) => c.id))
            : 0;
        comment.id = maxId + 1;
        stories[storyIndex].comments.push(comment);

        localStorage.setItem("krissane_stories", JSON.stringify(stories));
      }
      return true;
    } catch (error) {
      console.error("Error adding comment to localStorage:", error);
      return false;
    }
  }

  deleteCommentFromLocalStorage(commentId) {
    try {
      const stories = JSON.parse(
        localStorage.getItem("krissane_stories") || "[]"
      );

      for (let i = 0; i < stories.length; i++) {
        if (stories[i].comments) {
          const commentIndex = stories[i].comments.findIndex(
            (c) => c.id === commentId
          );
          if (commentIndex !== -1) {
            stories[i].comments.splice(commentIndex, 1);
            localStorage.setItem("krissane_stories", JSON.stringify(stories));
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error deleting comment from localStorage:", error);
      return false;
    }
  }

  toggleLikeInLocalStorage(storyId, userId) {
    try {
      const stories = JSON.parse(
        localStorage.getItem("krissane_stories") || "[]"
      );
      const storyIndex = stories.findIndex((story) => story.id === storyId);

      if (storyIndex !== -1) {
        if (!stories[storyIndex].likedBy) {
          stories[storyIndex].likedBy = [];
        }

        const likeIndex = stories[storyIndex].likedBy.indexOf(userId);
        if (likeIndex === -1) {
          // Like
          stories[storyIndex].likedBy.push(userId);
          stories[storyIndex].likes = (stories[storyIndex].likes || 0) + 1;
          localStorage.setItem("krissane_stories", JSON.stringify(stories));

          // Update likes in separate storage
          const userLikes = JSON.parse(
            localStorage.getItem(`krissane_likes_${userId}`) || "[]"
          );
          if (!userLikes.includes(storyId)) {
            userLikes.push(storyId);
            localStorage.setItem(
              `krissane_likes_${userId}`,
              JSON.stringify(userLikes)
            );
          }
          return true;
        } else {
          // Unlike
          stories[storyIndex].likedBy.splice(likeIndex, 1);
          stories[storyIndex].likes = Math.max(
            0,
            (stories[storyIndex].likes || 1) - 1
          );
          localStorage.setItem("krissane_stories", JSON.stringify(stories));

          // Update likes in separate storage
          const userLikes = JSON.parse(
            localStorage.getItem(`krissane_likes_${userId}`) || "[]"
          );
          const updatedLikes = userLikes.filter((id) => id !== storyId);
          localStorage.setItem(
            `krissane_likes_${userId}`,
            JSON.stringify(updatedLikes)
          );
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Error toggling like in localStorage:", error);
      return false;
    }
  }

  getUserLikesFromLocalStorage(userId) {
    try {
      const userLikes = JSON.parse(
        localStorage.getItem(`krissane_likes_${userId}`) || "[]"
      );
      return new Set(userLikes);
    } catch (error) {
      console.error("Error getting user likes from localStorage:", error);
      return new Set();
    }
  }

  toggleBookmarkInLocalStorage(storyId, userId) {
    try {
      const bookmarks = JSON.parse(
        localStorage.getItem(`krissane_bookmarks_${userId}`) || "[]"
      );
      const bookmarkIndex = bookmarks.indexOf(storyId);

      if (bookmarkIndex === -1) {
        // Add bookmark
        bookmarks.push(storyId);
        localStorage.setItem(
          `krissane_bookmarks_${userId}`,
          JSON.stringify(bookmarks)
        );
        return true;
      } else {
        // Remove bookmark
        bookmarks.splice(bookmarkIndex, 1);
        localStorage.setItem(
          `krissane_bookmarks_${userId}`,
          JSON.stringify(bookmarks)
        );
        return false;
      }
    } catch (error) {
      console.error("Error toggling bookmark in localStorage:", error);
      return false;
    }
  }

  getUserBookmarksFromLocalStorage(userId) {
    try {
      const bookmarks = JSON.parse(
        localStorage.getItem(`krissane_bookmarks_${userId}`) || "[]"
      );
      return new Set(bookmarks);
    } catch (error) {
      console.error("Error getting user bookmarks from localStorage:", error);
      return new Set();
    }
  }

  saveUserToLocalStorage(user) {
    try {
      const users = JSON.parse(localStorage.getItem("krissane_users") || "[]");
      const existingIndex = users.findIndex((u) => u.id === user.id);

      if (existingIndex !== -1) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }

      localStorage.setItem("krissane_users", JSON.stringify(users));
      return true;
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
      return false;
    }
  }

  getUserFromLocalStorage(userId) {
    try {
      const users = JSON.parse(localStorage.getItem("krissane_users") || "[]");
      return users.find((user) => user.id === userId) || null;
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
      return null;
    }
  }

  // ============================================
  // BACKUP & RESTORE
  // ============================================
  async exportData() {
    if (!this.initialized) await this.init();

    const data = {
      stories: await this.getAllStories(),
      users: this.db
        ? (await this.db.executeSql("SELECT * FROM users")).rows._array
        : JSON.parse(localStorage.getItem("krissane_users") || "[]"),
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      if (data.stories && Array.isArray(data.stories)) {
        for (const story of data.stories) {
          await this.saveStory(story);
        }
      }

      if (data.users && Array.isArray(data.users)) {
        for (const user of data.users) {
          await this.saveUser(user);
        }
      }

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  async clearAllData() {
    if (!this.initialized) await this.init();

    if (this.db) {
      try {
        await this.db.executeSql("DELETE FROM stories");
        await this.db.executeSql("DELETE FROM comments");
        await this.db.executeSql("DELETE FROM users");
        await this.db.executeSql("DELETE FROM likes");
        await this.db.executeSql("DELETE FROM bookmarks");
        return true;
      } catch (error) {
        console.error("Error clearing database:", error);
        return false;
      }
    } else {
      try {
        localStorage.removeItem("krissane_stories");
        localStorage.removeItem("krissane_users");
        localStorage.removeItem("krissane_likes");
        localStorage.removeItem("krissane_bookmarks");
        // Remove all user-specific like/bookmark keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key.startsWith("krissane_likes_") ||
            key.startsWith("krissane_bookmarks_")
          ) {
            localStorage.removeItem(key);
          }
        }
        return true;
      } catch (error) {
        console.error("Error clearing localStorage:", error);
        return false;
      }
    }
  }
}

// Create global database instance
const database = new DatabaseService();

// ============================================
// ICONS (Keep all your existing icons)
// ============================================
const Icons = {
  // ... (Keep all your existing icons exactly as they were)
  Plus: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Image: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  // ... (Rest of icons remain exactly the same)
  AlertTriangle: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

// ============================================
// SAMPLE DATA
// ============================================
const sampleStories = [
  {
    id: 1,
    title: "The Night Market That Changed How I See Food Forever",
    excerpt:
      "The spicy scent of street grill smoke wrapped around me as dusk settled over Baguio...",
    content: `The spicy scent of street grill smoke wrapped around me as dusk settled over Baguio. I didn't know it yet, but the next three hours would redefine everything I thought I knew about culinary adventure.

I'd been traveling through Baguio City for two weeks, exploring the local food scene, but nothing had prepared me for the sensory overload of the Night Market at Session Road.

A woman in her sixties waved me over to her stall. Her face was weathered but kind, illuminated by the warm glow of a single hanging bulb. She placed a bowl in front of me—Pinikpikan, a traditional Cordilleran dish.

That night taught me that the best meals aren't found in restaurants with Michelin stars. They're found in plastic chairs on crowded sidewalks of Baguio, shared with locals who become friends.`,
    category: "Food & Culinary",
    location: "Baguio City, Philippines",
    date: "2025-12-20",
    readTime: 8,
    images: [
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&h=800&fit=crop",
    author: {
      id: "user1",
      name: "Krissane Alva",
      avatar: DEFAULT_IMAGES.author,
    },
    likes: 234,
    likedBy: [],
    views: 1205,
    comments: [
      {
        id: 1,
        author: "Christian",
        avatar: DEFAULT_IMAGES.author,
        text: "This brought back so many memories!",
        date: "2025-12-21",
        userId: "user2",
      },
      {
        id: 2,
        author: "Jameson",
        avatar: DEFAULT_IMAGES.author,
        text: "Amazing storytelling! 🔥",
        date: "2025-12-22",
        userId: "user3",
      },
    ],
  },
  {
    id: 2,
    title: "Finding Serenity in Kyoto's Hidden Temples",
    excerpt:
      "Beyond the crowded tourist paths, I discovered ancient temples where time seemed to stand still...",
    content: `Kyoto in autumn is a palette of crimson and gold, but the real magic lies off the beaten path. While tourists flocked to Kinkaku-ji, I wandered into the quiet neighborhood of Ohara, where moss-covered steps led to Sanzen-in Temple.

The air was cool and carried the scent of incense. An elderly monk was raking the gravel garden into perfect patterns, each stroke a meditation.

In that simple act, I understood the Japanese concept of wabi-sabi—finding beauty in imperfection and transience.`,
    category: "Cultural Encounters",
    location: "Kyoto, Japan",
    date: "2025-11-15",
    readTime: 6,
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&h=800&fit=crop",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=800&fit=crop",
    author: {
      id: "user1",
      name: "Krissane Alva",
      avatar: DEFAULT_IMAGES.author,
    },
    likes: 189,
    likedBy: [],
    views: 892,
    comments: [],
  },
];

const categories = [
  "All",
  "Personal Journey",
  "Cultural Encounters",
  "Hidden Gems",
  "Food & Culinary",
  "Adventure",
  "City Exploration",
  "Nature & Wildlife",
  "Budget Travel",
];

// ============================================
// COMPONENTS (Keep all your existing components)
// ============================================

// UserAvatar component (keep as is)
const UserAvatar = ({ user, size = 32, showName = false, onClick }) => (
  <div
    style={{
      ...styles.userAvatarWrapper,
      cursor: onClick ? "pointer" : "default",
    }}
    onClick={onClick}
  >
    <img
      src={user?.picture || user?.avatar || DEFAULT_IMAGES.author}
      alt={user?.name || "User"}
      style={{ ...styles.userAvatar, width: size, height: size }}
    />
    {showName && <span style={styles.userAvatarName}>{user?.name}</span>}
  </div>
);

// NotificationCenter component (keep as is)
const NotificationCenter = ({
  notifications,
  onClear,
  onNotificationClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={styles.notificationContainer}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.notificationBtn}>
        <Icons.Bell />
        {unreadCount > 0 && (
          <span style={styles.notificationBadge}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div style={styles.notificationDropdown}>
          <div style={styles.notificationHeader}>
            <h4 style={{ margin: 0, fontSize: "1rem" }}>Notifications</h4>
            {notifications.length > 0 && (
              <button onClick={onClear} style={styles.clearAllBtn}>
                Clear all
              </button>
            )}
          </div>
          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.noNotifications}>No notifications yet</div>
            ) : (
              notifications.slice(0, 10).map((notif, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.notificationItem,
                    background: notif.read ? "white" : "#f0f7ff",
                  }}
                  onClick={() => {
                    onNotificationClick(notif);
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={notif.avatar || DEFAULT_IMAGES.author}
                    alt=""
                    style={styles.notificationAvatar}
                  />
                  <div style={styles.notificationContent}>
                    <p style={styles.notificationText}>{notif.message}</p>
                    <span style={styles.notificationTime}>{notif.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ImageCarousel component (keep as is)
const ImageCarousel = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={styles.galleryOverlay} onClick={onClose}>
      <div style={styles.galleryContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.galleryCloseBtn}>
          <Icons.X />
        </button>

        <div style={styles.galleryImageContainer}>
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            style={styles.galleryImage}
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              style={{ ...styles.galleryNavBtn, left: "20px" }}
            >
              <Icons.ChevronLeft />
            </button>
            <button
              onClick={goNext}
              style={{ ...styles.galleryNavBtn, right: "20px" }}
            >
              <Icons.ChevronRight />
            </button>
            <div style={styles.galleryIndicators}>
              {images.map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    ...styles.galleryDot,
                    background:
                      idx === currentIndex ? "white" : "rgba(255,255,255,0.5)",
                  }}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
          </>
        )}

        <div style={styles.galleryCounter}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

// CommentModal component (keep as is)
const CommentModal = ({
  isOpen,
  onClose,
  story,
  user,
  onAddComment,
  onDeleteComment,
  isAdmin,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!comment.trim() || !user) return;
    setIsSubmitting(true);
    await onAddComment(comment);
    setComment("");
    setIsSubmitting(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen || !story) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.commentModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.commentModalHeader}>
          <h3 style={styles.commentModalTitle}>
            <Icons.MessageCircle /> Comments ({story?.comments?.length || 0})
          </h3>
          <button onClick={onClose} style={styles.modalCloseBtn}>
            <Icons.X />
          </button>
        </div>

        <div style={styles.commentModalStoryPreview}>
          <img
            src={story.coverImage || story.images?.[0] || DEFAULT_IMAGES.cover}
            alt={story.title}
            style={styles.commentModalStoryImage}
          />
          <div style={styles.commentModalStoryInfo}>
            <h4 style={styles.commentModalStoryTitle}>{story.title}</h4>
            <div style={styles.commentModalStoryAuthor}>
              <UserAvatar user={story.author} size={24} />
              <span>{story.author?.name}</span>
            </div>
          </div>
        </div>

        <div style={styles.commentModalList}>
          {story?.comments?.length === 0 ? (
            <div style={styles.noCommentsModal}>
              <Icons.MessageCircle />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            story?.comments?.map((c) => (
              <div key={c.id} style={styles.commentModalItem}>
                <img
                  src={c.avatar || DEFAULT_IMAGES.author}
                  alt={c.author}
                  style={styles.commentModalAvatar}
                />
                <div style={styles.commentModalBody}>
                  <div style={styles.commentModalMeta}>
                    <span style={styles.commentModalAuthor}>{c.author}</span>
                    <span style={styles.commentModalDate}>
                      {new Date(c.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {(isAdmin || c.userId === user?.id) && (
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        style={styles.deleteCommentBtn}
                        title="Delete comment"
                      >
                        <Icons.Trash />
                      </button>
                    )}
                  </div>
                  <p style={styles.commentModalText}>{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.commentModalInput}>
          {user ? (
            <>
              <img
                src={user.picture || DEFAULT_IMAGES.author}
                alt="You"
                style={styles.commentModalAvatar}
              />
              <div style={styles.commentInputWrapper}>
                <textarea
                  ref={inputRef}
                  placeholder={`Share your thoughts, ${
                    user.name?.split(" ")[0]
                  }...`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={styles.commentTextarea}
                  rows={2}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim() || isSubmitting}
                  style={{
                    ...styles.commentSubmitBtn,
                    opacity: !comment.trim() || isSubmitting ? 0.5 : 1,
                  }}
                >
                  {isSubmitting ? (
                    "Posting..."
                  ) : (
                    <>
                      <Icons.Send /> Post
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div style={styles.signInPrompt}>
              <Icons.User />
              <span>Sign in to join the conversation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MultiImageUpload component (keep as is)
const MultiImageUpload = ({ images, onImagesChange, maxImages = 5 }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;
    files.slice(0, remainingSlots).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        onImagesChange((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (index) => {
    onImagesChange((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex, toIndex) => {
    onImagesChange((prev) => {
      const newImages = [...prev];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return newImages;
    });
  };

  return (
    <div style={styles.multiImageUpload}>
      <div style={styles.imageGrid}>
        {images.map((img, idx) => (
          <div key={idx} style={styles.uploadedImageWrapper}>
            <img
              src={img}
              alt={`Upload ${idx + 1}`}
              style={styles.uploadedImage}
            />
            <div style={styles.imageOverlayActions}>
              {idx > 0 && (
                <button
                  onClick={() => moveImage(idx, idx - 1)}
                  style={styles.moveBtn}
                >
                  ←
                </button>
              )}
              {idx < images.length - 1 && (
                <button
                  onClick={() => moveImage(idx, idx + 1)}
                  style={styles.moveBtn}
                >
                  →
                </button>
              )}
              <button
                onClick={() => removeImage(idx)}
                style={styles.removeImageBtn}
              >
                <Icons.X />
              </button>
            </div>
            {idx === 0 && <span style={styles.coverBadge}>Cover</span>}
          </div>
        ))}

        {images.length < maxImages && (
          <div
            style={styles.addImageBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            <Icons.Plus />
            <span>Add Photo</span>
            <span style={styles.imageCount}>
              {images.length}/{maxImages}
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

// StoryCard component (keep as is)
const StoryCard = ({
  story,
  index,
  viewMode,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onDelete,
  onClick,
  onOpenComments,
  isAdmin,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const images = story.images || [story.coverImage];

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await onLike(story.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  return (
    <article
      style={{
        ...styles.storyCard,
        ...(viewMode === "grid" && index === 0 ? styles.storyCardFeatured : {}),
        ...(viewMode === "list" ? styles.storyCardList : {}),
      }}
      onClick={() => onClick(story)}
    >
      <div
        style={{
          ...styles.storyImageWrapper,
          ...(viewMode === "list" ? styles.storyImageWrapperList : {}),
        }}
      >
        <img
          src={images[currentImageIndex] || DEFAULT_IMAGES.cover}
          alt={story.title}
          style={styles.storyImage}
        />

        {images.length > 1 && (
          <div style={styles.imageIndicators}>
            {images.map((_, idx) => (
              <span
                key={idx}
                style={{
                  ...styles.imageDot,
                  background:
                    idx === currentImageIndex
                      ? "white"
                      : "rgba(255,255,255,0.5)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
              />
            ))}
          </div>
        )}

        <div style={styles.storyOverlay}>
          <span style={styles.readMore}>Read Story →</span>
        </div>

        <div style={styles.storyActions}>
          <button
            onClick={handleLike}
            style={{
              ...styles.actionIconBtn,
              color: isLiked ? "#e74c3c" : "white",
              transform: isLiking ? "scale(1.3)" : "scale(1)",
              transition: "all 0.2s",
            }}
          >
            <Icons.Heart filled={isLiked} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(story.id);
            }}
            style={{
              ...styles.actionIconBtn,
              color: isBookmarked ? "#f39c12" : "white",
            }}
          >
            <Icons.Bookmark filled={isBookmarked} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments(story);
            }}
            style={styles.actionIconBtn}
          >
            <Icons.MessageCircle />
          </button>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(story.id);
              }}
              style={{ ...styles.actionIconBtn, color: "#e74c3c" }}
            >
              <Icons.Trash />
            </button>
          )}
        </div>
      </div>

      <div style={styles.storyContent}>
        <span style={styles.storyCategory}>{story.category}</span>
        <h3
          style={{
            ...styles.storyTitle,
            fontSize: viewMode === "grid" && index === 0 ? "1.6rem" : "1.2rem",
          }}
        >
          {story.title}
        </h3>
        <p style={styles.storyExcerpt}>{story.excerpt}</p>

        <div style={styles.storyMeta}>
          <div style={styles.storyAuthor}>
            <UserAvatar user={story.author} size={28} />
            <span>{story.author?.name}</span>
          </div>
          <div style={styles.storyStats}>
            <span style={styles.metaItem}>
              <Icons.Clock /> {story.readTime}m
            </span>
            <span
              style={{
                ...styles.metaItem,
                color: isLiked ? "#e74c3c" : "#888",
              }}
            >
              <Icons.Heart filled={isLiked} /> {story.likes}
            </span>
            <span style={styles.metaItem}>
              <Icons.MessageCircle /> {story.comments?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

// GoogleAuthModal component (keep as is)
const GoogleAuthModal = ({
  isOpen,
  onClose,
  onLogin,
  user,
  toast,
  onLogout,
  stories,
  likedStories,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    try {
      setIsLoading(true);

      const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const redirectUri = window.location.origin + "/auth/callback";

      const params = {
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "token id_token",
        scope: "openid profile email",
        nonce: Math.random().toString(36).substring(2),
      };

      const url = `${googleAuthUrl}?${new URLSearchParams(params)}`;

      const popup = window.open(
        url,
        "Google Login",
        "width=500,height=600,top=100,left=100"
      );

      if (!popup) {
        toast("Please allow popups to sign in", "error");
        setIsLoading(false);
        return;
      }

      const checkPopup = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(false);
            return;
          }

          const popupUrl = popup.location.href;
          if (
            popupUrl.includes("access_token") ||
            popupUrl.includes("id_token")
          ) {
            clearInterval(checkPopup);
            popup.close();

            const hashParams = new URLSearchParams(popupUrl.split("#")[1]);
            const idToken = hashParams.get("id_token");

            if (idToken) {
              const base64Url = idToken.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map(function (c) {
                    return (
                      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    );
                  })
                  .join("")
              );

              const userInfo = JSON.parse(jsonPayload);
              const userData = {
                id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                isAdmin: false,
              };

              onLogin(userData);
              onClose();
            }
            setIsLoading(false);
          }
        } catch (e) {
          // Cross-origin error, ignore
        }
      }, 500);
    } catch (error) {
      console.error("Google login error:", error);
      toast("Failed to sign in with Google", "error");
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    if (onLogout) onLogout();
    toast("Signed out successfully");
    onClose();
  };

  if (!isOpen) return null;

  const userStoriesCount =
    stories?.filter((s) => s.author?.id === user?.id).length || 0;
  const userCommentsCount =
    stories?.reduce((total, story) => {
      return (
        total +
        (story.comments?.filter((c) => c.userId === user?.id).length || 0)
      );
    }, 0) || 0;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.authModal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.authCloseBtn}>
          <Icons.X />
        </button>

        {user ? (
          <div style={styles.profileView}>
            <div style={styles.profileHeader}>
              <img
                src={user.picture || DEFAULT_IMAGES.author}
                alt={user.name}
                style={styles.profileAvatarLarge}
              />
              <h3 style={styles.profileName}>{user.name}</h3>
              <p style={styles.profileEmail}>{user.email}</p>
              {user.isAdmin ? (
                <div style={styles.adminBadgeProfile}>
                  <Icons.Shield /> Admin Account
                </div>
              ) : (
                <div style={styles.memberBadge}>
                  <Icons.User /> Community Member
                </div>
              )}
            </div>

            <div style={styles.profileStats}>
              <div style={styles.profileStat}>
                <Icons.BookOpen />
                <div>
                  <div style={styles.statNumber}>{userStoriesCount}</div>
                  <div style={styles.statLabel}>Stories Posted</div>
                </div>
              </div>
              <div style={styles.profileStat}>
                <Icons.Heart />
                <div>
                  <div style={styles.statNumber}>{likedStories?.size || 0}</div>
                  <div style={styles.statLabel}>Stories Liked</div>
                </div>
              </div>
              <div style={styles.profileStat}>
                <Icons.MessageCircle />
                <div>
                  <div style={styles.statNumber}>{userCommentsCount}</div>
                  <div style={styles.statLabel}>Comments</div>
                </div>
              </div>
            </div>

            <div style={styles.profileFooter}>
              <button onClick={handleSignOut} style={styles.signOutBtn}>
                <Icons.LogOut /> Sign Out
              </button>
              <p style={styles.accountNote}>Signed in with Google</p>
            </div>
          </div>
        ) : (
          <div style={styles.loginView}>
            <div style={styles.authHeader}>
              <h2 style={styles.authTitle}>Join Our Community</h2>
              <p style={styles.authSubtitle}>
                Sign in to share stories, like posts, and connect with travelers
              </p>
            </div>

            <div style={styles.authButtons}>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style={styles.googleBtn}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <div style={styles.authDivider}>
                <span style={styles.dividerLine}></span>
                <span style={styles.dividerText}>or</span>
                <span style={styles.dividerLine}></span>
              </div>

              <button
                onClick={() => {
                  toast(
                    "You can continue as a guest, but features are limited",
                    "info"
                  );
                  onClose();
                }}
                style={styles.guestBtn}
              >
                Continue as Guest
              </button>
            </div>

            <div style={styles.authBenefits}>
              <h4 style={styles.benefitsTitle}>
                What you can do when signed in:
              </h4>
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}>
                  ✓ Share your travel stories publicly
                </li>
                <li style={styles.benefitItem}>✓ Like and comment on posts</li>
                <li style={styles.benefitItem}>✓ Bookmark favorite stories</li>
                <li style={styles.benefitItem}>✓ See stories from all users</li>
              </ul>
            </div>

            <p style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// DATABASE MANAGEMENT MODAL
// ============================================
const DatabaseManager = ({ isOpen, onClose, toast }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [importData, setImportData] = useState("");
  const [stats, setStats] = useState({
    stories: 0,
    users: 0,
    comments: 0,
    likes: 0,
    bookmarks: 0,
  });

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      const stories = await database.getAllStories();
      const storyCount = stories.length;
      const commentCount = stories.reduce(
        (sum, story) => sum + (story.comments?.length || 0),
        0
      );
      const likeCount = stories.reduce(
        (sum, story) => sum + (story.likes || 0),
        0
      );

      let userCount = 0;
      let bookmarkCount = 0;

      if (database.db) {
        const usersResult = await database.db.executeSql(
          "SELECT COUNT(*) as count FROM users"
        );
        userCount = usersResult.rows._array[0]?.count || 0;

        const bookmarksResult = await database.db.executeSql(
          "SELECT COUNT(*) as count FROM bookmarks"
        );
        bookmarkCount = bookmarksResult.rows._array[0]?.count || 0;
      } else {
        const users = JSON.parse(
          localStorage.getItem("krissane_users") || "[]"
        );
        userCount = users.length;

        // Count bookmarks from localStorage
        let totalBookmarks = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith("krissane_bookmarks_")) {
            const bookmarks = JSON.parse(localStorage.getItem(key) || "[]");
            totalBookmarks += bookmarks.length;
          }
        }
        bookmarkCount = totalBookmarks;
      }

      setStats({
        stories: storyCount,
        users: userCount,
        comments: commentCount,
        likes: likeCount,
        bookmarks: bookmarkCount,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await database.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `travel-blog-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("Data exported successfully!", "success");
    } catch (error) {
      console.error("Export error:", error);
      toast("Export failed", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast("Please paste JSON data to import", "error");
      return;
    }

    setIsImporting(true);
    try {
      const success = await database.importData(importData);
      if (success) {
        toast("Data imported successfully!", "success");
        setImportData("");
        loadStats();
        onClose();
      } else {
        toast("Import failed", "error");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast("Invalid JSON data", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear ALL data? This cannot be undone!"
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      const success = await database.clearAllData();
      if (success) {
        toast("All data cleared successfully!", "success");
        loadStats();
        onClose();
      } else {
        toast("Failed to clear data", "error");
      }
    } catch (error) {
      console.error("Clear error:", error);
      toast("Clear failed", "error");
    } finally {
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            <Icons.Database /> Database Management
          </h3>
          <button onClick={onClose} style={styles.modalCloseBtn}>
            <Icons.X />
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.stories}</div>
            <div style={styles.statLabel}>Stories</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.users}</div>
            <div style={styles.statLabel}>Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.comments}</div>
            <div style={styles.statLabel}>Comments</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.likes}</div>
            <div style={styles.statLabel}>Likes</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.bookmarks}</div>
            <div style={styles.statLabel}>Bookmarks</div>
          </div>
        </div>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Backup & Restore</h4>
          <p style={styles.sectionDesc}>
            Export your data for safekeeping or import from a previous backup.
          </p>

          <div style={styles.buttonGroup}>
            <button
              onClick={handleExport}
              disabled={isExporting}
              style={styles.exportBtn}
            >
              {isExporting ? "Exporting..." : "Export All Data"}
            </button>
          </div>

          <div style={styles.importSection}>
            <textarea
              placeholder="Paste JSON backup data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              style={styles.importTextarea}
              rows={6}
            />
            <button
              onClick={handleImport}
              disabled={isImporting || !importData.trim()}
              style={styles.importBtn}
            >
              {isImporting ? "Importing..." : "Import Data"}
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Danger Zone</h4>
          <p style={styles.dangerText}>
            Warning: This will permanently delete all data including stories,
            users, comments, likes, and bookmarks.
          </p>
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            style={styles.clearAllBtn}
          >
            {isClearing ? "Clearing..." : "Clear All Data"}
          </button>
        </div>

        <div style={styles.footerNote}>
          <Icons.AlertTriangle />
          <span>Backup your data regularly to prevent data loss.</span>
        </div>
      </div>
    </div>
  );
};

// Add Database icon to Icons object
Icons.Database = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function TravelBlog() {
  // Core state
  const [currentPage, setCurrentPage] = useState("home");
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User state
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // UI state
  const [showToast, setShowToast] = useState(null);
  const [likedStories, setLikedStories] = useState(new Set());
  const [bookmarkedStories, setBookmarkedStories] = useState(new Set());
  const [notifications, setNotifications] = useState([]);

  // Modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentModalStory, setCommentModalStory] = useState(null);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [newStory, setNewStory] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    location: "",
    images: [],
  });
  const [adminCreds, setAdminCreds] = useState({ username: "", password: "" });
  const [adminError, setAdminError] = useState("");

  // ============================================
  // TOAST
  // ============================================
  const toast = useCallback((message, type = "success") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // ============================================
  // LOAD DATA FROM DATABASE
  // ============================================
  const loadStories = useCallback(async () => {
    try {
      setIsLoading(true);

      // Initialize database
      await database.init();

      // Load stories from database
      const loadedStories = await database.getAllStories();

      if (loadedStories && loadedStories.length > 0) {
        console.log(`Loaded ${loadedStories.length} stories from database`);
        setStories(loadedStories);
      } else {
        // If no stories exist, initialize with sample stories
        console.log("No stories found, initializing with sample data");

        // Save sample stories to database
        for (const story of sampleStories) {
          await database.saveStory(story);
        }

        // Reload stories
        const newStories = await database.getAllStories();
        setStories(newStories);
      }
    } catch (error) {
      console.error("Error loading stories:", error);
      // Fallback to sample stories
      setStories(sampleStories);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPersonalData = useCallback(async () => {
    try {
      if (user) {
        const [likes, bookmarks, notifs, savedAdmin] = await Promise.all([
          database.getUserLikes(user.id),
          database.getUserBookmarks(user.id),
          PersonalStorage.get("krissane-notifications"),
          PersonalStorage.get("krissane-admin"),
        ]);

        if (likes) setLikedStories(likes);
        if (bookmarks) setBookmarkedStories(bookmarks);
        if (notifs) setNotifications(notifs);
        if (savedAdmin) setIsAdmin(true);
      } else {
        // Load notifications for guest users
        const notifs = await PersonalStorage.get("krissane-notifications");
        if (notifs) setNotifications(notifs);
      }
    } catch (error) {
      console.error("Error loading personal data:", error);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadStories(), loadPersonalData()]);
      setIsLoading(false);
    };
    loadData();
  }, [loadStories, loadPersonalData]);

  // Refresh stories from database
  const refreshStories = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const loadedStories = await database.getAllStories();
      setStories(loadedStories);
      toast(`Refreshed! Loaded ${loadedStories.length} stories`);
    } catch (error) {
      console.error("Error refreshing stories:", error);
      toast("Refresh failed, using cached stories", "error");
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  // ============================================
  // NOTIFICATIONS
  // ============================================
  const addNotification = useCallback(
    (message, data = {}) => {
      const notif = {
        id: Date.now(),
        message,
        time: "Just now",
        read: false,
        ...data,
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
      PersonalStorage.set("krissane-notifications", [
        notif,
        ...notifications.slice(0, 19),
      ]);
    },
    [notifications]
  );

  const clearNotifications = () => {
    setNotifications([]);
    PersonalStorage.set("krissane-notifications", []);
    toast("Notifications cleared");
  };

  // ============================================
  // AUTHENTICATION
  // ============================================
  const handleLogin = async (userData) => {
    setUser(userData);
    await database.saveUser(userData);
    if (userData.isAdmin) setIsAdmin(true);

    // Load user-specific data
    const likes = await database.getUserLikes(userData.id);
    const bookmarks = await database.getUserBookmarks(userData.id);
    if (likes) setLikedStories(likes);
    if (bookmarks) setBookmarkedStories(bookmarks);

    toast(`Welcome, ${userData.name}! 👋`);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    setUser(null);
    setLikedStories(new Set());
    setBookmarkedStories(new Set());
    toast("Signed out successfully");
  };

  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    if (
      adminCreds.username === ADMIN_CREDENTIALS.username &&
      adminCreds.password === ADMIN_CREDENTIALS.password
    ) {
      setIsAdmin(true);
      await PersonalStorage.set("krissane-admin", true);
      setShowAdminLogin(false);
      setAdminCreds({ username: "", password: "" });
      toast("Welcome, Admin! 🛡️");
    } else {
      setAdminError("Invalid credentials");
    }
  };

  const handleAdminLogout = async () => {
    setIsAdmin(false);
    await PersonalStorage.delete("krissane-admin");
    toast("Admin logged out");
  };

  // ============================================
  // STORIES
  // ============================================
  const filteredStories = stories
    .filter((story) => {
      const matchesSearch =
        !searchQuery ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || story.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "popular") return b.likes - a.likes;
      return (b.comments?.length || 0) - (a.comments?.length || 0);
    });

  const handleCreateStory = async () => {
    if (
      !newStory.title.trim() ||
      !newStory.content.trim() ||
      !newStory.category
    ) {
      toast("Please fill in all required fields", "error");
      return;
    }

    const story = {
      id: Date.now(),
      title: newStory.title.trim(),
      excerpt:
        newStory.excerpt.trim() || newStory.content.substring(0, 150) + "...",
      content: newStory.content.trim(),
      category: newStory.category,
      location: newStory.location.trim() || "Unknown Location",
      date: new Date().toISOString().split("T")[0],
      readTime: Math.max(
        1,
        Math.ceil(newStory.content.split(/\s+/).length / 200)
      ),
      images:
        newStory.images.length > 0 ? newStory.images : [DEFAULT_IMAGES.cover],
      coverImage: newStory.images[0] || DEFAULT_IMAGES.cover,
      author: {
        id: user?.id || "anonymous",
        name: user?.name || "Anonymous Traveler",
        avatar: user?.picture || DEFAULT_IMAGES.author,
      },
      likes: 0,
      likedBy: [],
      views: 0,
      comments: [],
    };

    try {
      // Save to database
      const storyId = await database.saveStory(story);
      story.id = storyId || story.id;

      // Update local state
      setStories((prev) => [story, ...prev]);

      // Add notification
      addNotification(`New story: "${story.title}" by ${story.author.name}`, {
        avatar: story.author.avatar,
        storyId: story.id,
      });

      // Reset form
      setNewStory({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        location: "",
        images: [],
      });

      setCurrentPage("home");
      toast("Story published! 🎉 Everyone can see it now!");
    } catch (error) {
      console.error("Error creating story:", error);
      toast("Failed to save story", "error");
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const success = await database.deleteStory(storyId);
      if (success) {
        const updatedStories = stories.filter((s) => s.id !== storyId);
        setStories(updatedStories);
        setSelectedStory(null);
        setShowDeleteConfirm(null);
        setCurrentPage("home");
        toast("Story deleted");
      } else {
        toast("Failed to delete story", "error");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      toast("Failed to delete story", "error");
    }
  };

  // ============================================
  // LIKES
  // ============================================
  const handleLike = useCallback(
    async (storyId) => {
      if (!user) {
        toast("Please sign in to like stories", "error");
        return;
      }

      try {
        const liked = await database.toggleLike(storyId, user.id);

        // Update local state
        setLikedStories((prev) => {
          const newSet = new Set(prev);
          liked ? newSet.add(storyId) : newSet.delete(storyId);
          return newSet;
        });

        // Update story in local state
        setStories((prev) =>
          prev.map((s) =>
            s.id === storyId
              ? {
                  ...s,
                  likes: liked
                    ? (s.likes || 0) + 1
                    : Math.max(0, (s.likes || 1) - 1),
                }
              : s
          )
        );

        if (selectedStory?.id === storyId) {
          setSelectedStory((prev) => ({
            ...prev,
            likes: liked
              ? (prev.likes || 0) + 1
              : Math.max(0, (prev.likes || 1) - 1),
          }));
        }

        if (liked) {
          const story = stories.find((s) => s.id === storyId);
          if (story && story.author.id !== user.id) {
            addNotification(`${user.name} liked "${story.title}"`, {
              avatar: user.picture,
              storyId,
            });
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        toast("Failed to update like", "error");
      }
    },
    [user, stories, selectedStory, toast, addNotification]
  );

  // ============================================
  // BOOKMARKS
  // ============================================
  const handleBookmark = useCallback(
    async (storyId) => {
      if (!user) {
        toast("Please sign in to bookmark stories", "error");
        return;
      }

      try {
        const bookmarked = await database.toggleBookmark(storyId, user.id);

        setBookmarkedStories((prev) => {
          const newSet = new Set(prev);
          bookmarked ? newSet.add(storyId) : newSet.delete(storyId);
          return newSet;
        });

        toast(bookmarked ? "Added to bookmarks" : "Removed from bookmarks");
      } catch (error) {
        console.error("Error toggling bookmark:", error);
        toast("Failed to update bookmark", "error");
      }
    },
    [user, toast]
  );

  // ============================================
  // COMMENTS
  // ============================================
  const openCommentModal = (story) => {
    setCommentModalStory(story);
    setShowCommentModal(true);
  };

  const handleAddComment = async (text) => {
    if (!user || !commentModalStory) return;

    const comment = {
      id: Date.now(),
      author: user.name,
      avatar: user.picture || DEFAULT_IMAGES.author,
      text,
      date: new Date().toISOString().split("T")[0],
      userId: user.id,
    };

    try {
      const success = await database.addComment(commentModalStory.id, comment);

      if (success) {
        // Update local state
        const updatedStories = stories.map((s) =>
          s.id === commentModalStory.id
            ? { ...s, comments: [...(s.comments || []), comment] }
            : s
        );

        setStories(updatedStories);
        setCommentModalStory((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), comment],
        }));

        if (commentModalStory.author.id !== user.id) {
          addNotification(
            `${user.name} commented on "${commentModalStory.title}"`,
            {
              avatar: user.picture,
              storyId: commentModalStory.id,
            }
          );
        }
        toast("Comment added!");
      } else {
        toast("Failed to add comment", "error");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast("Failed to add comment", "error");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentModalStory) return;

    try {
      const success = await database.deleteComment(commentId);

      if (success) {
        const updatedStories = stories.map((s) =>
          s.id === commentModalStory.id
            ? { ...s, comments: s.comments.filter((c) => c.id !== commentId) }
            : s
        );

        setStories(updatedStories);
        setCommentModalStory((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
        }));
        toast("Comment deleted");
      } else {
        toast("Failed to delete comment", "error");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast("Failed to delete comment", "error");
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading your adventures...</p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {showToast && (
        <div
          style={{
            ...styles.toast,
            background: showToast.type === "error" ? "#e74c3c" : "#27ae60",
          }}
        >
          {showToast.type === "success" ? <Icons.Check /> : <Icons.X />}
          <span>{showToast.message}</span>
        </div>
      )}

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        story={commentModalStory}
        user={user}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        isAdmin={isAdmin}
      />

      {showImageGallery && (
        <ImageCarousel
          images={galleryImages}
          onClose={() => setShowImageGallery(false)}
        />
      )}

      {showDeleteConfirm && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteModalIcon}>
              <Icons.AlertTriangle />
            </div>
            <h3 style={styles.modalTitle}>Delete {showDeleteConfirm.type}?</h3>
            <p style={styles.modalDesc}>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.type === "story")
                    handleDeleteStory(showDeleteConfirm.id);
                  setShowDeleteConfirm(null);
                }}
                style={styles.deleteConfirmBtn}
              >
                <Icons.Trash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowAdminLogin(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.adminLoginHeader}>
              <div style={styles.adminIconBig}>
                <Icons.Shield />
              </div>
              <h3 style={styles.modalTitle}>Admin Login</h3>
            </div>
            {adminError && (
              <div style={styles.loginError}>
                <Icons.AlertTriangle /> {adminError}
              </div>
            )}
            <form onSubmit={handleAdminLogin} style={styles.loginForm}>
              <input
                type="text"
                placeholder="Username"
                value={adminCreds.username}
                onChange={(e) =>
                  setAdminCreds((p) => ({ ...p, username: e.target.value }))
                }
                style={styles.modalInput}
              />
              <input
                type="password"
                placeholder="Password"
                value={adminCreds.password}
                onChange={(e) =>
                  setAdminCreds((p) => ({ ...p, password: e.target.value }))
                }
                style={styles.modalInput}
              />
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.adminLoginBtn}>
                  <Icons.Lock /> Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
        user={user}
        toast={toast}
        stories={stories}
        likedStories={likedStories}
      />

      <DatabaseManager
        isOpen={showDatabaseManager}
        onClose={() => setShowDatabaseManager(false)}
        toast={toast}
      />

      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => setCurrentPage("home")}>
          Krissane<span style={styles.logoAccent}>.</span>
        </div>

        <div style={styles.navLinks}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("home");
            }}
            style={styles.navLink}
          >
            Stories
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("bookmarks");
            }}
            style={styles.navLink}
          >
            Bookmarks{" "}
            {bookmarkedStories.size > 0 && (
              <span style={styles.badge}>{bookmarkedStories.size}</span>
            )}
          </a>

          <button
            onClick={() =>
              user ? setCurrentPage("create") : setShowAuthModal(true)
            }
            style={styles.createBtn}
          >
            <Icons.Plus /> New Story
          </button>

          <button
            onClick={refreshStories}
            disabled={isRefreshing}
            style={{
              ...styles.refreshBtn,
              opacity: isRefreshing ? 0.5 : 1,
            }}
            title="Refresh stories"
          >
            <Icons.RefreshCw />
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowDatabaseManager(true)}
              style={styles.databaseBtn}
              title="Database Management"
            >
              <Icons.Database />
            </button>
          )}

          <NotificationCenter
            notifications={notifications}
            onClear={clearNotifications}
            onNotificationClick={(n) => {
              if (n.storyId) {
                const story = stories.find((s) => s.id === n.storyId);
                if (story) {
                  setSelectedStory(story);
                  setCurrentPage("story");
                }
              }
            }}
          />

          {isAdmin && (
            <div style={styles.adminBadgeContainer}>
              <div style={styles.adminBadge}>
                <Icons.Shield /> Admin
              </div>
              <button onClick={handleAdminLogout} style={styles.logoutBtn}>
                <Icons.LogOut />
              </button>
            </div>
          )}

          {!isAdmin && (
            <button
              onClick={() => setShowAdminLogin(true)}
              style={styles.adminLoginNavBtn}
            >
              <Icons.Lock />
            </button>
          )}

          {user ? (
            <UserAvatar
              user={user}
              size={36}
              showName={true}
              onClick={() => setShowAuthModal(true)}
            />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={styles.signInBtn}
            >
              <Icons.User /> Sign In
            </button>
          )}
        </div>
      </nav>

      {isAdmin && (
        <div style={styles.adminBanner}>
          <Icons.Shield /> Admin Mode — You can manage all posts and comments
          <button
            onClick={() => setShowDatabaseManager(true)}
            style={styles.databaseLinkBtn}
          >
            <Icons.Database /> Manage Database
          </button>
        </div>
      )}

      <div style={styles.publicBanner}>
        <Icons.Eye /> Public Stories — All posts are visible to everyone
        {database.db ? (
          <span style={styles.dbStatus}>SQLite Database Active</span>
        ) : (
          <span style={styles.dbStatusFallback}>LocalStorage Fallback</span>
        )}
      </div>

      <main style={styles.main}>
        {currentPage === "home" && (
          <>
            <section style={styles.hero}>
              <div style={styles.heroContent}>
                <span style={styles.heroTag}>Travel Stories That Move You</span>
                <h1 style={styles.heroTitle}>
                  Every Journey Deserves to Be{" "}
                  <em style={styles.heroEmphasis}>Told</em>
                </h1>
                <p style={styles.heroDesc}>
                  Share your adventures with the world. Stories posted here are
                  public and visible to all users.
                </p>
                <div style={styles.heroCta}>
                  <button
                    onClick={() =>
                      user ? setCurrentPage("create") : setShowAuthModal(true)
                    }
                    style={styles.btnPrimary}
                  >
                    Share Your Story →
                  </button>
                </div>
              </div>
              <div style={styles.heroImageWrapper}>
                <img
                  src={DEFAULT_IMAGES.cover}
                  alt="Travel"
                  style={styles.heroImage}
                />
                <div style={styles.heroStats}>
                  <div style={styles.stat}>
                    <div style={styles.statNumber}>{stories.length}</div>
                    <div style={styles.statLabel}>Public Stories</div>
                  </div>
                  <div style={styles.stat}>
                    <div style={styles.statNumber}>
                      {stories.reduce(
                        (a, s) => a + (s.comments?.length || 0),
                        0
                      )}
                    </div>
                    <div style={styles.statLabel}>Comments</div>
                  </div>
                </div>
              </div>
            </section>

            <section style={styles.filterSection}>
              <div style={styles.searchBar}>
                <Icons.Search />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={styles.clearSearch}
                  >
                    <Icons.X />
                  </button>
                )}
              </div>
              <div style={styles.filterControls}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    ...styles.filterBtn,
                    background: showFilters ? "#C4704F" : "#f5f5f5",
                    color: showFilters ? "white" : "#666",
                  }}
                >
                  <Icons.Filter /> Filters
                </button>
                <div style={styles.viewToggle}>
                  <button
                    onClick={() => setViewMode("grid")}
                    style={{
                      ...styles.viewBtn,
                      background:
                        viewMode === "grid" ? "#2C2C2C" : "transparent",
                      color: viewMode === "grid" ? "white" : "#666",
                    }}
                  >
                    <Icons.Grid />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    style={{
                      ...styles.viewBtn,
                      background:
                        viewMode === "list" ? "#2C2C2C" : "transparent",
                      color: viewMode === "list" ? "white" : "#666",
                    }}
                  >
                    <Icons.List />
                  </button>
                </div>
              </div>
            </section>

            {showFilters && (
              <section style={styles.expandedFilters}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Category</label>
                  <div style={styles.categoryPills}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          ...styles.categoryPill,
                          background:
                            selectedCategory === cat ? "#C4704F" : "white",
                          color: selectedCategory === cat ? "white" : "#666",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={styles.sortSelect}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="popular">Most Liked</option>
                    <option value="comments">Most Discussed</option>
                  </select>
                </div>
              </section>
            )}

            <section style={styles.storiesSection}>
              {filteredStories.length === 0 ? (
                <div style={styles.emptyState}>
                  <h3>No stories found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              ) : (
                <div
                  style={
                    viewMode === "grid"
                      ? styles.storiesGrid
                      : styles.storiesList
                  }
                >
                  {filteredStories.map((story, index) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      index={index}
                      viewMode={viewMode}
                      isLiked={likedStories.has(story.id)}
                      isBookmarked={bookmarkedStories.has(story.id)}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                      onDelete={(id) =>
                        setShowDeleteConfirm({ type: "story", id })
                      }
                      onClick={(s) => {
                        setSelectedStory(s);
                        setCurrentPage("story");
                      }}
                      onOpenComments={openCommentModal}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {currentPage === "story" && selectedStory && (
          <article style={styles.articlePage}>
            <button
              onClick={() => setCurrentPage("home")}
              style={styles.backBtn}
            >
              <Icons.ArrowLeft /> Back to Stories
            </button>

            <header style={styles.articleHeader}>
              <span style={styles.articleCategory}>
                {selectedStory.category}
              </span>
              <h1 style={styles.articleTitle}>{selectedStory.title}</h1>
              <div style={styles.articleMeta}>
                <UserAvatar
                  user={selectedStory.author}
                  size={48}
                  showName={true}
                />
                <div style={styles.articleInfo}>
                  <span>
                    {new Date(selectedStory.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span>{selectedStory.location}</span>
                  <span>•</span>
                  <span>
                    <Icons.Clock /> {selectedStory.readTime} min
                  </span>
                </div>
              </div>
            </header>

            <div
              style={styles.articleImageGallery}
              onClick={() => {
                setGalleryImages(
                  selectedStory.images || [selectedStory.coverImage]
                );
                setShowImageGallery(true);
              }}
            >
              <img
                src={selectedStory.coverImage || selectedStory.images?.[0]}
                alt={selectedStory.title}
                style={styles.articleCover}
              />
              {selectedStory.images?.length > 1 && (
                <div style={styles.moreImagesOverlay}>
                  <Icons.Images /> +{selectedStory.images.length - 1} more
                  photos
                </div>
              )}
            </div>

            <div style={styles.articleBody}>
              {selectedStory.content.split("\n\n").map((p, i) => (
                <p key={i} style={styles.articleParagraph}>
                  {p}
                </p>
              ))}
            </div>

            <div style={styles.articleActionsBar}>
              <button
                onClick={() => handleLike(selectedStory.id)}
                style={{
                  ...styles.articleActionBtn,
                  background: likedStories.has(selectedStory.id)
                    ? "#ffeaea"
                    : "#f5f5f5",
                  color: likedStories.has(selectedStory.id)
                    ? "#e74c3c"
                    : "#666",
                }}
              >
                <Icons.Heart filled={likedStories.has(selectedStory.id)} />{" "}
                {selectedStory.likes} Likes
              </button>
              <button
                onClick={() => openCommentModal(selectedStory)}
                style={styles.articleActionBtn}
              >
                <Icons.MessageCircle /> {selectedStory.comments?.length || 0}{" "}
                Comments
              </button>
              <button
                onClick={() => handleBookmark(selectedStory.id)}
                style={{
                  ...styles.articleActionBtn,
                  background: bookmarkedStories.has(selectedStory.id)
                    ? "#fff8e6"
                    : "#f5f5f5",
                  color: bookmarkedStories.has(selectedStory.id)
                    ? "#f39c12"
                    : "#666",
                }}
              >
                <Icons.Bookmark
                  filled={bookmarkedStories.has(selectedStory.id)}
                />
                {bookmarkedStories.has(selectedStory.id) ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast("Link copied!");
                }}
                style={styles.articleActionBtn}
              >
                <Icons.Share /> Share
              </button>
              {(isAdmin || selectedStory.author.id === user?.id) && (
                <button
                  onClick={() =>
                    setShowDeleteConfirm({
                      type: "story",
                      id: selectedStory.id,
                    })
                  }
                  style={{ ...styles.articleActionBtn, ...styles.deleteBtn }}
                >
                  <Icons.Trash /> Delete
                </button>
              )}
            </div>
          </article>
        )}

        {currentPage === "create" && (
          <div style={styles.createPage}>
            <button
              onClick={() => setCurrentPage("home")}
              style={styles.backBtn}
            >
              <Icons.ArrowLeft /> Back
            </button>
            <div style={styles.createHeader}>
              <h1 style={styles.createTitle}>
                Share Your <em style={styles.titleEmphasis}>Story</em>
              </h1>
              <p style={styles.publicNote}>
                <Icons.Eye /> Your story will be public and visible to all users
              </p>
            </div>
            <div style={styles.createForm}>
              <MultiImageUpload
                images={newStory.images}
                onImagesChange={(fn) =>
                  setNewStory((p) => ({
                    ...p,
                    images: typeof fn === "function" ? fn(p.images) : fn,
                  }))
                }
                maxImages={5}
              />
              <input
                type="text"
                placeholder="Story title..."
                value={newStory.title}
                onChange={(e) =>
                  setNewStory((p) => ({ ...p, title: e.target.value }))
                }
                style={styles.titleInput}
              />
              <div style={styles.formRow}>
                <select
                  value={newStory.category}
                  onChange={(e) =>
                    setNewStory((p) => ({ ...p, category: e.target.value }))
                  }
                  style={styles.selectInput}
                >
                  <option value="">Select Category</option>
                  {categories
                    .filter((c) => c !== "All")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  placeholder="Location"
                  value={newStory.location}
                  onChange={(e) =>
                    setNewStory((p) => ({ ...p, location: e.target.value }))
                  }
                  style={styles.locationInput}
                />
              </div>
              <textarea
                placeholder="Brief excerpt (optional)"
                value={newStory.excerpt}
                onChange={(e) =>
                  setNewStory((p) => ({ ...p, excerpt: e.target.value }))
                }
                style={styles.excerptInput}
                rows={2}
              />
              <textarea
                placeholder="Tell your story..."
                value={newStory.content}
                onChange={(e) =>
                  setNewStory((p) => ({ ...p, content: e.target.value }))
                }
                style={styles.contentInput}
                rows={15}
              />
              <div style={styles.formActions}>
                <button
                  onClick={() => setCurrentPage("home")}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button onClick={handleCreateStory} style={styles.publishBtn}>
                  <Icons.Send /> Publish Publicly
                </button>
              </div>
            </div>
          </div>
        )}

        {currentPage === "bookmarks" && (
          <div style={styles.bookmarksPage}>
            <button
              onClick={() => setCurrentPage("home")}
              style={styles.backBtn}
            >
              <Icons.ArrowLeft /> Back
            </button>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>
                Your <em style={styles.titleEmphasis}>Bookmarks</em>
              </h1>
              <p style={styles.privateNote}>
                These bookmarks are private to you
              </p>
            </div>
            {bookmarkedStories.size === 0 ? (
              <div style={styles.emptyState}>
                <Icons.Bookmark filled={false} />
                <h3>No bookmarks yet</h3>
                <button
                  onClick={() => setCurrentPage("home")}
                  style={styles.btnPrimary}
                >
                  Browse Stories
                </button>
              </div>
            ) : (
              <div style={styles.storiesGrid}>
                {stories
                  .filter((s) => bookmarkedStories.has(s.id))
                  .map((story, idx) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      index={idx}
                      viewMode="grid"
                      isLiked={likedStories.has(story.id)}
                      isBookmarked={true}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                      onDelete={(id) =>
                        setShowDeleteConfirm({ type: "story", id })
                      }
                      onClick={(s) => {
                        setSelectedStory(s);
                        setCurrentPage("story");
                      }}
                      onOpenComments={openCommentModal}
                      isAdmin={isAdmin}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <span style={styles.logo}>
              Krissane<span style={styles.logoAccent}>.</span>
            </span>
            <p style={styles.footerText}>Every journey deserves to be told.</p>
          </div>
          <div style={styles.footerLinks}>
            <a href="#" onClick={() => setCurrentPage("home")}>
              Stories
            </a>
            <a href="#" onClick={() => setCurrentPage("bookmarks")}>
              Bookmarks
            </a>
            {isAdmin && (
              <a href="#" onClick={() => setShowDatabaseManager(true)}>
                Database
              </a>
            )}
          </div>
        </div>
        <div style={styles.footerBottom}>
          © 2026 Krissane Adventures. All rights reserved.
          <span style={styles.dbInfo}>
            {database.db ? "SQLite Database" : "LocalStorage"}
          </span>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// ADDITIONAL STYLES FOR DATABASE MANAGER
// ============================================
const additionalStyles = {
  // Add these to your existing styles object
  databaseBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    background: "#f5f5f5",
    color: "#666",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  databaseLinkBtn: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  dbStatus: {
    marginLeft: "auto",
    fontSize: "0.7rem",
    background: "rgba(46, 125, 50, 0.2)",
    color: "#2e7d32",
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: 600,
  },
  dbStatusFallback: {
    marginLeft: "auto",
    fontSize: "0.7rem",
    background: "rgba(244, 67, 54, 0.2)",
    color: "#f44336",
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: 600,
  },
  dbInfo: {
    marginLeft: "20px",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "10px",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#C4704F",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "0.7rem",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  section: {
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #eee",
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#333",
  },
  sectionDesc: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "1rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "1rem",
  },
  exportBtn: {
    padding: "10px 16px",
    background: "#C4704F",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  importSection: {
    marginTop: "1rem",
  },
  importTextarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "monospace",
    marginBottom: "10px",
    resize: "vertical",
    minHeight: "100px",
    boxSizing: "border-box",
  },
  importBtn: {
    padding: "10px 16px",
    background: "#2C2C2C",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  dangerText: {
    fontSize: "0.9rem",
    color: "#e74c3c",
    marginBottom: "1rem",
  },
  clearAllBtn: {
    padding: "10px 16px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  footerNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.8rem",
    color: "#e74c3c",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #eee",
  },
};

// Merge additional styles with existing styles
Object.assign(styles, additionalStyles);

// ============================================
// STYLES (Keep all your existing styles)
// ============================================
const styles = {
  // ... (Keep all your existing styles exactly as they were)
  app: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    background: "#F7F3ED",
    minHeight: "100vh",
    color: "#2C2C2C",
  },
  loadingScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "1rem",
    color: "#666",
  },
  // ... (Rest of styles remain exactly the same)
  footerBottom: {
    textAlign: "center",
    paddingTop: "2rem",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`,
  styleSheet.cssRules.length
);
