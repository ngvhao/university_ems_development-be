import { Inject, Injectable, Scope } from '@nestjs/common';
import { IPaymentStrategy } from './IPaymentStrategy.interface';
import { PAYMENT_STRATEGY_TOKEN } from 'src/utils/constants';
import { PaymentOptionsDto } from './dto/paymentOptions.dto';

@Injectable({ scope: Scope.REQUEST })
export class PaymentContext {
  constructor(
    @Inject(PAYMENT_STRATEGY_TOKEN) private strategy: IPaymentStrategy,
  ) {}

  setStrategy(strategy: IPaymentStrategy): void {
    this.strategy = strategy;
  }

  async processPayment(
    amount: number,
    transactionId: number,
    paymentOptions: PaymentOptionsDto,
  ): Promise<string> {
    return this.strategy.processPayment(amount, transactionId, paymentOptions);
  }

  async refundPayment(transactionId: string): Promise<string> {
    return this.strategy.refundPayment(transactionId);
  }
}
