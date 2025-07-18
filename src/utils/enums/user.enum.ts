export enum EUserRole {
  STUDENT = 1,
  LECTURER = 2,
  ACADEMIC_MANAGER = 3,
  HEAD_OF_FACULTY = 4,
  ADMINISTRATOR = 5,
}

export enum EStudentStatus {
  STUDYING = 5, // Đang học (đang theo học bình thường)
  ON_LEAVE = 1, // Bảo lưu (nghỉ tạm thời có phép)
  GRADUATED = 2, // Đã tốt nghiệp
  DROPPED_OUT = 3, // Thôi học (tự ý hoặc bị buộc thôi học)
  TRANSFERRED = 4, // Chuyển trường
}

export enum EAccountStatus {
  INACTIVE = 2,
  ACTIVE = 1,
}

export enum EALLROLE {
  ALL = -1,
}

export enum EAcademicRank {
  MASTER = 4,
  DOCTOR = 1,
  ASSOCIATE_PROFESSOR = 2,
  PROFESSOR = 3,
}
