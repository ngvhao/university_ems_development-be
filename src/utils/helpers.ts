import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './constants';
import { EFacultyCode } from './enums/faculty.enum';

export class Helpers {
  static async hashPassword({
    password,
    saltRounds = SALT_ROUNDS,
  }: {
    password: string;
    saltRounds?: number;
  }): Promise<string> {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    console.log(password);
    return bcrypt.hashSync(password, salt);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateUserCode(
    facultyCode: string,
    academicYear: number,
    studentCount: number,
  ): Promise<string> {
    const enrollmentYear = academicYear.toString().slice(-2);
    return `${EFacultyCode[facultyCode]}${enrollmentYear}${(studentCount + 1)
      .toString()
      .padStart(5, '0')}`;
  }
}
