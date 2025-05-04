import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from 'src/utils/enums/room.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { Entity, Column } from 'typeorm';

@Entity('rooms')
export class RoomEntity extends IEntity {
  @ApiProperty({ description: 'Số phòng', example: 'A101' })
  @Column()
  roomNumber: string;

  @ApiProperty({ description: 'Tên tòa nhà', example: 'Tòa nhà A' })
  @Column()
  buildingName: string;

  @ApiProperty({ description: 'Tầng chứa phòng', example: 'Tầng 1' })
  @Column()
  floor: string;

  @ApiProperty({
    description: 'Loại phòng',
    enum: RoomType,
    example: RoomType.CLASSROOM,
    default: RoomType.CLASSROOM,
  })
  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.CLASSROOM,
  })
  roomType: RoomType;
}
