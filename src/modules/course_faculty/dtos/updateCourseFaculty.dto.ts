import { PartialType } from '@nestjs/swagger';
import { CreateCourseFacultyDto } from './createCourseFaculty.dto';

export class UpdateCourseFacultyDto extends PartialType(
  CreateCourseFacultyDto,
) {}
