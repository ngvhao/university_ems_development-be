import { IsString, IsNotEmpty, IsInt, Min, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimeSlotDto {
  @ApiProperty({
    description: 'Start time of the time slot',
    example: '08:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in the format HH:mm',
  })
  start_time: string;

  @ApiProperty({
    description: 'End time of the time slot',
    example: '10:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in the format HH:mm',
  })
  end_time: string;

  @ApiProperty({
    description: 'Shift number (e.g., 1 for morning, 2 for afternoon, etc.)',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  shift: number;
}
