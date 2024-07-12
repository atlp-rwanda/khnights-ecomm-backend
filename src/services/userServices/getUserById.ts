import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../../entities/User';

const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const userRepository = getRepository(User);

    const user = await userRepository
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
      .where('user.id = :id', { id: userId })
      .getOne();

    user && res.status(200).json({ message: 'User retrived', user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default getUserById;
