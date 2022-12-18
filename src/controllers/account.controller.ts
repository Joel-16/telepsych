import { Response, Request, NextFunction } from 'express';
import { Service } from 'typedi';

import {AccountService} from '../services';

@Service()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.accountService.login(req.body, next));
    } catch {
      next();
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.accountService.register(req.body, next));
    } catch {
      next();
    }
  };

  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {filename, path} = req?.file;
      const jwtPayload = req.jwtPayload
      res.customSuccess(200, await this.accountService.profile(req.body, jwtPayload, {filename, path}, next));
    } catch {
      next();
    }
  };

  uploadCerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jwtPayload = req.jwtPayload
      const unicert = req.files["uniCert"][0];
      const doctorCert = req.files["doctorCert"][0];
      res.customSuccess(200, await this.accountService.uploadCerts(unicert, doctorCert, jwtPayload, next));
    } catch {
      next();
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jwtPayload = req.jwtPayload
      res.customSuccess(200, await this.accountService.getProfile(jwtPayload, next));
    } catch {
      next();
    }
  };

  findPsychiatrists =  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.accountService.findPsychiatrists(req.jwtPayload, next));
    } catch {
      next();
    }
  };

  createComplaint =  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.accountService.createComplaint(req.body,req.jwtPayload, next));
    } catch {
      next();
    }
  };

  getComplaints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.accountService.getComplaints(req.jwtPayload, next));
    } catch {
      next();
    }
  };

  all = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.customSuccess(200, await this.accountService.all());
    } catch {
      next();
    }
  };
}