import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { SemesterEntity } from './entities/semester.entity';
import { CreateSemesterDto } from './dtos/createSemester.dto';
import { UpdateSemesterDto } from './dtos/updateSemester.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(SemesterEntity)
    private semesterRepository: Repository<SemesterEntity>,
  ) {}

  /**
   * Tạo một học kỳ mới.
   * @param createSemesterDto - Dữ liệu để tạo học kỳ mới.
   * @returns Promise<SemesterEntity> - Học kỳ vừa được tạo.
   * @throws ConflictException - Nếu mã học kỳ đã tồn tại.
   */
  async create(createSemesterDto: CreateSemesterDto): Promise<SemesterEntity> {
    const existingSemester = await this.semesterRepository.findOne({
      where: { semesterCode: createSemesterDto.semesterCode },
    });
    if (existingSemester) {
      throw new ConflictException(
        `Mã học kỳ '${createSemesterDto.semesterCode}' đã tồn tại.`,
      );
    }

    const semester = this.semesterRepository.create(createSemesterDto);
    return this.semesterRepository.save(semester);
  }

  /**
   * Lấy danh sách các học kỳ có phân trang.
   * Bao gồm thông tin liên quan: courseSemesters, registrationSchedules, studyPlans, curriculumCourses.
   * @param paginationDto - DTO chứa thông tin phân trang (page, limit).
   * @returns Promise<{ data: SemesterEntity[]; meta: MetaDataInterface }> - Danh sách học kỳ và metadata phân trang.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: SemesterEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.semesterRepository.findAndCount({
      relations: [
        'courseSemesters',
        'registrationSchedules',
        'studyPlans',
        'curriculumCourses',
      ],
      order: {
        startYear: 'DESC',
        term: 'DESC',
      },
      // Phân trang
      skip: (page - 1) * limit,
      take: limit,
      // where: { ... }
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Tìm một học kỳ cụ thể bằng ID.
   * Bao gồm thông tin liên quan: courseSemesters, registrationSchedules, studyPlans, curriculumCourses.
   * @param id - ID của học kỳ cần tìm.
   * @returns Promise<SemesterEntity> - Thông tin chi tiết của học kỳ.
   * @throws NotFoundException - Nếu không tìm thấy học kỳ với ID cung cấp.
   */
  async findOne(
    id: number,
    relations?: FindOptionsRelations<SemesterEntity>,
  ): Promise<SemesterEntity> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: relations,
    });

    if (!semester) {
      throw new NotFoundException(`Không tìm thấy học kỳ với ID ${id}`);
    }
    return semester;
  }

  /**
   * Cập nhật thông tin một học kỳ.
   * (Giữ nguyên logic, không cần QueryBuilder ở đây)
   * @param id - ID của học kỳ cần cập nhật.
   * @param updateSemesterDto - Dữ liệu cần cập nhật.
   * @returns Promise<SemesterEntity> - Thông tin học kỳ sau khi cập nhật.
   * @throws NotFoundException - Nếu không tìm thấy học kỳ với ID cung cấp.
   * @throws ConflictException - Nếu cố gắng cập nhật mã học kỳ thành mã đã tồn tại (cho học kỳ khác).
   */
  async update(
    id: number,
    updateSemesterDto: UpdateSemesterDto,
  ): Promise<SemesterEntity> {
    if (updateSemesterDto.semesterCode) {
      const existingSemester = await this.semesterRepository.findOne({
        where: { semesterCode: updateSemesterDto.semesterCode },
      });
      if (existingSemester && existingSemester.id !== id) {
        throw new ConflictException(
          `Mã học kỳ '${updateSemesterDto.semesterCode}' đã được sử dụng bởi học kỳ khác.`,
        );
      }
    }

    const semester = await this.semesterRepository.preload({
      id: id,
      ...updateSemesterDto,
    });

    if (!semester) {
      throw new NotFoundException(
        `Không tìm thấy học kỳ với ID ${id} để cập nhật.`,
      );
    }

    return this.semesterRepository.save(semester);
  }

  /**
   * Xóa một học kỳ.
   * Kiểm tra các ràng buộc dữ liệu liên quan trước khi xóa.
   * @param id - ID của học kỳ cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException - Nếu không tìm thấy học kỳ với ID cung cấp.
   * @throws ConflictException - Nếu học kỳ còn dữ liệu liên quan không thể xóa.
   */
  async remove(id: number): Promise<void> {
    const semester = await this.findOne(id);

    if (
      semester.registrationSchedules &&
      semester.registrationSchedules.length > 0
    ) {
      throw new ConflictException(
        `Không thể xóa học kỳ ID ${id} vì còn Lịch đăng ký tín chỉ liên kết.`,
      );
    }
    if (semester.studyPlans && semester.studyPlans.length > 0) {
      throw new ConflictException(
        `Không thể xóa học kỳ ID ${id} vì còn Kế hoạch học tập liên kết.`,
      );
    }
    if (semester.curriculumCourses && semester.curriculumCourses.length > 0) {
      throw new ConflictException(
        `Không thể xóa học kỳ ID ${id} vì còn Môn học trong chương trình đào tạo liên kết.`,
      );
    }

    await this.semesterRepository.delete(id);
  }
}
