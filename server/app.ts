import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/db";
import { BASE_PATH, PUBLIC_DIR_NAME, STATIC_PATH } from "./config";
import path from "path";
import rootRouter from "./routes";
import setupCronJobs from "./cron/deadline.cron";
import http from "http"; // 1. Import HTTP
import { Server } from "socket.io"; // 2. Import Socket.io

// dotenv config
dotenv.config();

// connectDB
connectDB();

const app = express();
// 3. Create the HTTP server wrapper
const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

// middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173", // Vite default
      "http://localhost:8000",
      "http://localhost:8001",
      "https://samwise-pmt.vercel.app/"
    ],
    credentials: true,
  })
);

app.use(express.json());

// static files
app.use(
  BASE_PATH + STATIC_PATH,
  express.static(path.join(__dirname, PUBLIC_DIR_NAME))
);

// 4. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://samwise-pmt.vercel.app/"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 5. Manage Online Users (Export this!)
export const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // When frontend emits "join", map their User ID to this Socket ID
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} is online (Socket: ${socket.id})`);
  });

  socket.on("disconnect", () => {
    // Remove user from map on disconnect
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

// 6. Export io so 'notification.service.ts' can use it
export { io };

// 7. Change app.listen -> server.listen
server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);

  // Existing AI Training Logic
  import("./services/ai.service")
    .then(({ trainAndCategorizeCards }) => trainAndCategorizeCards())
    .then(() => console.log("AI training & categorization completed"))
    .catch(console.error);
});

// Setup Cron Jobs
setupCronJobs();