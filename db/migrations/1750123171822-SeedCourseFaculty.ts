import { MigrationInterface, QueryRunner } from 'typeorm';
import { ECourseType } from '../../src/utils/enums/course-type.enum';

export class SeedCourseFaculty1750123171822 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const courses = [];
    for (let i = 6; i <= 55; i++) {
      courses.push(i);
    }

    for (const course of courses) {
      await queryRunner.query(
        `INSERT INTO course_faculties ("courseId", "facultyId", "description", "isActive")
         VALUES ($1, $2, $3, $4)`,
        [course, 22, `Mô tả môn học`, true],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM course_faculties`);
  }
}
