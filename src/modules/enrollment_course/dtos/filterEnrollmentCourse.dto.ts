import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterEnrollmentCourseDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID sinh viên',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  studentId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID nhóm lớp',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  classGroupId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đăng ký',
    example: 'ENROLLED',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID học kỳ',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semesterId?: number;
}
