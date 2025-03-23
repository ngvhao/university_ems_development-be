import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateStudyPlanDto {
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsInt()
  semesterId?: number;

  @IsOptional()
  @IsInt()
  courseId?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  plannedDate?: Date;
}
