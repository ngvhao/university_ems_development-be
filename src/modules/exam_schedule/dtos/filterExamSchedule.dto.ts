import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterExamScheduleDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID học kỳ',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semesterId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID nhóm lớp',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  classGroupId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID phòng thi',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roomId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo loại thi',
    example: 'MIDTERM',
  })
  @IsOptional()
  @IsString()
  examType?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ngày thi',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  examDate?: string;
}
