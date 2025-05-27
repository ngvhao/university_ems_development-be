import { IPaymentStrategy } from './IPaymentStrategy.interface';

export class MomoPayment implements IPaymentStrategy {
  async processPayment(amount: number, tuitionId: number): Promise<string> {
    console.log(
      `Processing payment of ${amount} for tuition ID ${tuitionId} via Momo...`,
    );
    return Promise.resolve('Momo payment successful');
  }

  async refundPayment(transactionId: string): Promise<string> {
    console.log(`Refunding transaction ${transactionId} via Momo...`);
    return Promise.resolve('Momo refund successful');
  }
}
