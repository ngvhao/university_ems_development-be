import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CourseSemesterService } from './course_semester.service';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Response } from 'express';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { StudentService } from '../student/student.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CourseSemesters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-semester')
export class CourseSemesterController {
  constructor(
    private readonly courseSemesterService: CourseSemesterService,
    private readonly studentService: StudentService,
  ) {}

  @Roles([EUserRole[EUserRole.STUDENT]])
  @Get(':semesterCode')
  async getCourseBySemesterCode(
    @Param('semesterCode') semesterCode: string,
    @Request() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const { user } = req;
    const student = await this.studentService.getOne(
      { user: { id: user.id } },
      { major: true },
    );

    if (!student) {
      return new BadRequestException('Student not found');
    }

    const courses = await this.courseSemesterService.getMany(
      {
        semester: { semesterCode },
        course: { courseMajors: { id: student.major.id } },
      },
      { course: true, semester: true },
    );

    return new SuccessResponse({ data: courses || [] }).send(res);
  }
}
