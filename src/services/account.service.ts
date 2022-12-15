import { NextFunction } from 'express';
import { Service } from 'typedi';
import { compareSync, hashSync } from 'bcrypt';

import { Patient, Doctor, Complaints } from '../entities';
import { createJwtToken } from '../utils/createJwtToken';
import { CustomError } from '../utils/response/custom-error/CustomError';
import { JwtPayload } from '../types/JwtPayload';
import { ProfileDto } from '../types/dto';


@Service()
export class AccountService {
  constructor(
    private readonly patient = Patient, 
    private readonly doctor = Doctor,
    private readonly complaints = Complaints
  ) {}

  async login(payload : {email : string, password: string}, next : NextFunction) {
    try {
      const patient = await this.patient.findOne({where : {email: payload.email }, select : ["password", "id", "role"]});
      if (patient){
        if (!patient || !compareSync(payload.password, patient.password)) {
          return next(new CustomError(400, "General","Invalid credentials"));
        }
        return {
          token: createJwtToken({ id: patient.id, role: patient.role })
        };
      } else {
        const doctor = await this.doctor.findOne({where : {email: payload.email }, select : ["password", "id", "role"]});
        if (!doctor || !compareSync(payload.password, doctor.password)) {
          return next(new CustomError(400, "General","Invalid credentials"));
        }
        return {
          token: createJwtToken({ id: doctor.id, role: doctor.role })
        };
      }
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }
  async register(payload, next: NextFunction) {
    try {
      if (payload.role === 'PATIENT'){
        const patientTest = await this.patient.findOneBy({ email: payload.email });
        if (patientTest) {
          return next(new CustomError(401, "General", "Email already associated with an patient"))
        }
        const patient = await this.patient.save({
          email: payload.email,
          password: hashSync(payload.password, 10),
          role : payload.role
        });
        return {
          token: createJwtToken({ id: patient.id, role: patient.role }),
        }
      } else {
        const doctorTest = await this.doctor.findOneBy({ email: payload.email });
        if (doctorTest) {
          return next(new CustomError(401, "General", "Email already associated with an patient"))
        }
        const doctor = await this.doctor.save({
          email: payload.email,
          password: hashSync(payload.password, 10),
          role : payload.role
        });
        return {
          token: createJwtToken({ id: doctor.id, role: doctor.role }),
        }
      }
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

  async profile(payload: ProfileDto, jwtPayload: JwtPayload, next: NextFunction) {
    try {
      if(jwtPayload.role === 'PATIENT'){
        const patient = await this.patient.findOneBy({ id: jwtPayload.id });
        if (!patient) {
          return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
        }
        patient.age = payload.age;
        patient.state = payload.state;
        patient.lga = payload.lga;
        patient.firstname = payload.firstname;
        patient.lastname = payload.lastname;
        patient.phoneNumber = payload.phoneNumber;
        await patient.save();
        return patient;
      } else {
        const doctor = await this.doctor.findOneBy({ id: jwtPayload.id });
        if (!doctor) {
          return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
        }
        doctor.age = payload.age;
        doctor.state = payload.state;
        doctor.lga = payload.lga;
        doctor.firstname = payload.firstname;
        doctor.lastname = payload.lastname;
        doctor.phoneNumber = payload.phoneNumber;
        await doctor.save();
        return doctor;
      }
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

  async getProfile(jwtPayload: JwtPayload, next: NextFunction) {
    try {
      if(jwtPayload.role === 'PATIENT'){
        const patient = await this.patient.findOneBy({ id: jwtPayload.id });
        if (!patient) {
          return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
        }
        return patient;
      } else {
        const doctor = await this.doctor.findOneBy({ id: jwtPayload.id });
        if (!doctor) {
          return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
        }
        return doctor;
      }
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

  async findPsychiatrists(payload: {state : string, lga: string},next: NextFunction){
    let result = await this.doctor.find({
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
  async createComplaint(payload: {id : number, complaint : string},jwtPayload : JwtPayload,next: NextFunction) {
    try {
      let doctor = await this.doctor.findOneBy({id : payload.id})
      if (!doctor){
        return next(new CustomError(404, 'General', "Psyhiatrist account doesn't exist on this platform"));
      }
      let patient = await this.patient.findOneBy({id : jwtPayload.id})
      let comp = await this.complaints.save({
        complaint: payload.complaint
      })
      patient.complaints.push(comp)
      doctor.complaints.push(comp)
      await Promise.all([patient.save(), doctor.save()]);
      return comp;
    } catch (error) {
      return next(new CustomError(500, 'Raw', `Internal server error`, error));
    }
  }

  async getComplaints(payload : JwtPayload, next: NextFunction){
    try {
      let patient = await this.patient.findOne({where : {id : payload.id}, select : ["complaints"]})
      return patient.complaints
    } catch (error) {
      return next(new CustomError(500, 'Raw', `Internal server error`, error));
    }
  }
  async all() {
    return await this.patient.find({ select: ['email'] });
  }
}
