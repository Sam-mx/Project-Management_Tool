// server/ai/gemini.ts
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_TOOLS } from "../utils/geminiTools";
import Card from "../models/card.model";
import List from "../models/list.model";
import Message from "../models/message.model";
import Space from "../models/space.model"; 
import Board from "../models/board.model";
import { getTaskPriority } from "../services/ai.service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function processAiRequest(
  prompt: string, 
  history: any[], 
  boardId: string, 
  userId: string,
  aiMode: "command" | "consultant" = "command"
) {
  try {
    const validBoardId = new mongoose.Types.ObjectId(boardId);

    const systemInstruction = `
      You are Samwise AI, a global project architect. Current Mode: ${aiMode.toUpperCase()}.
      You manage the entire hierarchy: Spaces > Boards > Lists > Cards.
      
      KNOWLEDGE BASE:
      - Expert in Project Management (Agile, Scrum, WBS, Waterfall).
      - Relate advice back to this platform's structure.

      ${aiMode === "command" ? `
      COMMAND MODE PROTOCOL:
      - Direct and action-oriented. 
      - Execute tool changes immediately if intent is clear.
      ` : `
      CONSULTANT MODE PROTOCOL:
      - Educational. Explain "Why" before "How".
      - Ask for confirmation before modifying the database.
      `}

      PRIORITY RULES (Numeric 1-5):
      - 1: Critical | 2: High | 3: Medium | 4: Low | 5: Very Low
      EMOJI GUIDE: 📋 lists, 🎯 tasks, 🗓️ deadlines, ✅ success, ⚠️ overdue.
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // 👈 Stable model version
      tools: AI_TOOLS,
      systemInstruction
    });

    const dbHistory = await Message.find({ boardId: validBoardId, userId })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const formattedHistory = dbHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({ history: formattedHistory });
    
    // Save User Message
    await Message.create({ boardId: validBoardId, userId, role: "user", content: prompt });

    const result = await chat.sendMessage(prompt);
    
    // FIX: Tool calls often return empty text. We set a placeholder to avoid Mongoose validation errors.
    let finalAiText = result.response.text() || "..."; 
    let actionTaken = false;
    const part = result.response.candidates?.[0]?.content?.parts?.find(p => p.functionCall);

    if (part && part.functionCall) {
      const { name, args }: any = part.functionCall;
      let toolResult;

      try {
        if (name === "get_all_user_workspaces") {
          const spaces = await Space.find({ "members.memberId": userId }).lean();
          const boards = await Board.find({ spaceId: { $in: spaces.map(s => s._id) } }).lean();
          toolResult = spaces.map(s => ({
            spaceName: s.name,
            boards: boards.filter(b => b.spaceId.toString() === s._id.toString()).map(b => ({ title: b.title, id: b._id }))
          }));
        }
        else if (name === "create_space") {
          const newSpace = new Space({ 
            name: args.name, 
            members: [{ memberId: new mongoose.Types.ObjectId(userId) }], 
            creator: userId 
          });
          await newSpace.save();
          toolResult = { success: true, message: `Workspace "${args.name}" created.` };
          actionTaken = true;
        }
        else if (name === "create_board") {
          const space = await Space.findOne({ name: new RegExp(`^${args.spaceName}$`, "i"), "members.memberId": userId });
          if (!space) {
            toolResult = { error: `Space "${args.spaceName}" not found.` };
          } else {
            const newBoard = new Board({ title: args.name, spaceId: space._id, creator: userId });
            await newBoard.save();
            toolResult = { success: true, message: `Board "${args.name}" created in ${args.spaceName}.` };
            actionTaken = true;
          }
        }
        else if (name === "create_task") {
          const list = await List.findOne({ boardId: validBoardId, title: new RegExp(`^${args.listName}$`, "i") });
          if (!list) {
            toolResult = { error: `List "${args.listName}" not found.` };
          } else {
            const numericPriority = getTaskPriority(args.dueDate);
            const newCard = new Card({
              name: args.name,
              listId: list._id,
              boardId: validBoardId,
              creator: userId,
              priority: numericPriority,
              deadline: args.dueDate ? new Date(args.dueDate) : null,
              pos: "a"
            });
            await newCard.save();
            toolResult = { success: true, task: newCard.name };
            actionTaken = true;
          }
        }
        else if (name === "get_board_data") {
          const lists = await List.find({ boardId: validBoardId }).lean();
          const cards = await Card.find({ boardId: validBoardId }).lean();
          const priorityLabels: Record<number, string> = { 1: "Critical 🚨", 2: "High 🟠", 3: "Medium 🟡", 4: "Low 🟢", 5: "Very Low ⚪" };
          toolResult = lists.map(l => ({
            listName: l.title,
            tasks: cards.filter(c => c.listId.toString() === l._id.toString()).map(c => ({
              name: c.name,
              priority: priorityLabels[c.priority as number] || "Low 🟢",
              deadline: c.deadline ? new Date(c.deadline).toDateString() : "Not set",
              status: c.completed ? "Completed" : "Pending"
            }))
          }));
        }

        const finalResult = await chat.sendMessage([{
          functionResponse: { name, response: { content: toolResult } }
        }]);
        finalAiText = finalResult.response.text();

      } catch (err: any) {
        console.error("Tool Error:", err.message);
        finalAiText = "I encountered an error updating the architecture: " + err.message;
      }
    }

    // --- FINAL SAFETY CHECK ---
    // If the AI response is still empty or just whitespace, provide a fallback.
    if (!finalAiText || finalAiText.trim().length === 0) {
      finalAiText = "Action completed! ✅ How else can I assist you?";
    }

    await Message.create({ boardId: validBoardId, userId, role: "model", content: finalAiText });
    return { reply: finalAiText, actionTaken };
  } catch (error: any) {
    console.error("Critical AI Error:", error);
    throw error;
  }
}