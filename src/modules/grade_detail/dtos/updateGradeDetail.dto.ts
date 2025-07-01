import { PartialType } from '@nestjs/swagger';
import { CreateGradeDetailDto } from './createGradeDetail.dto';

export class UpdateGradeDetailDto extends PartialType(CreateGradeDetailDto) {}
