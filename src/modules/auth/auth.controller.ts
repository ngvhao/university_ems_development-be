import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/utils/constants';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { SuccessResponse } from 'src/utils/response';
import { AuthHelpers } from 'src/utils/auth-helpers';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { StudentService } from '../student/student.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly studentService: StudentService,
    // private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('/login')
  async login(
    @Body() _body: LoginDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    const payload = { id: user.id, sub: user.universityEmail };

    // Create accessToken
    const accessToken = AuthHelpers.generateToken(
      this.jwtService,
      payload,
      'access',
    );

    // Create refreshToken
    const refreshToken = AuthHelpers.generateToken(
      this.jwtService,
      payload,
      'refresh',
    );

    // Set token into cookie
    AuthHelpers.setTokenCookies(res, accessToken, refreshToken);
    return new SuccessResponse({
      message: 'Login successfully',
      data: accessToken,
    }).send(res);
  }

  @Post('/refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    let payload: { id: number; sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
      console.log('refreshToken@@payload::', payload);
    } catch {
      AuthHelpers.setExpireTokens(res);
      throw new BadRequestException('Invalid or expired refresh token');
    }
    // Create new accessToken
    const newAccessToken = AuthHelpers.generateToken(
      this.jwtService,
      { id: payload.id, sub: payload.sub },
      'access',
    );
    AuthHelpers.setTokenCookies(res, newAccessToken);
    return new SuccessResponse({
      message: 'Fetch new access token successfully',
    }).send(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (user.role == EUserRole.STUDENT) {
      user.student = await this.studentService.getOne(
        {
          userId: user.id,
        },
        {
          major: true,
          class: true,
        },
      );
    }
    return new SuccessResponse({
      data: user,
      message: 'Fetch user profile successfully',
    }).send(res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(@Res() res: Response) {
    AuthHelpers.setExpireTokens(res);
    return new SuccessResponse({
      message: 'Logout successfully',
    }).send(res);
  }
}
