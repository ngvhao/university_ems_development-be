import { IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateCurriculumDto {
  @IsInt()
  totalCreditsRequired: number;

  @IsInt()
  electiveCreditsRequired: number;

  @IsDateString()
  effectiveDate: Date;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsInt()
  majorId: number;

  @IsInt()
  startAcademicYear: number;

  @IsInt()
  endAcademicYear: number;
}
