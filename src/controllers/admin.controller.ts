import { Response, Request, NextFunction } from 'express';
import { Service } from 'typedi';

import {AdminService} from '../services';

@Service()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.adminService.login(req.body, next));
    } catch {
      next();
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.adminService.register(req.body, next));
    } catch {
      next();
    }
  };

  getComplaints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.adminService.getComplaints(req.jwtPayload, next));
    } catch {
      next();
    }
  };
}