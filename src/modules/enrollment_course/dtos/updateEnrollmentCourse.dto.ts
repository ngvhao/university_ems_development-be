import { IsInt, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEnrollmentCourseDto {
  @IsInt({ message: 'Student ID must be an integer' })
  @Min(1, { message: 'Student ID must be greater than 0' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The ID of the student enrolling in the course',
    example: 1,
  })
  studentId?: number;

  @IsInt({ message: 'Course Semester ID must be an integer' })
  @Min(1, { message: 'Course Semester ID must be greater than 0' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The ID of the course semester being enrolled',
    example: 1,
  })
  courseSemesterId?: number;

  @IsNumber({}, { message: 'Grade must be a number' })
  @Min(0, { message: 'Grade must be at least 0' })
  @Max(10, { message: 'Grade must not exceed 10' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The grade achieved in the course (0-10)',
    example: 8.5,
  })
  grade?: number;

  @IsEnum(['ENROLLED', 'PASSED', 'FAILED', 'WITHDRAWN'], {
    message: 'Status must be one of: ENROLLED, PASSED, FAILED, WITHDRAWN',
  })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The enrollment status',
    example: 'PASSED',
    enum: ['ENROLLED', 'PASSED', 'FAILED', 'WITHDRAWN'],
  })
  status?: string;
}
