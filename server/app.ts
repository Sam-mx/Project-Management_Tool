import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// Define allowed origins centrally to ensure consistency
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8000",
  "http://localhost:8001",
  "https://samwise-pmt.vercel.app", // <--- ADDED: No trailing slash (Critical for Vercel)
  "https://samwise-pmt.vercel.app/" // Keeping this just in case
];

// middlewares
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// static files
app.use(
  BASE_PATH + STATIC_PATH,
  express.static(path.join(__dirname, PUBLIC_DIR_NAME))
);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same list here
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
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