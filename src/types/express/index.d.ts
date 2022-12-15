import { JwtPayload } from '../../types/JwtPayload';

declare global {
  namespace Express {
    export interface Request {
      jwtPayload: JwtPayload;
    }
    export interface Response {
      customSuccess(statusCode: number, data?: any): Response;
    }
  }
}
