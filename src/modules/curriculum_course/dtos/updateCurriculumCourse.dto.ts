import { PartialType } from '@nestjs/mapped-types';
import { CreateCurriculumCourseDto } from './createCurriculumCourse.dto';

export class UpdateCurriculumCourseDto extends PartialType(
  CreateCurriculumCourseDto,
) {}
