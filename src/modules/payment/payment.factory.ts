import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IPaymentStrategy } from './IPaymentStrategy.interface';
import { MomoPayment } from './Momo.payment';
import { VnpayPayment } from './Vnpay.payment';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';

@Injectable()
export class PaymentStrategyFactory {
  constructor(
    private readonly momoPayment: MomoPayment,
    private readonly vnpayPayment: VnpayPayment,
  ) {}

  createPaymentStrategy(type: EPaymentGateway): IPaymentStrategy {
    switch (type) {
      case EPaymentGateway.Momo:
        return this.momoPayment;
      case EPaymentGateway.Vnpay:
        return this.vnpayPayment;
      default:
        throw new InternalServerErrorException(
          `Payment strategy ${type} not supported`,
        );
    }
  }
}
