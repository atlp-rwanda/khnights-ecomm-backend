import express, { Request, Response } from 'express';
import cors from 'cors';
import router from './routes';
import { addDocumentation } from './startups/docs';
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { CustomError, errorHandler } from './middlewares/errorHandler';
import morgan from 'morgan';
import { dbConnection } from './startups/dbConnection';
import passport from 'passport';
import session from 'express-session';
import routerGmail from '../src/routes/googleRoutes.auth';
dotenv.config();

export const app = express();

app.use(cors({ origin: '*' }));
app.use(router);
addDocumentation(app);
app.all('*', (req: Request, res: Response, next) => {
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


//Google OAuth routes
app.use('/auth/google', routerGmail);

const port = process.env.PORT || 6890;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
