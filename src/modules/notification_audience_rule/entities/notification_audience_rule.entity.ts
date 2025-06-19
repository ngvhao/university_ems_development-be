import { NotificationEntity } from 'src/modules/notification/entities/notification.entity';
import {
  EAudienceType,
  EConditionLogic,
} from 'src/utils/enums/notification.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity('notification_audience_rules')
@Index(['notificationId', 'audienceType'])
export class NotificationAudienceRuleEntity extends IEntity {
  @Column()
  notificationId: number;

  @ManyToOne(
    () => NotificationEntity,
    (notification) => notification.audienceRules,
    { onDelete: 'CASCADE', orphanedRowAction: 'delete' },
  )
  @JoinColumn({ name: 'notificationId' })
  notification: NotificationEntity;

  @Column({
    name: 'audienceType',
    type: 'varchar',
    length: 100,
    enum: EAudienceType,
  })
  audienceType: EAudienceType;

  @Column({
    name: 'audienceValue',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  audienceValue: string | null;

  @Column({
    name: 'conditionLogic',
    type: 'varchar',
    length: 50,
    enum: EConditionLogic,
    default: EConditionLogic.INCLUDE,
  })
  conditionLogic: EConditionLogic;
}
