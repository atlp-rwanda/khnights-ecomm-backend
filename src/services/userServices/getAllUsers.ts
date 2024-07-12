import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../../entities/User';

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = getRepository(User);

    const users = await userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.gender',
        'user.phoneNumber',
        'user.photoUrl',
        'user.verified',
        'user.twoFactorEnabled',
        'user.status',
        'user.userType',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
      ])
      .getMany();

    res.status(200).json({ message: 'All users retrieved', users });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default getAllUsers;
