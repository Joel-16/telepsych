import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from '../../utils/response/custom-error/CustomError';
import { ErrorValidation } from '../../utils/response/custom-error/types';

export const validatorComplaint = (req: Request, res: Response, next: NextFunction) => {
  const { id, complaint } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  if (typeof id != 'number' ) {
    errorsValidation.push({ id: 'Not a valid id format' });
  }

  if (typeof complaint != 'string' || validator.isEmpty(complaint)) {
    errorsValidation.push({ complaint: 'complaint is required' });
  }
 
  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Register validation error', errorsValidation);
    return next(customError);
  }
;
  return next();
};
