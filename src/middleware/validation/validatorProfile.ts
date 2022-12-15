import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from '../../utils/response/custom-error/CustomError';
import { ErrorValidation } from '../../utils/response/custom-error/types';

export const validatorProfile = (req: Request, res: Response, next: NextFunction) => {
  const { phoneNumber, age, firstname, lastname, state, lga } = req.body;
  const errorsValidation: ErrorValidation[] = [];
  const reg = /^0(7|8|9)(0|1)\d{8}$/;
  
  if (!reg.test(phoneNumber)) {
    errorsValidation.push({ phoneNumber: 'Not a valid phone number format' });
  }

  if (typeof firstname != 'string' || validator.isEmpty(firstname)) {
    errorsValidation.push({ firstname: 'firstname is required' });
  }

  if (typeof lastname != 'string' || validator.isEmpty(lastname)) {
    errorsValidation.push({ lastname: 'lastname is required' });
  }
  if (typeof state != 'string' || validator.isEmpty(state)) {
    errorsValidation.push({ state: 'state of residence is required' });
  }

  if (typeof lga != 'string' || validator.isEmpty(lga)) {
    errorsValidation.push({ lga: 'Lga of residence is required' });
  }

  if (isNaN(Number(age)) || Number(age) > 70) {
    errorsValidation.push({ age: 'not a valid age format' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Register validation error', errorsValidation);
    return next(customError);
  }
  req.body.age = Number(age)
  return next();
};
