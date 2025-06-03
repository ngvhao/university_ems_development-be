import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IPaymentStrategy } from './ipayment.strategy.interface';
import { PaymentOptionsDto } from './dto/paymentOptions.dto';
import * as crypto from 'crypto';
import { VNPayConfig } from 'src/utils/constants';
import { Helpers } from 'src/utils/helpers';
import qs from 'qs';
import { format } from 'date-fns';

@Injectable()
export class VnpayPayment implements IPaymentStrategy {
  async processPayment(
    amount: number,
    transactionId: number,
    paymentOptions: PaymentOptionsDto,
  ): Promise<string> {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const { orderInfo: orderInfoDto } = paymentOptions;
    console.log('Received paymentOptions.orderInfo:', paymentOptions.orderInfo);
    if (!orderInfoDto) {
      throw new BadRequestException(
        'Cần cung cấp thông tin chi tiết của học phí',
      );
    }
    amount = amount | 0;
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be a positive number.');
    }
    if (!transactionId) {
      throw new BadRequestException('Tuition ID (transactionId) is required.');
    }

    if (
      !VNPayConfig.tmnCode ||
      !VNPayConfig.hashSecret ||
      !VNPayConfig.redirectUrl
    ) {
      console.error('Cấu hình VNPay chưa đủ');
      throw new InternalServerErrorException(
        'Cổng thanh toán VNPay chưa được cấu hình chính xác.',
      );
    }

    const orderId = 'VNPAY' + new Date().getTime() + transactionId;

    let ipAddr = '127.0.0.1';

    if (ipAddr.includes('::ffff:')) {
      ipAddr = ipAddr.split('::ffff:')[1];
    }

    const returnUrlParams = new URLSearchParams({
      transactionId: transactionId.toString(),
    });
    const returnUrl = `${VNPayConfig.redirectUrl}?${returnUrlParams.toString()}`;

    const locale = 'vn';
    const currCode = 'VND';

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNPayConfig.tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId + 'T' + transactionId,
      vnp_OrderInfo: orderInfoDto,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: format(new Date(), 'yyyyMMddHHmmss'),
    };

    const sorted_vnp_Params = Helpers.sortObjectByKeys(vnp_Params);
    const signData = qs.stringify(sorted_vnp_Params, { encode: false });
    console.log('String to be signed (signData):', signData);
    const signature = crypto
      .createHmac('sha512', VNPayConfig.hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
    sorted_vnp_Params['vnp_SecureHash'] = signature;

    const finalPaymentUrl =
      VNPayConfig.hostname +
      '?' +
      qs.stringify(sorted_vnp_Params, { encode: false });

    return finalPaymentUrl;
  }

  async refundPayment(transactionId: string): Promise<string> {
    console.log(`Refunding transaction ${transactionId} via Vnpay...`);
    return Promise.resolve('Vnpay refund successful');
  }
}
