import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Not,
  LessThanOrEqual,
  MoreThanOrEqual,
  FindOptionsRelations,
} from 'typeorm';
import { CurriculumEntity } from './entities/curriculum.entity';
import { CreateCurriculumDto } from './dtos/createCurriculum.dto';
import { UpdateCurriculumDto } from './dtos/updateCurriculum.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { MajorService } from '../major/major.service';
import { StudentEntity } from '../student/entities/student.entity';

@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(CurriculumEntity)
    private readonly curriculumRepository: Repository<CurriculumEntity>,
    @Inject(forwardRef(() => MajorService))
    private readonly majorService: MajorService,
  ) {}

  /**
   * Helper: Tìm chương trình đào tạo theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của chương trình đào tạo.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<CurriculumEntity> - Chương trình đào tạo tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findCurriculumByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<CurriculumEntity> {
    const curriculum = await this.curriculumRepository.findOne({
      where: { id },
      relations,
    });
    if (!curriculum) {
      throw new NotFoundException(
        `Không tìm thấy Chương trình đào tạo với ID ${id}`,
      );
    }
    return curriculum;
  }

  async findCurriculum(
    student?: StudentEntity,
    majorId?: number,
    academicYear?: number,
  ): Promise<CurriculumEntity | null> {
    const condicionesWhere: FindOptionsWhere<CurriculumEntity> = {};

    if (student && student.majorId) {
      condicionesWhere.majorId = student.majorId;
    } else if (student && student.majorId) {
      condicionesWhere.majorId = student.majorId;
    } else {
      throw new NotFoundException(
        'Không thể xác định ngành học để tìm chương trình đào tạo.',
      );
    }

    if (academicYear) {
      condicionesWhere.startAcademicYear = academicYear;
    } else if (student && student.academicYear) {
      condicionesWhere.startAcademicYear = student.academicYear;
    }

    const curriculum = await this.curriculumRepository.findOne({
      where: condicionesWhere,
      relations: [
        'major',
        'curriculumCourses',
        'curriculumCourses.course',
        'curriculumCourses.semester',
      ],
    });

    if (!curriculum) {
      return null;
    }

    return curriculum;
  }

  /**
   * Helper: Validate các logic nghiệp vụ của Curriculum.
   * @param curriculumData - Dữ liệu chương trình đào tạo.
   * @throws BadRequestException nếu logic không hợp lệ.
   */
  private validateBusinessLogic(
    curriculumData: Partial<CreateCurriculumDto> | CurriculumEntity,
  ): void {
    if (
      curriculumData.endAcademicYear !== undefined &&
      curriculumData.startAcademicYear !== undefined &&
      curriculumData.endAcademicYear < curriculumData.startAcademicYear
    ) {
      throw new BadRequestException(
        'Năm học kết thúc phải lớn hơn hoặc bằng năm học bắt đầu.',
      );
    }
    if (
      curriculumData.totalCreditsRequired !== undefined &&
      curriculumData.electiveCreditsRequired !== undefined &&
      curriculumData.totalCreditsRequired <
        curriculumData.electiveCreditsRequired
    ) {
      throw new BadRequestException(
        'Tổng tín chỉ yêu cầu phải lớn hơn hoặc bằng tín chỉ tự chọn yêu cầu.',
      );
    }
    if (
      curriculumData.expiryDate &&
      curriculumData.effectiveDate &&
      new Date(curriculumData.expiryDate) <=
        new Date(curriculumData.effectiveDate)
    ) {
      throw new BadRequestException(
        'Ngày hết hiệu lực phải sau ngày có hiệu lực.',
      );
    }
  }

  /**
   * Helper: Kiểm tra xung đột chương trình đào tạo (ví dụ: trùng ngành và khoảng thời gian áp dụng).
   * Logic kiểm tra conflict cần được định nghĩa rõ ràng theo nghiệp vụ.
   * Ví dụ: Không cho phép 2 CTĐT cùng ngành có khoảng năm học giao nhau.
   * @param curriculumData - Dữ liệu chương trình đào tạo.
   * @param excludeId - ID cần loại trừ khi kiểm tra (dùng khi update).
   * @throws ConflictException nếu có xung đột.
   */
  private async checkConflict(
    curriculumData: {
      majorId: number;
      startAcademicYear: number;
      endAcademicYear: number;
    },
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<CurriculumEntity> = {
      majorId: curriculumData.majorId,
      startAcademicYear: curriculumData.startAcademicYear,
    };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const conflict = await this.curriculumRepository.findOne({
      where,
      select: ['id'],
    });
    if (conflict) {
      throw new ConflictException(
        `Đã tồn tại chương trình đào tạo cho ngành ID ${curriculumData.majorId} bắt đầu từ năm ${curriculumData.startAcademicYear}.`,
      );
    }

    // Kiểm tra khoảng năm giao nhau:
    const conflictingPrograms = await this.curriculumRepository.find({
      where: {
        majorId: curriculumData.majorId,
        startAcademicYear: LessThanOrEqual(curriculumData.endAcademicYear),
        endAcademicYear: MoreThanOrEqual(curriculumData.startAcademicYear),
        ...(excludeId && { id: Not(excludeId) }),
      },
      select: ['id', 'startAcademicYear', 'endAcademicYear'],
    });
    if (conflictingPrograms.length > 0) {
      throw new ConflictException(
        `Khoảng thời gian áp dụng (${curriculumData.startAcademicYear}-${curriculumData.endAcademicYear}) bị trùng với chương trình đào tạo khác của ngành ID ${curriculumData.majorId}.`,
      );
    }
  }

  /**
   * Tạo một chương trình đào tạo mới.
   * @param createCurriculumDto - Dữ liệu chương trình đào tạo.
   * @returns Promise<CurriculumEntity> - Chương trình đào tạo vừa tạo.
   * @throws NotFoundException nếu Ngành học không tồn tại.
   * @throws BadRequestException nếu dữ liệu logic không hợp lệ.
   * @throws ConflictException nếu có xung đột với CTĐT khác.
   */
  async create(
    createCurriculumDto: CreateCurriculumDto,
  ): Promise<CurriculumEntity> {
    const { majorId } = createCurriculumDto;

    await this.majorService.findOne(majorId);

    this.validateBusinessLogic(createCurriculumDto);

    await this.checkConflict({
      majorId: createCurriculumDto.majorId,
      startAcademicYear: createCurriculumDto.startAcademicYear,
      endAcademicYear: createCurriculumDto.endAcademicYear,
    });

    // Tạo entity và lưu
    try {
      const curriculum = this.curriculumRepository.create(createCurriculumDto);
      return await this.curriculumRepository.save(curriculum);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Chương trình đào tạo này có thể đã tồn tại (trùng ngành và năm học).',
        );
      }
      console.error('Lỗi khi tạo chương trình đào tạo:', error);
      throw new BadRequestException('Không thể tạo chương trình đào tạo.');
    }
  }

  /**
   * Lấy danh sách chương trình đào tạo (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: CurriculumEntity[]; meta: MetaDataInterface }> - Danh sách CTĐT và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
    majorId?: number,
  ): Promise<{ data: CurriculumEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const where: FindOptionsWhere<CurriculumEntity> = { majorId };

    const [data, total] = await this.curriculumRepository.findAndCount({
      where,
      relations: ['major'],
      skip: (page - 1) * limit,
      take: limit,
      order: { majorId: 'ASC', startAcademicYear: 'DESC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một chương trình đào tạo theo ID.
   * @param id - ID của chương trình đào tạo.
   * @returns Promise<CurriculumEntity> - Thông tin chi tiết CTĐT.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<CurriculumEntity> {
    return this.findCurriculumByIdOrThrow(id, [
      'major',
      'curriculumCourses',
      'curriculumCourses.course',
    ]);
  }

  /**
   * Cập nhật thông tin một chương trình đào tạo.
   * @param id - ID của CTĐT cần cập nhật.
   * @param updateCurriculumDto - Dữ liệu cập nhật.
   * @returns Promise<CurriculumEntity> - CTĐT sau khi cập nhật.
   * @throws NotFoundException nếu CTĐT hoặc Ngành học mới không tồn tại.
   * @throws BadRequestException nếu logic nghiệp vụ không hợp lệ.
   * @throws ConflictException nếu có xung đột sau khi cập nhật.
   */
  async update(
    id: number,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<CurriculumEntity> {
    const curriculumToUpdate = await this.curriculumRepository.preload({
      id: id,
      ...updateCurriculumDto,
      ...(updateCurriculumDto.majorId && {
        major: { id: updateCurriculumDto.majorId },
      }),
    });

    if (!curriculumToUpdate) {
      throw new NotFoundException(
        `Không tìm thấy Chương trình đào tạo với ID ${id}`,
      );
    }

    const finalMajorId = curriculumToUpdate.majorId;

    if (updateCurriculumDto.majorId) {
      await this.majorService.findOne(finalMajorId);
    }

    this.validateBusinessLogic(curriculumToUpdate);

    const needsConflictCheck =
      updateCurriculumDto.majorId ||
      updateCurriculumDto.startAcademicYear !== undefined ||
      updateCurriculumDto.endAcademicYear !== undefined;
    if (needsConflictCheck) {
      await this.checkConflict(
        {
          majorId: finalMajorId,
          startAcademicYear: curriculumToUpdate.startAcademicYear,
          endAcademicYear: curriculumToUpdate.endAcademicYear,
        },
        id,
      );
    }

    // Lưu thay đổi
    try {
      return await this.curriculumRepository.save(curriculumToUpdate);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Chương trình đào tạo này có thể đã tồn tại (trùng ngành và năm học).',
        );
      }
      console.error('Lỗi khi cập nhật chương trình đào tạo:', error);
      throw new BadRequestException('Không thể cập nhật chương trình đào tạo.');
    }
  }

  /**
   * Xóa một chương trình đào tạo.
   * @param id - ID của CTĐT cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy CTĐT.
   * @throws BadRequestException nếu CTĐT đang được sử dụng.
   */
  async remove(id: number): Promise<void> {
    const curriculum = await this.findCurriculumByIdOrThrow(id, [
      'curriculumCourses',
    ]);

    if (
      curriculum.curriculumCourses &&
      curriculum.curriculumCourses.length > 0
    ) {
      throw new BadRequestException(
        `Không thể xóa Chương trình đào tạo ID ${id} vì đang chứa ${curriculum.curriculumCourses.length} môn học. Vui lòng xóa các môn học khỏi chương trình trước.`,
      );
    }

    await this.curriculumRepository.remove(curriculum);
  }

  async getOne(
    condition:
      | FindOptionsWhere<CurriculumEntity>
      | FindOptionsWhere<CurriculumEntity>[],
    relations?: FindOptionsRelations<CurriculumEntity>,
  ): Promise<CurriculumEntity> {
    const curriculumEntity = await this.curriculumRepository.findOne({
      where: condition,
      relations,
    });

    return curriculumEntity;
  }
}
