import { PartialType } from '@nestjs/mapped-types';
import { CreateCurriculumDto } from './createCurriculum.dto';

export class UpdateCurriculumDto extends PartialType(CreateCurriculumDto) {}
