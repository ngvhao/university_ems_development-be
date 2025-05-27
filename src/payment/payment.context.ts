import { IPaymentStrategy } from './IPaymentStrategy.interface';

export class PaymentContext {
  private strategy: IPaymentStrategy;

  constructor(strategy: IPaymentStrategy) {
    this.strategy = strategy;
  }

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
