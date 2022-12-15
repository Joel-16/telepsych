import { NextFunction } from 'express';
import path from 'path';
import { Service } from 'typedi';
import { compareSync, hashSync } from 'bcrypt';

import { Account } from '../entities';
import { createJwtToken } from '../utils/createJwtToken';
import { CustomError } from '../utils/response/custom-error/CustomError';
import { JwtPayload } from '../types/JwtPayload';
import { ProfileDto } from '../types/dto';

@Service()
export class AccountService {
  constructor(private readonly account = Account) {}

  async login(payload : {email : string, password: string}, next : NextFunction) {
    try {
      const account = await this.account.findOne({where : {email: payload.email }, select : ["password", "id", "role"]});
      if (!account || !compareSync(payload.password, account.password)) {
        return next(new CustomError(400, "General","Invalid credentials"));
      }
      return {
        token: createJwtToken({ id: account.id, role: account.role })
      };
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }
  async register(payload, next: NextFunction) {
    try {
      const accounttest = await this.account.findOneBy({ email: payload.email });
      if (accounttest) {
        return next(new CustomError(401, "General", "Email already associated with an account"))
      }
      const account = await this.account.save({
        email: payload.email,
        password: hashSync(payload.password, 10),
        role : payload.role
      });
      return {
        token: createJwtToken({ id: account.id, role: account.role }),
      };
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

  async profile(payload: ProfileDto, jwtPayload: JwtPayload, next: NextFunction) {
    try {
      const account = await this.account.findOneBy({ id: jwtPayload.id });
      if (!account) {
        return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
      }
      account.age = payload.age;
      account.state = payload.state;
      account.lga = payload.lga;
      account.firstname = payload.firstname;
      account.lastname = payload.lastname;
      account.phoneNumber = payload.phoneNumber;
      await account.save();
      if (account.role === 'PATIENT'){
        delete account.officeAddress
        return account;
      }
      return account;
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

  async getProfile(jwtPayload: JwtPayload, next: NextFunction) {
    try {
      const account = await this.account.findOneBy({ id: jwtPayload.id });
      if (!account) {
        return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
      }
      if (account.role === 'PATIENT'){
        delete account.officeAddress
        return account;
      }
      return account;
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

  async findPsychiatrists(payload: {state : string, lga: string},next: NextFunction){
    let result = await this.account.find({
      where : {
        role : "DOCTOR",
        state : payload.state,
        lga: payload.lga 
      },
      select: [
        "id",
        "image",
        "firstname",
        "lastname",
        "state",
        "lga",
        "phoneNumber",
        "officeAddress"
      ]
    })
    if (result.length === 0){
      return {
        message: "No psychiatrist within your location, Please try again with another location parameter"
      }
    }
    return result
  }
  async delete(email) {
    let a = await this.account.delete({ email });
    return a;
  }

  async all() {
    return await this.account.find({ select: ['email'] });
  }
}
