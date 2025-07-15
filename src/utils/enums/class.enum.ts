export enum EClassGroupStatus {
  CLOSED_FOR_REGISTER = 5,
  OPEN_FOR_REGISTER = 1,
  LOCKED = 2,
  CANCELLED = 3,
  IN_PROGRESS = 4,
}

export enum EClassAdjustmentScheduleStatus {
  REQUESTED = 1,
  APPROVED = 2,
  REJECTED = 3,
  CANCELLED = 4,
}

export enum EAdjustmentType {
  MAKEUP = 1,
  CANCEL = 2,
}
