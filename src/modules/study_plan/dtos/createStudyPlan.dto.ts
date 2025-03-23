import { IsInt, IsString, IsDateString } from 'class-validator';

export class CreateStudyPlanDto {
  @IsInt()
  studentId: number;

  @IsInt()
  semesterId: number;

  @IsInt()
  courseId: number;

  @IsString()
  status: string;

  @IsDateString()
  plannedDate: Date;
}
