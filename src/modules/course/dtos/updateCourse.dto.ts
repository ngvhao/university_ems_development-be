import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './createCourse.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
