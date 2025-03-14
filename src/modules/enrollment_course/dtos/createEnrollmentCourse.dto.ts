import { IsInt, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ECourseStatus } from 'src/utils/enums/course.enum';

export class CreateEnrollmentCourseDto {
  @IsInt({ message: 'Student ID must be an integer' })
  @Min(1, { message: 'Student ID must be greater than 0' })
  @IsNotEmpty({ message: 'Student ID is required' })
  @ApiProperty({
    description: 'The ID of the student enrolling in the course',
    example: 1,
  })
  studentId: number;

  @IsInt({ message: 'Course Semester ID must be an integer' })
  @Min(1, { message: 'Course Semester ID must be greater than 0' })
  @IsNotEmpty({ message: 'Course Semester ID is required' })
  @ApiProperty({
    description: 'The ID of the course semester being enrolled',
    example: 1,
  })
  courseSemesterId: number;

  @IsEnum(['ENROLLED', 'PASSED', 'FAILED', 'WITHDRAWN'], {
    message: 'Status must be one of: ENROLLED, PASSED, FAILED, WITHDRAWN',
  })
  @IsNotEmpty({ message: 'Status is required' })
  @ApiProperty({
    description: 'The enrollment status',
    example: 'ENROLLED',
    enum: ['ENROLLED', 'PASSED', 'FAILED', 'WITHDRAWN'],
  })
  status: ECourseStatus;
}
