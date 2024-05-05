import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const is2FAValid = async (email: string, code: string) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOneBy({ email });
  if (!user) {
    return [false, 'User not found'];
  }

  if (user.twoFactorCode !== code) {
    return [false, 'Invalid authentication code'];
  }

  if (user.twoFactorCodeExpiresAt && user.twoFactorCodeExpiresAt < new Date()) {
    return [false, 'Authentication code expired'];
  }

  // Force 2FA code to expire after usage
  user.twoFactorCodeExpiresAt = new Date(Date.now() - 10 * 60 * 1000);
  await userRepository.save(user);
  return [true];
};
