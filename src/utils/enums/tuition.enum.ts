export enum ETuitionStatus {
  PENDING = 0,
  PAID = 1,
  PARTIALLY_PAID = 2,
  OVERDUE = 3,
  CANCELLED = 4,
}

export enum EPaymentMethod {
  BANK_TRANSFER = 0,
  CASH = 1,
  CREDIT_CARD = 2,
  ONLINE_GATEWAY = 3,
  POS = 4,
}

export enum EPaymentTransactionStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
  REFUNDED = 3,
  PROCESSING = 4,
}
