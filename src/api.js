const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const api = {
  // Auth
  async googleLogin(token) {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    });
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });
    return response.json();
  },

  // Stories
  async getStories(params = {}) {
    const query = new URLSearchParams(params);
    const response = await fetch(`${API_URL}/stories?${query}`);
    return response.json();
  },

  async getStory(id) {
    const response = await fetch(`${API_URL}/stories/${id}`);
    return response.json();
  },

  async createStory(story) {
    const response = await fetch(`${API_URL}/stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
      credentials: "include",
    });
    return response.json();
  },

  async deleteStory(id) {
    const response = await fetch(`${API_URL}/stories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response.json();
  },

  // Comments
  async addComment(storyId, text) {
    const response = await fetch(`${API_URL}/stories/${storyId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      credentials: "include",
    });
    return response.json();
  },

  async deleteComment(id) {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response.json();
  },

  // Likes
  async toggleLike(storyId) {
    const response = await fetch(`${API_URL}/stories/${storyId}/like`, {
      method: "POST",
      credentials: "include",
    });
    return response.json();
  },

  async getUserLikes() {
    const response = await fetch(`${API_URL}/user/likes`, {
      credentials: "include",
    });
    return response.json();
  },

  // Bookmarks
  async toggleBookmark(storyId) {
    const response = await fetch(`${API_URL}/stories/${storyId}/bookmark`, {
      method: "POST",
      credentials: "include",
    });
    return response.json();
  },

  async getUserBookmarks() {
    const response = await fetch(`${API_URL}/user/bookmarks`, {
      credentials: "include",
    });
    return response.json();
  },
};
