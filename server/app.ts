import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/db";
import { BASE_PATH, PUBLIC_DIR_NAME, STATIC_PATH } from "./config";
import path from "path";
import rootRouter from "./routes";
import setupCronJobs from "./cron/deadline.cron";
import http from "http";
import { Server } from "socket.io";

// dotenv config
dotenv.config();

// connectDB
connectDB();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

// === CORS CONFIGURATION (CRITICAL) ===
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://samwise-pmt.vercel.app", // Primary Production URL
  "https://samwise-pmt.vercel.app/" // Trailing slash variation
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); // Debug log
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // Required for cookies/sessions
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Security Headers for Google OAuth Popup
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(express.json());
app.use(cookieParser());

// Debug Middleware: Log every request to server console
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// static files
app.use(
  BASE_PATH + STATIC_PATH,
  express.static(path.join(__dirname, PUBLIC_DIR_NAME))
);

// === SOCKET.IO CONFIGURATION ===
const io = new Server(server, {
  path: "/socket.io/", // Explicit path
  cors: {
    origin: allowedOrigins, // Must match Express CORS
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Allow both
});

// Manage Online Users
export const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} is online (Socket: ${socket.id})`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// routes
app.use(`${BASE_PATH}`, rootRouter);

// Export io
export { io };

server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);

  // AI Training Logic
  import("./services/ai.service")
    .then(({ trainAndCategorizeCards }) => trainAndCategorizeCards())
    .then(() => console.log("AI training & categorization completed"))
    .catch(console.error);
});

// Setup Cron Jobs
setupCronJobs();