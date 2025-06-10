import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { Helpers } from 'src/utils/helpers';
import { StudentService } from '../student/student.service';
import { EUserRole } from 'src/utils/enums/user.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly studentService: StudentService,
  ) {}

  /**
   * Xác thực người dùng dựa trên mã sinh viên và mật khẩu.
   * @param studentCode - Mã sinh viên.
   * @param password - Mật khẩu của người dùng.
   * @returns Thông tin người dùng nếu xác thực thành công, ngược lại ném ra UnauthorizedException.
   */
  async validateStudent(
    studentCode: string,
    password: string,
  ): Promise<Partial<UserEntity>> {
    const student = await this.studentService.getStudentByStudentCode(
      studentCode,
      false,
    );
    if (!student) {
      throw new UnauthorizedException(
        'Invalid credentials (Student should login with student code)',
      );
    }
    if (await Helpers.comparePassword(password, student.user.password)) {
      return _.omit(student.user, ['password']);
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  /**
   * Xác thực người dùng dựa trên email và mật khẩu.
   * @param uniEmail - Email của người dùng.
   * @param password - Mật khẩu của người dùng.
   * @returns Thông tin người dùng nếu xác thực thành công, ngược lại ném ra UnauthorizedException.
   */
  async validateOther(
    uniEmail: string,
    password: string,
  ): Promise<Partial<UserEntity>> {
    const user = await this.userService.getUserByUniEmail(uniEmail);
    console.log('validateOther@@user:', user);
    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials (Should login with university email)',
      );
    }
    if (user.role === EUserRole.STUDENT) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user && (await Helpers.comparePassword(password, user.password))) {
      return _.omit(user, ['password']);
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // async updateRefreshToken({
  //   userId,
  //   refreshToken,
  // }: {
  //   userId: number;
  //   refreshToken: string;
  // }): Promise<void> {
  //   this.userService.updateUser({ refreshToken }, userId);
  // }

  // async validateRefreshToken(
  //   userId: number,
  //   refreshToken: string,
  // ): Promise<boolean> {
  //   const user = await this.userService.getUserById(userId);
  //   return user?.refreshToken === refreshToken;
  // }
}
