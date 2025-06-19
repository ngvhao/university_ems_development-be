import { NotificationAudienceRuleEntity } from 'src/modules/notification_audience_rule/entities/notification_audience_rule.entity';
import { NotificationRecipientEntity } from 'src/modules/notification_recipient/entities/notification_recipient.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  ENotificationPriority,
  ENotificationStatus,
  ENotificationType,
} from 'src/utils/enums/notification.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity extends IEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column({
    name: 'notificationType',
    type: 'varchar',
    length: 50,
    enum: ENotificationType,
    nullable: true,
  })
  notificationType: ENotificationType | null;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    enum: ENotificationPriority,
    default: ENotificationPriority.MEDIUM,
  })
  priority: ENotificationPriority;

  @Column({ name: 'created_by_user_id', type: 'int', nullable: true })
  createdByUserId: number | null;

  @ManyToOne(
    () => UserEntity,
    (user: UserEntity) => user.createdNotifications,
    { eager: false, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: UserEntity | null;

  @Index()
  @Column({ type: 'int', nullable: true })
  semesterId: number | null;

  @ManyToOne(
    () => SemesterEntity,
    (semester: SemesterEntity) => semester.notifications,
    { eager: false, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  semester: SemesterEntity | null;

  @Index()
  @Column({
    name: 'published_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  publishedAt: Date | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  expiresAt: Date | null;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    enum: ENotificationStatus,
    default: ENotificationStatus.DRAFT,
  })
  status: ENotificationStatus;

  @OneToMany(
    () => NotificationAudienceRuleEntity,
    (rule) => rule.notification,
    { cascade: ['insert', 'update', 'remove'], eager: false },
  )
  audienceRules: NotificationAudienceRuleEntity[];

  @OneToMany(
    () => NotificationRecipientEntity,
    (recipient) => recipient.notification,
    { eager: false },
  )
  recipients: NotificationRecipientEntity[];
}
