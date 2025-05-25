import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateEnrollmentCourseDto {
  @ApiProperty({
    description: 'Danh sách ID của Nhóm lớp học (ClassGroup) cần đăng ký',
    example: [25, 26],
    required: true,
    type: [Number],
  })
  @IsArray({ message: 'classGroupId phải là một mảng' })
  @ArrayNotEmpty({ message: 'classGroupId không được để trống' })
  @ArrayMinSize(1, { message: 'classGroupId phải chứa ít nhất 1 phần tử' })
  @IsNumber(
    {},
    { each: true, message: 'Mỗi phần tử trong classGroupId phải là số' },
  )
  @IsPositive({ each: true, message: 'Mỗi ID Nhóm lớp học phải là số dương' })
  @Type(() => Number)
  classGroupIds: number[];

  @ApiPropertyOptional({
    description: 'ID của Sinh viên (chỉ dùng bởi Admin/Academic Manager)',
    example: 101,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Sinh viên phải là số dương' })
  studentId?: number;
}
