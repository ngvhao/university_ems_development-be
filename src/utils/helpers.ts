import { hashSync, genSaltSync, compare } from 'bcryptjs';
import { emailTailConstants, MomoConfig, SALT_ROUNDS } from './constants';
import { EFacultyCode } from './enums/faculty.enum';
import { EUserRole } from './enums/user.enum';
import { MomoIpnDto } from 'src/modules/payment/dto/momoIpnResponse.dto';
import * as crypto from 'crypto';

export class Helpers {
  static async hashPassword({
    password,
    saltRounds = SALT_ROUNDS,
  }: {
    password: string;
    saltRounds?: number;
  }): Promise<string> {
    const salt = genSaltSync(saltRounds);
    return hashSync(password, salt);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  static async generateUserCode(
    facultyCode: string,
    academicYear: number,
    lastIdx: number,
  ): Promise<string> {
    const enrollmentYear = academicYear.toString().slice(-2);
    return `${EFacultyCode[facultyCode]}${enrollmentYear}${(lastIdx + 1)
      .toString()
      .padStart(5, '0')}`;
  }

  static async generateAdminCode(
    role: EUserRole,
    lastIndx: number,
  ): Promise<string> {
    if (
      role !== EUserRole.ADMINISTRATOR &&
      role !== EUserRole.ACADEMIC_MANAGER
    ) {
      throw new Error('Invalid role for generating admin code');
    }
    if (role == EUserRole.ADMINISTRATOR) {
      return `ADMIN${(lastIndx + 1).toString().padStart(5, '0')}`;
    } else {
      return `ACADEMIC${(lastIndx + 1).toString().padStart(5, '0')}`;
    }
  }

  static generateStudentEmail(studentCode: string) {
    return studentCode + emailTailConstants.student;
  }

  static verifyMomoSignature(dto: MomoIpnDto): boolean {
    const { signature, ...restOfDto } = dto;

    const sortedKeys = Object.keys(restOfDto).sort();

    const rawSignatureData = sortedKeys
      .map((key) => `${key}=${restOfDto[key]}`)
      .join('&');

    console.log(
      'MoMo IPN rawSignatureData for verification:',
      rawSignatureData,
    );

    const calculatedSignature = crypto
      .createHmac('sha256', MomoConfig.secretkey)
      .update(rawSignatureData)
      .digest('hex');

    console.log('MoMo IPN received signature:', signature);
    console.log('MoMo IPN calculated signature:', calculatedSignature);

    return calculatedSignature === signature;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static sortObjectByKeys(obj: any): any {
    const sortedResult = {};
    const originalKeys = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        originalKeys.push(key);
      }
    }
    originalKeys.sort();

    for (const key of originalKeys) {
      sortedResult[key] = encodeURIComponent(obj[key].toString()).replace(
        /%20/g,
        '+',
      );
    }
    return sortedResult;
  }
}
