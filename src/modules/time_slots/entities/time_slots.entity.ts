import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('time_slots')
export class TimeSlotsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time', nullable: false })
  start_time: string;

  @Column({ type: 'time', nullable: false })
  end_time: string;

  @Column({ type: 'int', nullable: false })
  shift: number;
}
