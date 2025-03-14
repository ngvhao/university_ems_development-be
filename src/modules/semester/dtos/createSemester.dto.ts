import {
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSemesterDto {
  @IsString({ message: 'Semester code must be a string' })
  @IsNotEmpty({ message: 'Semester code is required' })
  @MaxLength(20, { message: 'Semester code must not exceed 20 characters' })
  @ApiProperty({
    description: 'Unique code identifying the semester',
    example: '2024-S1',
  })
  semesterCode: string;

  @IsInt({ message: 'Start year must be an integer' })
  @Min(2000, { message: 'Start year must be 2000 or later' })
  @IsNotEmpty({ message: 'Start year is required' })
  @ApiProperty({
    description: 'The starting year of the semester',
    example: 2024,
  })
  startYear: number;

  @IsInt({ message: 'End year must be an integer' })
  @Min(2000, { message: 'End year must be 2000 or later' })
  @IsNotEmpty({ message: 'End year is required' })
  @ApiProperty({
    description: 'The ending year of the semester',
    example: 2024,
  })
  endYear: number;

  @IsEnum([1, 2, 3], { message: 'Term must be 1, 2, or 3' })
  @IsNotEmpty({ message: 'Term is required' })
  @ApiProperty({
    description: 'The term number of the semester (1, 2, or 3)',
    example: 1,
    enum: [1, 2, 3],
  })
  term: number;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Start date is required' })
  @ApiProperty({
    description: 'The start date of the semester in ISO format',
    example: '2024-03-01T00:00:00Z',
  })
  startDate: Date;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @IsNotEmpty({ message: 'End date is required' })
  @ApiProperty({
    description: 'The end date of the semester in ISO format',
    example: '2024-06-30T23:59:59Z',
  })
  endDate: Date;
}
