import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { Response } from 'express';
import { CreateStudentDto } from './dtos/createStudent.dto';
import { SuccessResponse } from 'src/utils/response';
import { Helpers } from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterStudentDto } from './dtos/filterStudent.dto';
import { UpdateStudentDto } from './dtos/updateStudent.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly userService: UserService,
  ) {}

  @Roles([EUserRole[EUserRole.ADMINISTRATOR]])
  @Post()
  async createStudent(@Body() data: CreateStudentDto, @Res() res: Response) {
    const user = await this.userService.getUserByEmail(data.email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await Helpers.hashPassword({
      password: data.password,
    });
    const newUserInfo = await this.studentService.createStudent(
      data,
      hashedPassword,
    );
    return new SuccessResponse({
      message: 'Tạo sinh viên thành công',
      statusCode: HttpStatus.CREATED,
      data: newUserInfo,
    }).send(res);
  }

  // --- READ ALL ---
  @Roles([
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.LECTURER],
  ])
  @Get()
  async findAll(@Query() filterDto: FilterStudentDto, @Res() res: Response) {
    const { data, meta } = await this.studentService.findAll(filterDto);
    return new SuccessResponse({
      message: 'Lấy danh sách sinh viên thành công',
      data,
      metadata: meta,
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.LECTURER],
    EUserRole[EUserRole.STUDENT],
  ])
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const student = await this.studentService.findOneById(id);
    return new SuccessResponse({
      message: 'Lấy thông tin sinh viên thành công',
      data: student,
    }).send(res);
  }

  // --- UPDATE ---
  @Roles([
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
  ])
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStudentDto,
    @Res() res: Response,
  ) {
    const updatedStudent = await this.studentService.update(id, updateDto);
    return new SuccessResponse({
      message: 'Cập nhật thông tin sinh viên thành công',
      data: updatedStudent,
    }).send(res);
  }
}
