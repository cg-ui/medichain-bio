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
  name: { type: String },
  walletAddress: { type: String },
  emergencyUnlock: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

// Report Schema
const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true }, // IPFS CID
  fileHash: { type: String, required: true }, // Blockchain Tx Hash
  recordType: { type: String, required: true },
  fileName: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

// Access Grant Schema
const accessGrantSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modules: [{ type: String }],
  expiry: { type: Date, required: true },
  isEmergency: { type: Boolean, default: false },
});

const AccessGrant = mongoose.model("AccessGrant", accessGrantSchema);

// In-memory fallback for Demo Mode
const mockUsers: any[] = [];
const mockReports: any[] = [];
const mockAccessGrants: any[] = [];

// Auth Middleware
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, role, name, walletAddress } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

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
      id: user._id,
      email: user.email,
      address: user.walletAddress || null,
      name: user.name || user.email.split('@')[0]
    });
  } catch (error) {
    res.status(500).json({ error: "Resolution failed" });
  }
});

// Report Routes
app.post("/api/reports", authenticate, async (req: any, res) => {
  try {
    const { patientEmail, patientAddress, fileUrl, fileHash, recordType, fileName } = req.body;
    const uploaderId = req.user.userId;

    // Resolve patient
    let patient;
    if (isDbConnected) {
      if (patientEmail) {
        patient = await User.findOne({ email: patientEmail.toLowerCase(), role: "patient" });
      } else if (patientAddress) {
        patient = await User.findOne({ walletAddress: patientAddress, role: "patient" });
      }
    } else {
      if (patientEmail) {
        patient = mockUsers.find(u => u.email.toLowerCase() === patientEmail.toLowerCase() && u.role === "patient");
      } else if (patientAddress) {
        patient = mockUsers.find(u => u.walletAddress === patientAddress && u.role === "patient");
      }
    }

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    // Authorization: Only doctors or the patient themselves can upload
    if (req.user.role !== 'doctor' && req.user.userId !== patient._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to upload for this patient" });
    }

    if (isDbConnected) {
      const report = new Report({
        patientId: patient._id,
        uploadedBy: uploaderId,
        fileUrl,
        fileHash,
        recordType,
        fileName
      });
      await report.save();
    } else {
      mockReports.push({
        _id: Date.now().toString(),
        patientId: patient._id,
        uploadedBy: uploaderId,
        fileUrl,
        fileHash,
        recordType,
        fileName,
        timestamp: new Date()
      });
    }

    res.status(201).json({ message: "Report saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save report" });
  }
});

app.get("/api/reports/:patientId", authenticate, async (req: any, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Authorization Check
    let hasAccess = false;

    if (userRole === 'patient' && userId === patientId) {
      hasAccess = true;
    } else if (userRole === 'doctor') {
      // 1. Check for active access grant
      if (isDbConnected) {
        const grant = await AccessGrant.findOne({
          patientId,
          doctorId: userId,
          expiry: { $gt: new Date() }
        });
        if (grant) hasAccess = true;
      } else {
        const grant = mockAccessGrants.find(g => 
          g.patientId === patientId && 
          g.doctorId === userId && 
          new Date(g.expiry) > new Date()
        );
        if (grant) hasAccess = true;
      }

      // 2. Check for emergency unlock
      if (!hasAccess) {
        let patient;
        if (isDbConnected) {
          patient = await User.findById(patientId);
        } else {
          patient = mockUsers.find(u => u._id === patientId);
        }
        if (patient && patient.emergencyUnlock) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ error: "Unauthorized access to patient reports" });
    }

    let reports;
    if (isDbConnected) {
      reports = await Report.find({ patientId }).sort({ timestamp: -1 });
    } else {
      reports = mockReports.filter(r => r.patientId === patientId).sort((a, b) => b.timestamp - a.timestamp);
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

app.get("/api/reports/view/:reportId", authenticate, async (req: any, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.userId;

    let report;
    if (isDbConnected) {
      report = await Report.findById(reportId);
    } else {
      report = mockReports.find(r => r._id === reportId);
    }

    if (!report) return res.status(404).json({ error: "Report not found" });

    // Authorization Check
    let hasAccess = false;
    const patientId = report.patientId.toString();

    if (req.user.role === 'patient' && userId === patientId) {
      hasAccess = true;
    } else if (req.user.role === 'doctor') {
      if (isDbConnected) {
        const grant = await AccessGrant.findOne({
          patientId,
          doctorId: userId,
          expiry: { $gt: new Date() }
        });
        if (grant) hasAccess = true;
      } else {
        const grant = mockAccessGrants.find(g => 
          g.patientId === patientId && 
          g.doctorId === userId && 
          new Date(g.expiry) > new Date()
        );
        if (grant) hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ fileUrl: report.fileUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify access" });
  }
});

// Access Grant Routes
app.post("/api/access/grant", authenticate, async (req: any, res) => {
  try {
    const { doctorEmail, modules, durationSeconds, isEmergency } = req.body;
    const patientId = req.user.userId;

    if (req.user.role !== 'patient' && !isEmergency) {
      return res.status(403).json({ error: "Only patients can grant access" });
    }

    // Resolve doctor email
    let doctor;
    if (isDbConnected) {
      doctor = await User.findOne({ email: doctorEmail.toLowerCase(), role: "doctor" });
    } else {
      doctor = mockUsers.find(u => u.email.toLowerCase() === doctorEmail.toLowerCase() && u.role === "doctor");
    }

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const expiry = new Date(Date.now() + durationSeconds * 1000);

    if (isDbConnected) {
      await AccessGrant.findOneAndUpdate(
        { patientId, doctorId: doctor._id },
        { modules, expiry, isEmergency },
        { upsert: true, new: true }
      );
    } else {
      const existing = mockAccessGrants.find(g => g.patientId === patientId && g.doctorId === doctor._id);
      if (existing) {
        existing.modules = modules;
        existing.expiry = expiry;
        existing.isEmergency = isEmergency;
      } else {
        mockAccessGrants.push({ patientId, doctorId: doctor._id, modules, expiry, isEmergency });
      }
    }

    res.json({ message: "Access granted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to grant access" });
  }
});

app.post("/api/access/revoke", authenticate, async (req: any, res) => {
  try {
    const { doctorEmail } = req.body;
    const patientId = req.user.userId;

    let doctor;
    if (isDbConnected) {
      doctor = await User.findOne({ email: doctorEmail.toLowerCase(), role: "doctor" });
    } else {
      doctor = mockUsers.find(u => u.email.toLowerCase() === doctorEmail.toLowerCase() && u.role === "doctor");
    }

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    if (isDbConnected) {
      await AccessGrant.deleteOne({ patientId, doctorId: doctor._id });
    } else {
      const idx = mockAccessGrants.findIndex(g => g.patientId === patientId && g.doctorId === doctor._id);
      if (idx !== -1) mockAccessGrants.splice(idx, 1);
    }

    res.json({ message: "Access revoked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to revoke access" });
  }
});

app.post("/api/access/emergency-toggle", authenticate, async (req: any, res) => {
  try {
    const { status } = req.body;
    const patientId = req.user.userId;

    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: "Only patients can toggle emergency unlock" });
    }

    if (isDbConnected) {
      await User.findByIdAndUpdate(patientId, { emergencyUnlock: status });
    } else {
      const user = mockUsers.find(u => u._id === patientId);
      if (user) user.emergencyUnlock = status;
    }

    res.json({ message: `Emergency unlock ${status ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle emergency unlock" });
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
