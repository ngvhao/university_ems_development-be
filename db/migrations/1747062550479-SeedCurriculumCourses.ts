import { MigrationInterface, QueryRunner } from 'typeorm';

const CURRICULUM_ID_AI = 1;
const CURRICULUM_ID_SE = 2;
// ----------------------------------------------------

const studyPlansDataSource = [
  {
    curriculumId: CURRICULUM_ID_AI,
    nameForLog: 'Trí tuệ nhân tạo',
    semesters: [
      {
        semesterCode: '2025-HK1',
        courseCodes: ['IT101', 'IT102', 'IT104', 'IT130', 'IT124'],
        minGrade: 4.0,
      },
      {
        semesterCode: '2025-HK2',
        courseCodes: ['IT103', 'IT122', 'IT105', 'IT108', 'IT129'],
        minGrade: 4.0,
      },
      {
        semesterCode: '2026-HK1',
        courseCodes: ['IT106', 'IT107', 'IT109', 'IT120', 'IT133'],
        minGrade: 4.0,
      },
      {
        semesterCode: '2026-HK2',
        courseCodes: ['IT113', 'IT114', 'IT131', 'IT132', 'IT125'],
        minGrade: 5.0,
      },
      {
        semesterCode: '2027-HK1',
        courseCodes: ['IT141', 'IT115', 'IT118', 'IT137', 'IT126'],
        minGrade: 5.0,
      },
      {
        semesterCode: '2027-HK2',
        courseCodes: ['IT143', 'IT135', 'IT145', 'IT148', 'IT127'],
        minGrade: 5.0,
      },
      {
        semesterCode: '2028-HK1',
        courseCodes: ['IT146', 'IT123', 'IT147', 'IT144', 'IT140'],
        minGrade: 5.0,
      },
      { semesterCode: '2028-HK2', courseCodes: ['IT150'], minGrade: 5.0 },
    ],
  },
  {
    curriculumId: CURRICULUM_ID_SE,
    nameForLog: 'Kỹ thuật phần mềm',
    semesters: [
      {
        semesterCode: '2025-HK1',
        courseCodes: ['IT101', 'IT102', 'IT104', 'IT130', 'IT124'],
        minGrade: 4.0,
      },
      {
        semesterCode: '2025-HK2',
        courseCodes: ['IT103', 'IT105', 'IT122', 'IT108', 'IT125'],
        minGrade: 4.0,
      },
      {
        semesterCode: '2026-HK1',
        courseCodes: ['IT107', 'IT109', 'IT106', 'IT120', 'IT121'],
        minGrade: 4.0,
      },
      {
        semesterCode: '2026-HK2',
        courseCodes: ['IT110', 'IT111', 'IT117', 'IT126', 'IT127'],
        minGrade: 5.0,
      },
      {
        semesterCode: '2027-HK1',
        courseCodes: ['IT128', 'IT145', 'IT146', 'IT135', 'IT112'],
        minGrade: 5.0,
      },
      {
        semesterCode: '2027-HK2',
        courseCodes: ['IT144', 'IT148', 'IT137', 'IT123', 'IT140'],
        minGrade: 5.0,
      },
      {
        semesterCode: '2028-HK1',
        courseCodes: ['IT138', 'IT147', 'IT139', 'IT129', 'IT134'],
        minGrade: 5.0,
      },
      { semesterCode: '2028-HK2', courseCodes: ['IT150'], minGrade: 5.0 },
    ],
  },
];

