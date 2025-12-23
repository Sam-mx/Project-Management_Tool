import cron from "node-cron";
import Card from "../models/card.model";
import { createNotification } from "../services/notification.service";

const setupCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running Deadline Checker...");
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find cards due in the next 24 hours that aren't done
    const upcomingCards = await Card.find({
      dueDate: {
        $gte: now,
        $lt: tomorrow,
      },
      // Assuming you have a list status or 'done' boolean. Adjust accordingly.
      // isCompleted: false 
    });

    for (const card of upcomingCards) {
      // Notify all members assigned to this card
      for (const memberId of card.members) {
        await createNotification(
          memberId.toString(),
          "DEADLINE",
          `Reminder: The card "${card.title}" is due soon!`,
          undefined, // System message, no sender
          card._id,
          "Card"
        );
      }
    }
  });
};

export default setupCronJobs;