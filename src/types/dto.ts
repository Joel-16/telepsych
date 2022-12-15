export class Photo {
  link: string;
  path: string;
}
export class RegisterDto {
  email: string;
  password: string;
  salt?: string;
}

export interface ProfileDto {
  state: string;
  lga: string;
  age: number;
  firstname: string;
  lastname: string;
  phoneNumber: string;
}

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';
