import { EUserRole } from '../enums/user.enum';

export interface IUser {
  /**
   * ID của người dùng (từ bảng UserEntity). Thường là giá trị `sub` trong JWT payload.
   */
  id: number; // Hoặc string, tùy thuộc kiểu dữ liệu khóa chính của UserEntity

  /**
   * Vai trò của người dùng (ví dụ: STUDENT, ACADEMIC_MANAGER, ADMINISTRATOR).
   * Thường được lấy từ claim `role` trong JWT payload.
   */
  role: EUserRole; // Sử dụng Enum để đảm bảo tính nhất quán và type safety

  /**
   * Tên đăng nhập hoặc email (tùy chọn).
   * Có thể thêm vào JWT payload nếu cần hiển thị hoặc dùng thường xuyên.
   */
  userCode?: string;
  email?: string;

  /**
   * ID của sinh viên (từ bảng StudentEntity), chỉ tồn tại nếu role là STUDENT.
   * Rất quan trọng cho các nghiệp vụ liên quan đến sinh viên.
   * Nên được thêm vào JWT payload khi sinh viên đăng nhập thành công.
   */
  studentId?: number | null; // Có thể là null hoặc undefined nếu user không phải là sinh viên

  /**
   * Tương tự, có thể thêm lecturerId nếu có vai trò Giảng viên và các nghiệp vụ liên quan.
   */
  lecturerId?: number | null;
}
