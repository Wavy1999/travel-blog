import React, { useState, useEffect, useRef } from "react";

// Add Google Sign-In Script dynamically
const loadGoogleSignInScript = () => {
  if (document.getElementById("google-signin-script")) return;

  const script = document.createElement("script");
  script.id = "google-signin-script";
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    console.log("Google Sign-In script loaded");
  };
  document.head.appendChild(script);
};

// Icons as simple SVG components
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
      width="24"
      height="24"
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
};

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: "Krissaneadmin",
  password: "krissane2026",
};

// Google Sign-In Configuration - Replace with your actual Client ID
const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "89220882541-r7jkt456a57ve9c3jh46mb6fnoeuq379.apps.googleusercontent.com";

// API URL for backend
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Default images
const DEFAULT_IMAGES = {
  author:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  cover: "/2.jpeg",
  story1:
    "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&h-800&fit=crop",
  story2:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop",
};

// Sample stories data
const sampleStories = [
  {
    id: 1,
    title: "The Night Market That Changed How I See Food Forever",
    excerpt:
      "The spicy scent of street grill smoke wrapped around me as dusk settled over Baguio...",
    content: `The spicy scent of street grill smoke wrapped around me as dusk settled over Baguio. I didn't know it yet, but the next three hours would redefine everything I thought I knew about culinary adventure.

I'd been traveling through Baguio City for two weeks, exploring the local food scene, but nothing had prepared me for the sensory overload of the Night Market at Session Road.

A woman in her sixties waved me over to her stall. Her face was weathered but kind, illuminated by the warm glow of a single hanging bulb. She placed a bowl in front of me—Pinikpikan, a traditional Cordilleran dish. The chicken was tender, the broth rich with ginger and etag (smoked meat), and the vegetables fresh from the nearby farms.

That night taught me that the best meals aren't found in restaurants with Michelin stars. They're found in plastic chairs on crowded sidewalks of Baguio, shared with locals who become friends, with the cool mountain air as our companion.`,

    category: "Baguio Encounters",
    location: "Baguio City, Philippines",
    date: "2025-12-20",
    readTime: 8,
    coverImage: DEFAULT_IMAGES.story1,
    author: {
      name: "Krissane Alva",
      avatar: DEFAULT_IMAGES.author,
    },
    likes: 234,
    comments: [
      {
        id: 1,
        author: "Christian",
        avatar: DEFAULT_IMAGES.author,
        text: "This brought back so many memories of our trip to Baguio! The night market is truly magical.",
        date: "2025-12-21",
      },
      {
        id: 2,
        author: "Jameson",
        avatar: DEFAULT_IMAGES.author,
        text: "Camp John Hay is absolutely incredible. Did you manage to explore it while you were there?",
        date: "2025-12-22",
      },
    ],
  },
  {
    id: 2,
    title: "Finding Serenity in Kyoto's Hidden Temples",
    excerpt:
      "Beyond the crowded tourist paths, I discovered ancient temples where time seemed to stand still...",
    content: `Kyoto in autumn is a palette of crimson and gold, but the real magic lies off the beaten path. While tourists flocked to Kinkaku-ji, I wandered into the quiet neighborhood of Ohara, where moss-covered steps led to Sanzen-in Temple.

The air was cool and carried the scent of incense. An elderly monk was raking the gravel garden into perfect patterns, each stroke a meditation. He noticed me watching and gestured for me to join him. For an hour, we raked in silence, the only sounds being the rustle of maple leaves and distant temple bells.

In that simple act, I understood the Japanese concept of wabi-sabi—finding beauty in imperfection and transience. The temple wasn't just a building; it was a living, breathing space where centuries of prayers had soaked into the wooden beams.`,
    category: "Cultural Encounters",
    location: "Kyoto, Japan",
    date: "2025-11-15",
    readTime: 6,
    coverImage: DEFAULT_IMAGES.story2,
    author: {
      name: "Krissane Alva",
      avatar: DEFAULT_IMAGES.author,
    },
    likes: 189,
    comments: [
      {
        id: 3,
        author: "Alex",
        avatar: DEFAULT_IMAGES.author,
        text: "Beautifully written. Kyoto's hidden temples are truly special.",
        date: "2025-11-16",
      },
    ],
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

const writingTips = [
  {
    icon: "✨",
    title: "Tell Your Story",
    desc: "Write in first person with emotional depth and sensory details.",
  },
  {
    icon: "🧠",
    title: "Clear Structure",
    desc: "Hook, context, journey, and reflection create compelling narratives.",
  },
  {
    icon: "📸",
    title: "Visual Storytelling",
    desc: "Your own photos with captions make stories feel authentic.",
  },
  {
    icon: "💡",
    title: "Cultural Depth",
    desc: "Weave in local observations and meaningful encounters.",
  },
];

// Storage utility
const Storage = {
  get: async (key) => {
    try {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
      return null;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },
  set: async (key, value) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Storage set error:", error);
    }
  },
  delete: async (key) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Storage delete error:", error);
    }
  },
};

