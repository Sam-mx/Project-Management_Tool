import { Request, Response } from "express";
import Notification from "../models/notification"; // Ensure this matches your filename (Capital N)

// Define the shape of the Request after Auth middleware runs
interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any; // Allow other properties
  };
}

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // Cast req to AuthRequest so TS knows 'user' exists
    const userId = (req as AuthRequest).user?._id;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "username avatar");
      
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json(error);
  }
};