import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EnrollmentCourseService } from './enrollment_course.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateEnrollmentCourseDto } from './dtos/createEnrollmentCourse.dto';
import { UpdateEnrollmentCourseDto } from './dtos/updateEnrollmentCourse.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { ECourseStatus } from 'src/utils/enums/course.enum';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { StudentEntity } from '../student/entities/student.entity';
import { StudentInterceptor } from 'src/interceptors/get-student.interceptor';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@ApiTags('enrollment-courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollment-courses')
@ApiBearerAuth()
export class EnrollmentCourseController {
  constructor(
    private readonly enrollmentCourseService: EnrollmentCourseService,
  ) {}

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post('admin')
  @ApiOperation({ summary: 'Admin/Manager registers a student for a course' })
  async createByAdmin(
    @Body() createEnrollmentCourseDto: CreateEnrollmentCourseDto,
    @Res() res: Response,
  ) {
    const enrollmentCourse = await this.enrollmentCourseService.create(
      createEnrollmentCourseDto,
    );
    return new SuccessResponse({
      data: enrollmentCourse,
      message: 'EnrollmentCourse created',
    }).send(res);
  }

  @UseInterceptors(StudentInterceptor)
  @Roles([EUserRole[EUserRole.STUDENT]])
  @Post('register')
  @ApiOperation({ summary: 'Student registers for a course semester' })
  async registerCourse(
    @Body('courseSemesterId') courseSemesterId: number,
    @Request() req: RequestHasUserDto & Request & { student: StudentEntity },
    @Res() res: Response,
  ) {
    const { student } = req;
    const createEnrollmentCourseDto: CreateEnrollmentCourseDto = {
      studentId: student.id,
      courseSemesterId,
      status: ECourseStatus.ENROLLED,
    };
    const enrollmentCourse = await this.enrollmentCourseService.create(
      createEnrollmentCourseDto,
    );
    return new SuccessResponse({
      data: enrollmentCourse,
      message: 'Register enrollmentCourse successfully',
    }).send(res);
  }

  @UseInterceptors(StudentInterceptor)
  @Roles([EUserRole[EUserRole.STUDENT]])
  @Get(':semesterCode')
  @ApiOperation({
    summary: 'Get all enrollment records for a student by semester',
  })
  async findAll(
    @Param('semesterCode') semesterCode: string,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
    @Request() req: RequestHasUserDto & Request & { student: StudentEntity },
  ) {
    if (!semesterCode) {
      throw new BadRequestException('SemesterCode not found');
    }
    const { student } = req;
    const { data, meta } = await this.enrollmentCourseService.getMany(
      {
        student: { id: student.id },
        courseSemester: { semester: { semesterCode } },
      },
      paginationDto,
    );
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all enrollmentCourses successfully',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific enrollment record by ID' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const enrollmentCourse = await this.enrollmentCourseService.findOne(id);
    return new SuccessResponse({
      data: enrollmentCourse,
      message: 'Get enrollmentCourse successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  @ApiOperation({ summary: 'Admin/Manager updates an enrollment record' })
  async update(
    @Param('id') id: number,
    @Body() updateEnrollmentCourseDto: UpdateEnrollmentCourseDto,
    @Res() res: Response,
  ) {
    const enrollmentCourse = await this.enrollmentCourseService.update(
      id,
      updateEnrollmentCourseDto,
    );
    return new SuccessResponse({
      data: enrollmentCourse,
      message: 'Update enrollmentCourse successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  @ApiOperation({ summary: 'Admin/Manager deletes an enrollment record' })
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.enrollmentCourseService.remove(id);
    return new SuccessResponse({
      message: 'Delete enrollmentCourse successfully',
    }).send(res);
  }
}
