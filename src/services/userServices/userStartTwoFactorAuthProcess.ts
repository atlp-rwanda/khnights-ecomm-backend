import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const start2FAProcess = async (email: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOneBy({ email });
  if (!user) {
    return [false, 'User not found'];
  }

  user.twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
  const timeout = (parseInt(process.env.TWO_FA_MINS as string) || 3) * 60 * 1000;
  user.twoFactorCodeExpiresAt = new Date(Date.now() + timeout);
  await userRepository.save(user);
  return user.twoFactorCode;
};
