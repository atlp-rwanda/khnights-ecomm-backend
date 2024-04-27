import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import { addDocumentation } from "./startups/docs";

import {CustomError,errorHandler} from "./middlewares/errorHandler";
import morgan from 'morgan';
dotenv.config();

export const app = express();
const port = process.env.PORT as string;
app.use(express.json());

app.use(cors({ origin: "*" }));

app.all('*', (req: Request,res: Response,next) =>{
    const error = new CustomError(`Can't find ${req.originalUrl} on the server!`,404);
    error.status = 'fail';
    next(error);
});

addDocumentation(app);
app.get("/api/v1", (req: Request, res: Response) => {
  res.send("Knights Ecommerce API");
});
app.use(router);
app.use(errorHandler);

//morgan
const morganFormat = ':method :url :status :response-time ms - :res[content-length]';
app.use(morgan(morganFormat));



app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
