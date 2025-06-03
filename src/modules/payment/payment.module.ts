import { HttpModule } from '@nestjs/axios';
import { MomoPayment } from './momo.payment';
import { VnpayPayment } from './vnpay.payment';
import { PaymentContext } from './payment.context';
import { PaymentStrategyFactory } from './payment.factory';
import { PAYMENT_STRATEGY_TOKEN } from 'src/utils/constants';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentTransactionModule } from '../payment_transaction/payment_transaction.module';

@Module({
  imports: [HttpModule, PaymentTransactionModule],
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
    PaymentService,
  ],
  controllers: [PaymentController],
  exports: [PaymentContext, PaymentStrategyFactory],
})
export class PaymentModule {}
