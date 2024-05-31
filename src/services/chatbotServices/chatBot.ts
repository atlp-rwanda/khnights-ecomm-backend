import { configDotenv } from 'dotenv';
import { Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '../../utils/response.utils';
import { manager } from '../../train';


export const chatBot = async (req: Request, res: Response) => {
  const userMessage = req.body.message;
  
  try {
    if(!userMessage){
      return sendErrorResponse(res, 400, 'No user message');
    }
    const result = await manager.process('en', userMessage);
    const intent = result.intent;

   if (result.answer || intent !== 'None') {
    return sendSuccessResponse(res, 200, "", result.answer)
   }

   else {
    return sendSuccessResponse(res, 200, "Sorry, I am not sure what you mean. Can you rephrase?", result.answer)
   }
  
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, 500, (error as Error).message);

  }
  };