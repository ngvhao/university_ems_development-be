import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CourseFacultyEntity } from './entities/course_faculty.entity';
import { CreateCourseFacultyDto } from './dtos/createCourseFaculty.dto';
import { UpdateCourseFacultyDto } from './dtos/updateCourseFaculty.dto';
import { FilterCourseFacultyDto } from './dtos/filterCourseFaculty.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { CourseService } from '../course/course.service';
import { FacultyService } from '../faculty/faculty.service';

@Injectable()
export class CourseFacultyService {
  constructor(
    @InjectRepository(CourseFacultyEntity)
    private readonly courseFacultyRepository: Repository<CourseFacultyEntity>,
    private readonly courseService: CourseService,
    private readonly facultyService: FacultyService,
  ) {}

  /**
   * Helper: Tìm course_faculty theo ID, ném NotFoundException nếu không tồn tại.
   * @param id - ID course_faculty cần tìm.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<CourseFacultyEntity> - Course_faculty tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findCourseFacultyByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<CourseFacultyEntity> {
    const courseFaculty = await this.courseFacultyRepository.findOne({
      where: { id },
      relations,
    });
    if (!courseFaculty) {
      throw new NotFoundException(`Không tìm thấy mối quan hệ với ID ${id}`);
    }
    return courseFaculty;
  }

  /**
   * Helper: Kiểm tra trùng lặp course-faculty.
   * @param courseId - ID môn học.
   * @param facultyId - ID khoa.
   * @param excludeId - (Optional) ID cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu đã tồn tại.
   */
  private async checkCourseFacultyConflict(
    courseId: number,
    facultyId: number,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<CourseFacultyEntity> = {
      courseId,
      facultyId,
    };
    if (excludeId) {
      where.id = excludeId;
    }
    const existing = await this.courseFacultyRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(
        `Mối quan hệ giữa môn học ${courseId} và khoa ${facultyId} đã tồn tại.`,
      );
    }
  }

  /**
   * Tạo mối quan hệ course-faculty mới.
   * @param createCourseFacultyDto - Dữ liệu tạo mối quan hệ.
   * @returns Promise<CourseFacultyEntity> - Mối quan hệ vừa được tạo.
   * @throws ConflictException nếu mối quan hệ đã tồn tại.
   * @throws NotFoundException nếu course hoặc faculty không tồn tại.
   */
  async create(
    createCourseFacultyDto: CreateCourseFacultyDto,
  ): Promise<CourseFacultyEntity> {
    const { courseId, facultyId, ...restData } = createCourseFacultyDto;

    // 1. Kiểm tra môn học và khoa có tồn tại không
    await this.courseService.findOne(courseId);
    await this.facultyService.findOne(facultyId);

    // 2. Kiểm tra trùng lặp mối quan hệ
    await this.checkCourseFacultyConflict(courseId, facultyId);

    // 3. Tạo entity mới
    try {
      const courseFaculty = this.courseFacultyRepository.create({
        ...restData,
        courseId,
        facultyId,
      });
      return await this.courseFacultyRepository.save(courseFaculty);
    } catch (error) {
      console.error('Lỗi khi tạo mối quan hệ course-faculty:', error);
      throw new BadRequestException(
        'Không thể tạo mối quan hệ, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Lấy danh sách mối quan hệ course-faculty (có phân trang và filter).
   * @param filterDto - Thông tin filter và phân trang.
   * @returns Promise<{ data: CourseFacultyEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    filterDto: FilterCourseFacultyDto,
  ): Promise<{ data: CourseFacultyEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10, courseId, facultyId, isPrimary } = filterDto;

    const where: FindOptionsWhere<CourseFacultyEntity> = {};
    if (courseId) where.courseId = courseId;
    if (facultyId) where.facultyId = facultyId;
    if (isPrimary !== undefined) where.isPrimary = isPrimary;

    const [data, total] = await this.courseFacultyRepository.findAndCount({
      where,
      relations: ['course', 'faculty'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một mối quan hệ course-faculty theo ID.
   * @param id - ID mối quan hệ.
   * @returns Promise<CourseFacultyEntity> - Thông tin chi tiết mối quan hệ.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<CourseFacultyEntity> {
    return this.findCourseFacultyByIdOrThrow(id, ['course', 'faculty']);
  }

  /**
   * Cập nhật thông tin một mối quan hệ course-faculty.
   * @param id - ID mối quan hệ cần cập nhật.
   * @param updateCourseFacultyDto - Dữ liệu cập nhật.
   * @returns Promise<CourseFacultyEntity> - Mối quan hệ sau khi cập nhật.
   * @throws NotFoundException nếu mối quan hệ không tồn tại.
   * @throws ConflictException nếu mối quan hệ mới bị trùng.
   */
  async update(
    id: number,
    updateCourseFacultyDto: UpdateCourseFacultyDto,
  ): Promise<CourseFacultyEntity> {
    const existingCourseFaculty = await this.findCourseFacultyByIdOrThrow(id);

    // Kiểm tra course và faculty mới có tồn tại không (nếu có thay đổi)
    if (updateCourseFacultyDto.courseId) {
      await this.courseService.findOne(updateCourseFacultyDto.courseId);
    }
    if (updateCourseFacultyDto.facultyId) {
      await this.facultyService.findOne(updateCourseFacultyDto.facultyId);
    }

    // Kiểm tra trùng lặp mối quan hệ mới (nếu có thay đổi courseId hoặc facultyId)
    if (updateCourseFacultyDto.courseId || updateCourseFacultyDto.facultyId) {
      const newCourseId =
        updateCourseFacultyDto.courseId || existingCourseFaculty.courseId;
      const newFacultyId =
        updateCourseFacultyDto.facultyId || existingCourseFaculty.facultyId;

      if (
        newCourseId !== existingCourseFaculty.courseId ||
        newFacultyId !== existingCourseFaculty.facultyId
      ) {
        await this.checkCourseFacultyConflict(newCourseId, newFacultyId, id);
      }
    }

    try {
      const courseFacultyToUpdate = await this.courseFacultyRepository.preload({
        id: id,
        ...updateCourseFacultyDto,
      });

      if (!courseFacultyToUpdate) {
        throw new NotFoundException(`Không tìm thấy mối quan hệ với ID ${id}`);
      }

      return await this.courseFacultyRepository.save(courseFacultyToUpdate);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Mối quan hệ có thể đã tồn tại.');
      }
      console.error('Lỗi khi cập nhật mối quan hệ course-faculty:', error);
      throw new BadRequestException(
        'Không thể cập nhật mối quan hệ, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Xóa một mối quan hệ course-faculty.
   * @param id - ID mối quan hệ cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy mối quan hệ.
   */
  async remove(id: number): Promise<void> {
    await this.findCourseFacultyByIdOrThrow(id);

    const result = await this.courseFacultyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy mối quan hệ với ID ${id} để xóa.`,
      );
    }
  }
}
