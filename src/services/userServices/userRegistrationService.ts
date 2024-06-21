import { Request, Response } from 'express';
import { User } from '../../entities/User';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { responseError, responseServerError, responseSuccess } from '../../utils/response.utils';
import sendMail from '../../utils/sendMail';
import dotenv from 'dotenv';
dotenv.config();

export const userRegistrationService = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, gender, phoneNumber, userType } = req.body;

  // Validate user input
  if (!firstName || !lastName || !email || !password || !gender || !phoneNumber) {
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

    // Save user
    await userRepository.save(user);
    if (process.env.AUTH_EMAIL && process.env.AUTH_PASSWORD) {
      const message = {
        to: email,
        from: process.env.AUTH_EMAIL,
        subject: 'Welcome to the knights app',
        text: `Welcome to the app, ${firstName} ${lastName}!`,
        lastName: lastName,
        firstName: firstName,
      };
      const link = `${process.env.CLIENT_URL}/verify-email/${user.id}`;

      sendMail(process.env.AUTH_EMAIL, process.env.AUTH_PASSWORD, message, link);
    } else {
      // return res.status(500).json({ error: 'Email or password for mail server not configured' });
      return responseError(res, 500, 'Email or password for mail server not configured');
    }

    return responseSuccess(res, 201, 'User registered successfully');
  } catch (error) {
    if (error instanceof Error) {
      return responseServerError(res, error.message);
    }

    return responseServerError(res, 'Unknown error occurred');
  }
};
