import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { Helpers } from 'src/utils/helpers';
import { StudentService } from '../student/student.service';
import { EUserRole } from 'src/utils/enums/user.enum';
import * as nodemailer from 'nodemailer';
import { BadRequestException } from '@nestjs/common';
import { jwtConstants } from 'src/utils/constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly studentService: StudentService,
    private readonly jwtService: JwtService,
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

  async sendResetPasswordEmail(email: string): Promise<void> {
    console.log('sendResetPasswordEmail@@email:', email);
    if (!email) {
      throw new BadRequestException('Email không được để trống');
    }
    const user = await this.userService.getUserByUniEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }
    const expires = new Date(Date.now() + 1000 * 60 * 30);
    const jwtToken = this.jwtService.sign(
      { email, expires },
      {
        secret: jwtConstants.accessSecret,
        expiresIn: jwtConstants.accessExpired,
      },
    );
    const resetLink = `${process.env.FE_URL_DEV || 'http://localhost:3000'}/reset-password?token=${jwtToken}`;
    const transporter = nodemailer.createTransport({
      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: false,
      // requireTLS: true,
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('user:', user);
    await transporter.sendMail({
      from: '"Panda University" <noreply.panda.university.edu@gmail.com>',
      to: user.personalEmail,
      subject: 'Yêu cầu đặt lại mật khẩu',
      text: `Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào ${resetLink} để đặt lại mật khẩu. Link có hiệu lực trong 30 phút.`,
      html: `<p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào <a href="${resetLink}">đây</a> để đặt lại mật khẩu. Link có hiệu lực trong 30 phút.</p>`,
    });
    await this.userService.updateUser(user.id, {
      resetPasswordToken: jwtToken,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenObj = await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.accessSecret,
    });
    console.log('tokenObj:', tokenObj);
    console.log('password:', newPassword);
    if (!tokenObj) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    const user = await this.userService.getUserByUniEmail(tokenObj.email);
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    if (user.resetPasswordToken !== token) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    await this.userService.updateUser(user.id, { password: newPassword });
    await this.userService.updateUser(user.id, {
      resetPasswordToken: null,
    });
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng');
    }
    const isMatch = await Helpers.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }
    await this.userService.updateUser(userId, { password: newPassword });
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
