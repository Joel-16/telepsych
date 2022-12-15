import { NextFunction } from 'express';
import { Service } from 'typedi';
import { compareSync, hashSync } from 'bcrypt';

import { Admin } from '../entities';
import { createJwtToken } from '../utils/createJwtToken';
import { CustomError } from '../utils/response/custom-error/CustomError';
import { JwtPayload } from '../types/JwtPayload';

@Service()
export class AdminService {
  constructor(private readonly admin = Admin) {}

  async login(payload : {email : string, password: string}, next : NextFunction) {
    try {
      const admin = await this.admin.findOne({where : {email: payload.email }, select : ["password", "id", "role"]});
      if (!admin || !compareSync(payload.password, admin.password)) {
        return next(new CustomError(400, "General","Invalid credentials"));
      }
      return {
        token: createJwtToken({ id: admin.id, role: admin.role })
      };
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }
  async register(payload, next: NextFunction) {
    try {
      const admintest = await this.admin.findOneBy({ email: payload.email });
      if (admintest) {
        return next(new CustomError(401, "General", "Email already associated with an admin"))
      }
      const admin = await this.admin.save({
        email: payload.email,
        password: hashSync(payload.password, 10),
        role : payload.role
      });
      return {
        token: createJwtToken({ id: admin.id, role: admin.role }),
      };
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

 
  async delete(email) {
    let a = await this.admin.delete({ email });
    return a;
  }

  async all() {
    return await this.admin.find({ select: ['email'] });
  }
}
