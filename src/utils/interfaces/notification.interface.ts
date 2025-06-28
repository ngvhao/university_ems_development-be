import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import {
  ENotificationType,
  ERecipientStatus,
} from '../enums/notification.enum';

export interface INotificationResponse {
  id: number;
  title: string;
  notificationType: ENotificationType;
  priority: number;
  createdAt: Date;
  semester: SemesterEntity;
  recepientStatus?: ERecipientStatus;
  readAt?: Date;
  dismissedAt?: Date;
  isPinned?: boolean;
}
