import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dtos/createUser.dto';
import { Response } from 'express';
import { SuccessResponse } from 'src/utils/response';
import helpers from 'src/utils/helpers';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
    //
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDTO, @Res() res: Response) {
    const hashedPassword = await helpers.hashPassword({
      password: createUserDto.password,
    });
    createUserDto.password = hashedPassword;
    await this.userService.createUser(createUserDto);
    return new SuccessResponse({ message: 'User created' }).send(res);
  }

  @Get(':id')
  async getUserById(@Param() id: number) {
    const user = await this.userService.getUserById(id);
    return new SuccessResponse({
      message: 'Get user successfully',
      data: user,
    });
  }
}
