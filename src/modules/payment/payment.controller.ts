import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Query,
  Get,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';
import { Request, Response } from 'express';
import { MomoIpnDto } from './dto/momoIpnResponse.dto';
import { VNPayIPNQueryDto } from './dto/vnpayIpnResponse.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/momo/callback')
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() momoIpnDto: MomoIpnDto, @Res() res: Response) {
    try {
      await this.paymentService.processPayment(
        momoIpnDto.resultCode.toString(),
        Number(momoIpnDto.extraData),
        EPaymentGateway.Momo,
        momoIpnDto.transId.toString(),
      );
      console.log(
        `MoMo IPN processed successfully for orderId: ${momoIpnDto.orderId}, transId: ${momoIpnDto.transId}`,
      );
    } catch (processingError) {
      console.error(
        `Error processing MoMo IPN for orderId: ${momoIpnDto.orderId}, transId: ${momoIpnDto.transId}:`,
        processingError,
      );
    }
    return res.status(HttpStatus.NO_CONTENT);
  }
  @Get('/vnpay/callback')
  @HttpCode(HttpStatus.OK)
  async handleVnPayIpn(
    @Req() req: Request,
    @Query() vnpayIpnDto: VNPayIPNQueryDto,
    @Res() res: Response,
  ) {
    console.log('Raw req.query from Express:', JSON.stringify(req.query));
    console.log('handleVnPayIpn@@vnpayIpnDto::', JSON.stringify(vnpayIpnDto));
    console.log('handleVnPayIpn@@signature::', vnpayIpnDto.vnp_SecureHash);
    const transactionId = vnpayIpnDto.vnp_TxnRef.split('T')[1];
    try {
      await this.paymentService.processPayment(
        vnpayIpnDto.vnp_ResponseCode.toString(),
        Number(transactionId),
        EPaymentGateway.Momo,
        vnpayIpnDto.vnp_TransactionNo.toString(),
      );
      console.log(
        `VNPAY IPN processed successfully for orderId: ${vnpayIpnDto.vnp_TxnRef}, transId: ${vnpayIpnDto.vnp_TransactionNo}`,
      );
    } catch (processingError) {
      console.error(
        `Error processing VNPAY IPN for orderId: ${vnpayIpnDto.vnp_TransactionNo}, transId: ${vnpayIpnDto.vnp_TransactionNo}:`,
        processingError,
      );
    }
    res.status(200).json({ RspCode: '00', Message: 'Success' });
  }
}
