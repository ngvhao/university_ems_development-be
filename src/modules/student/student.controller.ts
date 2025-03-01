import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { Response } from 'express';
import { CreateStudentDto } from './dtos/createStudent.dto';
import { SuccessResponse } from 'src/utils/response';
import { Helpers } from 'src/utils/helpers';
import { UserService } from '../user/user.service';

@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async createStudent(@Body() data: CreateStudentDto, @Res() res: Response) {
    const user = await this.userService.getUserByEmail(data.email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await Helpers.hashPassword({
      password: data.password,
    });
    const student = await this.studentService.createStudent(
      data,
      hashedPassword,
    );
    return new SuccessResponse({
      message: 'Student created',
      statusCode: HttpStatus.CREATED,
      data: student,
    }).send(res);
  }
}
