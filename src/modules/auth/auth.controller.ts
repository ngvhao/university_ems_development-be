import { Controller, ForbiddenException, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get()
  testFunction(@Res() res: Response) {
    return res.json({ message: 'Hello from Nguyen Van Hao!' });
  }
  @Get('/err')
  testFunction2(@Res() _res: Response) {
    throw new ForbiddenException();
  }
}
