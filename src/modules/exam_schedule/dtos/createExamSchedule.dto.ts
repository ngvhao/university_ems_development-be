import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsDateString,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { EExamType } from 'src/utils/enums/exam.enum';

export class CreateExamScheduleDto {
  @ApiProperty({
    description: 'Loại kỳ thi',
    enum: EExamType,
    example: EExamType.MIDTERM,
  })
  @IsEnum(EExamType)
  examType: EExamType;

  @ApiProperty({
    description: 'Ngày thi',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  examDate: string;

  @ApiProperty({
    description: 'Giờ bắt đầu thi',
    example: '08:00',
    type: String,
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'Giờ kết thúc thi',
    example: '10:00',
    type: String,
  })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Ghi chú về kỳ thi',
    example: 'Thi tại phòng A101, mang theo CMND',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'ID của nhóm lớp',
    example: 25,
  })
  @IsNumber()
  classGroupId: number;

  @ApiProperty({
    description: 'ID của phòng thi',
    example: 10,
  })
  @IsNumber()
  roomId: number;

  @ApiProperty({
    description: 'ID của học kỳ',
    example: 5,
  })
  @IsNumber()
  semesterId: number;
}
