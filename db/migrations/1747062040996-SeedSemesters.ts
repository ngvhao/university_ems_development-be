import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSemesters1747062040996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const semesters = [
      {
        semesterCode: '2025-HK1',
        startYear: 2025,
        endYear: 2026,
        term: 1,
        startDate: new Date('2025-09-01T00:00:00Z'),
        endDate: new Date('2026-01-31T23:59:59Z'),
      },
      {
        semesterCode: '2025-HK2',
        startYear: 2026,
        endYear: 2026,
        term: 2,
        startDate: new Date('2026-02-01T00:00:00Z'),
        endDate: new Date('2026-06-30T23:59:59Z'),
      },
      {
        semesterCode: '2026-HK1',
        startYear: 2026,
        endYear: 2027,
        term: 1,
        startDate: new Date('2026-09-01T00:00:00Z'),
        endDate: new Date('2027-01-31T23:59:59Z'),
      },
      {
        semesterCode: '2026-HK2',
        startYear: 2027,
        endYear: 2027,
        term: 2,
        startDate: new Date('2027-02-01T00:00:00Z'),
        endDate: new Date('2027-06-30T23:59:59Z'),
      },
      {
        semesterCode: '2027-HK1',
        startYear: 2027,
        endYear: 2028,
        term: 1,
        startDate: new Date('2027-09-01T00:00:00Z'),
        endDate: new Date('2028-01-31T23:59:59Z'),
      },
      {
        semesterCode: '2027-HK2',
        startYear: 2028,
        endYear: 2028,
        term: 2,
        startDate: new Date('2028-02-01T00:00:00Z'),
        endDate: new Date('2028-06-30T23:59:59Z'),
      },
      {
        semesterCode: '2028-HK1',
        startYear: 2028,
        endYear: 2029,
        term: 1,
        startDate: new Date('2028-09-01T00:00:00Z'),
        endDate: new Date('2029-01-31T23:59:59Z'),
      },
      {
        semesterCode: '2028-HK2',
        startYear: 2029,
        endYear: 2029,
        term: 2,
        startDate: new Date('2029-02-01T00:00:00Z'),
        endDate: new Date('2029-06-30T23:59:59Z'),
      },
    ];

    await queryRunner.manager.insert('semesters', semesters);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM semesters
      WHERE semesterCode IN (
        '2025-HK1', '2025-HK2',
        '2026-HK1', '2026-HK2',
        '2027-HK1', '2027-HK2',
        '2028-HK1', '2028-HK2'
      );
    `);
  }
}

