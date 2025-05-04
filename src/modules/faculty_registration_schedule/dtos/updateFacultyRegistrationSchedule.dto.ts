import { PartialType } from '@nestjs/swagger';
import { CreateFacultyRegistrationScheduleDto } from './createFacultyRegistrationSchedule.dto';

export class UpdateFacultyRegistrationScheduleDto extends PartialType(
  CreateFacultyRegistrationScheduleDto,
) {}
