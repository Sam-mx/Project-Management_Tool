// server/routes/gemini.route.ts
import express from "express";
import mongoose from "mongoose";
import { processAiRequest } from "../ai/gemini";
import { authMiddleware } from "../middlewares/auth";
import Message from "../models/message.model";

const geminiRouter = express.Router();

/**
 * @route   POST /api/gemini/chat
 * @desc    Send a message to the AI with specific AI Mode (Command vs Consultant)
 */
geminiRouter.post("/chat", authMiddleware, async (req: any, res: any) => {
  // 1. Extract aiMode from the request body (defaults to command if missing)
  const { message, history, boardId, aiMode } = req.body;
  const userId = req.user._id;

  console.log(`AI Request [Mode: ${aiMode}] by User: ${userId} for Board: ${boardId}`);

  try {
    // 2. Pass the aiMode to the processing function
    const { reply, actionTaken } = await processAiRequest(
      message, 
      history, 
      boardId, 
      userId, 
      aiMode 
    );
    
    res.json({ reply, actionTaken });
  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    res.status(500).json({
      error: "The AI assistant is currently unavailable.",
      details: error.message,
    });
  }
});

/**
 * @route   GET /api/gemini/history/:boardId
 * @desc    Fetch chat history for a specific board
 */
geminiRouter.get("/history/:boardId", authMiddleware, async (req: any, res) => {
  try {
    const { boardId } = req.params;

    // Safety Check: Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: "Invalid Board ID format" });
    }

    const messages = await Message.find({
      boardId: new mongoose.Types.ObjectId(boardId),
      userId: req.user._id,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch History Error:", err);
    res.status(500).send("Error loading chat history");
  }
});

/**
 * @route   DELETE /api/gemini/history/:boardId
 * @desc    Clear chat history for a specific board
 */
geminiRouter.delete("/history/:boardId", authMiddleware, async (req: any, res) => {
  try {
    const { boardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: "Invalid Board ID format" });
    }

    const result = await Message.deleteMany({ 
      boardId: new mongoose.Types.ObjectId(boardId), 
      userId: req.user._id 
    });

    console.log(`Deleted ${result.deletedCount} messages for board ${boardId}`);
    res.status(200).json({ message: "History cleared successfully" });
  } catch (err: any) {
    console.error("DELETE HISTORY ERROR:", err);
    res.status(500).json({ error: "Server failed to clear history", details: err.message });
  }
});

export default geminiRouter;