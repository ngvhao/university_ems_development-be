import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseMajorDto } from './createCourseMajor.dto';

export class UpdateCourseMajorDto extends PartialType(CreateCourseMajorDto) {}
