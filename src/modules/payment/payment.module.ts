import { HttpModule } from '@nestjs/axios';
import { MomoPayment } from './Momo.payment';
import { VnpayPayment } from './Vnpay.payment';
import { PaymentContext } from './payment.context';
import { PaymentStrategyFactory } from './payment.factory';
import { PAYMENT_STRATEGY_TOKEN } from 'src/utils/constants';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';

@Module({
  imports: [HttpModule],
  providers: [
    PaymentContext,
    MomoPayment,
    VnpayPayment,
    PaymentStrategyFactory,
    {
      provide: PAYMENT_STRATEGY_TOKEN,
      useFactory: (factory: PaymentStrategyFactory) => {
        return factory.createPaymentStrategy(EPaymentGateway.Momo);
      },
      inject: [PaymentStrategyFactory],
    },
  ],
  controllers: [PaymentController],
  exports: [PaymentContext, PaymentStrategyFactory],
})
export class PaymentModule {}
