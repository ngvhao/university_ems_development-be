import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MomoIpnDto } from './dto/momoIPNResponse.dto';
import { PaymentService } from './payment.service';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/momo/callback')
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() momoIpnDto: MomoIpnDto) {
    console.log('Received MoMo IPN:', JSON.stringify(momoIpnDto));
    const isSignatureValid = true;
    if (!isSignatureValid) {
      console.error('MoMo IPN Error: Invalid signature.');
    }
    if (isSignatureValid) {
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
    } else {
      console.warn(
        `MoMo IPN for orderId: ${momoIpnDto.orderId}, transId: ${momoIpnDto.transId} - SKIPPED due to invalid signature.`,
      );
    }
    return {
      partnerCode: momoIpnDto.partnerCode,
      requestId: momoIpnDto.requestId,
      orderId: momoIpnDto.orderId,
      resultCode: 0,
      message: 'Confirm Success',
      responseTime: new Date().getTime(),
    };
  }
}
