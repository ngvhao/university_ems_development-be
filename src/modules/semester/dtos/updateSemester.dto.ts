import { PartialType } from '@nestjs/swagger';
import { CreateSemesterDto } from './createSemester.dto';

export class UpdateSemesterDto extends PartialType(CreateSemesterDto) {}
