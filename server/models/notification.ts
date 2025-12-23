import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  // 1. ADD "BOARD_INVITE"
  type: "ASSIGNMENT" | "SPACE_INVITE" | "BOARD_INVITE" | "DEADLINE" | "SYSTEM" | "MENTION";
  message: string;
  isRead: boolean;
  referenceId?: mongoose.Types.ObjectId;
  // 2. ADD "Board"
  referenceModel?: "Card" | "Space" | "Board"; 
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    type: { 
      type: String, 
      // 3. Update Enum here too
      enum: ["ASSIGNMENT", "SPACE_INVITE", "BOARD_INVITE", "DEADLINE", "SYSTEM", "MENTION"], 
      required: true 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    referenceId: { type: Schema.Types.ObjectId },
    // 4. Update Enum here too
    referenceModel: { type: String, enum: ["Card", "Space", "Board"] }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);