import { Response } from 'express';

export type TResponse<T> = {
    statusCode: number;
    success: boolean;
    message?: string;
    data: T;
};

const sendResponse = <T>(res: Response, payload: TResponse<T>): void => {
    res.status(payload.statusCode).json(payload);
};

export default sendResponse;
