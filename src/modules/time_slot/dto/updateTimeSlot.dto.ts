import { PartialType } from '@nestjs/swagger';
import { CreateTimeSlotDto } from './createTimeSlot.dto';
import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsTimeBefore } from 'src/decorators/is-time-before.decorator';

export class UpdateTimeSlotDto extends PartialType(CreateTimeSlotDto) {
  @ApiPropertyOptional({ description: 'Thời gian bắt đầu mới (HH:MM)' })
  @IsOptional()
  @IsString({ message: 'Thời gian bắt đầu phải là chuỗi' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Thời gian bắt đầu phải đúng định dạng HH:MM',
  })
  startTime?: string;

  @ApiPropertyOptional({ description: 'Thời gian kết thúc mới (HH:MM)' })
  @IsOptional()
  @IsString({ message: 'Thời gian kết thúc phải là chuỗi' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Thời gian kết thúc phải đúng định dạng HH:MM',
  })
  @IsTimeBefore('startTime', {
    message: '$property phải là thời gian sau startTime.',
  })
  endTime?: string;
}
