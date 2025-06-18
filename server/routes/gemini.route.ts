import express from "express";
import { getGeminiResponse } from "../ai/gemini"; // Adjust the path as needed

const geminiRouter = express.Router();

geminiRouter.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message); 
  try {
    const projectContext = `
      Here is the latest project management context:
      - Current tasks: Dashboard redesign, Wireframes, User feedback backlog
      - Next milestone: Product launch in two weeks
      - Recent meeting notes: The team agreed to prioritize the dashboard redesign and gather user feedback before launch.
    `;
    const prompt = `
      You are a project management assistant. Only respond to questions or requests related to project management.
      If the user asks about anything else, politely decline to answer and remind them that you only help with project management topics.

      ${projectContext}

      The user asks: ${message}
    `;
    const reply = await getGeminiResponse(prompt);
    res.json({ reply });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default geminiRouter;
