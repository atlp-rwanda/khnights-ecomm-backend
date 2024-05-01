import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const jwtSecretKey = process.env.JWT_SECRETKEY;

if (!jwtSecretKey) {
  throw new Error('JWT_SECRETKEY is not defined in the environment variables.');
}

export const tokenize = (payload: string | object | Buffer): string =>
  jwt.sign(payload, jwtSecretKey, { expiresIn: '48h' });

export const check = (hashedPassword: any, password: string): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};

export const verifiedToken = (token: string): any => {
  try {
    return jwt.verify(token, jwtSecretKey);
  } catch (err) {
    console.error(err);
    return null;
  }
};
