import { ApiProperty } from '@nestjs/swagger';
import { ERoomType } from 'src/utils/enums/room.enum';
import { TimeSlotEntity } from 'src/modules/time_slot/entities/time_slot.entity';

export class FreeClassroomResponseDto {
  @ApiProperty({ description: 'ID của phòng', example: 1 })
  id: number;

  @ApiProperty({ description: 'Số phòng', example: 'A101' })
  roomNumber: string;

  @ApiProperty({ description: 'Tên tòa nhà', example: 'Tòa nhà A' })
  buildingName: string;

  @ApiProperty({ description: 'Tầng chứa phòng', example: 'Tầng 1' })
  floor: string;

  @ApiProperty({
    description: 'Loại phòng',
    enum: ERoomType,
    example: ERoomType.CLASSROOM,
  })
  roomType: ERoomType;

  @ApiProperty({
    description: 'Sức chứa',
    example: 60,
  })
  capacity: number;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Danh sách các ca trống trong ngày',
    type: [TimeSlotEntity],
  })
  freeTimeSlots: TimeSlotEntity[];
}
