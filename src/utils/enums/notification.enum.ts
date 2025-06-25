export enum ENotificationType {
  ACADEMIC = 0,
  EVENT = 1,
  SURVEY = 2,
  SYSTEM = 3,
  FEE = 4,
  EXAM = 5,
  GENERAL = 6,
}

export enum ENotificationPriority {
  HIGH = 0,
  MEDIUM = 1,
  LOW = 2,
}

export enum ENotificationStatus {
  DRAFT = 0,
  SCHEDULED = 1,
  SENT = 2,
  ARCHIVED_BY_ADMIN = 3,
}

export enum EAudienceType {
  ALL_USERS = 0,
  USER_LIST = 1,
  ROLE = 2,
  MAJOR = 3,
  DEPARTMENT = 4,
  COURSE_SECTION = 5,
}

export enum EConditionLogic {
  INCLUDE = 'INCLUDE',
  EXCLUDE = 'EXCLUDE',
}

export enum ERecipientStatus {
  UNREAD = 0,
  READ = 1,
  DISMISSED = 3,
  ARCHIVED_BY_USER = 4,
}
