import { Injectable } from '@nestjs/common';
import { IPaymentStrategy } from './IPaymentStrategy.interface';

@Injectable()
export class VnpayPayment implements IPaymentStrategy {
  async processPayment(amount: number, tuitionId: number): Promise<string> {
    console.log(
      `Processing payment of ${amount} for tuition ID ${tuitionId} via Vnpay...`,
    );
    return Promise.resolve('Vnpay payment successful');
  }

  async refundPayment(transactionId: string): Promise<string> {
    console.log(`Refunding transaction ${transactionId} via Vnpay...`);
    return Promise.resolve('Vnpay refund successful');
  }
}
