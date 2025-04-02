// src/modules/student/entities/student.entity.ts
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index, // Thêm Index nếu cần tối ưu query theo userId, classId, majorId
} from 'typeorm';
import { Type } from 'class-transformer'; // Cần cho việc chuyển đổi kiểu Date
import { IEntity } from 'src/utils/interfaces/IEntity'; // Đường dẫn có thể cần điều chỉnh
import { UserEntity } from 'src/modules/user/entities/user.entity'; // Đường dẫn có thể cần điều chỉnh
import { MajorEntity } from 'src/modules/major/entities/major.entity'; // Đường dẫn có thể cần điều chỉnh
import { ClassEntity } from 'src/modules/class/entities/class.entity'; // Đường dẫn có thể cần điều chỉnh
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity'; // Đường dẫn có thể cần điều chỉnh
import { EnrollmentCourseEntity } from 'src/modules/enrollment_course/entities/enrollment_course.entity'; // Đường dẫn có thể cần điều chỉnh

@Entity('students')
export class StudentEntity extends IEntity {
  @Column({ type: 'int', unsigned: true })
  academicYear: number; // Niên khóa (ví dụ: 2021)

  @Column({ type: 'float', default: 0.0 })
  gpa: number; // Điểm trung bình tích lũy

  @Column({ type: 'date' })
  @Type(() => Date) // Đảm bảo chuyển đổi đúng kiểu Date khi lấy dữ liệu
  enrollmentDate: Date; // Ngày nhập học

  @Column({ type: 'date', nullable: true })
  @Type(() => Date)
  expectedGraduationDate: Date | null; // Ngày dự kiến tốt nghiệp

  // Quan hệ với UserEntity (Thông tin tài khoản và cá nhân chung)
  @Index() // Đánh index cho userId để tăng tốc độ truy vấn
  @Column() // Thêm cột userId để lưu trữ khóa ngoại rõ ràng
  userId: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' }) // Khi user bị xóa, student cũng bị xóa
  @JoinColumn({ name: 'userId' }) // Join trên cột userId
  user: UserEntity;

  // Quan hệ với MajorEntity (Chuyên ngành)
  @Index()
  @Column()
  majorId: number;

  @ManyToOne(() => MajorEntity, (major) => major.students, { nullable: false })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  // Quan hệ với ClassEntity (Lớp sinh hoạt)
  @Index()
  @Column()
  classId: number;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.students, {
    nullable: false, // Sinh viên phải thuộc về một lớp
  })
  @JoinColumn({ name: 'classId' })
  class: ClassEntity;

  // Quan hệ với StudyPlanEntity (Kế hoạch học tập)
  @OneToMany(() => StudyPlanEntity, (studyPlan) => studyPlan.student)
  studyPlans: StudyPlanEntity[];

  // Quan hệ với EnrollmentCourseEntity (Các học phần đã đăng ký)
  @OneToMany(() => EnrollmentCourseEntity, (enrollment) => enrollment.student)
  enrollments: EnrollmentCourseEntity[];
}
