import { Inject, Injectable, Scope } from '@nestjs/common';
import { IPaymentStrategy } from './IPaymentStrategy.interface';
import { PAYMENT_STRATEGY_TOKEN } from 'src/utils/constants';

@Injectable({ scope: Scope.REQUEST })
export class PaymentContext {
  constructor(
    @Inject(PAYMENT_STRATEGY_TOKEN) private strategy: IPaymentStrategy,
  ) {}

  setStrategy(strategy: IPaymentStrategy): void {
    this.strategy = strategy;
  }

  async processPayment(amount: number, tuitionId: number): Promise<string> {
    return this.strategy.processPayment(amount, tuitionId);
  }

  async refundPayment(transactionId: string): Promise<string> {
    return this.strategy.refundPayment(transactionId);
  }
}