export class SeedCurriculumCoursesWithSemesterCode1830000000000
  implements MigrationInterface
{
  name = 'SeedCurriculumCoursesWithSemesterCode1830000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Lấy Course IDs
    const allCourseCodesToQuery = new Set<string>();
    const allSemesterCodesToQuery = new Set<string>();

    studyPlansDataSource.forEach((plan) => {
      plan.semesters.forEach((sem) => {
        allSemesterCodesToQuery.add(sem.semesterCode);
        sem.courseCodes.forEach((code) => allCourseCodesToQuery.add(code));
      });
    });

    const courseParams = Array.from(allCourseCodesToQuery);
    let courseRows: Array<{ id: number; courseCode: string }> = [];
    if (courseParams.length > 0) {
      const coursePlaceholders = courseParams
        .map((_, i) => `$${i + 1}`)
        .join(',');
      courseRows = await queryRunner.query(
        `SELECT id, "courseCode" FROM courses WHERE "courseCode" IN (${coursePlaceholders})`,
        courseParams,
      );
    }
    const courseMap = new Map<string, number>(); // courseCode -> courseId
    courseRows.forEach((c) => courseMap.set(c.courseCode, c.id));

    // 2. Lấy Semester IDs bằng semesterCode
    const semesterCodeParams = Array.from(allSemesterCodesToQuery);
    let semesterRows: Array<{ id: number; semesterCode: string }> = [];
    if (semesterCodeParams.length > 0) {
      const semesterPlaceholders = semesterCodeParams
        .map((_, i) => `$${i + 1}`)
        .join(',');
      semesterRows = await queryRunner.query(
        `SELECT id, "semesterCode" FROM semesters WHERE "semesterCode" IN (${semesterPlaceholders})`,
        semesterCodeParams,
      );
    }
    const semesterMap = new Map<string, number>(); // semesterCode -> semesterId
    semesterRows.forEach((s) => semesterMap.set(s.semesterCode, s.id));

    console.log(`[Migration] Seeding curriculum_courses...`);
    for (const plan of studyPlansDataSource) {
      if (!plan.curriculumId) {
        console.error(
          `[Migration] CRITICAL: plan.curriculumId is undefined or null for ${plan.nameForLog}. Skipping this plan.`,
        );
        // Để an toàn, nếu curriculumId không có, chúng ta có thể dừng hẳn migration bằng cách throw error
        // throw new Error(`[Migration] CRITICAL: plan.curriculumId is undefined or null for ${plan.nameForLog}.`);
        continue;
      }

      for (const semesterData of plan.semesters) {
        const semesterId = semesterMap.get(semesterData.semesterCode);

        if (!semesterId) {
          console.warn(
            `[Migration] Semester with code '${semesterData.semesterCode}' not found in semesterMap. Skipping courses for this semester in curriculum '${plan.nameForLog}' (ID ${plan.curriculumId}).`,
          );
          continue;
        }

        for (const courseCode of semesterData.courseCodes) {
          const courseId = courseMap.get(courseCode);

          if (!courseId) {
            console.warn(
              `[Migration] Course with code '${courseCode}' not found in courseMap. Skipping for curriculum '${plan.nameForLog}' (ID ${plan.curriculumId}).`,
            );
            continue;
          }

          const queryParams = [
            plan.curriculumId,
            courseId,
            semesterId,
            true, // isMandatory
            semesterData.minGrade,
            null, // prerequisiteCourseId
          ];
          // console.log(`[Migration] Attempting INSERT with params: curriculumId=${queryParams[0]}, courseId=${queryParams[1]}, semesterId=${queryParams[2]}, isMandatory=${queryParams[3]}, minGradeRequired=${queryParams[4]}, prerequisiteCourseId=${queryParams[5]}`);

          try {
            await queryRunner.query(
              `INSERT INTO curriculum_courses ("curriculumId", "courseId", "semesterId", "isMandatory", "minGradeRequired", "prerequisiteCourseId")
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT ("curriculumId", "courseId") DO NOTHING`, // PostgreSQL specific
              queryParams,
            );
          } catch (error: any) {
            console.error(
              `[Migration] FAILED INSERT for: curriculumId=${queryParams[0]}, courseId=${queryParams[1]}, semesterId=${queryParams[2]}. Error: ${error.message}`,
              error,
            );
            // Ném lại lỗi để transaction bị abort và TypeORM biết migration thất bại.
            throw error;
          }
        }
      }
    }
    console.log(`[Migration] Seeding curriculum_courses completed.`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(`[Migration] Reverting seed for curriculum_courses...`);
    const allCourseCodesToQuery = new Set<string>();
    studyPlansDataSource.forEach((plan) => {
      plan.semesters.forEach((sem) => {
        sem.courseCodes.forEach((code) => allCourseCodesToQuery.add(code));
      });
    });

    const courseParams = Array.from(allCourseCodesToQuery);
    let courseRows: Array<{ id: number; courseCode: string }> = [];
    if (courseParams.length > 0) {
      const coursePlaceholders = courseParams
        .map((_, i) => `$${i + 1}`)
        .join(',');
      courseRows = await queryRunner.query(
        `SELECT id, "courseCode" FROM courses WHERE "courseCode" IN (${coursePlaceholders})`,
        courseParams,
      );
    }
    const courseMap = new Map<string, number>();
    courseRows.forEach((c) => courseMap.set(c.courseCode, c.id));

    for (const plan of studyPlansDataSource) {
      if (!plan.curriculumId) continue;
      for (const semesterData of plan.semesters) {
        for (const courseCode of semesterData.courseCodes) {
          const courseId = courseMap.get(courseCode);
          if (courseId) {
            try {
              await queryRunner.query(
                `DELETE FROM curriculum_courses WHERE "curriculumId" = $1 AND "courseId" = $2`,
                [plan.curriculumId, courseId],
              );
            } catch (error: any) {
              console.error(
                `[Migration] Error deleting curriculum_course for curriculumId=${plan.curriculumId}, courseId=${courseId}: ${error.message}`,
              );
              // Không ném lỗi ở down để cố gắng rollback nhiều nhất có thể, trừ khi lỗi nghiêm trọng
            }
          }
        }
      }
    }
    console.log(`[Migration] Reverting seed for curriculum_courses completed.`);
  }
}

