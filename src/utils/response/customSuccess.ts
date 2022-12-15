import { response, Response } from 'express';

response.customSuccess = function (statusCode: number, data?: any): Response {
  return this.status(statusCode).json({ data: data });
};
