import { MigrationInterface, QueryRunner } from 'typeorm';
import { ECourseType } from '../../src/utils/enums/course-type.enum';

export class SeedCourses1747060155280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const courses = [
      { code: 'IT101', name: 'Nhập môn CNTT', credit: 3 },
      { code: 'IT102', name: 'Cơ sở lập trình', credit: 3 },
      { code: 'IT103', name: 'Kiến trúc máy tính', credit: 3 },
      { code: 'IT104', name: 'Toán rời rạc', credit: 3 },
      { code: 'IT105', name: 'Cấu trúc dữ liệu', credit: 3 },
      { code: 'IT106', name: 'Hệ điều hành', credit: 3 },
      { code: 'IT107', name: 'Lập trình hướng đối tượng', credit: 3 },
      { code: 'IT108', name: 'Cơ sở dữ liệu', credit: 3 },
      { code: 'IT109', name: 'Mạng máy tính', credit: 3 },
      { code: 'IT110', name: 'Phân tích thiết kế hệ thống', credit: 3 },
      { code: 'IT111', name: 'Lập trình web', credit: 3 },
      { code: 'IT112', name: 'An toàn thông tin', credit: 3 },
      { code: 'IT113', name: 'Trí tuệ nhân tạo', credit: 3 },
      { code: 'IT114', name: 'Học máy', credit: 3 },
      { code: 'IT115', name: 'Thị giác máy tính', credit: 3 },
      { code: 'IT116', name: 'Điện toán đám mây', credit: 3 },
      { code: 'IT117', name: 'Phát triển ứng dụng di động', credit: 3 },
      { code: 'IT118', name: 'Big Data', credit: 3 },
      { code: 'IT119', name: 'Blockchain cơ bản', credit: 3 },
      { code: 'IT120', name: 'Lập trình Python', credit: 3 },
      { code: 'IT121', name: 'Lập trình Java', credit: 3 },
      { code: 'IT122', name: 'Lập trình C++', credit: 3 },
      { code: 'IT123', name: 'DevOps cơ bản', credit: 3 },
      { code: 'IT124', name: 'Kỹ năng làm việc nhóm', credit: 2 },
      { code: 'IT125', name: 'Thực tập cơ sở', credit: 2 },
      { code: 'IT126', name: 'Quản lý dự án phần mềm', credit: 3 },
      { code: 'IT127', name: 'Kiểm thử phần mềm', credit: 3 },
      { code: 'IT128', name: 'Phát triển phần mềm hướng dịch vụ', credit: 3 },
      { code: 'IT129', name: 'Lập trình hệ thống', credit: 3 },
      { code: 'IT130', name: 'Cơ sở kỹ thuật số', credit: 3 },
      { code: 'IT131', name: 'Khai phá dữ liệu', credit: 3 },
      { code: 'IT132', name: 'Xử lý ngôn ngữ tự nhiên', credit: 3 },
      { code: 'IT133', name: 'Nhập môn IoT', credit: 3 },
      { code: 'IT134', name: 'Nhúng và vi điều khiển', credit: 3 },
      { code: 'IT135', name: 'Giao tiếp người-máy', credit: 3 },
      { code: 'IT136', name: 'Lập trình Game', credit: 3 },
      { code: 'IT137', name: 'Quản trị hệ thống', credit: 3 },
      { code: 'IT138', name: 'Quản trị mạng', credit: 3 },
      { code: 'IT139', name: 'Thiết kế phần mềm', credit: 3 },
      { code: 'IT140', name: 'Phát triển Agile', credit: 3 },
      { code: 'IT141', name: 'Data Science', credit: 3 },
      { code: 'IT142', name: 'Lập trình song song', credit: 3 },
      { code: 'IT143', name: 'CUDA & GPU Programming', credit: 3 },
      { code: 'IT144', name: 'Công nghệ Web nâng cao', credit: 3 },
      { code: 'IT145', name: 'Phát triển frontend với React', credit: 3 },
      { code: 'IT146', name: 'Phát triển backend với NodeJS', credit: 3 },
      { code: 'IT147', name: 'CI/CD và DevOps', credit: 3 },
      { code: 'IT148', name: 'Thiết kế cơ sở dữ liệu nâng cao', credit: 3 },
      { code: 'IT149', name: 'Hệ thống phân tán', credit: 3 },
      { code: 'IT150', name: 'Khóa luận tốt nghiệp', credit: 5 },
    ];

    for (const course of courses) {
      await queryRunner.query(
        `INSERT INTO courses ("courseCode", name, credit, description, "courseType")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          course.code,
          course.name,
          course.credit,
          `Mô tả môn học ${course.name}`,
          ECourseType.MAJOR_REQUIRED,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM courses WHERE course_code LIKE 'IT%'`);
  }
}

