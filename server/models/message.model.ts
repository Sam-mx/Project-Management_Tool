// server/models/message.model.ts
import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  boardId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  role: "user" | "model";
  content: string;
  createdAt: Date; // 👈 TypeScript expects a Date object
}

// server/models/message.model.ts

const messageSchema = new Schema<IMessage>({
  boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["user", "model"], required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { 
    type: Date, 
    // FIX: Using () => new Date() explicitly returns the Date type 
    // instead of the number type returned by Date.now
    default: () => new Date() 
  },
});

export default model<IMessage>("Message", messageSchema);