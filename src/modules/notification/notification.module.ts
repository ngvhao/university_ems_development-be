import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { StudentModule } from '../student/student.module';
import { LecturerModule } from '../lecturer/lecturer.module';
import { NotificationRecipientModule } from '../notification_recipient/notification_recipient.module';
import { NotificationAudienceRuleEntity } from '../notification_audience_rule/entities/notification_audience_rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationAudienceRuleEntity,
    ]),
    forwardRef(() => NotificationRecipientModule),
    StudentModule,
    LecturerModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
