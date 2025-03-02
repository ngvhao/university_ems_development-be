import { Controller, Get, Param, Request, Res } from '@nestjs/common';
import { CourseSemesterService } from './course_semester.service';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';

@Controller('course-semester')
export class CourseSemesterController {
  constructor(private readonly courseSemesterService: CourseSemesterService) {}

  @Get(':semesterId')
  async getCourseSemester(
    @Param('semesterId') semesterId: number,
    @Request() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    console.log('semesterId', semesterId);
    const courses =
      await this.courseSemesterService.getCourseSemesterBySemesterId(
        semesterId,
      );
    return new SuccessResponse({ data: courses }).send(res);
  }
}
