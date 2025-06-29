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
    type: 'enum',
    enum: ENotificationType,
    comment:
      'ACADEMIC = 7, EVENT = 1, SURVEY = 2, SYSTEM = 3, FEE = 4, EXAM = 5, GENERAL = 6',
  })
  notificationType: ENotificationType;

  @Index()
  @Column({
    type: 'enum',
    enum: ENotificationPriority,
    default: ENotificationPriority.MEDIUM,
    comment: 'HIGH = 3, MEDIUM = 1, LOW = 2',
  })
  priority: ENotificationPriority;

  @Column({ name: 'createdByUserId', type: 'int', nullable: true })
  createdByUserId: number;

  @ManyToOne(
    () => UserEntity,
    (user: UserEntity) => user.createdNotifications,
    { eager: false, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: UserEntity;

  @Index()
  @Column({ type: 'int', nullable: true })
  semesterId: number;

  @ManyToOne(
    () => SemesterEntity,
    (semester: SemesterEntity) => semester.notifications,
    { eager: false, nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  semester: SemesterEntity;

  @Column('text', { array: true, nullable: true })
  attachments: string[];

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    enum: ENotificationStatus,
    default: ENotificationStatus.DRAFT,
    comment: 'DRAFT = 4, SCHEDULED = 1, SENT = 2, ARCHIVED_BY_ADMIN = 3',
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
