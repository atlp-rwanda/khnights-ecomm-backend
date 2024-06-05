import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { responseError, responseServerError, responseSuccess } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { User } from '../../entities/User';

export const userPasswordResetService = async (req: Request, res: Response) => {
  try {
    const { email, userid } = req.query;
    const { newPassword, confirmPassword } = req.body;
    const mail: any = email;
    const userId: any = userid;
    const userRepository = getRepository(User);
    if (!email || !userid) {
      return responseError(res, 404, `Something went wrong while fetching your data`);
    }
    const existingUser = await userRepository.findOneBy({ email: mail, id: userId });
    if (!existingUser) {
      return responseError(res, 404, `We can't find you data`);
    }

    if (!newPassword || !confirmPassword) {
      return responseError(res, 200, 'Please provide all required fields');
    }
    if (newPassword !== confirmPassword) {
      return responseError(res, 200, 'new password must match confirm password');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    existingUser.password = hashedPassword;
    const updadeUser = await userRepository.save(existingUser);
    return responseSuccess(res, 201, 'Password updated successfully', updadeUser);
  } catch (error) {
    console.log('error: reseting password in password reset service');
    return responseServerError(res, 'Internal server error');
  }
};
