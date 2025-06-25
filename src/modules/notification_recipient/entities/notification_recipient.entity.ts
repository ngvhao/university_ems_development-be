import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { ERecipientStatus } from 'src/utils/enums/notification.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('notification_recipients')
@Index(['recipientUserId', 'status'])
@Index(['notificationId', 'recipientUserId'], { unique: true })
export class NotificationRecipientEntity extends IEntity {
  @Index()
  @Column({ name: 'notificationId' })
  notificationId: number;

  @ManyToOne(
    () => NotificationEntity,
    (notification) => notification.recipients,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'notificationId' })
  notification: NotificationEntity;

  @Index()
  @Column({ name: 'recipientUserId' })
  recipientUserId: number;

  @ManyToOne(
    () => UserEntity,
    (user: UserEntity) => user.receivedNotifications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  recipientUser: UserEntity;

  @CreateDateColumn({ name: 'receivedAt', type: 'timestamp with time zone' })
  receivedAt: Date;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ERecipientStatus,
    default: ERecipientStatus.UNREAD,
    comment: 'UNREAD = 0, READ = 1, DISMISSED = 3, ARCHIVED_BY_USER = 4',
  })
  status: ERecipientStatus;

  @Column({ name: 'readAt', type: 'timestamp with time zone', nullable: true })
  readAt: Date | null;

  @Column({
    name: 'dismissedAt',
    type: 'timestamp with time zone',
    nullable: true,
  })
  dismissedAt: Date | null;

  @Column({ name: 'isPinned', type: 'boolean', default: false })
  isPinned: boolean;
}
