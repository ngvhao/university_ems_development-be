import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ERecipientStatus } from 'src/utils/enums/notification.enum';
import { UserNotificationQueryDto } from './dtos/queryNotificationRecipient.dto';
import { NotificationRecipientEntity } from './entities/notification_recipient.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationRecipientDto } from './dtos/createNotificationRecipient.dto';

@Injectable()
export class NotificationRecipientService {
  private readonly logger = new Logger(NotificationRecipientService.name);

  constructor(
    @InjectRepository(NotificationRecipientEntity)
    private readonly recipientRepository: Repository<NotificationRecipientEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async findUserNotifications(
    userId: number,
    queryDto: UserNotificationQueryDto,
  ): Promise<{ data: NotificationRecipientEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10, status, isPinned } = queryDto;
    const skip = (page - 1) * limit;

    const whereConditions: FindOptionsWhere<NotificationRecipientEntity> = {
      recipientUserId: userId,
    };

    if (status) {
      whereConditions.status = status;
    }
    if (typeof isPinned === 'boolean') {
      whereConditions.isPinned = isPinned;
    }

    const [data, total] = await this.recipientRepository.findAndCount({
      where: whereConditions,
      relations: ['notification', 'notification.audienceRules'],
      order: { isPinned: 'DESC', receivedAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        currentPage: Number(page),
        pageSize: Number(limit),
        totalPage: totalPages,
        nextPage: page < totalPages ? Number(page) + 1 : null,
        prevPage: page > 1 ? Number(page) - 1 : null,
      },
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.recipientRepository.count({
      where: {
        recipientUserId: userId,
        status: ERecipientStatus.UNREAD,
      },
    });
  }

  async findOneRecipientEntry(
    notificationId: number,
    userId: number,
  ): Promise<NotificationRecipientEntity> {
    const recipientEntry = await this.recipientRepository.findOne({
      where: { notificationId: notificationId },
      relations: ['notification'],
    });

    if (!recipientEntry) {
      throw new NotFoundException(
        `Không tìm thấy mục thông báo với ID ${notificationId}.`,
      );
    }
    if (recipientEntry.recipientUserId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập mục thông báo này.',
      );
    }
    return recipientEntry;
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const recipientEntry = await this.findOneRecipientEntry(
      notificationId,
      userId,
    );
    if (recipientEntry.status == ERecipientStatus.READ) {
      return;
    }
    const notification = await this.notificationService.findOne(notificationId);
    if (!notification) {
      throw new BadRequestException('Notification not found');
    }
    const newRecipient: CreateNotificationRecipientDto = {
      notificationId: notification.id,
      status: ERecipientStatus.READ,
      recipientUserId: userId,
      receivedAt: notification.createdAt,
      readAt: new Date(),
      dismissedAt: undefined,
      isPinned: false,
    };
    const recipient = this.recipientRepository.create(newRecipient);
    await this.recipientRepository.save(recipient);
    return;
  }

  async markAsDismissed(
    recipientId: number,
    userId: number,
  ): Promise<NotificationRecipientEntity> {
    const recipientEntry = await this.findOneRecipientEntry(
      recipientId,
      userId,
    );

    if (recipientEntry.status === ERecipientStatus.DISMISSED) {
      return recipientEntry;
    }

    recipientEntry.status = ERecipientStatus.DISMISSED;
    recipientEntry.dismissedAt = new Date();
    return this.recipientRepository.save(recipientEntry);
  }

  async getRecipientsOfNotification(
    notificationId: number,
    query: PaginationDto,
  ): Promise<{ data: NotificationRecipientEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.recipientRepository.findAndCount({
      where: { notificationId },
      relations: ['recipientUser'],
      order: { receivedAt: 'DESC' },
      skip,
      take: limit,
    });
    const meta = generatePaginationMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }
}
