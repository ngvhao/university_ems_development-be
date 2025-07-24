import { ApiProperty } from '@nestjs/swagger';
import { EStudentStatus } from 'src/utils/enums/user.enum';
import { ETuitionStatus } from 'src/utils/enums/tuition.enum';
import {
  ENotificationPriority,
  ENotificationType,
} from 'src/utils/enums/notification.enum';

export class StudentBasicInfoDto {
  @ApiProperty({ description: 'ID sinh viên' })
  id: number;

  @ApiProperty({ description: 'Mã sinh viên' })
  studentCode: string;

  @ApiProperty({ description: 'Họ và tên' })
  fullName: string;

  @ApiProperty({ description: 'Email cá nhân' })
  personalEmail: string;

  @ApiProperty({ description: 'Email trường' })
  universityEmail: string;

  @ApiProperty({ description: 'Số điện thoại' })
  phoneNumber: string;

  @ApiProperty({ description: 'Năm học' })
  academicYear: number;

  @ApiProperty({ description: 'Trạng thái sinh viên' })
  status: EStudentStatus;

  @ApiProperty({ description: 'Ngày nhập học' })
  enrollmentDate: Date;

  @ApiProperty({ description: 'Ngày dự kiến tốt nghiệp' })
  expectedGraduationDate: Date;
}

export class ClassInfoDto {
  @ApiProperty({ description: 'ID lớp' })
  id: number;

  @ApiProperty({ description: 'Mã lớp' })
  classCode: string;

  @ApiProperty({ description: 'Tên lớp' })
  className: string;

  @ApiProperty({ description: 'Thông tin chuyên ngành' })
  major: {
    id: number;
    majorCode: string;
    majorName: string;
    department: {
      id: number;
      departmentCode: string;
      departmentName: string;
      faculty: {
        id: number;
        facultyCode: string;
        facultyName: string;
      };
    };
  };
}

export class ScheduleItemDto {
  @ApiProperty({ description: 'ID lịch' })
  id: number;

  @ApiProperty({ description: 'Thông tin môn học' })
  course: {
    courseCode: string;
    name: string;
    credit: number;
  };

  @ApiProperty({ description: 'Phòng học' })
  room: {
    roomNumber: string;
  };

  @ApiProperty({ description: 'Tiết học' })
  timeSlot: {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
  };

  @ApiProperty({ description: 'Tuần học (VD: 1-8, 9-16)' })
  weekNumbers: string;
}

export class ExamScheduleDto {
  @ApiProperty({ description: 'ID lịch thi' })
  id: number;

  @ApiProperty({ description: 'Thông tin môn thi' })
  course: {
    courseCode: string;
    name: string;
    credit: number;
  };

  @ApiProperty({ description: 'Ngày thi' })
  examDate: Date;

  @ApiProperty({ description: 'Thời gian bắt đầu' })
  startTime: string;

  @ApiProperty({ description: 'Thời gian kết thúc' })
  endTime: string;

  @ApiProperty({ description: 'Phòng thi' })
  room: {
    roomNumber: string;
  };

  @ApiProperty({ description: 'Ghi chú về kỳ thi' })
  notes?: string;
}

export class TuitionInfoDto {
  @ApiProperty({ description: 'ID học phí' })
  id: number;

  @ApiProperty({ description: 'Mô tả học phí' })
  description: string;

  @ApiProperty({ description: 'Tổng số tiền phải đóng' })
  totalAmountDue: number;

  @ApiProperty({ description: 'Số tiền đã thanh toán' })
  amountPaid: number;

  @ApiProperty({ description: 'Số tiền còn lại' })
  balance: number;

  @ApiProperty({ description: 'Trạng thái thanh toán' })
  status: ETuitionStatus;

  @ApiProperty({ description: 'Ngày đến hạn' })
  dueDate: Date;

  @ApiProperty({ description: 'Chi tiết học phí theo môn học' })
  details: Array<{
    courseCode: string;
    courseName: string;
    credit: number;
    amount: number;
    pricePerCredit: number;
  }>;
}

export class NotificationDto {
  @ApiProperty({ description: 'ID thông báo' })
  id: number;

  @ApiProperty({ description: 'Tiêu đề' })
  title: string;

  @ApiProperty({ description: 'Nội dung' })
  content: string;

  @ApiProperty({ description: 'Loại thông báo' })
  notificationType: ENotificationType;

  @ApiProperty({ description: 'Mức độ ưu tiên' })
  priority: ENotificationPriority;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Trạng thái đã đọc' })
  isRead: boolean;
}

export class GradeInfoDto {
  @ApiProperty({ description: 'Thông tin môn học' })
  course: {
    courseCode: string;
    name: string;
    credit: number;
  };

  @ApiProperty({ description: 'Điểm quá trình' })
  processScore?: number;

  @ApiProperty({ description: 'Điểm cuối kỳ' })
  finalScore?: number;

  @ApiProperty({ description: 'Điểm tổng kết' })
  totalScore?: number;

  @ApiProperty({ description: 'Điểm chữ' })
  letterGrade?: string;

  @ApiProperty({ description: 'Trạng thái qua môn' })
  isPassed: boolean;
}

export class SemesterInfoDto {
  @ApiProperty({ description: 'ID học kỳ' })
  id: number;

  @ApiProperty({ description: 'Mã học kỳ' })
  semesterCode: string;

  @ApiProperty({ description: 'Tên học kỳ' })
  semesterName: string;

