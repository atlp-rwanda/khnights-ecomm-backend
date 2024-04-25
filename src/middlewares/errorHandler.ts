import { Request, Response } from 'express';

class CustomError extends Error {
    statusCode: number;
    status: string;

    constructor (message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,

) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.statusCode,
        message: err.message
    });
    console.error(err.stack);
};

export { CustomError, errorHandler };
