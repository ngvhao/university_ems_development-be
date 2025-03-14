import { IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassDto {
  @IsString({ message: 'Class code must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Class code must not exceed 20 characters' })
  @ApiPropertyOptional({
    description: 'Unique code identifying the class',
    example: 'CS2024A',
  })
  classCode?: string;

  @IsInt({ message: 'Major ID must be an integer' })
  @Min(1, { message: 'Major ID must be greater than 0' })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The ID of the major this class belongs to',
    example: 1,
  })
  majorId?: number;
}
