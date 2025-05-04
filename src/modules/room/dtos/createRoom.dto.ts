import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RoomType } from 'src/utils/enums/room.enum';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Số phòng',
    example: 'A101',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiProperty({
    description: 'Tên tòa nhà',
    example: 'Tòa nhà A',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  buildingName: string;

  @ApiProperty({
    description: 'Tầng chứa phòng',
    example: 'Tầng 1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  floor: string;

  @ApiProperty({
    description: 'Loại phòng',
    enum: RoomType,
    example: RoomType.CLASSROOM,
    default: RoomType.CLASSROOM,
  })
  @IsEnum(RoomType)
  roomType: RoomType;
}
