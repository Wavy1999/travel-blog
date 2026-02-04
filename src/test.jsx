import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================
// CONFIGURATION
// ============================================
const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

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
// ICONS
// ============================================
const Icons = {
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
  Images: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="18" height="18" rx="2" opacity="0.5" />
      <circle cx="10" cy="10" r="2" />
      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  X: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  BookOpen: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Send: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Search: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Filter: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  MessageCircle: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  User: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Bookmark: ({ filled }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Share: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Grid: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  List: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  LogOut: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
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
  Bell: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ============================================
// DATABASE SERVICE (Ready for Firebase/MongoDB)
// ============================================
const DatabaseService = {
  // Stories
  async getStories() {
    try {
      const response = await fetch(`${API_URL}/api/stories`);
      if (!response.ok) throw new Error("Network error");
      return await response.json();
    } catch (error) {
      console.log("Using local storage fallback");
      const stored = localStorage.getItem("krissane-stories");
      return stored ? JSON.parse(stored) : null;
    }
  },

  async createStory(story) {
    try {
      const response = await fetch(`${API_URL}/api/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      });
      return await response.json();
    } catch (error) {
      return story; // Fallback to local
    }
  },

  async deleteStory(storyId) {
    try {
      await fetch(`${API_URL}/api/stories/${storyId}`, { method: "DELETE" });
      return true;
    } catch (error) {
      return true;
    }
  },

  // Real-time Likes
  async toggleLike(storyId, userId) {
    try {
      const response = await fetch(`${API_URL}/api/stories/${storyId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  // Comments
  async addComment(storyId, comment) {
    try {
      const response = await fetch(
        `${API_URL}/api/stories/${storyId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(comment),
        }
      );
      return await response.json();
    } catch (error) {
      return comment;
    }
  },

  async deleteComment(storyId, commentId) {
    try {
      await fetch(`${API_URL}/api/stories/${storyId}/comments/${commentId}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      return true;
    }
  },
};

// ============================================
// LOCAL STORAGE SERVICE
// ============================================
const Storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  delete: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
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
// USER AVATAR COMPONENT
// ============================================
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
      style={{
        ...styles.userAvatar,
        width: size,
        height: size,
      }}
    />
    {showName && <span style={styles.userAvatarName}>{user?.name}</span>}
  </div>
);

// ============================================
// NOTIFICATION CENTER COMPONENT
// ============================================
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

// ============================================
// IMAGE CAROUSEL COMPONENT
// ============================================
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

// ============================================
// COMMENT MODAL COMPONENT
// ============================================
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

        {/* Story Preview */}
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

        {/* Comments List */}
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

        {/* Add Comment */}
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

// ============================================
// MULTI-IMAGE UPLOAD COMPONENT
// ============================================
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

// ============================================
// STORY CARD COMPONENT
// ============================================
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

        {/* Image indicators */}
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

// ============================================
// GOOGLE AUTH MODAL COMPONENT
// ============================================
const GoogleAuthModal = ({ isOpen, onClose, onLogin, user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: "demo-user-" + Date.now(),
        name: "Demo User",
        email: "demo@example.com",
        picture: DEFAULT_IMAGES.author,
        isAdmin: false,
      });
      setIsLoading(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.authModal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.authCloseBtn}>
          <Icons.X />
        </button>

        {user ? (
          // Profile View
          <div style={styles.profileView}>
            <div style={styles.profileHeader}>
              <img
                src={user.picture || DEFAULT_IMAGES.author}
                alt={user.name}
                style={styles.profileAvatarLarge}
              />
              <h3 style={styles.profileName}>{user.name}</h3>
              <p style={styles.profileEmail}>{user.email}</p>
              {user.isAdmin && (
                <div style={styles.adminBadgeProfile}>
                  <Icons.Shield /> Admin
                </div>
              )}
            </div>
          </div>
        ) : (
          // Login View
          <div style={styles.loginView}>
            <div style={styles.authHeader}>
              <h2 style={styles.authTitle}>Join Our Community</h2>
              <p style={styles.authSubtitle}>
                Sign in to share stories, like posts, and connect with travelers
              </p>
            </div>

            <div style={styles.authButtons}>
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                style={styles.demoLoginBtn}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <Icons.User /> Continue as Demo User
                  </>
                )}
              </button>

              <div style={styles.authDivider}>
                <span>or</span>
              </div>

              <button style={styles.googleBtn}>
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
              </button>
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
// MAIN APP COMPONENT
// ============================================
export default function TravelBlog() {
  // Core state
  const [currentPage, setCurrentPage] = useState("home");
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
  // LOAD DATA
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      let loadedStories = await DatabaseService.getStories();
      if (!loadedStories) {
        loadedStories = Storage.get("krissane-stories") || sampleStories;
      }

      setStories(loadedStories);
      setLikedStories(new Set(Storage.get("krissane-likes") || []));
      setBookmarkedStories(new Set(Storage.get("krissane-bookmarks") || []));
      setNotifications(Storage.get("krissane-notifications") || []);

      const savedUser = Storage.get("krissane-user");
      if (savedUser) {
        setUser(savedUser);
        if (savedUser.isAdmin) setIsAdmin(true);
      }

      const savedAdmin = Storage.get("krissane-admin");
      if (savedAdmin) setIsAdmin(true);

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save data when changed
  useEffect(() => {
    if (!isLoading) Storage.set("krissane-stories", stories);
  }, [stories, isLoading]);

  useEffect(() => {
    if (!isLoading) Storage.set("krissane-likes", Array.from(likedStories));
  }, [likedStories, isLoading]);

  useEffect(() => {
    if (!isLoading)
      Storage.set("krissane-bookmarks", Array.from(bookmarkedStories));
  }, [bookmarkedStories, isLoading]);

  useEffect(() => {
    if (!isLoading) Storage.set("krissane-notifications", notifications);
  }, [notifications, isLoading]);

  // ============================================
  // TOAST
  // ============================================
  const toast = useCallback((message, type = "success") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  // ============================================
  // NOTIFICATIONS
  // ============================================
  const addNotification = useCallback((message, data = {}) => {
    const notif = {
      id: Date.now(),
      message,
      time: "Just now",
      read: false,
      ...data,
    };
    setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
    toast("Notifications cleared");
  };

  // ============================================
  // AUTHENTICATION
  // ============================================
  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.isAdmin) setIsAdmin(true);
    Storage.set("krissane-user", userData);
    toast(`Welcome, ${userData.name}! 👋`);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    Storage.delete("krissane-user");
    toast("Signed out successfully");
  };

  const handleAdminLogin = (e) => {
    e?.preventDefault();
    if (
      adminCreds.username === ADMIN_CREDENTIALS.username &&
      adminCreds.password === ADMIN_CREDENTIALS.password
    ) {
      setIsAdmin(true);
      Storage.set("krissane-admin", true);
      setShowAdminLogin(false);
      setAdminCreds({ username: "", password: "" });
      toast("Welcome, Admin! 🛡️");
    } else {
      setAdminError("Invalid credentials");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    Storage.delete("krissane-admin");
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

    await DatabaseService.createStory(story);
    setStories((prev) => [story, ...prev]);

    // Add notification for new story
    addNotification(`New story: "${story.title}" by ${story.author.name}`, {
      avatar: story.author.avatar,
      storyId: story.id,
    });

    setNewStory({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      location: "",
      images: [],
    });
    setCurrentPage("home");
    toast("Story published! 🎉");
  };

  const handleDeleteStory = async (storyId) => {
    await DatabaseService.deleteStory(storyId);
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    setSelectedStory(null);
    setShowDeleteConfirm(null);
    setCurrentPage("home");
    toast("Story deleted");
  };

  // ============================================
  // LIKES - Real-time
  // ============================================
  const handleLike = useCallback(
    async (storyId) => {
      if (!user) {
        toast("Please sign in to like stories", "error");
        return;
      }

      const isLiked = likedStories.has(storyId);

      // Optimistic update
      setLikedStories((prev) => {
        const newSet = new Set(prev);
        isLiked ? newSet.delete(storyId) : newSet.add(storyId);
        return newSet;
      });

      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? { ...s, likes: isLiked ? s.likes - 1 : s.likes + 1 }
            : s
        )
      );

      // Update selected story if viewing it
      if (selectedStory?.id === storyId) {
        setSelectedStory((prev) => ({
          ...prev,
          likes: isLiked ? prev.likes - 1 : prev.likes + 1,
        }));
      }

      // Sync with database
      await DatabaseService.toggleLike(storyId, user.id);

      if (!isLiked) {
        const story = stories.find((s) => s.id === storyId);
        if (story && story.author.id !== user.id) {
          addNotification(`${user.name} liked "${story.title}"`, {
            avatar: user.picture,
            storyId,
          });
        }
      }
    },
    [user, likedStories, stories, selectedStory, toast, addNotification]
  );

  // ============================================
  // BOOKMARKS
  // ============================================
  const handleBookmark = useCallback(
    (storyId) => {
      setBookmarkedStories((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(storyId)) {
          newSet.delete(storyId);
          toast("Removed from bookmarks");
        } else {
          newSet.add(storyId);
          toast("Added to bookmarks");
        }
        return newSet;
      });
    },
    [toast]
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

    await DatabaseService.addComment(commentModalStory.id, comment);

    setStories((prev) =>
      prev.map((s) =>
        s.id === commentModalStory.id
          ? { ...s, comments: [...(s.comments || []), comment] }
          : s
      )
    );

    setCommentModalStory((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), comment],
    }));

    // Notification
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
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentModalStory) return;

    await DatabaseService.deleteComment(commentModalStory.id, commentId);

    setStories((prev) =>
      prev.map((s) =>
        s.id === commentModalStory.id
          ? { ...s, comments: s.comments.filter((c) => c.id !== commentId) }
          : s
      )
    );

    setCommentModalStory((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));

    toast("Comment deleted");
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
      {/* Toast */}
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

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        story={commentModalStory}
        user={user}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        isAdmin={isAdmin}
      />

      {/* Image Gallery */}
      {showImageGallery && (
        <ImageCarousel
          images={galleryImages}
          onClose={() => setShowImageGallery(false)}
        />
      )}

      {/* Delete Confirmation */}
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

      {/* Admin Login Modal */}
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

      {/* Auth Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        user={user}
      />

      {/* Navigation */}
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
              onClick={handleLogout}
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

      {/* Admin Banner */}
      {isAdmin && (
        <div style={styles.adminBanner}>
          <Icons.Shield /> Admin Mode — You can manage all posts and comments
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {/* HOME PAGE */}
        {currentPage === "home" && (
          <>
            {/* Hero */}
            <section style={styles.hero}>
              <div style={styles.heroContent}>
                <span style={styles.heroTag}>Travel Stories That Move You</span>
                <h1 style={styles.heroTitle}>
                  Every Journey Deserves to Be{" "}
                  <em style={styles.heroEmphasis}>Told</em>
                </h1>
                <p style={styles.heroDesc}>
                  Share your adventures with authentic voice, stunning photos,
                  and the moments that changed you forever.
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
                    <div style={styles.statLabel}>Stories</div>
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

            {/* Filters */}
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

            {/* Stories Grid */}
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

        {/* STORY PAGE */}
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

            {/* Image Gallery */}
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

            {/* Actions */}
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

        {/* CREATE PAGE */}
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
                  <Icons.Send /> Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOOKMARKS PAGE */}
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

      {/* Footer */}
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
          </div>
        </div>
        <div style={styles.footerBottom}>
          © 2026 Krissane Adventures. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// ============================================
// STYLES
// ============================================
const styles = {
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
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #eee",
    borderTopColor: "#C4704F",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    zIndex: 9999,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },

  // User Avatar
  userAvatarWrapper: { display: "flex", alignItems: "center", gap: "8px" },
  userAvatar: { borderRadius: "50%", objectFit: "cover" },
  userAvatarName: { fontWeight: 500, fontSize: "0.9rem" },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    maxWidth: "420px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
  },
  modalDesc: { color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" },
  modalInput: {
    width: "100%",
    padding: "12px",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "1rem",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1rem",
  },
  modalCloseBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#666",
    padding: "8px",
  },
  deleteModalIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#ffeaea",
    color: "#e74c3c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  deleteConfirmBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 20px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },

  // Comment Modal
  commentModal: {
    background: "white",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  commentModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #eee",
  },
  commentModalTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.3rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  },
  commentModalStoryPreview: {
    display: "flex",
    gap: "12px",
    padding: "16px 24px",
    background: "#f9f9f9",
    borderBottom: "1px solid #eee",
  },
  commentModalStoryImage: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  commentModalStoryInfo: { flex: 1 },
  commentModalStoryTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    marginBottom: "4px",
    margin: 0,
  },
  commentModalStoryAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
    color: "#666",
  },
  commentModalList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 24px",
    maxHeight: "350px",
  },
  commentModalItem: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f0f0f0",
  },
  commentModalAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  commentModalBody: { flex: 1 },
  commentModalMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  commentModalAuthor: { fontWeight: 600, fontSize: "0.9rem" },
  commentModalDate: { fontSize: "0.8rem", color: "#888" },
  commentModalText: {
    fontSize: "0.95rem",
    lineHeight: 1.5,
    color: "#444",
    margin: 0,
  },
  commentModalInput: {
    padding: "16px 24px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  commentInputWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  commentTextarea: {
    width: "100%",
    padding: "12px",
    fontSize: "0.95rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    resize: "none",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  commentSubmitBtn: {
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    background: "#C4704F",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  noCommentsModal: { textAlign: "center", padding: "40px 20px", color: "#888" },
  deleteCommentBtn: {
    background: "none",
    border: "none",
    color: "#e74c3c",
    cursor: "pointer",
    padding: "4px",
    marginLeft: "auto",
    opacity: 0.6,
  },
  signInPrompt: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "16px",
    background: "#f5f5f5",
    borderRadius: "8px",
    color: "#666",
    width: "100%",
  },

  // Auth Modal
  authModal: {
    background: "white",
    borderRadius: "16px",
    maxWidth: "400px",
    width: "100%",
    padding: "40px",
    position: "relative",
    textAlign: "center",
  },
  authCloseBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#666",
  },
  authHeader: { marginBottom: "32px" },
  authTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2rem",
    marginBottom: "8px",
  },
  authSubtitle: { color: "#666", fontSize: "0.95rem" },
  authButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "24px",
  },
  demoLoginBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 24px",
    background: "#2C2C2C",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "1rem",
  },
  authDivider: {
    display: "flex",
    alignItems: "center",
    color: "#999",
    fontSize: "0.85rem",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    padding: "14px 24px",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "1rem",
  },
  termsText: { fontSize: "0.8rem", color: "#888" },
  profileView: { textAlign: "center" },
  profileHeader: { marginBottom: "24px" },
  profileAvatarLarge: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginBottom: "16px",
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  profileName: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.5rem",
    marginBottom: "4px",
  },
  profileEmail: { color: "#666", fontSize: "0.9rem" },
  adminBadgeProfile: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginTop: "12px",
  },
  loginView: {},

  // Notifications
  notificationContainer: { position: "relative" },
  notificationBtn: {
    background: "#f5f5f5",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: "#e74c3c",
    color: "white",
    fontSize: "0.7rem",
    padding: "2px 6px",
    borderRadius: "10px",
    fontWeight: 600,
  },
  notificationDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    width: "320px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    zIndex: 1000,
    marginTop: "8px",
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #eee",
  },
  notificationList: { maxHeight: "400px", overflowY: "auto" },
  notificationItem: {
    display: "flex",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  notificationAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  notificationContent: { flex: 1 },
  notificationText: { fontSize: "0.9rem", marginBottom: "4px", margin: 0 },
  notificationTime: { fontSize: "0.75rem", color: "#888" },
  noNotifications: { padding: "32px", textAlign: "center", color: "#888" },
  clearAllBtn: {
    background: "none",
    border: "none",
    color: "#C4704F",
    cursor: "pointer",
    fontSize: "0.85rem",
  },

  // Image Gallery
  galleryOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.95)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryContent: { position: "relative", maxWidth: "90vw", maxHeight: "90vh" },
  galleryImage: {
    maxWidth: "100%",
    maxHeight: "85vh",
    objectFit: "contain",
    borderRadius: "8px",
  },
  galleryCloseBtn: {
    position: "absolute",
    top: "-50px",
    right: "0",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "24px",
  },
  galleryNavBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
  },
  galleryIndicators: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "8px",
  },
  galleryDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  galleryCounter: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    color: "white",
    fontSize: "0.9rem",
  },

  // Multi Image Upload
  multiImageUpload: { marginBottom: "24px" },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px",
  },
  uploadedImageWrapper: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "8px",
    overflow: "hidden",
  },
  uploadedImage: { width: "100%", height: "100%", objectFit: "cover" },
  imageOverlayActions: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    opacity: 0,
    transition: "opacity 0.2s",
  },
  moveBtn: {
    background: "white",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
  },
  removeImageBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  coverBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "#C4704F",
    color: "white",
    fontSize: "0.7rem",
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: 600,
  },
  addImageBtn: {
    aspectRatio: "1",
    border: "2px dashed #ddd",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    color: "#888",
    transition: "border-color 0.2s",
  },
  imageCount: { fontSize: "0.75rem", color: "#aaa" },

  // Story Card
  imageIndicators: {
    position: "absolute",
    bottom: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "6px",
  },
  imageDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    cursor: "pointer",
  },

  // Navigation
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 3rem",
    background: "rgba(247,243,237,0.95)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  logo: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#2C2C2C",
    cursor: "pointer",
  },
  logoAccent: { color: "#C4704F" },
  navLinks: { display: "flex", alignItems: "center", gap: "1.5rem" },
  navLink: {
    color: "#5A5A5A",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  badge: {
    background: "#C4704F",
    color: "white",
    fontSize: "0.7rem",
    padding: "2px 6px",
    borderRadius: "10px",
    fontWeight: 600,
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    background: "#C4704F",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  signInBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    background: "#2C2C2C",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  adminLoginNavBtn: {
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
  adminBadgeContainer: { display: "flex", alignItems: "center", gap: "8px" },
  adminBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    background: "#f5f5f5",
    color: "#666",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  adminBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  adminLoginHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  adminIconBig: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loginForm: { display: "flex", flexDirection: "column" },
  loginError: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    background: "#ffeaea",
    color: "#e74c3c",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "0.9rem",
  },
  adminLoginBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },

  // Main
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
    minHeight: "calc(100vh - 200px)",
  },

  // Hero
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
    padding: "4rem 0",
  },
  heroContent: {},
  heroTag: {
    display: "inline-block",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#C4704F",
    marginBottom: "1rem",
    padding: "6px 12px",
    background: "rgba(196,112,79,0.1)",
    borderRadius: "4px",
  },
  heroTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "3.2rem",
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: "1rem",
  },
  heroEmphasis: { fontStyle: "italic", color: "#C4704F" },
  heroDesc: {
    fontSize: "1.1rem",
    color: "#5A5A5A",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  heroCta: { display: "flex", gap: "1rem" },
  btnPrimary: {
    padding: "14px 28px",
    background: "#C4704F",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  heroImageWrapper: { position: "relative" },
  heroImage: {
    width: "100%",
    height: "500px",
    objectFit: "cover",
    borderRadius: "12px",
    boxShadow: "20px 20px 60px rgba(0,0,0,0.15)",
  },
  heroStats: {
    position: "absolute",
    bottom: "-20px",
    right: "-20px",
    background: "white",
    padding: "1.5rem 2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    display: "flex",
    gap: "2rem",
  },
  stat: { textAlign: "center" },
  statNumber: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#C4704F",
  },
  statLabel: {
    fontSize: "0.7rem",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },

  // Filters
  filterSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 0",
    marginBottom: "1rem",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    flex: 1,
    maxWidth: "500px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "0.95rem",
    background: "transparent",
  },
  clearSearch: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
    padding: "4px",
  },
  filterControls: { display: "flex", alignItems: "center", gap: "1rem" },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  viewToggle: {
    display: "flex",
    background: "#f5f5f5",
    borderRadius: "8px",
    overflow: "hidden",
  },
  viewBtn: {
    padding: "10px 12px",
    border: "none",
    cursor: "pointer",
    background: "transparent",
  },
  expandedFilters: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    alignItems: "flex-end",
  },
  filterGroup: { flex: "1 1 auto", minWidth: "200px" },
  filterLabel: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#666",
    marginBottom: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  categoryPills: { display: "flex", flexWrap: "wrap", gap: "8px" },
  categoryPill: {
    padding: "8px 14px",
    border: "1px solid #ddd",
    borderRadius: "20px",
    fontSize: "0.85rem",
    cursor: "pointer",
    background: "white",
  },
  sortSelect: {
    padding: "10px 14px",
    fontSize: "0.9rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
    minWidth: "150px",
  },

  // Stories
  storiesSection: { padding: "2rem 0 4rem" },
  storiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  storiesList: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  storyCard: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  storyCardFeatured: { gridColumn: "span 2" },
  storyCardList: { flexDirection: "row" },
  storyImageWrapper: {
    position: "relative",
    overflow: "hidden",
    height: "200px",
  },
  storyImageWrapperList: { flex: "0 0 250px" },
  storyImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  storyOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  readMore: { color: "white", fontWeight: 600, fontSize: "0.9rem" },
  storyActions: {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
    gap: "8px",
  },
  actionIconBtn: {
    background: "rgba(0,0,0,0.4)",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
  },
  storyContent: {
    padding: "1.25rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  storyCategory: {
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#C4704F",
    marginBottom: "0.5rem",
    display: "block",
  },
  storyTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.2rem",
    fontWeight: 600,
    lineHeight: 1.3,
    marginBottom: "0.5rem",
    flex: 1,
  },
  storyExcerpt: {
    fontSize: "0.9rem",
    color: "#666",
    lineHeight: 1.6,
    marginBottom: "1rem",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  storyMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.8rem",
    color: "#888",
    marginTop: "auto",
  },
  storyAuthor: { display: "flex", alignItems: "center", gap: "8px" },
  storyStats: { display: "flex", alignItems: "center", gap: "12px" },
  metaItem: { display: "flex", alignItems: "center", gap: "4px" },
  emptyState: { textAlign: "center", padding: "4rem 2rem", color: "#888" },

  // Article Page
  articlePage: { maxWidth: "800px", margin: "0 auto", padding: "2rem 0 4rem" },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    color: "#666",
    fontSize: "0.9rem",
    cursor: "pointer",
    marginBottom: "2rem",
    padding: "8px 0",
  },
  articleHeader: { marginBottom: "2rem" },
  articleCategory: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#C4704F",
    marginBottom: "1rem",
    display: "block",
  },
  articleTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2.8rem",
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: "1.5rem",
  },
  articleMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  articleInfo: {
    display: "flex",
    gap: "8px",
    fontSize: "0.85rem",
    color: "#888",
    alignItems: "center",
  },
  articleImageGallery: {
    position: "relative",
    cursor: "pointer",
    marginBottom: "2rem",
  },
  articleCover: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "12px",
  },
  moreImagesOverlay: {
    position: "absolute",
    bottom: "16px",
    right: "16px",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
  },
  articleBody: { fontSize: "1.1rem", lineHeight: 1.9, color: "#333" },
  articleParagraph: { marginBottom: "1.5rem" },
  articleActionsBar: {
    display: "flex",
    gap: "1rem",
    padding: "1.5rem 0",
    borderTop: "1px solid #eee",
    borderBottom: "1px solid #eee",
    marginTop: "2rem",
    flexWrap: "wrap",
  },
  articleActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    background: "#f5f5f5",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    color: "#666",
  },
  deleteBtn: { background: "#ffeaea", color: "#e74c3c" },

  // Create Page
  createPage: { maxWidth: "800px", margin: "0 auto", padding: "2rem 0 4rem" },
  createHeader: { marginBottom: "2rem" },
  createTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2.5rem",
    fontWeight: 700,
  },
  titleEmphasis: { fontStyle: "italic", color: "#8B9A7D" },
  createForm: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  titleInput: {
    width: "100%",
    padding: "1rem",
    fontSize: "1.5rem",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontWeight: 600,
    border: "none",
    borderBottom: "2px solid #eee",
    marginBottom: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  selectInput: {
    padding: "12px",
    fontSize: "0.95rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "white",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  locationInput: {
    padding: "12px",
    fontSize: "0.95rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
  },
  excerptInput: {
    width: "100%",
    padding: "12px",
    fontSize: "0.95rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "1rem",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  contentInput: {
    width: "100%",
    padding: "1rem",
    fontSize: "1rem",
    lineHeight: 1.8,
    border: "1px solid #ddd",
    borderRadius: "8px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
    minHeight: "300px",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  cancelBtn: {
    padding: "12px 24px",
    background: "#f5f5f5",
    color: "#666",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  publishBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "#C4704F",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  // Bookmarks
  bookmarksPage: { padding: "2rem 0 4rem" },
  pageHeader: { marginBottom: "2rem" },
  pageTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2.5rem",
    fontWeight: 700,
  },

  // Footer
  footer: {
    background: "#2C2C2C",
    color: "white",
    padding: "3rem",
    marginTop: "4rem",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "2rem",
  },
  footerBrand: {},
  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
  footerLinks: { display: "flex", gap: "2rem" },
  footerBottom: {
    textAlign: "center",
    paddingTop: "2rem",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
  },
};

// CSS Animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');
  
  @keyframes spin { to { transform: rotate(360deg); } }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  article:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important; }
  article:hover img { transform: scale(1.05); }
  article:hover [style*="storyOverlay"], article:hover > div > div:first-child > div:nth-child(3) { opacity: 1 !important; }
  
  div[style*="uploadedImageWrapper"]:hover > div { opacity: 1 !important; }
  
  button:hover { opacity: 0.9; }
  a:hover { color: #C4704F !important; }
  input:focus, textarea:focus, select:focus { border-color: #C4704F !important; }
  
  @media (max-width: 768px) {
    nav { padding: 1rem !important; flex-wrap: wrap; gap: 1rem; }
    section[style*="hero"] { grid-template-columns: 1fr !important; gap: 2rem !important; }
    div[style*="storiesGrid"] { grid-template-columns: 1fr !important; }
    div[style*="formRow"] { grid-template-columns: 1fr !important; }
    article[style*="storyCardFeatured"] { grid-column: span 1 !important; }
  }
`;
document.head.appendChild(styleSheet);
