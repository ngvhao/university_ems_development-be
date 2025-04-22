import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSemesterCourseData1740931612590 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO semesters ("semesterCode", "startYear", "endYear", term, "startDate", "endDate") VALUES
            ('2024-2025-1', 2024, 2025, '1', '2024-09-01', '2025-12-31'),
            ('2024-2025-2', 2024, 2025, '2', '2024-01-15', '2025-05-15'),
            ('2024-2025-3', 2024, 2025, '3', '2024-06-01', '2025-08-31');
          `);

    await queryRunner.query(`
            INSERT INTO courses ("courseCode", name, credit, description) VALUES
            ('CS101', 'Introduction to Programming', 3, 'Basic programming concepts'),
            ('CS102', 'Data Structures', 4, 'Fundamental data structures'),
            ('CS103', 'Algorithms', 4, 'Basic algorithms'),
            ('MATH101', 'Calculus I', 3, 'Introduction to calculus'),
            ('ENG101', 'English for Academic Purposes', 2, 'English skills for university');
          `);

    // await queryRunner.query(`
    //         UPDATE courses SET "prerequisiteCourseId" = 1 WHERE "courseCode" = 'CS102';
    //         UPDATE courses SET "prerequisiteCourseId" = 2 WHERE "courseCode" = 'CS103';
    //       `);

    // await queryRunner.query(`
    //         INSERT INTO course_semesters ("courseId", "semesterId", "maxStudents") VALUES
    //         (1, 1, 50),
    //         (2, 2, 50),
    //         (3, 3, 50),
    //         (4, 1, 50),
    //         (5, 2, 50);
    //       `);
    }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`
    //     DELETE FROM course_semesters WHERE "courseId" IN (1, 2, 3, 4, 5);
    //   `);
    await queryRunner.query(`
        DELETE FROM courses WHERE "courseCode" IN ('CS101', 'CS102', 'CS103', 'MATH101', 'ENG101');
      `);
    await queryRunner.query(`
        DELETE FROM semesters WHERE "semesterCode" IN ('2024-2025-1', '2024-2025-2', '2024-2025-3');
      `);
  }
}

