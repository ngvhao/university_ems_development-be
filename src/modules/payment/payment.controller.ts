import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';
import { Response } from 'express';
import { MomoIpnDto } from './dto/momoIPNResponse.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/momo/callback')
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() momoIpnDto: MomoIpnDto, @Res() res: Response) {
    console.log('handleMomoIpn@@momoIpnDto::', JSON.stringify(momoIpnDto));
    console.log('handleMomoIpn@@signature::', momoIpnDto.signature);
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
}
