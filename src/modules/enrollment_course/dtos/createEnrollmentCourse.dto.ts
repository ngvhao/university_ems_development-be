import { IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';

export class CreateEnrollmentCourseDto {
  @IsNotEmpty()
  @IsNumber()
  classGroupId: number;

  @IsOptional()
  @IsNumber()
  studentId?: number;

  @IsOptional()
  @IsEnum(EEnrollmentStatus)
  status?: EEnrollmentStatus;
}
