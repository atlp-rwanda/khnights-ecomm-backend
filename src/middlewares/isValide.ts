import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifiedToken } from '../helpers/TokenizeAndVerifyPass';

export interface DecodedUser {
  userType: string;
  id: string;
  email: string;
}

export interface CustomeRequest extends Request {
  user?: DecodedUser;
}

export const isAdmin: RequestHandler = async (
  req: CustomeRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    const user = verifiedToken(token) as DecodedUser;

    if (user.userType !== 'Admin') {
      console.log('Acess denied. You are not an ADMIN');
      res.status(403).json({ Message: 'Acess denied.' });
      return;
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Error in isAdmin middleware:\n', error);
    res.status(401).json({ Message: 'Sorry, Something went wrong' });
    return;
  }
};

export const isUser: RequestHandler = async (req: CustomeRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.token;
    const user = verifiedToken(token) as DecodedUser;

    if (user.userType !== 'Admin' && user.userType !== 'Buyer' && user.userType !== 'Vendor') {
      console.log('Access denied. Un Authorized user');
      res.status(403).json({ Message: 'Access denied.' });
      return;
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Error in isUser middleware:\n', error);
    res.status(401).json({ Message: 'Sorry, Something went wrong' });
    return;
  }
};
