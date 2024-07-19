import { Request, Response } from 'express';
import { responseError, responseSuccess } from '../../utils/response.utils';
import { User, UserInterface } from '../../entities/User';
import { getRepository } from 'typeorm';
import cloudinary from '../../utils/cloudinary';

declare module 'express' {
  interface Request {
    files?: any;
  }
}

const userUpdateProfilePicture = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const userRepository = getRepository(User);
    const userToUpdate = await userRepository.findOne({
      where: {
        email: user?.email,
      },
    });

    if (!userToUpdate) {
      return responseError(res, 404, 'User not found');
    }

    const files: any = req.files;

    if (files.length < 1) {
      return responseError(res, 400, 'Please upload an image');
    }

    for (const file of files) {
      const image = file.path;
      const link = await cloudinary.uploader.upload(image);
      userToUpdate.photoUrl = link.secure_url;
    }

    await userRepository.save(userToUpdate);

    const newUser = await userRepository.findOne({
      where: {
        email: user?.email,
      },
    });

    // eslint-disable-next-line no-unused-vars
    const { password, twoFactorCode, twoFactorCodeExpiresAt, ...safeUser } = newUser as UserInterface;
    responseSuccess(res, 200, 'profile picture updated successfully', { profile: safeUser });
    return;
  } catch (error) {
    responseError(res, 400, (error as Error).message);
    return;
  }
};

export default userUpdateProfilePicture;
