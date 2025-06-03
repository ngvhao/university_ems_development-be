import { PaymentOptionsDto } from './dto/paymentOptions.dto';

export interface IPaymentStrategy {
  processPayment(
    amount: number,
    transactionId: number,
    paymentOptions: PaymentOptionsDto,
  ): Promise<string>;
  refundPayment(transactionId: string): Promise<string>;
}
