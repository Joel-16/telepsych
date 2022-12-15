import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from '../../utils/response/custom-error/CustomError';
import { ErrorValidation } from '../../utils/response/custom-error/types';

export const validatorRegister = (req: Request, res: Response, next: NextFunction) => {
  const { password, email, role } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  if (typeof email != 'string' || !validator.isEmail(email)) {
    errorsValidation.push({ email: 'Not a valid email format' });
  }

  if (typeof password != 'string' || validator.isEmpty(password)) {
    errorsValidation.push({ password: 'password is required' });
  }
 
  if (!(["PATIENT", "DOCTOR"].includes(role))) {
    errorsValidation.push({ role: 'Not a valid role format' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Register validation error', errorsValidation);
    return next(customError);
  }
;
  return next();
};
