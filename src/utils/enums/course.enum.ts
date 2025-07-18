export enum EEnrollmentStatus {
  ENROLLED = 7,
  PASSED = 1,
  FAILED = 2,
  WITHDRAWN = 3,
  CANCELLED = 4,
  PENDING = 5,
  ENROLLED_DYNAMODB_UPDATE_FAILED = 6,
}

export enum ERegistrationStatus {
  CLOSED = 5,
  OPEN = 1,
  PENDING = 2,
}

export enum ERegistrationLecturerCourseStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}
