import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import { addDocumentation } from './startups/docs';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import session from "express-session"
import { CustomError, errorHandler } from './middlewares/errorHandler';
import morgan from 'morgan';
import { dbConnection } from './startups/dbConnection';
import passport from 'passport';



dotenv.config();

export const app = express();
const port = process.env.PORT || 8000;
app.use(session({
  secret: 'keyboard cat'
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json());
app.use(cookieParser());
app.use(cookieParser());
app.use(cors({ origin: '*' }));
app.use(router);
addDocumentation(app);
app.all('*', (req: Request, res: Response, next:any) => {
  const error = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
  error.status = 'fail';
  next(error);
});
app.use(errorHandler);


// Start database connection

dbConnection();

//morgan
const morganFormat = ':method :url :status :response-time ms - :res[content-length]';
app.use(morgan(morganFormat));

export const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
