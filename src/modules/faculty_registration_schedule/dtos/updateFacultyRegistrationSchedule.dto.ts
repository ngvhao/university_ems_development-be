import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateFacultyRegistrationScheduleDto } from './createFacultyRegistrationSchedule.dto';
import { EFacultyRegistrationScheduleStatus } from 'src/utils/enums/faculty.enum';

export class UpdateFacultyRegistrationScheduleDto extends PartialType(
  CreateFacultyRegistrationScheduleDto,
) {
  @IsOptional()
  @IsEnum(EFacultyRegistrationScheduleStatus, {
    message: 'Invalid status value',
  })
  status?: EFacultyRegistrationScheduleStatus;
}
