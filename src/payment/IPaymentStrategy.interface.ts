export interface IPaymentStrategy {
  processPayment(amount: number, tuitionId: number): Promise<string>;
  refundPayment(transactionId: string): Promise<string>;
}
