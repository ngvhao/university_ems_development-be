export enum EFacultyCode {
  IT = 5,
  FBA = 7,
  LAW = 6,
}

export enum EFacultyRegistrationScheduleStatus {
  PENDING = 'PENDING', // Chờ xử lý/chưa mở
  PRE_REGISTRATION = 'PRE_REGISTRATION', // Đang trong giai đoạn đăng ký trước
  REGISTRATION = 'REGISTRATION', // Đang trong giai đoạn đăng ký chính thức
  CLOSED = 'CLOSED', // Đã đóng
  CANCELLED = 'CANCELLED', // Đã hủy
}
