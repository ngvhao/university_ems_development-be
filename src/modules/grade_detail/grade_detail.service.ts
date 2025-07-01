import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeDetailEntity } from './entities/grade_detail.entity';
import { CreateGradeDetailDto } from './dtos/createGradeDetail.dto';
import { UpdateGradeDetailDto } from './dtos/updateGradeDetail.dto';
import { FilterGradeDetailDto } from './dtos/filterGradeDetail.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { DEFAULT_PAGINATION } from 'src/utils/constants';

@Injectable()
export class GradeDetailService {
  constructor(
    @InjectRepository(GradeDetailEntity)
    private readonly gradeDetailRepository: Repository<GradeDetailEntity>,
  ) {}

  async create(
    createGradeDetailDto: CreateGradeDetailDto,
  ): Promise<GradeDetailEntity> {
    const gradeDetail = this.gradeDetailRepository.create(createGradeDetailDto);
    return await this.gradeDetailRepository.save(gradeDetail);
  }

  async findAll(
    filterDto?: FilterGradeDetailDto,
    paginationDto: PaginationDto = DEFAULT_PAGINATION,
  ): Promise<{ data: GradeDetailEntity[]; meta: MetaDataInterface }> {
    const { page, limit } = paginationDto;
    const queryBuilder = this.gradeDetailRepository
      .createQueryBuilder('gradeDetail')
      .leftJoinAndSelect('gradeDetail.student', 'student')
      .leftJoinAndSelect('gradeDetail.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course');

    if (filterDto?.studentId) {
      queryBuilder.andWhere('gradeDetail.studentId = :studentId', {
        studentId: filterDto.studentId,
      });
    }

    if (filterDto?.classGroupId) {
      queryBuilder.andWhere('gradeDetail.classGroupId = :classGroupId', {
        classGroupId: filterDto.classGroupId,
      });
    }

    if (filterDto?.gradeType !== undefined) {
      queryBuilder.andWhere('gradeDetail.gradeType = :gradeType', {
        gradeType: filterDto.gradeType,
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);
    const [data, total] = await queryBuilder.getManyAndCount();
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
    const gradeDetail = await this.findOne(id);

    Object.assign(gradeDetail, updateGradeDetailDto);
    return await this.gradeDetailRepository.save(gradeDetail);
  }

  async remove(id: number): Promise<void> {
    const gradeDetail = await this.findOne(id);
    await this.gradeDetailRepository.remove(gradeDetail);
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
