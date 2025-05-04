import { PartialType } from '@nestjs/swagger';
import { CreateClassWeeklyScheduleDto } from './createClassWeeklySchedule.dto';
export class UpdateClassWeeklyScheduleDto extends PartialType(
  CreateClassWeeklyScheduleDto,
) {}
