import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI, createPartFromText } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const upload = multer();

app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PINATA_JWT = process.env.PINATA_JWT;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USE_AI_GENERATION = Boolean(GEMINI_API_KEY);
const USE_ARGON2 = process.env.USE_ARGON2 === 'true';
const COOKIE_SECURE = NODE_ENV === "production";
const COOKIE_SAME_SITE: "strict" | "lax" = COOKIE_SECURE ? "strict" : "lax";
let textGenClient: GoogleGenAI | null = null;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is required. Set JWT_SECRET in your environment.");
  process.exit(1);
}

if (USE_AI_GENERATION) {
  textGenClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

let isDbConnected = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB Atlas cloud for auth and privacy backup.");
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
  name: { type: String },
  walletAddress: { type: String },
});

const User = mongoose.model("User", userSchema);

const cloudRecordSchema = new mongoose.Schema({
  patientAddress: { type: String, required: true },
  recordType: { type: String, required: true },
  fileName: { type: String, required: true },
  ipfsHash: { type: String, required: true },
  syntheticSummary: { type: String, required: true },
  cloudProvider: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

const CloudRecord = mongoose.model("CloudRecord", cloudRecordSchema);
const cloudBackupRecords: any[] = [];

// In-memory fallback for Demo Mode
const mockUsers: any[] = [];

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, role, name, walletAddress } = req.body;
    if (!email || !password || !role || !["patient", "doctor"].includes(role)) {
      return res.status(400).json({ error: "Invalid signup payload" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    let hashedPassword: string;
    
    if (USE_ARGON2) {
      hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    } else {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    if (isDbConnected) {
      const user = new User({ 
        email, 
        password: hashedPassword, 
        role,
        name: name || email.split('@')[0],
        walletAddress: walletAddress || ""
      });
      await user.save();
    } else {
      // Mock signup
      if (mockUsers.find(u => u.email === email)) {
        return res.status(400).json({ error: "User already exists" });
      }
      mockUsers.push({ 
        _id: Date.now().toString(), 
        email, 
        password: hashedPassword, 
        role,
        name: name || email.split('@')[0],
        walletAddress: walletAddress || ""
      });
    }
    
    res.status(201).json({ message: "User created" });
  } catch (error) {
  console.error("🔥 SIGNUP ERROR:", error);
  res.status(400).json({
    error: "Signup failed",
    details: error instanceof Error ? error.message : error
  });
}
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    let user;

    if (isDbConnected) {
      user = await User.findOne({ email });
    } else {
      user = mockUsers.find(u => u.email === email);
    }

    let passwordMatches = false;
    if (user) {
      if (USE_ARGON2 && user.password.startsWith('$argon2')) {
        passwordMatches = await argon2.verify(user.password, password);
      } else {
        passwordMatches = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAME_SITE,
      maxAge: 24 * 60 * 60 * 1000,
    });
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

app.post("/api/auth/update-wallet", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { walletAddress } = req.body;

    if (isDbConnected) {
      await User.findByIdAndUpdate(decoded.userId, { walletAddress });
    } else {
      const user = mockUsers.find(u => u._id === decoded.userId);
      if (user) user.walletAddress = walletAddress;
    }

    res.json({ message: "Wallet updated" });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.post(
  "/api/ipfs/upload",
  upload.single("file"),
  async (
    req: express.Request & {
      file?: {
        buffer: Buffer;
        originalname: string;
      };
    },
    res
  ) => {
    if (!PINATA_JWT) {
    return res.status(500).json({ error: "Pinata JWT is not configured on the server" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const formData = new FormData();
    const uploadBlob = new Blob([new Uint8Array(req.file.buffer)]);
    formData.append("file", uploadBlob, req.file.originalname);

    const metadata = JSON.stringify({
      name: req.file.originalname,
      keyvalues: {
        app: "MediChain",
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    formData.append("pinataOptions", options);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return res.status(response.status).json({
        error: errorData?.error?.details || response.statusText || "Pinata upload failed"
      });
    }

    const data = await response.json();
    return res.json({ ipfsHash: data.IpfsHash });
  } catch (error) {
    console.error("Pinata proxy upload failed:", error);
    res.status(500).json({ error: "IPFS upload proxy failed" });
  }
});

// User Directory Routes
app.get("/api/users/resolve/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let user;

    if (isDbConnected) {
      user = await User.findOne({ email: email.toLowerCase(), role: "patient" });
    } else {
      user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === "patient");
    }

    if (!user) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      email: user.email,
      address: user.walletAddress || null,
      name: user.name || user.email.split('@')[0]
    });
  } catch (error) {
    res.status(500).json({ error: "Resolution failed" });
  }
});

async function generatePrivacySummaryWithAI(record: { patientAddress: string; recordType: string; fileName: string; }) {
  if (!textGenClient) {
    throw new Error('GenAI model is not configured.');
  }

  const prompt = `Create a privacy-preserving summary for an anonymized medical upload. The summary should be generative, synthetic, and remove any identifiable details. Use descriptive but non-specific language for a ${record.recordType} file named ${record.fileName}. Do not include patient identifiers.`;

  const chat = textGenClient.chats.create({
    model: 'gemini-1.5-flash',
    history: [],
  });

  type GenAIResponse = {
    candidates?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  const response = await chat.sendMessage({
    message: createPartFromText(prompt),
  }) as unknown as GenAIResponse;

  const candidates = response?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('No response candidates returned from GenAI.');
  }

  const content = candidates[0]?.content;
  if (!Array.isArray(content) || content.length === 0) {
    throw new Error('No content returned from GenAI response.');
  }

  return content.map((item) => item.text || '').join('').trim();
}

app.post('/api/cloud/backup', async (req, res) => {
  try {
    const { patientAddress, recordType, fileName, ipfsHash, syntheticSummary, cloudProvider, timestamp } = req.body;
    let summary = syntheticSummary;

    if ((!summary || summary.length === 0) && USE_AI_GENERATION) {
      try {
        summary = await generatePrivacySummaryWithAI({ patientAddress, recordType, fileName });
      } catch (aiErr) {
        console.error('AI summary generation failed:', aiErr);
        summary = 'AI-generated privacy summary unavailable.';
      }
    }

    if (!summary) {
      summary = 'Privacy summary generated by the cloud privacy engine.';
    }

    const payload = { patientAddress, recordType, fileName, ipfsHash, syntheticSummary: summary, cloudProvider, timestamp };

    if (isDbConnected) {
      const record = new CloudRecord(payload);
      await record.save();
      return res.status(201).json({ message: 'Cloud backup saved', id: record._id });
    }

    cloudBackupRecords.push(payload);
    res.status(201).json({ message: 'Cloud backup saved (demo mode)', id: cloudBackupRecords.length - 1 });
  } catch (error) {
    console.error('Cloud backup failed:', error);
    res.status(500).json({ error: 'Cloud backup failed' });
  }
});

app.get('/api/cloud/records/:patientAddress', async (req, res) => {
  try {
    const { patientAddress } = req.params;

    if (isDbConnected) {
      const records = await CloudRecord.find({ patientAddress }).sort({ timestamp: -1 }).lean();
      return res.json({ records });
    }

    const records = cloudBackupRecords.filter(record => record.patientAddress === patientAddress);
    res.json({ records });
  } catch (error) {
    console.error('Cloud record retrieval failed:', error);
    res.status(500).json({ error: 'Failed to fetch cloud records' });
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
