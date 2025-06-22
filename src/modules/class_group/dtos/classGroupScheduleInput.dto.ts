import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { OccupiedResourceSlotDto } from './occupiedSlot.dto';
import { Type } from 'class-transformer';

export class ClassGroupScheduleInputDto {
  @ApiProperty({
    description: 'ID của học phần trong học kỳ',
    example: 15,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Học phần-Học kỳ phải là số dương' })
  @IsNotEmpty({ message: 'ID Học phần-Học kỳ không được để trống' })
  semesterId: number;

  @ApiProperty({
    description: 'IDs của học phần trong học kỳ',
    example: [1, 2, 3, 4, 5],
    required: true,
    type: Array,
  })
  @IsArray({ message: 'IDs Học phần-Học kỳ phải là mảng' })
  @IsNotEmpty({ message: 'IDs Học phần-Học kỳ không được để trống' })
  courseIds: number[];

  @ApiProperty({
    description: 'Danh sách ngày ngoại lệ (không tính lịch)',
    type: [String],
    example: ['2025-05-20', '2025-05-21'],
  })
  @IsArray()
  @IsDateString({}, { each: true })
  @IsOptional()
  exceptionDates: string[] = [];

  @ApiProperty({
    description: 'Danh sách các khung giờ đã chiếm dụng của tài nguyên',
    type: [OccupiedResourceSlotDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OccupiedResourceSlotDto)
  occupiedSlots: OccupiedResourceSlotDto[] = [];

  @ApiProperty({
    description: 'Số lượng mục tiêu của nhóm',
    example: 30,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  groupSizeTarget: number = 60;

  @ApiProperty({
    description: 'Tối đa số ca trong tuần',
    example: 4,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  maxSessionsPerWeekAllowed: number = 4;

  @ApiProperty({
    description: 'Là nhóm lớp bổ sung hay không',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isExtraClassGroup: boolean = false;

  @ApiProperty({
    description: 'Ngày bắt đầu cho phép đăng ký nhóm lớp này',
    example: '2025-08-01',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày bắt đầu đăng ký phải đúng định dạng ISO (yyyy-MM-dd)' },
  )
  isRegisterFromDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc cho phép đăng ký nhóm lớp này',
    example: '2025-08-15',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày kết thúc đăng ký phải đúng định dạng ISO (yyyy-MM-dd)' },
  )
  isRegisterToDate: string;
}
