import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

export class FilterClassGroupDto {
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

  @ApiPropertyOptional({
    description: 'Lọc theo ID môn học',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID học kỳ',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semesterId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(EClassGroupStatus)
  status?: EClassGroupStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo danh sách trạng thái',
    example: [
      EClassGroupStatus.OPEN_FOR_REGISTER,
      EClassGroupStatus.CLOSED_FOR_REGISTER,
    ],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EClassGroupStatus, { each: true })
  statuses?: EClassGroupStatus[];

  @ApiPropertyOptional({
    description: 'Lọc theo năm nhập học',
    example: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  yearAdmission?: number;
}