// Google Auth Modal Component
const GoogleAuthModal = ({ isOpen, onClose, onLogin, onLogout, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const googleSignInButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && !user) {
      loadGoogleSignInScript();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen || user || !window.google || !googleSignInButtonRef.current)
      return;

    const timer = setTimeout(() => {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleSignInButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 280,
        });

        // Show One Tap sign-in
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        setError("Failed to initialize Google Sign-In");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, user]);

  const loadGoogleSignInScript = () => {
    if (document.getElementById("google-signin-script")) return;

    const script = document.createElement("script");
    script.id = "google-signin-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Sign-In script loaded");
    };
    document.head.appendChild(script);
  };

  const handleGoogleSignIn = async (response) => {
    setIsLoading(true);
    setError("");

    try {
      // Send token to backend for verification
      const result = await verifyGoogleToken(response.credential);

      if (result.success && result.user) {
        onLogin(result.user);
        onClose();
      } else {
        setError(result.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setError("Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyGoogleToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return await response.json();
    } catch (error) {
      console.error("Token verification error:", error);

      // Fallback to client-side verification if backend is down
      try {
        const userData = parseJwt(token);
        return {
          success: true,
          user: {
            id: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            token: token,
            isAdmin: userData.email.includes("admin") || false,
          },
        };
      } catch (parseError) {
        return { success: false, message: "Invalid token format" };
      }
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error("Invalid token format");
    }
  };

  const handleLogout = async () => {
    try {
      // Revoke Google token if available
      if (window.google && user?.token) {
        window.google.accounts.id.disableAutoSelect();
        window.google.accounts.id.revoke(user.email, () => {
          console.log("Google Sign-Out successful");
        });
      }

      // Call backend logout
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.log("Backend logout failed, continuing with local logout");
      }

      // Clear local session
      onLogout();
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if backend fails
      onLogout();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {user ? (
          // User Profile View
          <div style={styles.profileView}>
            <div style={styles.profileHeader}>
              <img
                src={user.picture}
                alt={user.name}
                style={styles.profileAvatarLarge}
              />
              <h3 style={styles.profileName}>{user.name}</h3>
              <p style={styles.profileEmail}>{user.email}</p>
            </div>

            <div style={styles.adminSection}>
              {user.isAdmin && (
                <div style={styles.adminBadge}>
                  <Icons.Shield /> Admin User
                </div>
              )}
            </div>

            <div style={styles.profileStats}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{user.storyCount || 0}</div>
                <div style={styles.statLabel}>Stories</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{user.commentCount || 0}</div>
                <div style={styles.statLabel}>Comments</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{user.bookmarkCount || 0}</div>
                <div style={styles.statLabel}>Bookmarks</div>
              </div>
            </div>

            <div style={styles.profileActions}>
              <button onClick={handleLogout} style={styles.logoutButton}>
                <Icons.LogOut /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          // Login View
          <div style={styles.loginView}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Join the Community</h2>
              <p style={styles.modalSubtitle}>
                Sign in to share stories, comment, and bookmark your favorites
              </p>
            </div>

            <div style={styles.signInSection}>
              <div style={styles.signInWith}>Sign in with</div>

              <div
                ref={googleSignInButtonRef}
                style={styles.googleButtonContainer}
              />

              {isLoading && (
                <div style={styles.loading}>
                  <div style={styles.loadingSpinner}></div>
                  <span>Signing in...</span>
                </div>
              )}

              {error && (
                <div style={styles.errorMessage}>
                  <Icons.X /> {error}
                </div>
              )}
            </div>

            <div style={styles.termsSection}>
              <p style={styles.termsText}>
                By continuing, you agree to our{" "}
                <a href="/terms" style={styles.termsLink}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" style={styles.termsLink}>
                  Privacy Policy
                </a>
              </p>
            </div>

            <button onClick={onClose} style={styles.closeButton}>
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// User Dropdown Component
const UserDropdown = ({ user, onLogin, onLogout, showToast }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUserClick = () => {
    if (user) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    await onLogout();
    setIsDropdownOpen(false);
    showToast("Signed out successfully");
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  const handleLoginSuccess = (userData) => {
    onLogin(userData);
    setShowAuthModal(false);
    showToast(`Welcome, ${userData.name}!`);
  };

  return (
    <>
      <div style={styles.dropdownContainer}>
        <button
          onClick={handleUserClick}
          style={styles.userButton}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
        >
          {user ? (
            <>
              <img
                src={user.picture}
                alt={user.name}
                style={styles.userAvatar}
              />
              <span style={styles.userName}>{user.name.split(" ")[0]}</span>
              <Icons.ChevronDown />
            </>
          ) : (
            <>
              <Icons.User />
              <span style={styles.signInText}>Sign in</span>
            </>
          )}
        </button>

        {isDropdownOpen && user && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <img
                src={user.picture}
                alt={user.name}
                style={styles.dropdownAvatar}
              />
              <div>
                <div style={styles.dropdownName}>{user.name}</div>
                <div style={styles.dropdownEmail}>{user.email}</div>
              </div>
            </div>

            <div style={styles.dropdownDivider} />

            <div style={styles.dropdownMenu}>
              <button
                style={styles.dropdownItem}
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowAuthModal(true);
                }}
              >
                Profile Settings
              </button>
              {user.isAdmin && (
                <button style={styles.dropdownItem}>
                  <div style={styles.adminTag}>Admin Panel</div>
                </button>
              )}
              <button style={styles.dropdownItem} onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={handleCloseModal}
        onLogin={handleLoginSuccess}
        onLogout={handleLogout}
        user={user}
      />
    </>
  );
};

// Main TravelBlog Component
export default function TravelBlog() {
  const [currentPage, setCurrentPage] = useState("home");
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [likedStories, setLikedStories] = useState(new Set());
  const [bookmarkedStories, setBookmarkedStories] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // User state
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");

  // New story form
  const [newStory, setNewStory] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    location: "",
    coverImagePreview: "",
  });
  const fileInputRef = useRef(null);

  // Google User state
  const [googleUser, setGoogleUser] = useState(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const savedStories = await Storage.get("Krissane-stories");
        const savedLikes = await Storage.get("Krissane-likes");
        const savedBookmarks = await Storage.get("Krissane-bookmarks");
        const savedUserName = await Storage.get("Krissane-username");
        const savedAdmin = await Storage.get("Krissane-admin");
        const savedGoogleUser = await Storage.get("Krissane-google-user");

        setStories(savedStories?.length > 0 ? savedStories : sampleStories);
        if (savedLikes) setLikedStories(new Set(savedLikes));
        if (savedBookmarks) setBookmarkedStories(new Set(savedBookmarks));
        if (savedUserName) setUserName(savedUserName);
        if (savedAdmin) setIsAdmin(true);
        if (savedGoogleUser) {
          setGoogleUser(savedGoogleUser);
          if (!savedUserName) {
            setUserName(savedGoogleUser.name);
          }
        }
      } catch (error) {
        console.error("Load data error:", error);
        setStories(sampleStories);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (!isLoading) {
      Storage.set("Krissane-stories", stories);
    }
  }, [stories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      Storage.set("Krissane-likes", Array.from(likedStories));
    }
  }, [likedStories, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      Storage.set("Krissane-bookmarks", Array.from(bookmarkedStories));
    }
  }, [bookmarkedStories, isLoading]);

  // Toast notification
  const toast = (message, type = "success") => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Handle Google Login
  const handleGoogleLogin = (userData) => {
    setGoogleUser(userData);
    setUserName(userData.name);

    // If user is admin, set admin state
    if (userData.isAdmin) {
      setIsAdmin(true);
      Storage.set("Krissane-admin", true);
    }

    Storage.set("Krissane-google-user", userData);
    Storage.set("Krissane-username", userData.name);
  };

  // Handle Google Logout
  const handleGoogleLogout = () => {
    setGoogleUser(null);
    setUserName("");

    // Check if we should keep admin state (might be separate admin login)
    const savedAdmin = localStorage.getItem("Krissane-admin");
    if (!savedAdmin) {
      setIsAdmin(false);
    }

    Storage.delete("Krissane-google-user");
    Storage.delete("Krissane-username");
  };

  // Admin functions
  const handleAdminLogin = (e) => {
    e?.preventDefault();
    if (
      adminUsername === ADMIN_CREDENTIALS.username &&
      adminPassword === ADMIN_CREDENTIALS.password
    ) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminUsername("");
      setAdminPassword("");
      setAdminLoginError("");
      Storage.set("Krissane-admin", true);
      toast("Welcome, Admin! 🛡️");
    } else {
      setAdminLoginError("Invalid username or password");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    Storage.delete("Krissane-admin");
    toast("Logged out successfully");
  };

  // Filter stories
  const filteredStories = stories
    .filter((story) => {
      const matchesSearch =
        searchQuery === "" ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || story.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "popular") return b.likes - a.likes;
      if (sortBy === "comments")
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      return 0;
    });

  // Story image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast("Please select an image file", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStory((prev) => ({
          ...prev,
          coverImagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit new story
  const handleSubmitStory = () => {
    if (!newStory.title.trim()) {
      toast("Please enter a story title", "error");
      return;
    }

    if (!newStory.content.trim()) {
      toast("Please write your story content", "error");
      return;
    }

    if (!newStory.category) {
      toast("Please select a category", "error");
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
        Math.ceil(newStory.content.split(/\s+/).filter(Boolean).length / 200)
      ),
      coverImage: newStory.coverImagePreview || DEFAULT_IMAGES.cover,
      author: {
        name: userName.trim() || "Anonymous Traveler",
        avatar: googleUser?.picture || DEFAULT_IMAGES.author,
      },
      likes: 0,
      comments: [],
    };

    setStories((prev) => [story, ...prev]);
    setNewStory({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      location: "",
      coverImagePreview: "",
    });

    setCurrentPage("home");
    toast("Your story has been published! 🎉");
  };

  // Like a story
  const handleLike = (storyId, e) => {
    e?.stopPropagation();
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;

    const isLiked = likedStories.has(storyId);
    const newLikedStories = new Set(likedStories);

    if (isLiked) {
      newLikedStories.delete(storyId);
    } else {
      newLikedStories.add(storyId);
      toast("Story liked!");
    }

    setLikedStories(newLikedStories);

    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, likes: isLiked ? s.likes - 1 : s.likes + 1 }
          : s
      )
    );

    if (selectedStory?.id === storyId) {
      setSelectedStory((prev) => ({
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1,
      }));
    }
  };

  // Bookmark a story
  const handleBookmark = (storyId, e) => {
    e?.stopPropagation();
    const newBookmarks = new Set(bookmarkedStories);

    if (newBookmarks.has(storyId)) {
      newBookmarks.delete(storyId);
      toast("Removed from bookmarks");
    } else {
      newBookmarks.add(storyId);
      toast("Added to bookmarks");
    }

    setBookmarkedStories(newBookmarks);
  };

  // Add comment
  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast("Please write a comment", "error");
      return;
    }

    // Require Google login for comments
    if (!googleUser) {
      toast("Please sign in to comment", "error");
      return;
    }

    const comment = {
      id: Date.now(),
      author: googleUser.name,
      avatar: googleUser.picture || DEFAULT_IMAGES.author,
      text: newComment.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    setStories((prev) =>
      prev.map((s) =>
        s.id === selectedStory.id
          ? { ...s, comments: [...(s.comments || []), comment] }
          : s
      )
    );

    setSelectedStory((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), comment],
    }));

    setNewComment("");
    toast("Comment added!");
  };

  // Delete story
  const handleDeleteStory = (storyId) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    setSelectedStory(null);
    setCurrentPage("home");
    setShowDeleteConfirm(null);
    toast("Story deleted successfully");
  };

  // Delete comment
  const handleDeleteComment = (storyId, commentId) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId
          ? { ...s, comments: s.comments.filter((c) => c.id !== commentId) }
          : s
      )
    );

    if (selectedStory?.id === storyId) {
      setSelectedStory((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));
    }

    setShowDeleteConfirm(null);
    toast("Comment deleted");
  };

  // Check if user can delete story
  const canDeleteStory = (story) => {
    return (
      isAdmin ||
      story.author.name === (googleUser?.name || "Anonymous Traveler")
    );
  };

  // Loading state
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
      {/* Toast Notification */}
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

      {/* Delete Confirmation Modal */}
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
            <p style={styles.modalDesc}>
              {showDeleteConfirm.type === "story"
                ? "This will permanently delete this story and all its comments."
                : "This will permanently delete this comment."}
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.type === "story") {
                    handleDeleteStory(showDeleteConfirm.id);
                  } else {
                    handleDeleteComment(
                      showDeleteConfirm.storyId,
                      showDeleteConfirm.id
                    );
                  }
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
            <p style={styles.modalDesc}>
              Enter your credentials to access moderation features.
            </p>

            {adminLoginError && (
              <div style={styles.loginError}>
                <Icons.AlertTriangle /> {adminLoginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={styles.loginForm}>
              <input
                type="text"
                placeholder="Username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                style={styles.modalInput}
                autoFocus
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={styles.modalInput}
                required
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
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("guide");
            }}
            style={styles.navLink}
          >
            Writing Guide
          </a>
          <button
            onClick={() => {
              if (!googleUser) {
                toast("Please sign in to create a story", "error");
                return;
              }
              setCurrentPage("create");
            }}
            style={styles.createBtn}
          >
            <Icons.Plus /> New Story
          </button>

          {isAdmin && !googleUser?.isAdmin && (
            <div style={styles.adminBadgeContainer}>
              <div style={styles.adminBadge}>
                <Icons.Shield /> Admin
              </div>
              <button
                onClick={handleAdminLogout}
                style={styles.logoutBtn}
                title="Logout"
              >
                <Icons.LogOut />
              </button>
            </div>
          )}

          {!isAdmin && !googleUser?.isAdmin && (
            <button
              onClick={() => setShowAdminLogin(true)}
              style={styles.adminLoginNavBtn}
              title="Admin Login"
            >
              <Icons.Lock />
            </button>
          )}

          {/* User Dropdown */}
          <UserDropdown
            user={googleUser}
            onLogin={handleGoogleLogin}
            onLogout={handleGoogleLogout}
            showToast={toast}
          />
        </div>
      </nav>

      {/* Admin Banner */}
      {isAdmin && (
        <div style={styles.adminBanner}>
          <Icons.Shield /> Admin Mode — You can delete any posts and comments
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {/* HOME PAGE */}
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
                  Discover the art of travel storytelling. Share your adventures
                  with authentic voice, sensory details, and the moments that
                  changed you forever.
                </p>
                <div style={styles.heroCta}>
                  <button
                    onClick={() => {
                      if (!googleUser) {
                        toast("Please sign in to create a story", "error");
                        return;
                      }
                      setCurrentPage("create");
                    }}
                    style={styles.btnPrimary}
                  >
                    Share Your Story →
                  </button>
                  <button
                    onClick={() => setCurrentPage("guide")}
                    style={styles.btnSecondary}
                  >
                    Learn to Write
                  </button>
                </div>
              </div>
              <div style={styles.heroImageWrapper}>
                <img
                  src={DEFAULT_IMAGES.cover}
                  alt="Traveler"
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
                        (acc, s) => acc + (s.comments?.length || 0),
                        0
                      )}
                    </div>
                    <div style={styles.statLabel}>Comments</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Search & Filters */}
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
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
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
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    style={styles.btnPrimary}
                  >
                    Clear Filters
                  </button>
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
                    <article
                      key={story.id}
                      style={{
                        ...styles.storyCard,
                        ...(viewMode === "grid" && index === 0
                          ? styles.storyCardFeatured
                          : {}),
                        ...(viewMode === "list" ? styles.storyCardList : {}),
                      }}
                      onClick={() => {
                        setSelectedStory(story);
                        setCurrentPage("story");
                      }}
                    >
                      <div
                        style={{
                          ...styles.storyImageWrapper,
                          ...(viewMode === "list"
                            ? styles.storyImageWrapperList
                            : {}),
                        }}
                      >
                        <img
                          src={story.coverImage || DEFAULT_IMAGES.cover}
                          alt={story.title}
                          style={styles.storyImage}
                        />
                        <div style={styles.storyOverlay}>
                          <span style={styles.readMore}>Read Story →</span>
                        </div>
                        <div style={styles.storyActions}>
                          <button
                            onClick={(e) => handleLike(story.id, e)}
                            style={{
                              ...styles.actionIconBtn,
                              color: likedStories.has(story.id)
                                ? "#e74c3c"
                                : "white",
                            }}
                          >
                            <Icons.Heart filled={likedStories.has(story.id)} />
                          </button>
                          <button
                            onClick={(e) => handleBookmark(story.id, e)}
                            style={{
                              ...styles.actionIconBtn,
                              color: bookmarkedStories.has(story.id)
                                ? "#f39c12"
                                : "white",
                            }}
                          >
                            <Icons.Bookmark
                              filled={bookmarkedStories.has(story.id)}
                            />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm({
                                  type: "story",
                                  id: story.id,
                                });
                              }}
                              style={styles.actionIconBtn}
                              title="Delete (Admin)"
                            >
                              <Icons.Trash />
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={styles.storyContent}>
                        <span style={styles.storyCategory}>
                          {story.category}
                        </span>
                        <h3 style={styles.storyTitle}>{story.title}</h3>
                        <p style={styles.storyExcerpt}>{story.excerpt}</p>
                        <div style={styles.storyMeta}>
                          <div style={styles.storyAuthor}>
                            <img
                              src={story.author.avatar || DEFAULT_IMAGES.author}
                              alt={story.author.name}
                              style={styles.authorAvatar}
                            />
                            <span>{story.author.name}</span>
                          </div>
                          <div style={styles.storyStats}>
                            <span style={styles.metaItem}>
                              <Icons.Clock /> {story.readTime}m
                            </span>
                            <span style={styles.metaItem}>
                              <Icons.Heart filled={false} /> {story.likes}
                            </span>
                            <span style={styles.metaItem}>
                              <Icons.MessageCircle />{" "}
                              {story.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* BOOKMARKS PAGE */}
        {currentPage === "bookmarks" && (
          <div style={styles.bookmarksPage}>
            <button
              onClick={() => setCurrentPage("home")}
              style={styles.backBtn}
            >
              <Icons.ArrowLeft /> Back to Stories
            </button>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>
                Your <em style={styles.titleEmphasis}>Bookmarks</em>
              </h1>
              <p style={styles.pageSubtitle}>
                Stories you've saved for later reading
              </p>
            </div>
            {bookmarkedStories.size === 0 ? (
              <div style={styles.emptyState}>
                <Icons.Bookmark filled={false} />
                <h3>No bookmarks yet</h3>
                <p>Save stories to read later by clicking the bookmark icon</p>
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
                  .map((story) => (
                    <article
                      key={story.id}
                      style={styles.storyCard}
                      onClick={() => {
                        setSelectedStory(story);
                        setCurrentPage("story");
                      }}
                    >
                      <div style={styles.storyImageWrapper}>
                        <img
                          src={story.coverImage || DEFAULT_IMAGES.cover}
                          alt={story.title}
                          style={styles.storyImage}
                        />
                        <button
                          onClick={(e) => handleBookmark(story.id, e)}
                          style={styles.removeBookmark}
                        >
                          <Icons.X />
                        </button>
                      </div>
                      <div style={styles.storyContent}>
                        <span style={styles.storyCategory}>
                          {story.category}
                        </span>
                        <h3 style={styles.storyTitle}>{story.title}</h3>
                        <p style={styles.storyExcerpt}>{story.excerpt}</p>
                        <div style={styles.storyMeta}>
                          <span style={styles.metaItem}>
                            <Icons.Clock /> {story.readTime}m read
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* STORY VIEW PAGE */}
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
                <div style={styles.articleAuthor}>
                  <img
                    src={selectedStory.author.avatar || DEFAULT_IMAGES.author}
                    alt={selectedStory.author.name}
                    style={styles.articleAvatar}
                  />
                  <div>
                    <div style={styles.authorName}>
                      {selectedStory.author.name}
                    </div>
                    <div style={styles.articleDate}>
                      {new Date(selectedStory.date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}{" "}
                      • {selectedStory.location}
                    </div>
                  </div>
                </div>
                <div style={styles.articleInfo}>
                  <span>
                    <Icons.Clock /> {selectedStory.readTime} min read
                  </span>
                </div>
              </div>
            </header>

            <img
              src={selectedStory.coverImage || DEFAULT_IMAGES.cover}
              alt={selectedStory.title}
              style={styles.articleCover}
            />

            <div style={styles.articleBody}>
              {selectedStory.content.split("\n\n").map((paragraph, index) => (
                <p key={index} style={styles.articleParagraph}>
                  {paragraph}
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
                onClick={(e) => handleBookmark(selectedStory.id, e)}
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
                />{" "}
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
              {canDeleteStory(selectedStory) && (
                <button
                  onClick={() =>
                    setShowDeleteConfirm({
                      type: "story",
                      id: selectedStory.id,
                    })
                  }
                  style={{ ...styles.articleActionBtn, ...styles.deleteBtn }}
                >
                  <Icons.Trash /> Delete{" "}
                  {isAdmin &&
                    selectedStory.author.name !== googleUser?.name &&
                    "(Admin)"}
                </button>
              )}
            </div>

            {/* Comments */}
            <section style={styles.commentsSection}>
              <h3 style={styles.commentsTitle}>
                <Icons.MessageCircle /> Comments (
                {selectedStory.comments?.length || 0})
              </h3>

              <div style={styles.addComment}>
                <img
                  src={googleUser?.picture || DEFAULT_IMAGES.author}
                  alt="You"
                  style={styles.commentAvatar}
                />
                <div style={styles.commentInputWrapper}>
                  <textarea
                    placeholder={
                      googleUser
                        ? `Share your thoughts, ${
                            googleUser.name.split(" ")[0]
                          }...`
                        : "Sign in to comment..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={styles.commentInput}
                    rows={3}
                    disabled={!googleUser}
                  />
                  {googleUser ? (
                    <button
                      onClick={handleAddComment}
                      style={styles.commentSubmitBtn}
                    >
                      <Icons.Send /> Post
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        toast("Please sign in to comment", "error")
                      }
                      style={styles.commentSubmitBtnDisabled}
                    >
                      Sign in to Comment
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.commentsList}>
                {selectedStory.comments?.length === 0 ? (
                  <div style={styles.noComments}>
                    <p>No comments yet. Be the first!</p>
                  </div>
                ) : (
                  selectedStory.comments?.map((comment) => (
                    <div key={comment.id} style={styles.comment}>
                      <img
                        src={comment.avatar || DEFAULT_IMAGES.author}
                        alt={comment.author}
                        style={styles.commentAvatar}
                      />
                      <div style={styles.commentBody}>
                        <div style={styles.commentHeader}>
                          <span style={styles.commentAuthor}>
                            {comment.author}
                          </span>
                          <span style={styles.commentDate}>
                            {new Date(comment.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() =>
                                setShowDeleteConfirm({
                                  type: "comment",
                                  id: comment.id,
                                  storyId: selectedStory.id,
                                })
                              }
                              style={styles.deleteCommentBtn}
                              title="Delete (Admin)"
                            >
                              <Icons.Trash />
                            </button>
                          )}
                        </div>
                        <p style={styles.commentText}>{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>
        )}

        {/* CREATE STORY PAGE */}
        {currentPage === "create" && (
          <div style={styles.createPage}>
            <button
              onClick={() => setCurrentPage("home")}
              style={styles.backBtn}
            >
              <Icons.ArrowLeft /> Back to Stories
            </button>
            <div style={styles.createHeader}>
              <h1 style={styles.createTitle}>
                Share Your <em style={styles.titleEmphasis}>Story</em>
              </h1>
              <p style={styles.createSubtitle}>
                Tell us about your journey with sensory details and emotional
                depth.
              </p>
            </div>
            <div style={styles.createForm}>
              <div style={styles.imageUpload}>
                {newStory.coverImagePreview ? (
                  <div style={styles.imagePreviewWrapper}>
                    <img
                      src={newStory.coverImagePreview}
                      alt="Cover"
                      style={styles.imagePreview}
                    />
                    <button
                      onClick={() =>
                        setNewStory((prev) => ({
                          ...prev,
                          coverImagePreview: "",
                        }))
                      }
                      style={styles.removeImageBtn}
                    >
                      <Icons.X />
                    </button>
                  </div>
                ) : (
                  <div
                    style={styles.uploadPlaceholder}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icons.Image />
                    <span>Click to upload cover image</span>
                    <span style={styles.uploadHint}>
                      Recommended: 1200 x 800px
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </div>
              <input
                type="text"
                placeholder="Your story title..."
                value={newStory.title}
                onChange={(e) =>
                  setNewStory((prev) => ({ ...prev, title: e.target.value }))
                }
                style={styles.titleInput}
              />
              <div style={styles.formRow}>
                <select
                  value={newStory.category}
                  onChange={(e) =>
                    setNewStory((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
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
                  placeholder="Location (e.g., Tokyo, Japan)"
                  value={newStory.location}
                  onChange={(e) =>
                    setNewStory((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  style={styles.locationInput}
                />
              </div>
              <textarea
                placeholder="Brief excerpt (optional)"
                value={newStory.excerpt}
                onChange={(e) =>
                  setNewStory((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                style={styles.excerptInput}
                rows={2}
              />
              <textarea
                placeholder="Tell your story here..."
                value={newStory.content}
                onChange={(e) =>
                  setNewStory((prev) => ({ ...prev, content: e.target.value }))
                }
                style={styles.contentInput}
                rows={15}
              />
              <div style={styles.wordCount}>
                {newStory.content.split(/\s+/).filter(Boolean).length} words • ~
                {Math.max(
                  1,
                  Math.ceil(
                    newStory.content.split(/\s+/).filter(Boolean).length / 200
                  )
                )}{" "}
                min read
              </div>
              <div style={styles.formActions}>
                <button
                  onClick={() => setCurrentPage("home")}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button onClick={handleSubmitStory} style={styles.publishBtn}>
                  <Icons.Send /> Publish Story
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WRITING GUIDE PAGE */}
        {currentPage === "guide" && (
          <div style={styles.guidePage}>
            <button
              onClick={() => setCurrentPage("home")}
              style={styles.backBtn}
            >
              <Icons.ArrowLeft /> Back to Stories
            </button>
            <div style={styles.guideHeader}>
              <span style={styles.sectionTag}>The Art of Travel Writing</span>
              <h1 style={styles.guideTitle}>
                Essential Elements of a{" "}
                <em style={styles.titleEmphasis}>Great Story</em>
              </h1>
            </div>
            <div style={styles.tipsGrid}>
              {writingTips.map((tip, index) => (
                <div key={index} style={styles.tipCard}>
                  <div style={styles.tipIcon}>{tip.icon}</div>
                  <h3 style={styles.tipTitle}>{tip.title}</h3>
                  <p style={styles.tipDesc}>{tip.desc}</p>
                </div>
              ))}
            </div>
            <div style={styles.structureSection}>
              <h2 style={styles.structureTitle}>
                <Icons.BookOpen /> Story Structure
              </h2>
              <div style={styles.structureSteps}>
                {[
                  {
                    num: "01",
                    title: "Hook",
                    desc: "Grab attention immediately",
                  },
                  {
                    num: "02",
                    title: "Context",
                    desc: "Where and why you went",
                  },
                  {
                    num: "03",
                    title: "Journey",
                    desc: "Walk through experiences",
                  },
                  { num: "04", title: "Reflection", desc: "What you learned" },
                ].map((step, index) => (
                  <div key={index} style={styles.structureStep}>
                    <div style={styles.stepNum}>{step.num}</div>
                    <div>
                      <h4 style={styles.stepTitle}>{step.title}</h4>
                      <p style={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.guideFooter}>
              <button
                onClick={() => {
                  if (!googleUser) {
                    toast("Please sign in to create a story", "error");
                    return;
                  }
                  setCurrentPage("create");
                }}
                style={styles.btnPrimary}
              >
                Start Writing →
              </button>
            </div>
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
            <p style={styles.footerText}>
              Stories that transport you. Every journey deserves to be told.
            </p>
          </div>
          <div style={styles.footerLinks}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("home");
              }}
            >
              Stories
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("bookmarks");
              }}
            >
              Bookmarks
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("guide");
              }}
            >
              Writing Guide
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

// Styles
const styles = {
  app: {
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    background: "#F7F3ED",
    minHeight: "100vh",
    color: "#2C2C2C",
    lineHeight: 1.6,
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
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    maxWidth: "420px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
    color: "#2C2C2C",
  },
  modalDesc: {
    color: "#666",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
    lineHeight: 1.5,
  },
  modalInput: {
    width: "100%",
    padding: "12px",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
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
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  adminLoginHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "0.5rem",
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
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  loginError: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "#ffeaea",
    color: "#e74c3c",
    borderRadius: "6px",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  adminLoginBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
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
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",
  },
  logoAccent: {
    color: "#C4704F",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
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
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  userButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
    transition: "all 0.2s",
  },
  userAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  userName: {
    maxWidth: "100px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  signInText: {
    fontSize: "14px",
  },
  dropdownContainer: {
    position: "relative",
    display: "inline-block",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    width: "280px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    marginTop: "8px",
    animation: "slideDown 0.2s ease",
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    borderBottom: "1px solid #f0f0f0",
  },
  dropdownAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  dropdownName: {
    fontWeight: 600,
    fontSize: "16px",
    marginBottom: "2px",
  },
  dropdownEmail: {
    fontSize: "14px",
    color: "#666",
  },
  dropdownDivider: {
    height: "1px",
    background: "#f0f0f0",
  },
  dropdownMenu: {
    padding: "12px 0",
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 20px",
    background: "none",
    border: "none",
    textAlign: "left",
    fontSize: "14px",
    color: "#333",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  adminTag: {
    display: "inline-block",
    padding: "4px 12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600,
  },
  adminLoginNavBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    background: "#f5f5f5",
    color: "#666",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  adminBadgeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  adminBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "6px",
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
    borderRadius: "6px",
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
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
    minHeight: "calc(100vh - 200px)",
  },
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
  heroEmphasis: {
    fontStyle: "italic",
    color: "#C4704F",
  },
  heroDesc: {
    fontSize: "1.1rem",
    color: "#5A5A5A",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  heroCta: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "14px 28px",
    background: "#C4704F",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  btnSecondary: {
    padding: "14px 28px",
    background: "transparent",
    color: "#2C2C2C",
    border: "2px solid #2C2C2C",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  heroImageWrapper: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "500px",
    objectFit: "cover",
    borderRadius: "8px",
    boxShadow: "20px 20px 60px rgba(0,0,0,0.15)",
  },
  heroStats: {
    position: "absolute",
    bottom: "-20px",
    right: "-20px",
    background: "white",
    padding: "1.5rem 2rem",
    borderRadius: "8px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    display: "flex",
    gap: "2rem",
  },
  stat: {
    textAlign: "center",
  },
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
  filterControls: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  viewToggle: {
    display: "flex",
    background: "#f5f5f5",
    borderRadius: "6px",
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
    borderRadius: "8px",
    marginBottom: "1.5rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    alignItems: "flex-end",
  },
  filterGroup: {
    flex: "1 1 auto",
    minWidth: "200px",
  },
  filterLabel: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#666",
    marginBottom: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  categoryPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  categoryPill: {
    padding: "8px 14px",
    border: "1px solid #ddd",
    borderRadius: "20px",
    fontSize: "0.85rem",
    cursor: "pointer",
    background: "white",
    transition: "all 0.2s",
  },
  sortSelect: {
    padding: "10px 14px",
    fontSize: "0.9rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "white",
    cursor: "pointer",
    minWidth: "150px",
  },
  storiesSection: {
    padding: "2rem 0 4rem",
  },
  storiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  storiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  storyCard: {
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  storyCardFeatured: {
    gridColumn: "span 2",
  },
  storyCardList: {
    flexDirection: "row",
    height: "auto",
  },
  storyImageWrapper: {
    position: "relative",
    overflow: "hidden",
    height: "200px",
  },
  storyImageWrapperList: {
    flex: "0 0 200px",
    height: "auto",
  },
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
  readMore: {
    color: "white",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
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
    transition: "background 0.2s",
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
  storyAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  authorAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  storyStats: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    color: "#888",
  },
  bookmarksPage: {
    padding: "2rem 0 4rem",
  },
  pageHeader: {
    marginBottom: "2rem",
  },
  pageTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  pageSubtitle: {
    color: "#666",
  },
  titleEmphasis: {
    fontStyle: "italic",
    color: "#8B9A7D",
  },
  removeBookmark: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  articlePage: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 0 4rem",
  },
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
  articleHeader: {
    marginBottom: "2rem",
  },
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
  articleAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  articleAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  authorName: {
    fontWeight: 600,
    fontSize: "1rem",
  },
  articleDate: {
    fontSize: "0.85rem",
    color: "#888",
  },
  articleInfo: {
    display: "flex",
    gap: "1.5rem",
    fontSize: "0.85rem",
    color: "#666",
  },
  articleCover: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "2rem",
  },
  articleBody: {
    fontSize: "1.1rem",
    lineHeight: 1.9,
    color: "#333",
  },
  articleParagraph: {
    marginBottom: "1.5rem",
  },
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
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    color: "#666",
  },
  deleteBtn: {
    background: "#ffeaea",
    color: "#e74c3c",
  },
  commentsSection: {
    marginTop: "3rem",
  },
  commentsTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  addComment: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  },
  commentAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  commentInputWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  commentInput: {
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
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  commentSubmitBtnDisabled: {
    alignSelf: "flex-end",
    padding: "10px 20px",
    background: "#ddd",
    color: "#666",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "not-allowed",
  },
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  noComments: {
    textAlign: "center",
    padding: "2rem",
    color: "#888",
    background: "#f9f9f9",
    borderRadius: "8px",
  },
  comment: {
    display: "flex",
    gap: "1rem",
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.5rem",
    flexWrap: "wrap",
  },
  commentAuthor: {
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  commentDate: {
    fontSize: "0.8rem",
    color: "#888",
  },
  commentText: {
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#444",
  },
  deleteCommentBtn: {
    background: "none",
    border: "none",
    color: "#e74c3c",
    cursor: "pointer",
    padding: "4px",
    marginLeft: "auto",
    opacity: 0.7,
  },
  createPage: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 0 4rem",
  },
  createHeader: {
    marginBottom: "2rem",
  },
  createTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  createSubtitle: {
    color: "#666",
    fontSize: "1rem",
  },
  createForm: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  imageUpload: {
    marginBottom: "1.5rem",
  },
  uploadPlaceholder: {
    border: "2px dashed #ddd",
    borderRadius: "8px",
    padding: "3rem",
    textAlign: "center",
    cursor: "pointer",
    color: "#888",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    transition: "border-color 0.2s",
  },
  uploadHint: {
    fontSize: "0.8rem",
    color: "#aaa",
  },
  imagePreviewWrapper: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "300px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  removeImageBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
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
    borderRadius: "6px",
    background: "white",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  locationInput: {
    padding: "12px",
    fontSize: "0.95rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  },
  excerptInput: {
    width: "100%",
    padding: "12px",
    fontSize: "0.95rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "1rem",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    minHeight: "60px",
  },
  contentInput: {
    width: "100%",
    padding: "1rem",
    fontSize: "1rem",
    lineHeight: 1.8,
    border: "1px solid #ddd",
    borderRadius: "6px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
    minHeight: "300px",
    boxSizing: "border-box",
  },
  wordCount: {
    fontSize: "0.85rem",
    color: "#888",
    textAlign: "right",
    marginTop: "0.5rem",
    marginBottom: "1.5rem",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
  },
  cancelBtn: {
    padding: "12px 24px",
    background: "#f5f5f5",
    color: "#666",
    border: "none",
    borderRadius: "6px",
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
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  guidePage: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem 0 4rem",
  },
  guideHeader: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  sectionTag: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#C4704F",
    display: "block",
    marginBottom: "0.5rem",
  },
  guideTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2.8rem",
    fontWeight: 700,
    marginBottom: "1rem",
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
  },
  tipCard: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  tipIcon: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  tipTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.4rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  tipDesc: {
    color: "#666",
    lineHeight: 1.6,
  },
  structureSection: {
    background: "#2C2C2C",
    color: "white",
    padding: "3rem",
    borderRadius: "12px",
    marginBottom: "3rem",
  },
  structureTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "1.8rem",
    fontWeight: 600,
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  structureSteps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  structureStep: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  stepNum: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#C4704F",
    lineHeight: 1,
  },
  stepTitle: {
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
  stepDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem",
  },
  guideFooter: {
    textAlign: "center",
  },
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
    maxWidth: "300px",
    marginTop: "0.5rem",
  },
  footerLinks: {
    display: "flex",
    gap: "2rem",
  },
  footerBottom: {
    textAlign: "center",
    paddingTop: "2rem",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
  },

  // Google Auth Modal Styles
  modalHeader: {
    textAlign: "center",
    marginBottom: "30px",
  },
  modalSubtitle: {
    color: "#666",
    fontSize: "16px",
    lineHeight: 1.5,
  },
  signInSection: {
    textAlign: "center",
    marginBottom: "24px",
  },
  signInWith: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  googleButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
    color: "#666",
    fontSize: "14px",
  },
  loadingSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #C4704F",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "8px",
    fontSize: "14px",
    marginTop: "16px",
  },
  termsSection: {
    textAlign: "center",
    marginBottom: "24px",
  },
  termsText: {
    color: "#777",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  termsLink: {
    color: "#4285F4",
    textDecoration: "none",
  },
  closeButton: {
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "transparent",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  profileView: {
    textAlign: "center",
  },
  profileHeader: {
    marginBottom: "24px",
  },
  profileAvatarLarge: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginBottom: "16px",
    border: "3px solid white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  profileName: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "24px",
    fontWeight: 600,
    color: "#333",
    marginBottom: "4px",
  },
  profileEmail: {
    fontSize: "14px",
    color: "#666",
  },
  adminSection: {
    marginBottom: "24px",
  },
  profileStats: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
  },
  statItem: {
    textAlign: "center",
  },
  statNumber: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "24px",
    fontWeight: 700,
    color: "#C4704F",
    marginBottom: "4px",
  },
  profileActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "14px 20px",
    backgroundColor: "#f5f5f5",
    color: "#666",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

// CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'DM Sans', -apple-system, sans-serif;
  }
  
  button {
    font-family: inherit;
  }
  
  input, textarea, select {
    font-family: inherit;
  }
  
  article:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
  }
  
  article:hover img {
    transform: scale(1.05);
  }
  
  article:hover .storyOverlay {
    opacity: 1 !important;
  }
  
  button:hover {
    opacity: 0.9;
  }
  
  a:hover {
    color: #C4704F !important;
  }
  
  input:focus, textarea:focus, select:focus {
    border-color: #C4704F !important;
  }
  
  .divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #eee;
    z-index: 0;
  }
  
  @media (max-width: 1024px) {
    .hero {
      grid-template-columns: 1fr !important;
      gap: 2rem !important;
    }
    
    .heroImage {
      height: 400px !important;
    }
    
    .storiesGrid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .nav {
      padding: 1rem !important;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .navLinks {
      width: 100%;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .heroTitle {
      font-size: 2.5rem !important;
    }
    
    .storiesGrid {
      grid-template-columns: 1fr !important;
    }
    
    .storyCardFeatured {
      grid-column: span 1 !important;
    }
    
    .filterSection {
      flex-direction: column;
      align-items: stretch !important;
    }
    
    .formRow {
      grid-template-columns: 1fr !important;
    }
    
    .modal {
      padding: 1.5rem !important;
    }
    
    .footerContent {
      flex-direction: column !important;
      gap: 1.5rem !important;
    }
    
    .footerLinks {
      flex-direction: column !important;
      gap: 1rem !important;
    }
    
    .googleButtonContainer {
      transform: scale(0.9);
    }
  }
  
  @media (max-width: 480px) {
    .heroCta {
      flex-direction: column;
    }
    
    .articleActionsBar {
      flex-direction: column;
    }
    
    .addComment {
      flex-direction: column;
    }
    
    .commentHeader {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 0.5rem !important;
    }
    
    .googleButtonContainer {
      transform: scale(0.8);
    }
    
    .modalActions {
      flex-direction: column;
    }
    
    .modalActions button {
      width: 100%;
    }
    
    .dropdown {
      width: 100% !important;
      right: 0 !important;
    }
  }
`;
document.head.appendChild(styleSheet);
