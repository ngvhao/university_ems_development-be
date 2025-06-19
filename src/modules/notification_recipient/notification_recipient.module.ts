import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRecipientEntity } from './entities/notification_recipient.entity';
import { NotificationRecipientsController } from './notification_recipient.controller';
import { NotificationRecipientsService } from './notification_recipient.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationRecipientEntity])],
  controllers: [NotificationRecipientsController],
  providers: [NotificationRecipientsService],
})
export class NotificationRecipientModule {}
