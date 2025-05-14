import { IsIn, IsInt, IsNotEmpty, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OccupiedResourceSlotDto {
  @ApiProperty({
    description: 'Loại tài nguyên (room hoặc lecturer)',
    enum: ['room', 'lecturer'],
    example: 'room',
  })
  @IsIn(['room', 'lecturer'])
  resourceType: 'room' | 'lecturer';

  @ApiProperty({
    description:
      'ID hoặc mã của tài nguyên (roomId, roomNumber, hoặc lecturerId)',
    oneOf: [
      { type: 'integer', example: 123 },
      { type: 'string', example: 'A101' },
    ],
  })
  @IsNotEmpty()
  resourceId: number | string;

  @ApiProperty({
    description: 'Ngày (định dạng YYYY-MM-DD)',
    example: '2025-05-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'ID của khung giờ',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  timeSlotId: number;
}
