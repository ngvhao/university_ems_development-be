import { IsInt, IsDateString, IsOptional } from 'class-validator';

export class UpdateCurriculumDto {
  @IsOptional()
  @IsInt()
  totalCreditsRequired?: number;

  @IsOptional()
  @IsInt()
  electiveCreditsRequired?: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsInt()
  majorId?: number;

  @IsOptional()
  @IsInt()
  startAcademicYear?: number;

  @IsOptional()
  @IsInt()
  endAcademicYear?: number;
}
