import { EUserRole } from '../enums/user.enum';

export interface LoggedInterface {
  id: number;
  email: string;
  role: EUserRole;
}
