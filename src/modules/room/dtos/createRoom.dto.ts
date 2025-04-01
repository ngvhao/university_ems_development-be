import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RoomType } from 'src/utils/enums/room.enum';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @IsString()
  @IsNotEmpty()
  buildingName: string;

  @IsString()
  @IsNotEmpty()
  floor: string;

  @IsEnum(RoomType)
  roomType: RoomType;
}
