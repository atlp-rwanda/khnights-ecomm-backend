import { Request, Response } from 'express';
import { responseError, responseSuccess } from '../../utils/response.utils';
import { User, UserInterface } from '../../entities/User';
import { getRepository } from 'typeorm';

export const userProfileUpdateServices = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return responseError(res, 400, 'body required');
    }

    const { firstName, lastName, gender, phoneNumber } = req.body;

    // Validate user input
    if (!firstName || !lastName || !gender || !phoneNumber) {
      return responseError(res, 400, 'Fill all the field');
    }

    const userRepository = getRepository(User);
    const existingUser = await userRepository.findOne({
      where: {
        id: req.user?.id,
      },
    });

    if (!existingUser) {
      return responseError(res, 401, 'User not found');
    }

    existingUser.firstName = firstName;
    existingUser.lastName = lastName;
    existingUser.gender = gender;
    existingUser.phoneNumber = phoneNumber;
    await userRepository.save(existingUser);

    const newUser = await userRepository.findOne({
      where: {
        id: req.user?.id,
      },
    });

    // eslint-disable-next-line no-unused-vars
    const { password, twoFactorCode, twoFactorCodeExpiresAt, ...safeUser } = newUser as UserInterface;
    return responseSuccess(res, 200, 'User Profile has successfully been updated', {
      profile: safeUser,
    });
  } catch (error) {
    responseError(res, 400, (error as Error).message);
  }
};
