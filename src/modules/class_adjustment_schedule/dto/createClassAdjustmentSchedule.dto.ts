import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdjustmentScheduleDto {
  @ApiProperty({
    example: '2025-05-12',
    description: 'Ngày học được điều chỉnh sang (YYYY-MM-DD)',
    required: true,
    type: String,
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'Ngày điều chỉnh phải đúng định dạng YYYY-MM-DD' },
  )
  @IsNotEmpty({ message: 'Ngày điều chỉnh không được để trống' })
  adjustmentDate: string;

  @ApiProperty({
    example: 1,
    description: 'ID của Nhóm lớp học cần điều chỉnh',
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'ID Nhóm lớp học phải là số nguyên' })
  @IsPositive({ message: 'ID Nhóm lớp học phải là số dương' })
  @IsNotEmpty({ message: 'ID Nhóm lớp học không được để trống' })
  classGroupId: number;

  @ApiProperty({
    example: 3,
    description: 'ID của Phòng học mới',
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'ID Phòng học phải là số nguyên' })
  @IsPositive({ message: 'ID Phòng học phải là số dương' })
  @IsNotEmpty({ message: 'ID Phòng học không được để trống' })
  roomId: number;

  @ApiProperty({
    example: 2,
    description: 'ID của Khung giờ học mới',
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'ID Khung giờ học phải là số nguyên' })
  @IsPositive({ message: 'ID Khung giờ học phải là số dương' })
  @IsNotEmpty({ message: 'ID Khung giờ học không được để trống' })
  timeSlotId: number;

  @ApiProperty({
    example: 'Chuyển sang phòng B101 do phòng cũ có sự kiện',
    description: 'Ghi chú lý do điều chỉnh (tối đa 500 ký tự)',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là một chuỗi' })
  @IsNotEmpty({ message: 'Ghi chú nếu được cung cấp không được để trống' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  note?: string;
}
