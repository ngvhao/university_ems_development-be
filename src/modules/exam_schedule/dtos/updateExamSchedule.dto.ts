import { PartialType } from '@nestjs/swagger';
import { CreateExamScheduleDto } from './createExamSchedule.dto';

export class UpdateExamScheduleDto extends PartialType(CreateExamScheduleDto) {}
