import bcrypt from 'bcrypt';
import { Request, Response } from "express";
import { responseError, responseServerError, responseSuccess } from "../../utils/response.utils";
import { getRepository } from "typeorm";
import { User } from "../../entities/User";

export const userPasswordResetService = async (req: Request, res: Response) => {
    try {
        const { email, userid } = req.params;
        const { newPassword, confirmPassword } = req.body;

        const userRepository = getRepository(User);

        const existingUser = await userRepository.findOneBy({ email, id: userid });
        if (!existingUser) {
            return responseError(res, 404, 'Something went wrong in finding your data');
        }

        if (!newPassword || !confirmPassword) {
            return responseError(res, 204, 'Please provide all required fields');
        }
        if (newPassword !== confirmPassword) {
            return responseError(res, 204, 'new password must match confirm password');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        existingUser.password = hashedPassword;
        const updadeUser = await userRepository.save(existingUser);
        return responseSuccess(res, 200, "Password updated successful", updadeUser);
    } catch (error) {
        return responseServerError(res, "Internal server error");
    }
}

