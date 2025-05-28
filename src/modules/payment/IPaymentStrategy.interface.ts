export interface IPaymentStrategy {
  processPayment(amount: number, transactionId: number): Promise<string>;
  refundPayment(transactionId: string): Promise<string>;
}