  @ApiProperty({ description: 'Ngày bắt đầu' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc' })
  endDate: Date;

  @ApiProperty({ description: 'Học kỳ hiện tại' })
  isCurrentSemester: boolean;
}

export class NextSemesterInfoDto {
  @ApiProperty({ description: 'Thông tin học kỳ kế tiếp' })
  semesterInfo: SemesterInfoDto | null;

  @ApiProperty({ description: 'Lịch đăng ký môn học' })
  registrationSchedule: Array<{
    startDate: Date;
    endDate: Date;
    description: string;
    isActive: boolean;
  }>;

  @ApiProperty({ description: 'Môn học có thể đăng ký' })
  availableCourses: Array<{
    courseCode: string;
    name: string;
    credit: number;
    prerequisiteCourses: string[];
    maxStudents: number;
    registeredStudents: number;
    isAvailable: boolean;
  }>;

  @ApiProperty({ description: 'Học phí dự kiến' })
  estimatedTuition: {
    pricePerCredit: number;
    estimatedMinCredits: number;
    estimatedMaxCredits: number;
    estimatedMinAmount: number;
    estimatedMaxAmount: number;
  };
}

export class CurriculumCourseStatusDto {
  @ApiProperty({ description: 'ID môn học' })
  courseId: number;
  @ApiProperty({ description: 'Mã môn học' })
  courseCode: string;
  @ApiProperty({ description: 'Tên môn học' })
  name: string;
  @ApiProperty({ description: 'Số tín chỉ' })
  credit: number;
  @ApiProperty({ description: 'Học kỳ gợi ý' })
  semester: { id: number; name: string };
  @ApiProperty({ description: 'Bắt buộc hay tự chọn' })
  isMandatory: boolean;
  @ApiProperty({ description: 'ID môn tiên quyết (nếu có)' })
  prerequisiteCourseId: number | null;
  @ApiProperty({ description: 'Mã môn tiên quyết (nếu có)' })
  prerequisiteCourseCode: string | null;
  @ApiProperty({ description: 'Trạng thái môn học' })
  status: 'PASSED' | 'ENROLLED' | 'FAILED' | 'NOT_ENROLLED' | 'ELIGIBLE';
  @ApiProperty({ description: 'Điểm số (nếu có)' })
  grade?: number;
  @ApiProperty({ description: 'Điểm chữ (nếu có)' })
  letterGrade?: string;
  @ApiProperty({ description: 'Qua môn hay chưa' })
  isPassed?: boolean;
}

export class CurriculumDto {
  @ApiProperty({ description: 'ID chương trình đào tạo' })
  id: number;
  @ApiProperty({ description: 'Tên chương trình đào tạo' })
  name: string;
  @ApiProperty({ description: 'Tổng tín chỉ yêu cầu' })
  totalCreditsRequired: number;
  @ApiProperty({ description: 'Tín chỉ tự chọn yêu cầu' })
  electiveCreditsRequired: number;
  @ApiProperty({ description: 'Danh sách môn học trong CTĐT' })
  courses: CurriculumCourseStatusDto[];
}

export class NextCourseDto {
  @ApiProperty({ description: 'ID môn học' })
  courseId: number;
  @ApiProperty({ description: 'Mã môn học' })
  courseCode: string;
  @ApiProperty({ description: 'Tên môn học' })
  name: string;
  @ApiProperty({ description: 'Số tín chỉ' })
  credit: number;
  @ApiProperty({ description: 'Học kỳ gợi ý' })
  semester: { id: number; name: string };
  @ApiProperty({ description: 'Bắt buộc hay tự chọn' })
  isMandatory: boolean;
  @ApiProperty({ description: 'ID môn tiên quyết (nếu có)' })
  prerequisiteCourseId: number | null;
  @ApiProperty({ description: 'Mã môn tiên quyết (nếu có)' })
  prerequisiteCourseCode: string | null;
  @ApiProperty({ description: 'Lý do đủ điều kiện hoặc chưa đủ điều kiện' })
  reason: string;
}

export class StudentChatbotDataDto {
  @ApiProperty({ description: 'Thông tin cơ bản sinh viên' })
  basicInfo: StudentBasicInfoDto;

  @ApiProperty({ description: 'Thông tin lớp học' })
  classInfo: ClassInfoDto;

  @ApiProperty({ description: 'Thông tin học kỳ hiện tại' })
  currentSemester: SemesterInfoDto;

  @ApiProperty({ description: 'Lịch học trong tuần' })
  weeklySchedule: ScheduleItemDto[];

  @ApiProperty({ description: 'Lịch thi sắp tới' })
  upcomingExams: ExamScheduleDto[];

  @ApiProperty({ description: 'Thông tin học phí' })
  tuitionInfo: TuitionInfoDto[];

  @ApiProperty({ description: 'Thông báo mới nhất' })
  recentNotifications: NotificationDto[];

  @ApiProperty({ description: 'Điểm số học kỳ hiện tại' })
  currentGrades: GradeInfoDto[];

  @ApiProperty({ description: 'Tổng kết học tập' })
  academicSummary: {
    totalCreditsRegistered: number;
    totalCreditsPassed: number;
    currentGPA: number;
    cumulativeGPA: number;
    currentSemesterCredits: number;
  };

  @ApiProperty({ description: 'Lịch học điều chỉnh (nếu có)' })
  scheduleAdjustments: Array<{
    originalDate: Date;
    newDate: Date;
    course: {
      courseCode: string;
      name: string;
    };
    reason: string;
  }>;

  @ApiProperty({ description: 'Thông tin học kỳ kế tiếp' })
  nextSemester: NextSemesterInfoDto;

  @ApiProperty({ description: 'Chương trình đào tạo của sinh viên' })
  curriculum: CurriculumDto;
  @ApiProperty({ description: 'Các môn học sắp tới có thể đăng ký' })
  nextCourses: NextCourseDto[];
}
