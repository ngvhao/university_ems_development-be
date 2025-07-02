import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
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
import { NotificationRecipientService } from '../notification_recipient/notification_recipient.service';
import { INotificationResponse } from 'src/utils/interfaces/notification.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(NotificationAudienceRuleEntity)
    private readonly ruleRepository: Repository<NotificationAudienceRuleEntity>,
    private readonly dataSource: DataSource,
    // @Inject(forwardRef(() => NotificationRuleService))
    // private readonly ruleService: NotificationRuleService,
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
      console.error(
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

  _buildCaseWhenCondition = (currentUser: UserEntity) => {
    const conditions: string[] = [];
    const params: { [key: string]: string | number | EAudienceType } = {};

    conditions.push(`(rule.audienceType = :caseAllType)`);
    params.caseAllType = EAudienceType.ALL_USERS;

    // 2. ROLE
    if (currentUser.role) {
      conditions.push(
        `(rule.audienceType = :caseRoleType AND rule.audienceValue = :caseUserRole)`,
      );
      params.caseRoleType = EAudienceType.ROLE;
      params.caseUserRole = currentUser.role;
    }

    // 3. MAJOR
    if (currentUser.student?.majorId) {
      conditions.push(
        `(rule.audienceType = :caseMajorType AND rule.audienceValue = :caseUserMajor)`,
      );
      params.caseMajorType = EAudienceType.MAJOR;
      params.caseUserMajor = currentUser.student.majorId.toString();
    }

    // 4. DEPARTMENT
    if (currentUser.lecturer?.departmentId) {
      conditions.push(
        `(rule.audienceType = :caseDeptType AND rule.audienceValue = :caseUserDept)`,
      );
      params.caseDeptType = EAudienceType.DEPARTMENT;
      params.caseUserDept = currentUser.lecturer.departmentId.toString();
    }

    // 5. USER_LIST
    conditions.push(`(
        rule.audienceType = :caseUserListType AND (
            rule.audienceValue = :caseUserIdStr OR
            rule.audienceValue LIKE :caseUserIdStart OR
            rule.audienceValue LIKE :caseUserIdMiddle OR
            rule.audienceValue LIKE :caseUserIdEnd
        )
    )`);
    params.caseUserListType = EAudienceType.USER_LIST;
    params.caseUserIdStr = currentUser.id.toString();
    params.caseUserIdStart = `${currentUser.id},%`;
    params.caseUserIdMiddle = `%,${currentUser.id},%`;
    params.caseUserIdEnd = `%,${currentUser.id}`;

    const fullConditionString = conditions.join(' OR ');
    return { conditionString: fullConditionString, params };
  };

  async findUserNotifications(
    currentUser: UserEntity,
    queryDto: UserNotificationQueryDto,
  ): Promise<{ data: INotificationResponse[]; meta: MetaDataInterface }> {
    const {
      page = 1,
      limit = 10,
      search,
      notificationType,
      priority,
      recipientStatus: filterRecipientStatus,
    } = queryDto;
    const skip = (page - 1) * limit;

    const { conditionString, params: caseParams } =
      this._buildCaseWhenCondition(currentUser);
    const validNotificationIdsSubQuery = this.ruleRepository
      .createQueryBuilder('rule')
      .select('rule.notificationId')
      .where('rule.conditionLogic = :includeLogic', {
        includeLogic: EConditionLogic.INCLUDE,
      })
      .groupBy('rule.notificationId')
      .having(
        `COUNT(rule.id) = SUM(CASE WHEN ${conditionString} THEN 1 ELSE 0 END)`,
      )
      .setParameters(caseParams);

    const mainQb = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.semester', 'semester')
      .leftJoinAndSelect(
        'notification.recipients',
        'recipient',
        'recipient.recipientUserId = :currentUserId',
        { currentUserId: currentUser.id },
      )
      .where(`notification.id IN (${validNotificationIdsSubQuery.getQuery()})`)
      .setParameters(validNotificationIdsSubQuery.getParameters())
      .andWhere('notification.status = :sentStatus', {
        sentStatus: ENotificationStatus.SENT,
      });

    if (search) {
      mainQb.andWhere(
        new Brackets((sqb) => {
          sqb
            .where('notification.title ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('notification.content ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }
    if (notificationType) {
      mainQb.andWhere('notification.notificationType = :notificationType', {
        notificationType,
      });
    }
    if (priority) {
      mainQb.andWhere('notification.priority = :priority', { priority });
    }

    if (filterRecipientStatus) {
      if (filterRecipientStatus === ERecipientStatus.UNREAD) {
        mainQb.andWhere('recipient.id IS NULL');
      } else {
        mainQb.andWhere('recipient.status = :filterRecipientStatus', {
          filterRecipientStatus,
        });
      }
    }
    mainQb.orderBy('notification.createdAt', 'DESC').skip(skip).take(limit);
    const [notifications, total] = await mainQb.getManyAndCount();

    const finalNotificationsData: INotificationResponse[] = notifications.map(
      (notification) => {
        const recipientEntry =
          notification.recipients && notification.recipients.length > 0
            ? notification.recipients[0]
            : null;
        return {
          id: notification.id,
          title: notification.title,
          notificationType: notification.notificationType,
          priority: notification.priority,
          createdAt: notification.createdAt,
          semester: notification.semester,
          recepientStatus: recipientEntry
            ? recipientEntry.status
            : ERecipientStatus.UNREAD,
          readAt: recipientEntry?.readAt || null,
          dismissedAt: recipientEntry?.dismissedAt || null,
          isPinned: recipientEntry?.isPinned || false,
        };
      },
    );

    const meta = generatePaginationMeta(total, page, limit);

    return {
      data: finalNotificationsData,
      meta: meta,
    };
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
    console.log('audienceRules', audienceRules);

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
        console.log('delete success');
        const rulesToSave = audienceRules.map((ruleDto) => ({
          ...ruleDto,
          notificationId: id,
        }));
        await queryRunner.manager.save(
          NotificationAudienceRuleEntity,
          rulesToSave,
        );
        console.log('audienceRules', audienceRules);
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
      console.error(
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
