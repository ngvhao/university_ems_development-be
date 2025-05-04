// src/modules/course/course.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { CourseEntity } from './entities/course.entity';
import { CreateCourseDto } from './dtos/createCourse.dto';
import { UpdateCourseDto } from './dtos/updateCourse.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  /**
   * Helper: Tìm môn học theo ID, ném NotFoundException nếu không tồn tại.
   * @param id - ID môn học cần tìm.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<CourseEntity> - Môn học tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findCourseByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations,
    });
    if (!course) {
      throw new NotFoundException(`Không tìm thấy Môn học với ID ${id}`);
    }
    return course;
  }

  /**
   * Helper: Kiểm tra trùng lặp mã môn học.
   * @param courseCode - Mã môn học cần kiểm tra.
   * @param excludeId - (Optional) ID môn học cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu mã môn học đã tồn tại.
   */
  private async checkCourseCodeConflict(
    courseCode: string,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<CourseEntity> = { courseCode };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.courseRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(`Mã môn học '${courseCode}' đã tồn tại.`);
    }
  }

  /**
   * Tạo một môn học mới.
   * @param createCourseDto - Dữ liệu tạo môn học.
   * @returns Promise<CourseEntity> - Môn học vừa được tạo.
   * @throws ConflictException nếu mã môn học bị trùng.
   */
  async create(createCourseDto: CreateCourseDto): Promise<CourseEntity> {
    const { courseCode, ...restData } = createCourseDto;

    // 1. Kiểm tra trùng mã môn học
    await this.checkCourseCodeConflict(courseCode);

    // 2. Tạo entity mới
    try {
      const course = this.courseRepository.create({
        ...restData,
        courseCode,
      });
      return await this.courseRepository.save(course);
    } catch (error) {
      console.error('Lỗi khi tạo môn học:', error);
      throw new BadRequestException(
        'Không thể tạo môn học, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Lấy danh sách môn học (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: CourseEntity[]; meta: MetaDataInterface }> - Danh sách môn học và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: CourseEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.courseRepository.findAndCount({
      relations: ['courseMajors', 'courseMajors.major'],
      skip: (page - 1) * limit,
      take: limit,
      order: { courseCode: 'ASC' },
    });
    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một môn học theo ID.
   * @param id - ID môn học.
   * @returns Promise<CourseEntity> - Thông tin chi tiết môn học.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<CourseEntity> {
    return this.findCourseByIdOrThrow(id, [
      'courseMajors',
      'courseMajors.major',
      'courseSemesters',
    ]);
  }

  /**
   * Cập nhật thông tin một môn học.
   * @param id - ID môn học cần cập nhật.
   * @param updateCourseDto - Dữ liệu cập nhật.
   * @returns Promise<CourseEntity> - Môn học sau khi cập nhật.
   * @throws NotFoundException nếu môn học không tồn tại.
   * @throws ConflictException nếu mã môn học mới bị trùng.
   */
  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseEntity> {
    const courseToUpdate = await this.courseRepository.preload({
      id: id,
      ...updateCourseDto,
    });

    if (!courseToUpdate) {
      throw new NotFoundException(`Không tìm thấy Môn học với ID ${id}`);
    }

    const originalCourse = await this.findCourseByIdOrThrow(id);

    // Kiểm tra trùng mã môn học nếu thay đổi
    if (
      updateCourseDto.courseCode &&
      updateCourseDto.courseCode !== originalCourse.courseCode
    ) {
      await this.checkCourseCodeConflict(updateCourseDto.courseCode, id);
    }

    try {
      return await this.courseRepository.save(courseToUpdate);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Mã môn học '${courseToUpdate.courseCode}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi cập nhật môn học:', error);
      throw new BadRequestException(
        'Không thể cập nhật môn học, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Xóa một môn học.
   * @param id - ID môn học cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy môn học.
   * @throws BadRequestException nếu môn học đang được sử dụng.
   */
  async remove(id: number): Promise<void> {
    const course = await this.findCourseByIdOrThrow(id, [
      'courseSemesters',
      'curriculumCourses',
      'studyPlans',
      'courseMajors',
    ]);

    if (course.courseSemesters?.length > 0) {
      throw new BadRequestException(
        `Không thể xóa môn học ID ${id} vì đang được mở trong ${course.courseSemesters.length} học kỳ.`,
      );
    }
    if (course.curriculumCourses?.length > 0) {
      throw new BadRequestException(
        `Không thể xóa môn học ID ${id} vì đang có trong ${course.curriculumCourses.length} chương trình đào tạo.`,
      );
    }
    if (course.studyPlans?.length > 0) {
      throw new BadRequestException(
        `Không thể xóa môn học ID ${id} vì đang có trong ${course.studyPlans.length} kế hoạch học tập.`,
      );
    }
    if (course.courseMajors?.length > 0) {
      throw new BadRequestException(
        `Không thể xóa môn học ID ${id} vì đang thuộc ${course.courseMajors.length} ngành học.`,
      );
    }

    const result = await this.courseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy Môn học với ID ${id} để xóa.`,
      );
    }
  }
}
