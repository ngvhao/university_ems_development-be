import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationRuleModule } from '../notification_audience_rule/notification_audience_rule.module';
import { StudentModule } from '../student/student.module';
import { NotificationRecipientModule } from '../notification_recipient/notification_recipient.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    forwardRef(() => NotificationRuleModule),
    forwardRef(() => NotificationRecipientModule),
    StudentModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
