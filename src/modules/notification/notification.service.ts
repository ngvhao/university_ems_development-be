import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets, In } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationAudienceRuleEntity } from '../notification_audience_rule/entities/notification_audience_rule.entity';
import {
  EAudienceType,
  EConditionLogic,
  ENotificationStatus,
  ERecipientStatus,
} from 'src/utils/enums/notification.enum';
import { CreateNotificationDto } from './dtos/createNotification.dto';
import { NotificationQueryDto } from './dtos/notificationQuery.dto';
import { UpdateNotificationDto } from './dtos/updateNotification.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { UserEntity } from '../user/entities/user.entity';
import { UserNotificationQueryDto } from '../notification_recipient/dtos/queryNotificationRecipient.dto';
import { NotificationRuleService } from '../notification_audience_rule/notification_audience_rule.service';
import { NotificationRecipientService } from '../notification_recipient/notification_recipient.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => NotificationRuleService))
    private readonly ruleService: NotificationRuleService,
    @Inject(forwardRef(() => NotificationRecipientService))
    private readonly recipientService: NotificationRecipientService,
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
        status: ENotificationStatus.SENT,
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

  async findUserNotifications(
    currentUser: UserEntity,
    queryDto: UserNotificationQueryDto,
  ): Promise<{ data: NotificationEntity[]; meta: MetaDataInterface }> {
    const {
      page = 1,
      limit = 10,
      search,
      notificationType,
      priority,
      recipientStatus: filterRecipientStatus,
    } = queryDto;
    const skip = (page - 1) * limit;

    const potentialNotificationsQb = this.notificationRepository
      .createQueryBuilder('notification')
      .innerJoin('notification.audienceRules', 'rule')
      .leftJoinAndSelect('notification.semester', 'semester')
      .leftJoinAndSelect(
        'notification.recipients',
        'recipient',
        'recipient.recipientUserId = :currentUserId',
        { currentUserId: currentUser.id },
      )
      .where('notification.status = :sentStatus', {
        sentStatus: ENotificationStatus.SENT,
      })
      .andWhere(
        new Brackets((qb) => {
          if (search) {
            qb.andWhere(
              new Brackets((sqb) => {
                sqb
                  .where('notification.title LIKE :search', {
                    search: `%${search}%`,
                  })
                  .orWhere('notification.content LIKE :search', {
                    search: `%${search}%`,
                  });
              }),
            );
          }
          if (notificationType) {
            qb.andWhere('notification.notificationType = :notificationType', {
              notificationType,
            });
          }
          if (priority) {
            qb.andWhere('notification.priority = :priority', { priority });
          }
        }),
      )
      .andWhere(
        new Brackets((mainQb) => {
          mainQb.where(
            new Brackets((qb) => {
              qb.where(
                'rule.audienceType = :allType AND rule.conditionLogic = :includeLogic',
                {
                  allType: EAudienceType.ALL_USERS,
                  includeLogic: EConditionLogic.INCLUDE,
                },
              );
            }),
          );
          if (currentUser.role) {
            mainQb.orWhere(
              new Brackets((qb) => {
                qb.where(
                  'rule.audienceType = :roleType AND rule.audienceValue = :userRole AND rule.conditionLogic = :includeLogic',
                  {
                    roleType: EAudienceType.ROLE,
                    userRole: currentUser.role,
                    includeLogic: EConditionLogic.INCLUDE,
                  },
                );
              }),
            );
          }
          if (currentUser.student?.majorId) {
            mainQb.orWhere(
              new Brackets((qb) => {
                qb.where(
                  'rule.audienceType = :majorType AND rule.audienceValue = :userMajorValue AND rule.conditionLogic = :includeLogic',
                  {
                    majorType: EAudienceType.MAJOR,
                    userMajorValue: currentUser.student.majorId.toString(),
                    includeLogic: EConditionLogic.INCLUDE,
                  },
                );
              }),
            );
          }
          if (currentUser.lecturer?.departmentId) {
            mainQb.orWhere(
              new Brackets((qb) => {
                qb.where(
                  'rule.audienceType = :deptType AND rule.audienceValue = :userDeptValue AND rule.conditionLogic = :includeLogic',
                  {
                    deptType: EAudienceType.DEPARTMENT,
                    userDeptValue: currentUser.lecturer.departmentId.toString(),
                    includeLogic: EConditionLogic.INCLUDE,
                  },
                );
              }),
            );
          }
          mainQb.orWhere(
            new Brackets((qb) => {
              qb.where(
                'rule.audienceType = :userListType AND rule.conditionLogic = :includeLogic AND (rule.audienceValue = :userIdStr OR rule.audienceValue LIKE :userIdStart OR rule.audienceValue LIKE :userIdMiddle OR rule.audienceValue LIKE :userIdEnd)',
                {
                  userListType: EAudienceType.USER_LIST,
                  includeLogic: EConditionLogic.INCLUDE,
                  userIdStr: currentUser.id.toString(),
                  userIdStart: `${currentUser.id},%`,
                  userIdMiddle: `%,${currentUser.id},%`,
                  userIdEnd: `%,${currentUser.id}`,
                },
              );
            }),
          );
        }),
      )
      // .select([
      //   'notification.id',
      //   'notification.title',
      //   'notification.content',
      //   'notification.notificationType',
      //   'notification.priority',
      //   'notification.createdAt',
      //   'semester.id',
      //   'recipient.id',
      //   'recipient.status',
      //   'recipient.readAt',
      //   'recipient.dismissedAt',
      //   'recipient.isPinned',
      // ])
      .groupBy('notification.id')
      .addGroupBy('semester.id')
      .addGroupBy('recipient.id')
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [candidateNotifications, totalCandidates] =
      await potentialNotificationsQb.getManyAndCount();

    const finalNotificationsData = [];

    if (candidateNotifications.length > 0) {
      const candidateNotificationIdsOnPage = candidateNotifications.map(
        (n) => n.id,
      );
      const allRulesForCandidatesOnPage = await this.ruleService.find({
        where: {
          notificationId: In(candidateNotificationIdsOnPage),
          conditionLogic: EConditionLogic.INCLUDE,
        },
      });

      const rulesByNotificationId = new Map<
        number,
        NotificationAudienceRuleEntity[]
      >();
      allRulesForCandidatesOnPage.forEach((r) => {
        if (!rulesByNotificationId.has(r.notificationId)) {
          rulesByNotificationId.set(r.notificationId, []);
        }
        rulesByNotificationId.get(r.notificationId).push(r);
      });

      for (const notification of candidateNotifications) {
        const rules = rulesByNotificationId.get(notification.id) || [];

        if (this._checkUserMatchesAllIncludeRules(currentUser, rules)) {
          const recipientEntry =
            notification.recipients && notification.recipients.length > 0
              ? notification.recipients[0]
              : null;

          const currentStatus = recipientEntry
            ? recipientEntry.status
            : ERecipientStatus.UNREAD;
          const isPinned = recipientEntry ? recipientEntry.isPinned : false;
          const readAt = recipientEntry ? recipientEntry.readAt : null;
          const dismissedAt = recipientEntry
            ? recipientEntry.dismissedAt
            : null;

          if (filterRecipientStatus && currentStatus !== filterRecipientStatus)
            continue;

          finalNotificationsData.push({
            id: notification.id,
            title: notification.title,
            notificationType: notification.notificationType,
            priority: notification.priority,
            createdAt: notification.createdAt,
            semester: notification.semester,
            recepientStatus: currentStatus,
            readAt: readAt,
            dismissedAt: dismissedAt,
            isPinned: isPinned,
          });
        }
      }
    }

    const meta = generatePaginationMeta(totalCandidates, page, limit);

    return {
      data: finalNotificationsData,
      meta: meta,
    };
  }

  private _checkUserMatchesSingleRule(
    user: UserEntity,
    rule: NotificationAudienceRuleEntity,
  ): boolean {
    switch (Number(rule.audienceType)) {
      case EAudienceType.ALL_USERS:
        return true;
      case EAudienceType.ROLE:
        return user.role.toString() === rule.audienceValue;
      case EAudienceType.MAJOR:
        return user.student?.majorId?.toString() === rule.audienceValue;
      case EAudienceType.DEPARTMENT:
        return user.lecturer?.departmentId?.toString() === rule.audienceValue;
      case EAudienceType.USER_LIST:
        const userListIds = rule.audienceValue
          ?.split(',')
          .map((id) => id.trim());
        return userListIds?.includes(user.id.toString());
      default:
        return false;
    }
  }

  private _checkUserMatchesAllIncludeRules(
    user: UserEntity,
    rules: NotificationAudienceRuleEntity[],
  ): boolean {
    if (!rules || rules.length === 0) return false;
    const includeRules = rules.filter(
      (r) => r.conditionLogic === EConditionLogic.INCLUDE,
    );
    if (includeRules.length === 0) return false;
    for (const rule of includeRules) {
      if (!this._checkUserMatchesSingleRule(user, rule)) return false;
    }
    return true;
  }

  async findOne(
    id: number,
    loadRelations: boolean = true,
    recipientId?: number,
  ): Promise<NotificationEntity & { recepientStatus?: ERecipientStatus }> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: loadRelations ? ['audienceRules'] : [],
    });

    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}.`);
    }

    const noti: NotificationEntity & { recepientStatus?: ERecipientStatus } =
      notification;

    if (recipientId) {
      const recipient = await this.recipientService.findOne({
        notificationId: id,
        recipientUserId: recipientId,
      });

      noti.recepientStatus = recipient?.status ?? ERecipientStatus.UNREAD;
      return noti;
    }

    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    await this.findOne(id, false);

    const { audienceRules, ...notificationData } = updateNotificationDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(NotificationEntity, id, {
        ...notificationData,
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
