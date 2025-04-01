import { RoomType } from 'src/utils/enums/room.enum';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column } from 'typeorm';

@Entity()
export class RoomEntity extends IEntity {
  @Column()
  roomNumber: string;

  @Column()
  buildingName: string;

  @Column()
  floor: string;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.CLASSROOM,
  })
  roomType: RoomType;
}
