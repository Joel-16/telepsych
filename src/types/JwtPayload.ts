import { Role } from "./dto";

export type JwtPayload = {
  id: number;
  role: Role
};
