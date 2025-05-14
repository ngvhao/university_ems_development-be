import { PartialType } from '@nestjs/swagger';
import { CreateLecturerCourseDto } from './createLecturerCourse.dto';

export class UpdateLecturerCourseDto extends PartialType(
  CreateLecturerCourseDto,
) {}
