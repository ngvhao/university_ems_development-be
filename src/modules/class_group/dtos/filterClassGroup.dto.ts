import { IsOptional, IsEnum, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterClassGroupDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID của học phần trong học kỳ',
    example: 15,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Học phần-Học kỳ phải là số dương' })
  @Type(() => Number)
  courseSemesterId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái nhóm lớp',
    enum: EClassGroupStatus,
    example: EClassGroupStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(EClassGroupStatus, { message: 'Trạng thái không hợp lệ' })
  status?: EClassGroupStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo số thứ tự nhóm lớp',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsPositive({ message: 'Số thứ tự nhóm phải là số dương' })
  @Type(() => Number)
  groupNumber?: number;
}
