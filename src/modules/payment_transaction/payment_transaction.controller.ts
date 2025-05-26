import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentTransactionEntity } from './entities/payment_transaction.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePaymentTransactionDto } from './dto/createPaymentTransaction.dto';
import { UpdatePaymentTransactionDto } from './dto/updatePaymentTransaction.dto';
import { PaymentTransactionService } from './payment_transaction.service';

@ApiTags('Quản lý Giao dịch Thanh toán (Payment Transactions)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('payment-transactions')
export class PaymentTransactionController {
  constructor(
    private readonly paymentTransactionService: PaymentTransactionService,
  ) {}

  @Post('payment-transactions')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo một giao dịch thanh toán mới' })
  @ApiBody({ type: CreatePaymentTransactionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo giao dịch thành công.',
    type: PaymentTransactionEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Học phí hoặc Người xử lý.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã tham chiếu giao dịch đã tồn tại.',
  })
  async create(
    @Body() createDto: CreatePaymentTransactionDto,
    @Res() res: Response,
  ) {
    const transaction = await this.paymentTransactionService.create(createDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: transaction,
      message: 'Tạo giao dịch thanh toán thành công',
    }).send(res);
  }

  @Get('tuitions/:tuitionId/payment-transactions')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.STUDENT])
  @ApiOperation({
    summary: 'Lấy danh sách giao dịch của một khoản học phí (có phân trang)',
  })
  @ApiParam({
    name: 'tuitionId',
    type: Number,
    description: 'ID của khoản học phí tổng',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách giao dịch thành công.',
  })
  async findAllByTuitionId(
    @Param('tuitionId', ParseIntPipe) tuitionId: number,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.paymentTransactionService.findAllByTuitionId(
      tuitionId,
      paginationDto,
    );
    return new SuccessResponse({
      ...result,
      message: `Lấy danh sách giao dịch cho học phí ID ${tuitionId} thành công`,
    }).send(res);
  }

  @Get('payment-transactions/:id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.STUDENT])
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một giao dịch thanh toán' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của giao dịch' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin giao dịch thành công.',
    type: PaymentTransactionEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy giao dịch.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const transaction = await this.paymentTransactionService.findOne(id);
    return new SuccessResponse({
      data: transaction,
      message: 'Lấy thông tin giao dịch thành công',
    }).send(res);
  }

  @Patch('payment-transactions/:id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary: 'Cập nhật thông tin một giao dịch thanh toán (ví dụ: trạng thái)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID giao dịch cần cập nhật',
  })
  @ApiBody({ type: UpdatePaymentTransactionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật giao dịch thành công.',
    type: PaymentTransactionEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy giao dịch.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã tham chiếu giao dịch đã tồn tại (nếu cập nhật).',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentTransactionDto,
    @Res() res: Response,
  ) {
    const transaction = await this.paymentTransactionService.update(
      id,
      updateDto,
    );
    return new SuccessResponse({
      data: transaction,
      message: 'Cập nhật giao dịch thanh toán thành công',
    }).send(res);
  }
}
