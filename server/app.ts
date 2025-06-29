import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/db";
import { BASE_PATH, PUBLIC_DIR_NAME, STATIC_PATH } from "./config";
import path from "path";
import rootRouter from "./routes";

// dotenv config
dotenv.config();

// connectDB
connectDB();

const app = express();

const PORT = process.env.PORT || 8000;

// middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000", // if you use port 3000
      "http://localhost:5173", // if you use Vite's default port
    ],
    credentials: true, // if you use cookies or need credentials
  })
);

app.use(express.json());
// static files -> eg: /api/v1/static -> points to /public dir
app.use(
  BASE_PATH + STATIC_PATH,
  express.static(path.join(__dirname, PUBLIC_DIR_NAME))
);

// routes
app.use(`${BASE_PATH}`, rootRouter);



app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
