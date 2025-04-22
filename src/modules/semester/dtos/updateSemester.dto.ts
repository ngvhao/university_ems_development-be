import { PartialType } from '@nestjs/mapped-types';
import { CreateSemesterDto } from './createSemester.dto';

export class UpdateSemesterDto extends PartialType(CreateSemesterDto) {}
