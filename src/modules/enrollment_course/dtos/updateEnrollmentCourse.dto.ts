import { IsNotEmpty, IsEnum } from 'class-validator';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';

export class UpdateEnrollmentStatusDto {
  @IsNotEmpty()
  @IsEnum(EEnrollmentStatus)
  status: EEnrollmentStatus;
}
