import { Response } from 'express';
import jsend from 'jsend';

interface ApiResponse {
  code: number;
  resp_msg: string;
  data?: any;
}

export const responseSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
): Response<ApiResponse> => {
  return res.status(statusCode).json(
    jsend.success({
      code: statusCode,
      message,
      ...data,
    })
  );
};

export const responseError = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
): Response<ApiResponse> => {
  return res.status(statusCode).json(
    jsend.error({
      code: statusCode,
      message,
      data,
    })
  );
};

export const responseServerError = (res: Response, error: string): Response<ApiResponse> => {
  return res.status(500).json(
    jsend.error({
      code: 999,
      message: `There is a problem with the server!: ${error}`,
    })
  );
};
