// src/modules/course-major/course_major.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Not,
  Repository,
  FindOptionsWhere,
  FindOptionsRelations,
} from 'typeorm';
import { CourseService } from 'src/modules/course/course.service';
import { MajorService } from 'src/modules/major/major.service';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { CreateCourseMajorDto } from './dtos/createCourseMajor.dto';
import { UpdateCourseMajorDto } from './dtos/updateCourseMajor.dto';
import { CourseMajorEntity } from './entities/course_major.entity';
// Bỏ import CourseEntity nếu không dùng để check prerequisite nữa
// import { CourseEntity } from '../course/entities/course.entity';

@Injectable()
export class CourseMajorService {
  constructor(
    @InjectRepository(CourseMajorEntity)
    private readonly courseMajorRepository: Repository<CourseMajorEntity>,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => MajorService))
    private readonly majorService: MajorService,
  ) {}

  /**
   * Helper: Tìm liên kết CourseMajor theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của liên kết CourseMajor.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<CourseMajorEntity> - Liên kết tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findCourseMajorByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<CourseMajorEntity> {
    const courseMajor = await this.courseMajorRepository.findOne({
      where: { id },
      relations,
    });
    if (!courseMajor) {
      throw new NotFoundException(
        `Không tìm thấy liên kết Course-Major với ID ${id}`,
      );
    }
    return courseMajor;
  }

  /**
   * Helper: Kiểm tra sự tồn tại của Course và Major.
   * @param courseId - ID của Course.
   * @param majorId - ID của Major.
   * @throws NotFoundException nếu Course hoặc Major không tồn tại.
   */
  private async validateForeignKeys(
    courseId: number,
    majorId: number,
  ): Promise<void> {
    await Promise.all([
      this.courseService.findOne(courseId),
      this.majorService.findOne(majorId),
    ]);
  }

  /**
   * Helper: Kiểm tra xem liên kết giữa Course và Major đã tồn tại chưa.
   * @param courseId - ID của Course.
   * @param majorId - ID của Major.
   * @param excludeId - (Optional) ID của liên kết cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu liên kết đã tồn tại.
   */
  private async checkConflict(
    courseId: number,
    majorId: number,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<CourseMajorEntity> = { courseId, majorId };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existingRelation = await this.courseMajorRepository.findOne({
      where,
      select: ['id'],
    });
    if (existingRelation) {
      throw new ConflictException(
        `Liên kết giữa Môn học ID ${courseId} và Ngành học ID ${majorId} đã tồn tại.`,
      );
    }
  }

  /**
   * Tạo một liên kết mới giữa Course và Major.
   * @param createCourseMajorDto - Dữ liệu liên kết (courseId, majorId, isMandatory).
   * @returns Promise<CourseMajorEntity> - Liên kết vừa được tạo.
   * @throws NotFoundException nếu Course hoặc Major không tồn tại.
   * @throws ConflictException nếu liên kết đã tồn tại.
   */
  async create(
    createCourseMajorDto: CreateCourseMajorDto,
  ): Promise<CourseMajorEntity> {
    const { courseId, majorId, ...restData } = createCourseMajorDto;

    await this.validateForeignKeys(courseId, majorId);
    await this.checkConflict(courseId, majorId);

    try {
      const courseMajor = this.courseMajorRepository.create({
        ...restData,
        courseId,
        majorId,
      });
      const saved = await this.courseMajorRepository.save(courseMajor);
      return this.findCourseMajorByIdOrThrow(saved.id, ['course', 'major']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Liên kết giữa Môn học ID ${courseId} và Ngành học ID ${majorId} có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi tạo liên kết Course-Major:', error);
      throw new BadRequestException('Không thể tạo liên kết Course-Major.');
    }
  }

  /**
   * Lấy danh sách tất cả các liên kết Course-Major (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: CourseMajorEntity[]; meta: MetaDataInterface }> - Danh sách liên kết và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: CourseMajorEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.courseMajorRepository.findAndCount({
      relations: ['course', 'major'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một liên kết Course-Major theo ID.
   * @param id - ID của liên kết.
   * @returns Promise<CourseMajorEntity> - Thông tin chi tiết liên kết.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<CourseMajorEntity> {
    return this.findCourseMajorByIdOrThrow(id, ['course', 'major']);
  }

  /**
   * Lấy danh sách các môn học thuộc một ngành cụ thể.
   * @param majorId - ID của Ngành học.
   * @returns Promise<CourseMajorEntity[]> - Danh sách các liên kết.
   * @throws NotFoundException nếu Ngành học không tồn tại.
   */
  async findByMajor(majorId: number): Promise<CourseMajorEntity[]> {
    await this.majorService.findOne(majorId);
    return this.courseMajorRepository.find({
      where: { majorId },
      relations: ['course'],
      order: { course: { courseCode: 'ASC' } },
    });
  }

  /**
   * Lấy danh sách các ngành học chứa một môn học cụ thể.
   * @param courseId - ID của Môn học.
   * @returns Promise<CourseMajorEntity[]> - Danh sách các liên kết.
   * @throws NotFoundException nếu Môn học không tồn tại.
   */
  async findByCourse(courseId: number): Promise<CourseMajorEntity[]> {
    await this.courseService.findOne(courseId);
    return this.courseMajorRepository.find({
      where: { courseId },
      relations: ['major'], // Chỉ cần load major
      order: { major: { name: 'ASC' } },
    });
  }

  /**
   * Cập nhật một liên kết Course-Major (chỉ cờ isMandatory).
   * @param id - ID của liên kết cần cập nhật.
   * @param updateCourseMajorDto - Dữ liệu cập nhật (chỉ chứa isMandatory).
   * @returns Promise<CourseMajorEntity> - Liên kết sau khi cập nhật.
   * @throws NotFoundException nếu liên kết không tồn tại.
   */
  async update(
    id: number,
    updateCourseMajorDto: UpdateCourseMajorDto,
  ): Promise<CourseMajorEntity> {
    const courseMajorToUpdate = await this.courseMajorRepository.preload({
      id: id,
      isMandatory: updateCourseMajorDto.isMandatory,
    });

    if (!courseMajorToUpdate) {
      throw new NotFoundException(
        `Không tìm thấy liên kết Course-Major với ID ${id}`,
      );
    }

    try {
      await this.courseMajorRepository.save(courseMajorToUpdate);
      return this.findCourseMajorByIdOrThrow(id, ['course', 'major']);
    } catch (error) {
      console.error('Lỗi khi cập nhật liên kết Course-Major:', error);
      throw new BadRequestException(
        'Không thể cập nhật liên kết Course-Major.',
      );
    }
  }

  /**
   * Xóa một liên kết Course-Major.
   * @param id - ID của liên kết cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy liên kết.
   * @throws BadRequestException nếu đang là tiên quyết (logic này đã bị loại bỏ).
   */
  async remove(id: number): Promise<void> {
    const courseMajorToRemove = await this.findCourseMajorByIdOrThrow(id);
    await this.courseMajorRepository.remove(courseMajorToRemove);
  }

  async getOne(
    condition:
      | FindOptionsWhere<CourseMajorEntity>
      | FindOptionsWhere<CourseMajorEntity>[],
    relations?: FindOptionsRelations<CourseMajorEntity>,
  ): Promise<CourseMajorEntity> {
    const courseMajor = await this.courseMajorRepository.findOne({
      where: condition,
      relations,
    });

    return courseMajor;
  }
}
