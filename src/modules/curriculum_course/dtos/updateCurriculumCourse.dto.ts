import { PartialType } from '@nestjs/swagger';
import { CreateCurriculumCourseDto } from './createCurriculumCourse.dto';
export class UpdateCurriculumCourseDto extends PartialType(
  CreateCurriculumCourseDto,
) {}
