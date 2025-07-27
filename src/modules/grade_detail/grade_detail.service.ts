import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { GradeDetailEntity } from './entities/grade_detail.entity';
import { CreateGradeDetailDto } from './dtos/createGradeDetail.dto';
import { UpdateGradeDetailDto } from './dtos/updateGradeDetail.dto';
import { FilterGradeDetailDto } from './dtos/filterGradeDetail.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { DEFAULT_PAGINATION } from 'src/utils/constants';
import { EnrollmentCourseService } from '../enrollment_course/enrollment_course.service';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';
import { StudentService } from '../student/student.service';

@Injectable()
export class GradeDetailService {
  constructor(
    @InjectRepository(GradeDetailEntity)
    private readonly gradeDetailRepository: Repository<GradeDetailEntity>,
    private readonly enrollmentCourseService: EnrollmentCourseService,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createGradeDetailDto: CreateGradeDetailDto,
  ): Promise<GradeDetailEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const enrollment = await this.enrollmentCourseService.getOne({
        classGroupId: createGradeDetailDto.classGroupId,
      });
      if (!enrollment) {
        throw new NotFoundException('Enrollment not found');
      }
      if (enrollment.status !== EEnrollmentStatus.ENROLLED) {
        throw new BadRequestException('Enrollment is not enrolled');
      }

      const gradeDetail = this.gradeDetailRepository.create({
        ...createGradeDetailDto,
        enrollmentId: enrollment.id,
      });

      const savedGradeDetail = await queryRunner.manager.save(
        GradeDetailEntity,
        gradeDetail,
      );

      // Cập nhật GPA của sinh viên sau khi tạo điểm (sử dụng cùng transaction)
      try {
        await this.studentService.updateStudentGPA(
          createGradeDetailDto.studentId,
          queryRunner,
        );
      } catch (error) {
        console.error(
          `Failed to update GPA for student ${createGradeDetailDto.studentId}:`,
          error,
        );
        // Không throw error để không ảnh hưởng đến việc tạo điểm
      }

      await queryRunner.commitTransaction();
      return savedGradeDetail;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') {
        throw new BadRequestException('Điểm cột này đã tồn tại');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    filterDto?: FilterGradeDetailDto,
    paginationDto: PaginationDto = DEFAULT_PAGINATION,
  ): Promise<{ data: GradeDetailEntity[]; meta: MetaDataInterface }> {
    const { page, limit } = paginationDto;
    const where: FindOptionsWhere<GradeDetailEntity> = {};

    if (filterDto?.studentId) {
      where.studentId = filterDto.studentId;
    }

    if (filterDto?.classGroupId) {
      where.classGroupId = filterDto.classGroupId;
    }
    if (filterDto?.gradeType) {
      where.gradeType = filterDto.gradeType;
    }

    const [data, total] = await this.gradeDetailRepository.findAndCount({
      where,
      relations: {
        student: {
          user: true,
        },
        classGroup: {
          course: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    data.forEach((item) => {
      item.student.user.password = undefined;
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findOne(id: number): Promise<GradeDetailEntity> {
    const gradeDetail = await this.gradeDetailRepository.findOne({
      where: { id },
      relations: ['student', 'classGroup', 'classGroup.course'],
    });

    if (!gradeDetail) {
      throw new NotFoundException(`Grade detail with ID ${id} not found`);
    }

    return gradeDetail;
  }

  async findByStudent(studentId: number): Promise<GradeDetailEntity[]> {
    return await this.gradeDetailRepository.find({
      where: { studentId },
      relations: ['student', 'classGroup', 'classGroup.course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClassGroup(classGroupId: number): Promise<GradeDetailEntity[]> {
    return await this.gradeDetailRepository.find({
      where: { classGroupId },
      relations: ['student', 'classGroup', 'classGroup.course'],
      order: { studentId: 'ASC', gradeType: 'ASC' },
    });
  }

  async findByStudentAndClassGroup(
    studentId: number,
    classGroupId: number,
  ): Promise<GradeDetailEntity[]> {
    return await this.gradeDetailRepository.find({
      where: { studentId, classGroupId },
      relations: ['student', 'classGroup', 'classGroup.course'],
      order: { gradeType: 'ASC' },
    });
  }

  async update(
    id: number,
    updateGradeDetailDto: UpdateGradeDetailDto,
  ): Promise<GradeDetailEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const gradeDetail = await this.findOne(id);
      const studentId = gradeDetail.studentId;

      Object.assign(gradeDetail, updateGradeDetailDto);
      const updatedGradeDetail = await queryRunner.manager.save(
        GradeDetailEntity,
        gradeDetail,
      );

      // Cập nhật GPA của sinh viên sau khi cập nhật điểm (sử dụng cùng transaction)
      try {
        await this.studentService.updateStudentGPA(studentId, queryRunner);
      } catch (error) {
        console.error(`Failed to update GPA for student ${studentId}:`, error);
        // Không throw error để không ảnh hưởng đến việc cập nhật điểm
      }

      await queryRunner.commitTransaction();
      return updatedGradeDetail;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const gradeDetail = await this.findOne(id);
      const studentId = gradeDetail.studentId;

      await queryRunner.manager.remove(GradeDetailEntity, gradeDetail);

      // Cập nhật GPA của sinh viên sau khi xóa điểm (sử dụng cùng transaction)
      try {
        await this.studentService.updateStudentGPA(studentId, queryRunner);
      } catch (error) {
        console.error(`Failed to update GPA for student ${studentId}:`, error);
        // Không throw error để không ảnh hưởng đến việc xóa điểm
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async calculateWeightedAverage(
    studentId: number,
    classGroupId: number,
  ): Promise<number> {
    const gradeDetails = await this.findByStudentAndClassGroup(
      studentId,
      classGroupId,
    );

    if (gradeDetails.length === 0) {
      return 0;
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const gradeDetail of gradeDetails) {
      totalWeightedScore += gradeDetail.score * (gradeDetail.weight / 100);
      totalWeight += gradeDetail.weight;
    }

    if (totalWeight === 0) {
      return 0;
    }

    return totalWeightedScore / (totalWeight / 100);
  }

  async getGradeSummary(
    studentId: number,
    classGroupId: number,
  ): Promise<{
    gradeDetails: GradeDetailEntity[];
    weightedAverage: number;
    totalWeight: number;
  }> {
    const gradeDetails = await this.findByStudentAndClassGroup(
      studentId,
      classGroupId,
    );
    const weightedAverage = await this.calculateWeightedAverage(
      studentId,
      classGroupId,
    );
    const totalWeight = gradeDetails.reduce(
      (sum, detail) => sum + detail.weight,
      0,
    );

    return {
      gradeDetails,
      weightedAverage,
      totalWeight,
    };
  }
}
