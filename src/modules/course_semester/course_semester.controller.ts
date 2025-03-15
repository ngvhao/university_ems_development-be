import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { CourseSemesterService } from './course_semester.service';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Response } from 'express';
import { EALLROLE } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('course-semester')
export class CourseSemesterController {
  constructor(private readonly courseSemesterService: CourseSemesterService) {}

  @Roles([EALLROLE[EALLROLE.ALL]])
  @Get(':semesterCode')
  async getCourseBySemesterCode(
    @Param('semesterCode') semesterCode: string,
    @Res() res: Response,
  ) {
    const courses = await this.courseSemesterService.getOne(
      {
        semester: {
          semesterCode: semesterCode,
        },
      },
      { course: true, semester: true },
    );
    return new SuccessResponse({ data: courses }).send(res);
  }
}
