import { ErrorType, ErrorValidation, ErrorResponse } from './types';

export class CustomError extends Error {
  private httpStatusCode: number;
  private errorType: ErrorType;
  private errorsValidation: ErrorValidation[] | null;

  constructor(
    httpStatusCode: number,
    errorType: ErrorType,
    message: string,
    errorsValidation: ErrorValidation[] | null = null,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.httpStatusCode = httpStatusCode;
    this.errorType = errorType;
    this.errorsValidation = errorsValidation;
  }

  get HttpStatusCode() {
    return this.httpStatusCode;
  }

  get JSON(): ErrorResponse {
    return {
      errorType: this.errorType,
      errorMessage: this.message,
      errorsValidation: this.errorsValidation,
    };
  }
}
