import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET;

if (!jwtSecretKey) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

export const verifiedToken = (token: string): any => {
  try {
    return jwt.verify(token, jwtSecretKey);
  } catch (err) {
    console.error(err);
    return null;
  }
};
