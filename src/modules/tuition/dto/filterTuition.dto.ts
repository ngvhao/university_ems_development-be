import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterTuitionDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID sinh viên',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  studentId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID học kỳ',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semesterId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái thanh toán',
    example: 'PAID',
  })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID khoa',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID bộ môn',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID ngành học',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  majorId?: number;
}
