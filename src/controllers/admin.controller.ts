import { Response, Request, NextFunction } from 'express';
import { Service } from 'typedi';
import { CustomError } from '../utils/response/custom-error/CustomError';

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
      res.customSuccess(200, await this.adminService.getComplaints(next));
    } catch {
      next();
    }
  };

  suspendDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if(isNaN(id)){
        next(new CustomError(400, "Validation", "Unsurpported id format"))
      }
      res.customSuccess(200, await this.adminService.suspendDoctor(id, next));
    } catch {
      next();
    }
  };
}