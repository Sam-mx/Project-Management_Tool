// server/services/notification.service.ts
import Notification from "../models/notification"; // Check filename casing!
import { io, onlineUsers } from "../app";

export const createNotification = async (
  recipientId: string,
  type: string,
  message: string,
  senderId?: string,
  refId?: string,
  refModel?: string
) => {
  try {
    // 1. Create Object
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      referenceId: refId,
      referenceModel: refModel,
      isRead: false, // Default
    });

    // 2. SAVE TO DB (This prevents disappearing on refresh)
    const savedNotification = await notification.save(); // <--- CRITICAL STEP

    // 3. Send Real-time Socket
    const socketId = onlineUsers.get(recipientId.toString());
    if (socketId) {
      io.to(socketId).emit("new_notification", savedNotification);
    }
    
    return savedNotification;
  } catch (error) {
    console.error("❌ Error saving notification:", error);
  }
};