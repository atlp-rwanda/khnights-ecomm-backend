import { Request, Response } from "express";
import { responseError, responseSuccess } from "../../utils/response.utils";
import { User, UserInterface } from "../../entities/User";
import { getRepository } from "typeorm";
import { userProfileUpdate } from "../../controllers/authController";

declare module "express"{
    interface Request{
        user?: Partial <UserInterface>
    }
}


export const userProfileUpdateServices = async (req: Request, res: Response) =>{
try {
      console.log(req.body)
        if(!req.body){
            return responseError(res, 401, "body required")
        }
        
        const { firstName, lastName, gender, phoneNumber, photoUrl, email } = req.body;
    
        // Validate user input
        if (!firstName.trim() && !lastName.trim()  && !gender.trim() && !phoneNumber.trim() && !photoUrl.trim() && !email.trim()) {
            return responseError(res, 400, 'Fill all the field');
        }
    
     
        const userRepository =  getRepository(User)
        const existingUser = await userRepository.findOne({
            where: {email: req.body.email}
        })

        if (!existingUser){
            return responseError(res, 401, "User not found")
        }
            
        existingUser.firstName = firstName
        existingUser.lastName = lastName
        existingUser.gender = gender
        existingUser.phoneNumber = phoneNumber
        existingUser.photoUrl = photoUrl
    
    await userRepository.save(existingUser);
     return responseSuccess(res, 201, "User Profile has successfully been updated");
} catch (error) {
    responseError(res, 400, (error as Error).message)
    
}

}
