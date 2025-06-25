import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRecipientEntity } from './entities/notification_recipient.entity';
import { NotificationRecipientController } from './notification_recipient.controller';
import { NotificationRecipientService } from './notification_recipient.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationRecipientEntity]),
    forwardRef(() => NotificationModule),
  ],
  controllers: [NotificationRecipientController],
  providers: [NotificationRecipientService],
  exports: [NotificationRecipientService],
})
export class NotificationRecipientModule {}
