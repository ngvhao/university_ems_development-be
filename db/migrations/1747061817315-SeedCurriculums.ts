import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCurriculums1747061817315 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert('curriculums', [
      {
        majorId: 1,
        totalCreditsRequired: 120,
        electiveCreditsRequired: 15,
        effectiveDate: new Date('2025-09-01'),
        expiryDate: null,
        startAcademicYear: 2025,
        endAcademicYear: 2029,
      },
      {
        majorId: 10,
        totalCreditsRequired: 125,
        electiveCreditsRequired: 20,
        effectiveDate: new Date('2025-09-01'),
        expiryDate: null,
        startAcademicYear: 2025,
        endAcademicYear: 2029,
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM curriculums
      WHERE (majorId = 1 OR majorId = 2)
        AND startAcademicYear = 2025
    `);
  }
}

