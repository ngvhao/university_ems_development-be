import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ERoomType } from 'src/utils/enums/room.enum';

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
    enum: ERoomType,
    example: ERoomType.CLASSROOM,
    default: ERoomType.CLASSROOM,
  })
  @IsEnum(ERoomType)
  roomType: ERoomType;

  @ApiProperty({
    description: 'Sức chứa',
    example: 60,
    default: 60,
  })
  @IsNumber()
  capacity: number;
}
