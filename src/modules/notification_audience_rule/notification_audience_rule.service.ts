import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ENotificationStatus } from 'src/utils/enums/notification.enum';
import { FindManyOptions, Repository } from 'typeorm';
import { NotificationEntity } from '../notification/entities/notification.entity';
import { CreateNotificationAudienceRuleDto } from './dtos/createNotificationAudienceRule.dto';
import { UpdateNotificationAudienceRuleDto } from './dtos/updateNotificationAudienceRule.dto';
import { NotificationAudienceRuleEntity } from './entities/notification_audience_rule.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class NotificationRuleService {
  private readonly logger = new Logger(NotificationRuleService.name);

  constructor(
    @InjectRepository(NotificationAudienceRuleEntity)
    private readonly ruleRepository: Repository<NotificationAudienceRuleEntity>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  private async _getNotificationOrFail(
    notificationId: number,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationService.findOne(notificationId);
    if (!notification) {
      throw new NotFoundException(
        `Không tìm thấy thông báo với ID ${notificationId}.`,
      );
    }
    return notification;
  }

  private _checkNotificationStatus(notification: NotificationEntity): void {
    if (notification.status === ENotificationStatus.SENT) {
      this.logger.warn(
        `Attempted to modify rules for a sent/sending notification (ID: ${notification.id})`,
      );
    }
  }

  async createRule(
    notificationId: number,
    createRuleDto: CreateNotificationAudienceRuleDto,
  ): Promise<NotificationAudienceRuleEntity> {
    const notification = await this._getNotificationOrFail(notificationId);
    this._checkNotificationStatus(notification);

    const newRule = this.ruleRepository.create({
      ...createRuleDto,
      notificationId: notificationId,
    });

    try {
      return await this.ruleRepository.save(newRule);
    } catch (error) {
      this.logger.error(
        `Failed to create rule for notification ${notificationId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Không thể tạo quy tắc.');
    }
  }

  async findAllRulesForNotification(
    notificationId: number,
  ): Promise<NotificationAudienceRuleEntity[]> {
    await this._getNotificationOrFail(notificationId);
    return this.ruleRepository.find({
      where: { notificationId },
      order: { id: 'ASC' },
    });
  }

  async find(
    condition: FindManyOptions<NotificationAudienceRuleEntity>,
  ): Promise<NotificationAudienceRuleEntity[]> {
    const rule = await this.ruleRepository.find(condition);
    if (!rule) {
      throw new NotFoundException('Không tìm thấy quy tắc cho thông báo');
    }
    return rule;
  }

  async findOneRule(
    notificationId: number,
    ruleId: number,
  ): Promise<NotificationAudienceRuleEntity> {
    const rule = await this.ruleRepository.findOneBy({
      id: ruleId,
      notificationId: notificationId,
    });
    if (!rule) {
      throw new NotFoundException(
        `Không tìm thấy quy tắc ID ${ruleId} cho thông báo ID ${notificationId}.`,
      );
    }
    return rule;
  }

  async updateRule(
    notificationId: number,
    ruleId: number,
    updateRuleDto: UpdateNotificationAudienceRuleDto,
  ): Promise<NotificationAudienceRuleEntity> {
    const notification = await this._getNotificationOrFail(notificationId);
    this._checkNotificationStatus(notification);

    const rule = await this.findOneRule(notificationId, ruleId);

    this.ruleRepository.merge(rule, updateRuleDto);

    try {
      return await this.ruleRepository.save(rule);
    } catch (error) {
      this.logger.error(
        `Failed to update rule ${ruleId} for notification ${notificationId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Không thể cập nhật quy tắc.');
    }
  }

  async removeRule(notificationId: number, ruleId: number): Promise<void> {
    const notification = await this._getNotificationOrFail(notificationId);
    this._checkNotificationStatus(notification);

    await this.findOneRule(notificationId, ruleId);

    const result = await this.ruleRepository.delete({
      id: ruleId,
      notificationId: notificationId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy quy tắc ID ${ruleId} cho thông báo ID ${notificationId} để xóa (sau khi đã kiểm tra).`,
      );
    }
  }
}
