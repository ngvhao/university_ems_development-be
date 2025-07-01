import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { CreateCurriculumCourseDto } from './dtos/createCurriculumCourse.dto';
import { UpdateCurriculumCourseDto } from './dtos/updateCurriculumCourse.dto';
import { CurriculumCourseEntity } from './entities/curriculum_course.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { CurriculumService } from '../curriculum/curriculum.service';
import { CourseService } from '../course/course.service';
import { SemesterService } from '../semester/semester.service';
import { CourseEntity } from '../course/entities/course.entity';

@Injectable()
export class CurriculumCourseService {
  constructor(
    @InjectRepository(CurriculumCourseEntity)
    private readonly curriculumCourseRepository: Repository<CurriculumCourseEntity>,
    @Inject(forwardRef(() => CurriculumService))
    private readonly curriculumService: CurriculumService,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => SemesterService))
    private readonly semesterService: SemesterService,
  ) {}

  /**
   * Helper: Tìm CurriculumCourse theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của CurriculumCourse.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<CurriculumCourseEntity> - Liên kết tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findCurriculumCourseByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<CurriculumCourseEntity> {
    const curriculumCourse = await this.curriculumCourseRepository.findOne({
      where: { id },
      relations,
    });
    if (!curriculumCourse) {
      throw new NotFoundException(
        `Không tìm thấy liên kết Curriculum-Course với ID ${id}`,
      );
    }
    return curriculumCourse;
  }

  /**
   * Helper: Kiểm tra sự tồn tại của các khóa ngoại (Curriculum, Course, Semester).
   * @param dto - Dữ liệu chứa các ID cần kiểm tra.
   * @throws NotFoundException nếu bất kỳ ID nào không hợp lệ.
   */
  private async validateForeignKeys(dto: {
    curriculumId: number;
    courseId: number;
    semesterId: number;
  }): Promise<void> {
    await Promise.all([
      this.curriculumService.findOne(dto.curriculumId),
      this.courseService.findOne(dto.courseId),
      this.semesterService.findOne(dto.semesterId),
    ]);
  }

  /**
   * Helper: Kiểm tra xem môn học đã tồn tại trong chương trình đào tạo chưa.
   * @param curriculumId - ID của Curriculum.
   * @param courseId - ID của Course.
   * @param excludeId - (Optional) ID của bản ghi cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu môn học đã tồn tại trong CTĐT.
   */
  private async checkConflict(
    curriculumId: number,
    courseId: number,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<CurriculumCourseEntity> = {
      curriculumId,
      courseId,
    };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.curriculumCourseRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(
        `Môn học ID ${courseId} đã tồn tại trong Chương trình đào tạo ID ${curriculumId}.`,
      );
    }
  }

  /**
   * Helper: Kiểm tra môn tiên quyết trong ngữ cảnh của Chương trình đào tạo.
   * @param prerequisiteCourseId - ID môn tiên quyết cần kiểm tra.
   * @param currentCourseId - ID môn học hiện tại.
   * @param curriculumId - ID của Chương trình đào tạo.
   * @returns Promise<CourseEntity | null> - Entity môn tiên quyết nếu hợp lệ, ngược lại null.
   * @throws NotFoundException nếu prerequisiteCourseId không tồn tại.
   * @throws BadRequestException nếu tiên quyết không hợp lệ.
   */
  private async validatePrerequisiteInCurriculumContext(
    prerequisiteCourseId: number | null | undefined,
    currentCourseId: number,
    curriculumId: number,
  ): Promise<CourseEntity | null> {
    if (prerequisiteCourseId === null || prerequisiteCourseId === undefined) {
      return null;
    }

    if (prerequisiteCourseId === currentCourseId) {
      throw new BadRequestException(
        'Môn học không thể là tiên quyết của chính nó.',
      );
    }

    // Kiểm tra môn tiên quyết tồn tại
    const prerequisiteCourse =
      await this.courseService.findOne(prerequisiteCourseId);

    // Môn tiên quyết cũng phải thuộc CTĐT này
    const prerequisiteInCurriculum =
      await this.curriculumCourseRepository.findOne({
        where: { curriculumId: curriculumId, courseId: prerequisiteCourseId },
        select: ['id'],
      });
    if (!prerequisiteInCurriculum) {
      throw new BadRequestException(
        `Môn tiên quyết (ID: ${prerequisiteCourseId}) phải thuộc cùng Chương trình đào tạo (ID: ${curriculumId}).`,
      );
    }

    return prerequisiteCourse;
  }

  /**
   * Thêm một môn học vào chương trình đào tạo, có thể kèm tiên quyết.
   * @param createCurriculumCourseDto - Dữ liệu liên kết.
   * @returns Promise<CurriculumCourseEntity> - Liên kết vừa tạo.
   * @throws NotFoundException nếu Curriculum, Course, Semester hoặc Prerequisite Course không tồn tại.
   * @throws BadRequestException nếu tiên quyết không hợp lệ.
   * @throws ConflictException nếu môn học đã có trong CTĐT.
   */
  async create(
    createCurriculumCourseDto: CreateCurriculumCourseDto,
  ): Promise<CurriculumCourseEntity> {
    const {
      curriculumId,
      courseId,
      semesterId,
      prerequisiteCourseId,
      ...restData
    } = createCurriculumCourseDto;

    // Validate FKs (Curriculum, Course, Semester)
    await this.validateForeignKeys({ curriculumId, courseId, semesterId });

    // Validate Prerequisite Course trong context của Curriculum
    const prerequisiteCourseEntity =
      await this.validatePrerequisiteInCurriculumContext(
        prerequisiteCourseId,
        courseId,
        curriculumId,
      );

    // Check conflict
    await this.checkConflict(curriculumId, courseId);

    // 4. Tạo và lưu
    try {
      const curriculumCourse = this.curriculumCourseRepository.create({
        ...restData,
        curriculumId,
        courseId,
        semesterId,
        prerequisiteCourseId: prerequisiteCourseEntity
          ? prerequisiteCourseEntity.id
          : null,
      });
      const saved =
        await this.curriculumCourseRepository.save(curriculumCourse);
      return this.findCurriculumCourseByIdOrThrow(saved.id, [
        'curriculum',
        'course',
        'semester',
        'prerequisiteCourse',
      ]);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Môn học ID ${courseId} có thể đã tồn tại trong CTĐT ID ${curriculumId}.`,
        );
      }
      console.error('Lỗi khi thêm môn học vào CTĐT:', error);
      throw new BadRequestException('Không thể thêm môn học vào CTĐT.');
    }
  }

  /**
   * Lấy danh sách các môn học trong các chương trình đào tạo (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: CurriculumCourseEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: CurriculumCourseEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.curriculumCourseRepository.findAndCount({
      relations: [
        'curriculum',
        'course',
        'semester',
        'prerequisiteCourse',
        'curriculum.major',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        curriculumId: 'ASC',
        semesterId: 'ASC',
        course: { courseCode: 'ASC' },
      },
    });
    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy danh sách các môn học thuộc một CTĐT cụ thể (kèm tiên quyết).
   * @param curriculumId - ID của Chương trình đào tạo.
   * @returns Promise<CurriculumCourseEntity[]> - Danh sách các môn học trong CTĐT.
   * @throws NotFoundException nếu CTĐT không tồn tại.
   */
  async findByCurriculum(
    curriculumId: number,
    paginationDto: PaginationDto,
  ): Promise<{ data: CurriculumCourseEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    await this.curriculumService.findOne(curriculumId);
    const [data, total] = await this.curriculumCourseRepository.findAndCount({
      where: { curriculumId },
      relations: ['course', 'semester', 'prerequisiteCourse'], // Load tiên quyết
      order: { semesterId: 'ASC', course: { courseCode: 'ASC' } },
      skip: (page - 1) * limit,
      take: limit,
    });
    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một liên kết Curriculum-Course theo ID.
   * @param id - ID của liên kết.
   * @returns Promise<CurriculumCourseEntity> - Thông tin chi tiết.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<CurriculumCourseEntity> {
    return this.findCurriculumCourseByIdOrThrow(id, [
      'curriculum',
      'course',
      'semester',
      'prerequisiteCourse',
      'curriculum.major',
    ]);
  }

  /**
   * Cập nhật thông tin một môn học trong chương trình đào tạo.
   * @param id - ID của liên kết CurriculumCourse.
   * @param updateCurriculumCourseDto - Dữ liệu cập nhật.
   * @returns Promise<CurriculumCourseEntity> - Liên kết sau khi cập nhật.
   * @throws NotFoundException nếu liên kết hoặc FK mới không tồn tại.
   * @throws BadRequestException nếu tiên quyết không hợp lệ hoặc cố gắng thay đổi trường bị cấm.
   */
  async update(
    id: number,
    updateCurriculumCourseDto: UpdateCurriculumCourseDto,
  ): Promise<CurriculumCourseEntity> {
    if (
      updateCurriculumCourseDto.curriculumId !== undefined ||
      updateCurriculumCourseDto.courseId !== undefined
    ) {
      throw new BadRequestException(
        'Không thể thay đổi Chương trình đào tạo hoặc Môn học của một bản ghi đã tồn tại.',
      );
    }

    const curriculumCourseToUpdate =
      await this.curriculumCourseRepository.preload({
        id: id,
        isMandatory: updateCurriculumCourseDto.isMandatory,
        semesterId: updateCurriculumCourseDto.semesterId,
        minGradeRequired: updateCurriculumCourseDto.minGradeRequired,
      });

    if (!curriculumCourseToUpdate) {
      throw new NotFoundException(
        `Không tìm thấy liên kết Curriculum-Course với ID ${id}`,
      );
    }

    if (updateCurriculumCourseDto.semesterId !== undefined) {
      await this.semesterService.findOne(updateCurriculumCourseDto.semesterId);
    }

    if (updateCurriculumCourseDto.hasOwnProperty('prerequisiteCourseId')) {
      const prerequisiteCourseEntity =
        await this.validatePrerequisiteInCurriculumContext(
          updateCurriculumCourseDto.prerequisiteCourseId,
          curriculumCourseToUpdate.courseId,
          curriculumCourseToUpdate.curriculumId,
        );
      curriculumCourseToUpdate.prerequisiteCourseId = prerequisiteCourseEntity
        ? prerequisiteCourseEntity.id
        : null;
    }

    try {
      await this.curriculumCourseRepository.save(curriculumCourseToUpdate);
      return this.findCurriculumCourseByIdOrThrow(id, [
        'curriculum',
        'course',
        'semester',
        'prerequisiteCourse',
      ]);
    } catch (error) {
      console.error('Lỗi khi cập nhật Curriculum-Course:', error);
      throw new BadRequestException('Không thể cập nhật Curriculum-Course.');
    }
  }

  /**
   * Xóa một môn học khỏi chương trình đào tạo.
   * @param id - ID của liên kết CurriculumCourse cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy.
   * @throws BadRequestException nếu môn này đang là tiên quyết cho môn khác trong cùng CTĐT.
   */
  async remove(id: number): Promise<void> {
    const curriculumCourseToRemove =
      await this.findCurriculumCourseByIdOrThrow(id);
    const { courseId: removedCourseId, curriculumId: removedCurriculumId } =
      curriculumCourseToRemove;

    const dependentCount = await this.curriculumCourseRepository.count({
      where: {
        curriculumId: removedCurriculumId,
        prerequisiteCourseId: removedCourseId,
      },
    });

    if (dependentCount > 0) {
      throw new BadRequestException(
        `Không thể xóa môn học ID ${removedCourseId} khỏi CTĐT ID ${removedCurriculumId} vì đang là tiên quyết cho ${dependentCount} môn học khác trong cùng CTĐT.`,
      );
    }

    await this.curriculumCourseRepository.remove(curriculumCourseToRemove);
  }
}
