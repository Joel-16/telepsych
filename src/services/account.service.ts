import { NextFunction } from 'express';
import { Service } from 'typedi';
import { compareSync, hashSync } from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { Patient, Doctor, Complaints } from '../entities';
import { createJwtToken } from '../utils/createJwtToken';
import { CustomError } from '../utils/response/custom-error/CustomError';
import { JwtPayload } from '../types/JwtPayload';
import { Photo, ProfileDto } from '../types/dto';
import { Not } from 'typeorm';

@Service()
export class AccountService {
  constructor(
    private readonly patient = Patient,
    private readonly doctor = Doctor,
    private readonly complaints = Complaints,
  ) {}

  async login(payload: { email: string; password: string }, next: NextFunction) {
    try {
      const patient = await this.patient.findOne({
        where: { email: payload.email },
        select: ['password', 'id', 'role', 'firstname'],
      });
      if (patient) {
        if (!patient || !compareSync(payload.password, patient.password)) {
          return next(new CustomError(400, 'General', 'Invalid credentials'));
        }

        return {
          token: createJwtToken({ id: patient.id, role: patient.role }),
          profile: patient.firstname ? true : false,
        };
      } else {
        const doctor = await this.doctor.findOne({
          where: { email: payload.email },
          select: ['password', 'id', 'role', 'firstname'],
        });
        if (!doctor || !compareSync(payload.password, doctor.password)) {
          return next(new CustomError(400, 'General', 'Invalid credentials'));
        }
        if (doctor.suspended) {
          return next(new CustomError(400, 'Unauthorized', 'Account suspended, Please contact the Admin'));
        }
        return {
          token: createJwtToken({ id: doctor.id, role: doctor.role }),
          profile: doctor.firstname ? true : false,
        };
      }
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }
  async register(payload, next: NextFunction) {
    try {
      let status =
        (await this.patient.findOneBy({ email: payload.email })) ||
        (await this.doctor.findOneBy({ email: payload.email }));
      if (status) {
        return next(new CustomError(401, 'General', 'Email already associated with an patient'));
      }
      if (payload.role === 'PATIENT') {
        const patient = await this.patient.save({
          email: payload.email,
          password: hashSync(payload.password, 10),
          role: payload.role,
        });
        return {
          token: createJwtToken({ id: patient.id, role: patient.role }),
        };
      } else {
        const doctor = await this.doctor.save({
          email: payload.email,
          password: hashSync(payload.password, 10),
          role: payload.role,
        });
        return {
          token: createJwtToken({ id: doctor.id, role: doctor.role }),
        };
      }
    } catch (err) {
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }

  async profile(payload: ProfileDto, jwtPayload: JwtPayload, image: Photo, next: NextFunction) {
    try {
      if (jwtPayload.role === 'PATIENT') {
        const patient = await this.patient.findOneBy({ id: jwtPayload.id });
        if (!patient) {
          return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
        }
        if (patient.image.filename) {
          await cloudinary.uploader.destroy(patient.image.filename);
        }
        patient.age = payload.age;
        patient.state = payload.state;
        patient.lga = payload.lga;
        patient.firstname = payload.firstname;
        patient.lastname = payload.lastname;
        patient.phoneNumber = payload.phoneNumber;
        patient.image = image;
        await patient.save();
        return patient;
      } else {
        const doctor = await this.doctor.findOneBy({ id: jwtPayload.id });
        if (!doctor) {
          return next(new CustomError(404, 'General', "Account doesn't exist on this platform"));
        }
        if (doctor.image.filename) {
          await cloudinary.uploader.destroy(doctor.image.filename);
        }
        doctor.age = payload.age;
        doctor.state = payload.state;
        doctor.lga = payload.lga;
        doctor.firstname = payload.firstname;
        doctor.lastname = payload.lastname;
        doctor.phoneNumber = payload.phoneNumber;
        doctor.image = image;
        await doctor.save();
        return doctor;
      }
    } catch (err) {
      console.log(err);
      return next(new CustomError(500, 'Raw', `Internal server error`, err));
    }
  }
  async uploadCerts(uniCert, doctorCert, jwtPayload : JwtPayload,next : NextFunction){
    try {
      if(jwtPayload.role === "DOCTOR"){
        let doctor = await this.doctor.findOne({where : {id : jwtPayload.id}, select : ["doctorCert", "uniCert"]})
        doctor.uniCert= {filename : uniCert.filename, path : uniCert.path};
        doctor.doctorCert = {filename : doctorCert.filename, path : doctorCert.path};
        await doctor.save()
        return { message : "success"}
      }
    } catch (error) {
      console.log(error);
      return next(new CustomError(500, 'Raw', `Internal server error`));
    }

  }
  async getProfile(jwtPayload: JwtPayload, next: NextFunction) {
    try {
      if (jwtPayload.role === 'PATIENT') {
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

  async findPsychiatrists(jwtPayload: JwtPayload, next: NextFunction) {
    let patient = await this.patient.findOne({ where: { id: jwtPayload.id }, select: ['state', 'lga'] });
    let lga = await this.doctor.find({
      where: {
        role: 'DOCTOR',
        lga: patient.lga,
        suspended: false,
      },
      select: ['id', 'image', 'firstname', 'lastname', 'state', 'lga', 'phoneNumber', 'officeAddress'],
    });

    let statewise = await this.doctor.find({
      where: {
        role: 'DOCTOR',
        state: patient.state,
        lga: Not(patient.lga),
        suspended: false,
      },
      select: ['id', 'image', 'firstname', 'lastname', 'state', 'lga', 'phoneNumber', 'officeAddress'],
    });

    let national = await this.doctor.find({
      where: {
        role: 'DOCTOR',
        state: Not(patient.state),
        lga: Not(patient.lga),
        suspended: false,
      },
      select: ['id', 'image', 'firstname', 'lastname', 'state', 'lga', 'phoneNumber', 'officeAddress'],
    });

    return [...lga, ...statewise, ...national];
  }
  async createComplaint(payload: { id: number; complaint: string }, jwtPayload: JwtPayload, next: NextFunction) {
    try {
      let doctor = await this.doctor.findOneBy({ id: payload.id });
      if (!doctor) {
        return next(new CustomError(404, 'General', "Psyhiatrist account doesn't exist on this platform"));
      }
      let patient = await this.patient.findOneBy({ id: jwtPayload.id });
      let comp = await this.complaints.save({
        complaint: payload.complaint,
      });
      patient.complaints.push(comp);
      doctor.complaints.push(comp);
      await Promise.all([patient.save(), doctor.save()]);
      return comp;
    } catch (error) {
      return next(new CustomError(500, 'Raw', `Internal server error`, error));
    }
  }

  async getComplaints(payload: JwtPayload, next: NextFunction) {
    try {
      let patient = await this.patient.findOne({ where: { id: payload.id }, relations: { complaints: true } });
      return patient.complaints;
    } catch (error) {
      return next(new CustomError(500, 'Raw', `Internal server error`, error));
    }
  }
  async all() {
    return {
      patients: await this.patient.find({ select: ['id', 'email'] }),
      doctors: await this.doctor.find({ select: ['id', 'email', 'suspended'] }),
    };
  }
}
