import { Request, Response } from 'express';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import sendMail from '../utils/sendMail';
import { send } from 'process';
import dotenv from 'dotenv';
dotenv.config();

const registerUser = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, gender, phoneNumber, userType, photoUrl } = req.body;

    // Validate user input
    if (!(firstName && lastName && email && password && gender && phoneNumber && photoUrl)) {
        return res.status(400).json({ error: 'Please fill all the fields' });
    }

    const userRepository = getRepository(User);

    // Check for existing user
    const existingUser = await userRepository.findOneBy({ email });
    const existingUserNumber = await userRepository.findOneBy({ phoneNumber });

    if (existingUser || existingUserNumber) {
        return res.status(400).json({ error: 'Email or phone number already in use' });
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


  //this function is to send email when all the variable are set , and the email and password is set in the.env file and the verification email 
   if(process.env.AUTH_EMAIL && process.env.AUTH_PASSWORD ){

    const message = {
        to: email,
        from: process.env.AUTH_EMAIL,
        subject: 'Welcome to the knights app',
        text: `Welcome to the app, ${firstName} ${lastName}!`,
    }
    const link = `http://localhost:3000/verify/${user.id}`

    sendMail(process.env.AUTH_EMAIL,process.env.AUTH_PASSWORD, message, link);

   }     
   


    return res.status(201).json({ message: 'User registered successfully' });
}

export { registerUser };
