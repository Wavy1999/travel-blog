const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(CLIENT_ID);

// Mock database (in production, use MongoDB/PostgreSQL)
const users = [];

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

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Auth server is running",
    timestamp: new Date().toISOString(),
  });
});

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

    // Check if user exists
    let user = users.find((u) => u.email === googleUser.email);

    if (!user) {
      // Create new user
      user = {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        isAdmin: googleUser.email.includes("@admin.com"), // Simple admin check
        createdAt: new Date(),
        storyCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
      };
      users.push(user);
      console.log("New user created:", user.email);
    }

    // Generate JWT token
    const jwtToken = generateToken(user);

    // Set HTTP-only cookie (secure in production)
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return user info (excluding sensitive data)
    const { id, email, name, picture, isAdmin } = user;

    res.json({
      success: true,
      user: {
        id,
        email,
        name,
        picture,
        isAdmin,
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

// Get current user (for testing)
app.get("/api/auth/me", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { id, email, name, picture, isAdmin } = user;

    res.json({
      user: { id, email, name, picture, isAdmin },
    });
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
});

// Simple user stats (for demo)
app.get("/api/users", (req, res) => {
  const userList = users.map(({ id, email, name, isAdmin, createdAt }) => ({
    id,
    email,
    name,
    isAdmin,
    createdAt,
  }));

  res.json({
    count: users.length,
    users: userList,
  });
});

// Update package.json scripts
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Auth server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `🔐 Google OAuth endpoint: http://localhost:${PORT}/api/auth/google`
  );
});
