import { Request, Response } from 'express';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { responseError, responseServerError, responseSuccess } from '../utils/response.utils';
import { validate } from 'class-validator';

class UserController {
  static registerUser = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, gender, phoneNumber, userType, photoUrl } = req.body;

    // Validate user input
    if (!firstName || !lastName || !email || !password || !gender || !phoneNumber || !photoUrl) {
      return responseError(res, 400, 'Please fill all the required fields');
    }

    const userRepository = getRepository(User);

    try {
      // Check for existing user
      const existingUser = await userRepository.findOneBy({ email });
      const existingUserNumber = await userRepository.findOneBy({ phoneNumber });

      if (existingUser || existingUserNumber) {
        return responseError(res, 409, 'Email or phone number already in use');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = hashedPassword;
      user.userType = userType;
      user.gender = gender;
      user.phoneNumber = phoneNumber;
      user.photoUrl = photoUrl;

      // Save user
      await userRepository.save(user);

      return responseSuccess(res, 201, 'User registered successfully');
    } catch (error) {
      if (error instanceof Error) {
        return responseServerError(res, error.message);
      }

      return responseServerError(res, 'Unknown error occurred');
    }
  };
}
export { UserController };
