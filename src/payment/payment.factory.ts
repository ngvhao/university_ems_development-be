import { IPaymentStrategy } from './IPaymentStrategy.interface';
import { MomoPayment } from './Momo.payment';
import { VnpayPayment } from './Vnpay.payment';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';

export class SimplePaymentFactory {
  static createPaymentStrategy(type: EPaymentGateway): IPaymentStrategy {
    switch (type) {
      case EPaymentGateway.Momo:
        return new MomoPayment();
      case EPaymentGateway.Vnpay:
        return new VnpayPayment();
      default:
        throw new Error(`Payment strategy ${type} not supported`);
    }
  }
}
