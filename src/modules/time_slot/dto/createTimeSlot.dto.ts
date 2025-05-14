import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Matches } from 'class-validator';
import { IsTimeBefore } from 'src/decorators/is-time-before.decorator';
import { TIME_REGEX } from 'src/utils/constants';

export class CreateTimeSlotDto {
  @ApiProperty({
    description: 'Thời gian bắt đầu của khung giờ (HH:MM)',
    example: '07:00',
    required: true,
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsString({ message: 'Thời gian bắt đầu phải là chuỗi' })
  @Matches(TIME_REGEX, {
    message: 'Thời gian bắt đầu phải đúng định dạng HH:MM',
  })
  startTime: string;

  @ApiProperty({
    description: 'Thời gian kết thúc của khung giờ (HH:MM)',
    example: '09:30',
    required: true,
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsString({ message: 'Thời gian kết thúc phải là chuỗi' })
  @Matches(TIME_REGEX, {
    message: 'Thời gian kết thúc phải đúng định dạng HH:MM',
  })
  @IsTimeBefore('startTime', {
    message: '$property phải là thời gian sau startTime.',
  })
  endTime: string;

  @ApiProperty({
    description:
      'Tiết học/Ca học (ví dụ: 1 cho tiết 1-2, 2 cho tiết 3-4,... hoặc theo quy định)',
    example: 1,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Tiết/Ca học không được để trống' })
  @IsInt({ message: 'Tiết/Ca học phải là số nguyên' })
  @Min(1, { message: 'Tiết/Ca học phải lớn hơn 0' })
  shift: number;
}
