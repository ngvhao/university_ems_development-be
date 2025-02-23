import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/utils/constants';
import { RequestHasUserDTO } from 'src/utils/request-has-user-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Get()
  testFunction(@Res() res: Response) {
    return res.json({ message: 'Hello from Nguyen Van Hao!' });
  }
  @Get('/err')
  testFunction2(@Res() _res: Response) {
    throw new ForbiddenException();
  }
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Body() body: LoginDto,
    @Request() req: RequestHasUserDTO & Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    const payload = { id: user.id, sub: body.email };
    const token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expired,
    });
    return res.json({ token });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(
    @Request() req: RequestHasUserDTO & Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    console.log(user);
    return res.json({
      user,
    });
  }
}
