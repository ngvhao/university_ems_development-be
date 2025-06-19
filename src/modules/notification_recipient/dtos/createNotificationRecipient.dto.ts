import { ERecipientStatus } from 'src/utils/enums/notification.enum';

export class CreateNotificationRecipientDto {
  notificationId: number;

  recipientUserId: number;

  receivedAt: Date;

  status: ERecipientStatus;

  readAt: Date;

  dismissedAt: Date | null;

  isPinned: boolean;
}
