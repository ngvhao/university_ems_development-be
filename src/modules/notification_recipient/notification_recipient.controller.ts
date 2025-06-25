import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  ParseIntPipe,
  Res,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';

import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserNotificationQueryDto } from './dtos/queryNotificationRecipient.dto';
import { NotificationRecipientService } from './notification_recipient.service';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';

@ApiTags('Thông báo Người dùng (User Notifications)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationRecipientController {
  constructor(
    private readonly recipientsService: NotificationRecipientService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Lấy danh sách thông báo đã nhận của người dùng hiện tại (phân trang)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thông báo thành công.',
  })
  async findMyNotifications(
    @Req() req: RequestHasUserDto & Request,
    @Query() queryDto: UserNotificationQueryDto,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const { data, meta } = await this.recipientsService.findUserNotifications(
      userId,
      queryDto,
    );
    new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách thông báo thành công.',
    }).send(res);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Lấy số lượng thông báo chưa đọc của người dùng hiện tại',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy số lượng thành công.',
  })
  async getMyUnreadCount(
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const count = await this.recipientsService.getUnreadCount(userId);
    new SuccessResponse({
      data: { count },
      message: 'Lấy số lượng thông báo chưa đọc thành công.',
    }).send(res);
  }

  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Đánh dấu một thông báo là đã đọc' })
  @ApiParam({
    name: 'recipientId',
    description: 'ID của bản ghi thông báo người nhận',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đánh dấu đã đọc thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async markAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const updatedRecipient = await this.recipientsService.markAsRead(
      notificationId,
      userId,
    );
    new SuccessResponse({
      data: updatedRecipient,
      message: 'Đánh dấu đã đọc thành công.',
    }).send(res);
  }

  @Get('notifications/admin/:notificationId/recipients')
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({
    summary: 'Lấy danh sách người đã nhận một thông báo cụ thể (Admin)',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'ID của thông báo gốc',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách người nhận thành công.',
  })
  async getRecipientsForNotification(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Query() queryDto: PaginationDto,
    @Res() res: Response,
  ) {
    const { data, meta } =
      await this.recipientsService.getRecipientsOfNotification(
        notificationId,
        queryDto,
      );
    new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách người nhận thành công.',
    }).send(res);
  }
}
