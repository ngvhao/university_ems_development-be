import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentCourseService } from './enrollment_course.service';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';

@Controller('enrollment-course')
export class EnrollmentCourseController {
  constructor(
    private readonly enrollmentCourseService: EnrollmentCourseService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([EUserRole[EUserRole.STUDENT]])
  @Post()
  async enrollmentCourse(
    @Body('courseIds') courseIds: number[],
    @Request() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    console.log(req.user);
    console.log(courseIds);
    return new SuccessResponse({}).send(res);
  }
}
