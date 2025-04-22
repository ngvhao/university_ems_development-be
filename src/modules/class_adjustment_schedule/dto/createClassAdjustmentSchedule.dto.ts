import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdjustmentScheduleDto {
  @ApiProperty({ example: '2025-05-12', description: 'Ngày điều chỉnh học' })
  @IsDateString()
  adjustmentDate: string;

  @ApiProperty({ example: 1, description: 'ID nhóm lớp học' })
  @IsInt()
  @Min(1)
  classGroupId: number;

  @ApiProperty({ example: 3, description: 'ID phòng học' })
  @IsInt()
  @Min(1)
  roomId: number;

  @ApiProperty({ example: 2, description: 'ID khung giờ học' })
  @IsInt()
  @Min(1)
  timeSlotId: number;

  @ApiProperty({
    example: 'Chuyển sang phòng B101 do phòng cũ có sự kiện',
    description: 'Ghi chú lý do điều chỉnh (nếu có)',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  note?: string;
}
