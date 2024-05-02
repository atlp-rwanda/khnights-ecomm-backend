import { Request, Response } from 'express';

// logout method
export const logoutService = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies['token'] || null;
    if (!token) {
      res.status(400).json({ Message: 'Access denied. You must be logged in' });
      return;
    }

    res.clearCookie('token');
    res.status(200).json({ Message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Sorry, Token required.' });
  }
};
