import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ETuitionStatus } from 'src/utils/enums/tuition.enum';

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
  paymentStatus?: ETuitionStatus;

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
