import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  IsPositive,
  IsDate,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsString,
} from 'class-validator';
import { EDayOfWeek } from 'src/utils/enums/schedule.enum';

export class CreateClassWeeklyScheduleDto {
  @ApiProperty({
    description: 'ID của Nhóm lớp học',
    example: 10,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Nhóm lớp học phải là số dương' })
  @IsNotEmpty({ message: 'ID Nhóm lớp học không được để trống' })
  classGroupId: number;

  @ApiProperty({
    description: 'ID của Phòng học',
    example: 5,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Phòng học phải là số dương' })
  @IsNotEmpty({ message: 'ID Phòng học không được để trống' })
  roomId: number;

  @ApiProperty({
    description: 'ID của Khung giờ học',
    example: 3,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Khung giờ học phải là số dương' })
  @IsNotEmpty({ message: 'ID Khung giờ học không được để trống' })
  timeSlotId: number;

  @ApiProperty({
    description: 'Thứ trong tuần (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)',
    example: 1,
    required: true,
    type: Number,
    minimum: 0,
    maximum: 6,
    enum: EDayOfWeek,
  })
  @IsEnum(EDayOfWeek, {
    message: 'Thứ trong tuần không hợp lệ (phải từ 0 đến 6)',
  })
  @Min(0, { message: 'Thứ trong tuần phải lớn hơn hoặc bằng 0' })
  @Max(6, { message: 'Thứ trong tuần phải nhỏ hơn hoặc bằng 6' })
  @IsInt({ message: 'Thứ trong tuần phải là số nguyên' })
  @IsNotEmpty({ message: 'Thứ trong tuần không được để trống' })
  dayOfWeek: EDayOfWeek;

  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2025-09-01',
    type: String,
    format: 'date',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2026-01-05',
    type: String,
    format: 'date',
  })
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description:
      'Các ngày được lên lịch (dạng mảng chuỗi, ví dụ: "YYYY-MM-DD")',
    example: ['2026-01-05', '2026-01-06', '2026-01-07'],
    type: [String],
  })
  @IsArray({ message: 'scheduledDates phải là một mảng.' })
  @ArrayNotEmpty({ message: 'scheduledDates không được để trống.' })
  @IsString({
    each: true,
    message: 'Mỗi phần tử trong scheduledDates phải là một chuỗi.',
  })
  @IsDateString(
    {},
    {
      each: true,
      message:
        'Mỗi phần tử trong scheduledDates phải là một chuỗi ngày hợp lệ (YYYY-MM-DD).',
    },
  )
  scheduledDates: string[];
}
