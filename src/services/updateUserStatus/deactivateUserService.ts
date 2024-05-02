import { Request, Response } from 'express';
import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import { sendEmail } from '../../utils/sendStatusMail';

enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'suspended',
}

export const deactivateUserService = async (req:Request,res:Response)=>{
    try {
        const {email} = req.body;
        const userRepository = getRepository(User);

        if(!email){
            return res.status(404).json({error: 'Email is needed'});
        }

        const user = await userRepository.findOneBy({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status === 'suspended') {
            return res.json({ message: 'User is already suspended' });
        }

        user.status = UserStatus.INACTIVE;
        await userRepository.save(user);

        await sendEmail('User_Account_diactivated', { name: user.firstName, email: user.email });

        return res.json({ message: 'User deactivated successfully', user });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}