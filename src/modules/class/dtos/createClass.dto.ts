import { IsString, IsInt, IsNotEmpty, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @IsString({ message: 'Class code must be a string' })
  @IsNotEmpty({ message: 'Class code is required' })
  @MaxLength(20, { message: 'Class code must not exceed 20 characters' })
  @ApiProperty({
    description: 'Unique code identifying the class',
    example: 'CS2024A',
  })
  classCode: string;

  @IsInt({ message: 'Major ID must be an integer' })
  @Min(1, { message: 'Major ID must be greater than 0' })
  @IsNotEmpty({ message: 'Major ID is required' })
  @ApiProperty({
    description: 'The ID of the major this class belongs to',
    example: 1,
  })
  majorId: number;
}
