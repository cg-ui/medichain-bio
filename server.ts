import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

let isDbConnected = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      isDbConnected = true;
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      console.log("Running in DEMO MODE with in-memory auth fallback.");
    });
} else {
  console.log("MONGODB_URI not found. Running in DEMO MODE with in-memory auth fallback.");
}

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor"], required: true },
});

const User = mongoose.model("User", userSchema);

// In-memory fallback for Demo Mode
const mockUsers: any[] = [];

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isDbConnected) {
      const user = new User({ email, password: hashedPassword, role });
      await user.save();
    } else {
      // Mock signup
      if (mockUsers.find(u => u.email === email)) {
        return res.status(400).json({ error: "User already exists" });
      }
      mockUsers.push({ _id: Date.now().toString(), email, password: hashedPassword, role });
    }
    
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(400).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;

    if (isDbConnected) {
      user = await User.findOne({ email });
    } else {
      user = mockUsers.find(u => u.email === email);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.json({ user: { email: user.email, role: user.role }, isDemo: !isDbConnected });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.get("/api/auth/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    let user;

    if (isDbConnected) {
      user = await User.findById(decoded.userId).select("-password");
    } else {
      user = mockUsers.find(u => u._id === decoded.userId);
    }

    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user, isDemo: !isDbConnected });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
