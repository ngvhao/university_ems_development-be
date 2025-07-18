export enum ENotificationType {
  ACADEMIC = 7,
  EVENT = 1,
  SURVEY = 2,
  SYSTEM = 3,
  FEE = 4,
  EXAM = 5,
  GENERAL = 6,
}

export enum ENotificationPriority {
  HIGH = 3,
  MEDIUM = 1,
  LOW = 2,
}

export enum ENotificationStatus {
  DRAFT = 4,
  SCHEDULED = 1,
  SENT = 2,
  ARCHIVED_BY_ADMIN = 3,
}

export enum EAudienceType {
  ALL_USERS = 6,
  USER_LIST = 1,
  ROLE = 2,
  MAJOR = 3,
  DEPARTMENT = 4,
  COURSE_SECTION = 5,
  FACULTY = 7,
}

export enum EConditionLogic {
  INCLUDE = 'INCLUDE',
  EXCLUDE = 'EXCLUDE',
}

export enum ERecipientStatus {
  UNREAD = 5,
  READ = 1,
  DISMISSED = 3,
  ARCHIVED_BY_USER = 4,
}
