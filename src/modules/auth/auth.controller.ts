import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/utils/constants';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { AuthService } from './auth.service';
import { SuccessResponse } from 'src/utils/response';
import { AuthHelpers } from 'src/utils/auth-helpers';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Body() _body: LoginDto,
    @Request() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    const payload = { id: user.id, sub: user.userCode };

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

    // Save refreshToken into database
    await this.authService.updateRefreshToken({
      userId: user.id,
      refreshToken,
    });

    // Set token into cookie
    AuthHelpers.setTokenCookies(res, accessToken, refreshToken);
    return new SuccessResponse({
      message: 'Login successfully',
      data: accessToken,
    }).send(res);
  }

  @Post('/refresh-token')
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Res() res: Response,
  ) {
    const { refreshToken } = body;
    let payload: { id: number; sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstants.refreshSecret,
      });
    } catch {
      throw new BadRequestException('Invalid or expired refresh token');
    }
    //Check if refreshToken is valid
    const isValid = await this.authService.validateRefreshToken(
      payload.id,
      refreshToken,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // Create new accessToken
    const newAccessToken = AuthHelpers.generateToken(
      this.jwtService,
      payload,
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
    @Request() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    console.log(user);
    return res.json({
      user,
    });
  }
}
