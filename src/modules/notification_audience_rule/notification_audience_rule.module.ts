import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationAudienceRuleEntity } from './entities/notification_audience_rule.entity';
import { NotificationRuleController } from './notification_audience_rule.controller';
import { NotificationRuleService } from './notification_audience_rule.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationAudienceRuleEntity]),
    NotificationModule,
  ],
  controllers: [NotificationRuleController],
  providers: [NotificationRuleService],
  exports: [NotificationRuleService],
})
export class NotificationRuleModule {}
