import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomType } from 'src/utils/enums/room.enum';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  @IsOptional()
  buildingName?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;
}
