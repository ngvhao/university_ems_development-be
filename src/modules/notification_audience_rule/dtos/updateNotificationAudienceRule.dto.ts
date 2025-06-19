import { PartialType } from '@nestjs/swagger';
import { CreateNotificationAudienceRuleDto } from './createNotificationAudienceRule.dto';

export class UpdateNotificationAudienceRuleDto extends PartialType(
  CreateNotificationAudienceRuleDto,
) {}
