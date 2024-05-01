import { Request, Response } from 'express';
import { User } from '../entities/User';;
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';


class UserController {
    static registerUser = async (req: Request, res: Response) => {
        const { firstName, lastName, email, password, gender, phoneNumber, userType, status, verified, photoUrl } = req.body;

        // Validate user input
        if (!(firstName && lastName && email && password && gender && phoneNumber && verified && photoUrl)) {
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
        user.status = status ? status : 'active';
        user.verified = verified;

        // Save user
        await userRepository.save(user);

        return res.status(201).json({ message: 'User registered successfully' });
    };
}
export { UserController };