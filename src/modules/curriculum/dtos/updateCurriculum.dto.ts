import { PartialType } from '@nestjs/swagger';
import { CreateCurriculumDto } from './createCurriculum.dto';

export class UpdateCurriculumDto extends PartialType(CreateCurriculumDto) {}
