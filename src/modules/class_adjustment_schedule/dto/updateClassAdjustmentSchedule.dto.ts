import { PartialType } from '@nestjs/swagger';
import { CreateAdjustmentScheduleDto } from './createClassAdjustmentSchedule.dto';

export class UpdateAdjustmentScheduleDto extends PartialType(
  CreateAdjustmentScheduleDto,
) {}
