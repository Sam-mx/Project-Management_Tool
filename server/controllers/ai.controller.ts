import { Request, Response } from 'express';
import { analyzeAndUpdateCard, trainAndCategorizeCards } from '../services/ai.service';

// Process one task by ID
export const processTaskWithAI = async (req: Request, res: Response) => {
  const { cardId } = req.body;
  
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'cardId is required' });
  }

  try {
    // 👇 FIX: Wait for the AI to finish before responding!
    const result = await analyzeAndUpdateCard(cardId);

    // Now send the response. The frontend will wait for this.
    return res.status(200).json({ 
      success: true, 
      message: 'AI processing completed successfully.',
      data: result 
    });

  } catch (err) {
    console.error('Error processing card:', err);
    return res.status(500).json({ success: false, message: 'AI processing failed.' });
  }
};

// Batch train and categorize all uncategorized cards
export const batchTrainAndCategorize = async (req: Request, res: Response) => {
  try {
    await trainAndCategorizeCards();
    res.status(200).json({ success: true, message: 'Batch training and categorization completed.' });
  } catch (err) {
    console.error('Batch training error:', err);
    res.status(500).json({ success: false, message: 'Batch training failed.' });
  }
};