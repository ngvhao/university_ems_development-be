import {
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSemesterDto {
  @IsString({ message: 'Semester code must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Semester code must not exceed 20 characters' })
  @ApiPropertyOptional({
    description: 'Unique code identifying the semester',
    example: '2024-S1',
  })
  semesterCode?: string;

  @IsInt({ message: 'Start year must be an integer' })
  @Min(2000, { message: 'Start year must be 2000 or later' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The starting year of the semester',
    example: 2024,
  })
  startYear?: number;

  @IsInt({ message: 'End year must be an integer' })
  @Min(2000, { message: 'End year must be 2000 or later' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The ending year of the semester',
    example: 2024,
  })
  endYear?: number;

  @IsEnum([1, 2, 3], { message: 'Term must be 1, 2, or 3' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The term number of the semester (1, 2, or 3)',
    example: 1,
    enum: [1, 2, 3],
  })
  term?: number;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The start date of the semester in ISO format',
    example: '2024-03-01T00:00:00Z',
  })
  startDate?: Date;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The end date of the semester in ISO format',
    example: '2024-06-30T23:59:59Z',
  })
  endDate?: Date;
}
