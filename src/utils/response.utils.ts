import { Response } from 'express';
import jsend from 'jsend';

interface ApiResponse {
    code: number;
    resp_msg: string;
    data?: any;
}

export const responseSuccess = (res: Response, status_code: number, message: string, data?: any): Response<ApiResponse> => {
    return res.status(200).json(jsend.success({
        code: status_code,
        message,
        data,
    }));
};

export const responseError = (res: Response, status_code: number, message: string, data?: any): Response<ApiResponse> => {
    return res.status(400).json(jsend.error({
        code: status_code,
        message,
        data,
    }));
};

export const responseServerError = (res: Response, error: string): Response<ApiResponse> => {
    return res.status(500).json(jsend.error({
        code: 999,
        message: `There is a problem with the server!: ${error}`,
    }));
};