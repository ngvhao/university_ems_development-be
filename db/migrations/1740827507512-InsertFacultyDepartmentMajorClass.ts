import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertFacultyDepartmentMajorClass1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert Faculties
    await queryRunner.query(`
      INSERT INTO faculties ("facultyCode", name, description) VALUES
      ('IT', 'Công nghệ thông tin', 'Công nghệ thông tin'),
      ('BA', 'Khoa Quản trị Kinh doanh', 'Quản trị Kinh doanh')
    `);

    // Insert Departments
    await queryRunner.query(`
      INSERT INTO departments ("departmentCode", name, "facultyId") VALUES
      ('SE', 'Công nghệ phần mềm', (SELECT id FROM faculties WHERE "facultyCode" = 'IT')),
      ('CS', 'Khoa học máy tính', (SELECT id FROM faculties WHERE "facultyCode" = 'IT'))
    `);

    // Insert Majors
    await queryRunner.query(`
      INSERT INTO majors (name, "departmentId") VALUES
      ('Kỹ thuật phần mềm', (SELECT id FROM departments WHERE "departmentCode" = 'SE')),
      ('Trí tuệ nhân tạo', (SELECT id FROM departments WHERE "departmentCode" = 'CS'))
    `);

    // Insert Classes
    await queryRunner.query(`
      INSERT INTO classes ("classCode", "majorId") VALUES
      ('25050201', (SELECT id FROM majors WHERE name = 'Kỹ thuật phần mềm')),
      ('25050202', (SELECT id FROM majors WHERE name = 'Kỹ thuật phần mềm')),
      ('25050203', (SELECT id FROM majors WHERE name = 'Trí tuệ nhân tạo'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM classes WHERE name IN ('25050201', '25050202', '25050203');`,
    );
    await queryRunner.query(
      `DELETE FROM majors WHERE name IN ('Kỹ thuật phần mềm', 'Trí tuệ nhân tạo');`,
    );
    await queryRunner.query(
      `DELETE FROM departments WHERE "departmentCode" IN ('SE', 'CS');`,
    );
    await queryRunner.query(
      `DELETE FROM faculties WHERE "facultyCode" IN ('IT', 'BA');`,
    );
  }
}

