import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { LecturerCourseEntity } from './entities/lecturer_course.entity';
import { CreateLecturerCourseDto } from './dto/createLecturerCourse.dto';
import { CourseService } from '../course/course.service';
import { FilterLecturerCourseDto } from './dto/filterLecturerCourse.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { LecturerService } from '../lecturer/lecturer.service';

@Injectable()
export class LecturerCourseService {
  constructor(
    @InjectRepository(LecturerCourseEntity)
    private readonly lecturerCourseRepository: Repository<LecturerCourseEntity>,
    private readonly lectureService: LecturerService,
    private readonly courseService: CourseService,
  ) {}

  /**
   * Phân công một giảng viên dạy một học phần.
   * @param dto - Dữ liệu phân công bao gồm lecturerId và courseId.
   * @returns Promise<LecturerCourseEntity> - Bản ghi phân công vừa được tạo.
   * @throws NotFoundException - Nếu không tìm thấy Giảng viên hoặc Học phần.
   * @throws ConflictException - Nếu phân công này đã tồn tại.
   */
  async assign(dto: CreateLecturerCourseDto): Promise<LecturerCourseEntity> {
    const { lecturerId, courseId } = dto;

    const lecturer = await this.lectureService.findOne(lecturerId);
    if (!lecturer) {
      throw new NotFoundException(
        `Không tìm thấy Giảng viên với ID ${lecturerId}.`,
      );
    }

    const course = await this.courseService.findOne(courseId);
    if (!course) {
      throw new NotFoundException(
        `Không tìm thấy Học phần với ID ${courseId}.`,
      );
    }

    const existingAssignment = await this.lecturerCourseRepository.findOneBy({
      lecturerId,
      courseId,
    });
    if (existingAssignment) {
      throw new ConflictException(
        `Giảng viên (ID: ${lecturerId}) đã được phân công cho Học phần (ID: ${courseId}) này rồi.`,
      );
    }

    const newAssignment = this.lecturerCourseRepository.create({
      lecturerId,
      courseId,
    });

    try {
      return await this.lecturerCourseRepository.save(newAssignment);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Phân công này đã tồn tại (lỗi ràng buộc duy nhất).`,
        );
      }
      console.error('Lỗi khi lưu phân công giảng dạy:', error);
      throw new BadRequestException('Không thể tạo phân công giảng dạy.');
    }
  }

  /**
   * Lấy danh sách tất cả các phân công giảng dạy, có thể lọc theo lecturerId và/hoặc courseId.
   * Bao gồm thông tin chi tiết của Giảng viên và Học phần liên quan.
   * @param filterDto - DTO chứa các tiêu chí lọc (lecturerId, courseId) và phân trang (nếu có).
   * @returns Promise<{ data: LecturerCourseEntity[]; meta?: MetaDataInterface }> - Danh sách phân công và metadata (nếu có phân trang).
   */
  async findAll(
    filterDto: FilterLecturerCourseDto,
  ): Promise<{ data: LecturerCourseEntity[]; meta?: MetaDataInterface }> {
    const { lecturerId, courseId, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<LecturerCourseEntity> = {};
    if (lecturerId) {
      where.lecturerId = lecturerId;
    }
    if (courseId) {
      where.courseId = courseId;
    }

    const queryBuilder = this.lecturerCourseRepository
      .createQueryBuilder('lc')
      .leftJoin('lc.lecturer', 'lecturer')
      .leftJoin('lecturer.user', 'user')
      .leftJoinAndSelect('lc.course', 'course')
      .select([
        'lc.id',
        'lc.lecturerId',
        'lc.courseId',
        'lc.createdAt',
        'lecturer.id',
        'lecturer.lecturerCode',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.universityEmail',
        'course.id',
        'course.courseCode',
        'course.name',
        'course.credits',
      ])
      .where(where);

    queryBuilder.orderBy('lc.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findLecturersByCourseId(courseId: number): Promise<number[]> {
    const lecturerCourses = await this.lecturerCourseRepository.find({
      where: { courseId },
      select: ['lecturerId'],
    });

    return lecturerCourses.map((lc) => lc.lecturerId);
  }

  /**
   * Lấy một bản ghi phân công cụ thể bằng ID.
   * @param id - ID của bản ghi phân công.
   * @returns Promise<LecturerCourseEntity> - Thông tin chi tiết bản ghi phân công.
   * @throws NotFoundException - Nếu không tìm thấy bản ghi.
   */
  async findOneById(id: number): Promise<LecturerCourseEntity> {
    const assignment = await this.lecturerCourseRepository
      .createQueryBuilder('lc')
      .leftJoin('lc.lecturer', 'lecturer')
      .leftJoin('lecturer.user', 'user')
      .leftJoinAndSelect('lc.course', 'course')
      .select([
        'lc.id',
        'lc.lecturerId',
        'lc.courseId',
        'lc.createdAt',
        'lecturer.id',
        'lecturer.lecturerCode',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.universityEmail',
        'course.id',
        'course.courseCode',
        'course.name',
        'course.credits',
      ])
      .where('lc.id = :id', { id })
      .getOne();

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy phân công với ID ${id}.`);
    }
    return assignment;
  }

  /**
   * Xóa một bản ghi phân công giảng dạy.
   * @param id - ID của bản ghi phân công cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException - Nếu không tìm thấy bản ghi phân công.
   */
  async remove(id: number): Promise<void> {
    const assignment = await this.lecturerCourseRepository.findOneBy({ id });
    if (!assignment) {
      throw new NotFoundException(
        `Không tìm thấy phân công với ID ${id} để xóa.`,
      );
    }
    await this.lecturerCourseRepository.delete(id);
  }
}
