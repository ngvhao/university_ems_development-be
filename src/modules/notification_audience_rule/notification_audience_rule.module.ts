import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationAudienceRuleEntity } from './entities/notification_audience_rule.entity';
import { NotificationRulesController } from './notification_audience_rule.controller';
import { NotificationRulesService } from './notification_audience_rule.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationAudienceRuleEntity])],
  controllers: [NotificationRulesController],
  providers: [NotificationRulesService],
  exports: [NotificationRulesService],
})
export class NotificationsModule {}
