import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ERecipientStatus } from 'src/utils/enums/notification.enum';
import { NotificationRecipientEntity } from './entities/notification_recipient.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationRecipientDto } from './dtos/createNotificationRecipient.dto';

@Injectable()
export class NotificationRecipientService {
  constructor(
    @InjectRepository(NotificationRecipientEntity)
    private readonly recipientRepository: Repository<NotificationRecipientEntity>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async getUnreadCount(userId: number): Promise<number> {
    return this.recipientRepository.count({
      where: {
        recipientUserId: userId,
        status: ERecipientStatus.UNREAD,
      },
    });
  }

  async findOne(
    condition: FindOptionsWhere<NotificationRecipientEntity>,
  ): Promise<NotificationRecipientEntity | null> {
    return this.recipientRepository.findOneBy(condition);
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
    const recipientEntry = await this.recipientRepository.findOne({
      where: { notificationId: notificationId, recipientUserId: userId },
      relations: ['notification'],
    });
    console.log('markAsRead@recipientEntry:', recipientEntry);
    if (recipientEntry && recipientEntry.status != ERecipientStatus.UNREAD) {
      return;
    }
    const notification = await this.notificationService.findOne(notificationId);

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
