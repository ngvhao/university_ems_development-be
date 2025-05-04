export enum EUserRole {
  GUEST = 0,
  STUDENT = 1,
  LECTURER = 2,
  ACADEMIC_MANAGER = 3,
  HEAD_OF_DEPARTMENT = 4,
  ADMINISTRATOR = 5,
}

export enum EStudentStatus {
  ENROLLED = 0, // Đang học (đang theo học bình thường)
  ON_LEAVE = 1, // Bảo lưu (nghỉ tạm thời có phép)
  GRADUATED = 2, // Đã tốt nghiệp
  DROPPED_OUT = 3, // Thôi học (tự ý hoặc bị buộc thôi học)
  TRANSFERRED = 4, // Chuyển trường
}

export enum EAccountStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum EALLROLE {
  ALL = -1,
}

export enum EAcademicRank {
  MASTER = 0,
  DOCTOR = 1,
  ASSOCIATE_PROFESSOR = 2,
  PROFESSOR = 3,
}
