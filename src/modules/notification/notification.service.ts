import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationAudienceRuleEntity } from '../notification_audience_rule/entities/notification_audience_rule.entity';
import { ENotificationStatus } from 'src/utils/enums/notification.enum';
import { CreateNotificationDto } from './dtos/createNotification.dto';
import { NotificationQueryDto } from './dtos/notificationQuery.dto';
import { UpdateNotificationDto } from './dtos/updateNotification.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
    createdByUserId: number,
  ): Promise<NotificationEntity> {
    const { audienceRules, ...notificationData } = createNotificationDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newNotification = queryRunner.manager.create(NotificationEntity, {
        ...notificationData,
        createdByUserId,
        status: notificationData.publishedAt
          ? ENotificationStatus.SCHEDULED
          : ENotificationStatus.DRAFT,
      });
      const savedNotification = await queryRunner.manager.save(
        NotificationEntity,
        newNotification,
      );

      const rulesToSave = audienceRules.map((ruleDto) =>
        queryRunner.manager.create(NotificationAudienceRuleEntity, {
          ...ruleDto,
          notificationId: savedNotification.id,
        }),
      );
      await queryRunner.manager.save(
        NotificationAudienceRuleEntity,
        rulesToSave,
      );

      await queryRunner.commitTransaction();
      return this.findOne(savedNotification.id, true);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Không thể tạo thông báo.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    queryDto: NotificationQueryDto,
  ): Promise<{ data: NotificationEntity[]; meta: MetaDataInterface }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      notificationType,
      priority,
      semesterId,
      createdByUserId,
    } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.audienceRules', 'audienceRules')
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }
    if (notificationType) {
      queryBuilder.andWhere(
        'notification.notificationType = :notificationType',
        { notificationType },
      );
    }
    if (priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority });
    }
    if (semesterId) {
      queryBuilder.andWhere('notification.semesterId = :semesterId', {
        semesterId,
      });
    }
    if (createdByUserId) {
      queryBuilder.andWhere('notification.createdByUserId = :createdByUserId', {
        createdByUserId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(notification.title LIKE :search OR notification.content LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const meta = generatePaginationMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }

  async findOne(
    id: number,
    loadRelations: boolean = true,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: loadRelations ? ['audienceRules', 'recipients'] : [],
    });
    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}.`);
    }
    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = await this.findOne(id, false);

    if (
      notification.status === ENotificationStatus.SENT ||
      notification.status === ENotificationStatus.SENDING
    ) {
      // throw new BadRequestException('Không thể cập nhật thông báo đã gửi hoặc đang gửi.');
    }

    const { audienceRules, ...notificationData } = updateNotificationDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Cập nhật thông tin cơ bản của notification
      await queryRunner.manager.update(NotificationEntity, id, {
        ...notificationData,
        ...(notificationData.publishedAt && {
          status:
            notification.status === ENotificationStatus.DRAFT ||
            notification.status === ENotificationStatus.SCHEDULED
              ? ENotificationStatus.SCHEDULED
              : notification.status,
        }),
      });

      if (audienceRules && audienceRules.length > 0) {
        await queryRunner.manager.delete(NotificationAudienceRuleEntity, {
          notificationId: id,
        });
        const rulesToSave = audienceRules.map((ruleDto) =>
          queryRunner.manager.create(NotificationAudienceRuleEntity, {
            ...ruleDto,
            notificationId: id,
          }),
        );
        await queryRunner.manager.save(
          NotificationAudienceRuleEntity,
          rulesToSave,
        );
      } else if (
        audienceRules === null ||
        (Array.isArray(audienceRules) && audienceRules.length === 0)
      ) {
        await queryRunner.manager.delete(NotificationAudienceRuleEntity, {
          notificationId: id,
        });
      }

      await queryRunner.commitTransaction();
      return this.findOne(id, true);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to update notification ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Không thể cập nhật thông báo.');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
