import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { MajorEntity } from './entities/major.entity';
import { CreateMajorDto } from './dtos/createMajor.dto';
import { UpdateMajorDto } from './dtos/updateMajor.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { DepartmentService } from '../department/department.service';
import { StudentService } from '../student/student.service';
import { ClassService } from '../class/class.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { CourseMajorService } from '../course_major/course_major.service';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(MajorEntity)
    private readonly majorRepository: Repository<MajorEntity>,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => ClassService))
    private readonly classService: ClassService,
    private readonly curriculumService: CurriculumService,
    private readonly courseMajorService: CourseMajorService,
  ) {}

  /**
   * Helper: Tìm Ngành học theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của Ngành học.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<MajorEntity> - Ngành học tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number, relations?: string[]): Promise<MajorEntity> {
    const relationsToLoad = relations ?? ['department'];
    const major = await this.majorRepository.findOne({
      where: { id },
      relations: relationsToLoad,
    });
    if (!major) {
      throw new NotFoundException(`Không tìm thấy Ngành học với ID ${id}`);
    }
    return major;
  }

  /**
   * Helper: Kiểm tra trùng lặp tên Ngành học.
   * @param name - Tên Ngành học cần kiểm tra.
   * @param excludeId - (Optional) ID Ngành học cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu tên đã tồn tại.
   */
  private async checkNameConflict(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<MajorEntity> = { name };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.majorRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(`Tên Ngành học '${name}' đã tồn tại.`);
    }
  }

  /**
   * Tạo một Ngành học mới.
   * @param createMajorDto - Dữ liệu tạo Ngành học.
   * @returns Promise<MajorEntity> - Ngành học vừa tạo.
   * @throws NotFoundException nếu Department không tồn tại.
   * @throws ConflictException nếu tên Ngành học bị trùng.
   */
  async create(createMajorDto: CreateMajorDto): Promise<MajorEntity> {
    const { departmentId, name } = createMajorDto;

    await this.departmentService.findOne(departmentId);

    await this.checkNameConflict(name);

    try {
      const major = this.majorRepository.create({ ...createMajorDto });
      const saved = await this.majorRepository.save(major);
      return this.findOne(saved.id, ['department']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Tên Ngành học '${name}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi tạo Ngành học:', error);
      throw new BadRequestException('Không thể tạo Ngành học.');
    }
  }

  /**
   * Lấy danh sách Ngành học .
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: MajorEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: MajorEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    // const where: FindOptionsWhere<MajorEntity> = {};

    const [data, total] = await this.majorRepository.findAndCount({
      // where,
      relations: ['department'],

      skip: (page - 1) * limit,
      take: limit,
      order: { departmentId: 'ASC', name: 'ASC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Cập nhật thông tin một Ngành học.
   * @param id - ID Ngành học cần cập nhật.
   * @param updateMajorDto - Dữ liệu cập nhật.
   * @returns Promise<MajorEntity> - Ngành học sau khi cập nhật.
   * @throws NotFoundException nếu Ngành học hoặc Department mới không tồn tại.
   * @throws ConflictException nếu tên Ngành học mới bị trùng.
   */
  async update(
    id: number,
    updateMajorDto: UpdateMajorDto,
  ): Promise<MajorEntity> {
    const majorToUpdate = await this.majorRepository.preload({
      id: id,
      ...updateMajorDto,

      ...(updateMajorDto.departmentId && {
        department: { id: updateMajorDto.departmentId },
      }),
    });

    if (!majorToUpdate) {
      throw new NotFoundException(`Không tìm thấy Ngành học với ID ${id}`);
    }

    const originalMajor = await this.findOne(id);

    if (
      updateMajorDto.departmentId &&
      updateMajorDto.departmentId !== originalMajor.departmentId
    ) {
      await this.departmentService.findOne(updateMajorDto.departmentId);
      majorToUpdate.departmentId = updateMajorDto.departmentId;
    }

    if (updateMajorDto.name && updateMajorDto.name !== originalMajor.name) {
      await this.checkNameConflict(updateMajorDto.name, id);
    }

    try {
      await this.majorRepository.save(majorToUpdate);
      return this.findOne(id, ['department']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Tên Ngành học '${majorToUpdate.name}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi cập nhật Ngành học:', error);
      throw new BadRequestException('Không thể cập nhật Ngành học.');
    }
  }

  /**
   * Xóa một Ngành học.
   * @param id - ID Ngành học cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy.
   * @throws BadRequestException nếu còn liên kết (Sinh viên, Lớp, CTĐT, Môn học).
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const student = await this.studentService.getOne({ majorId: id });
    if (student) {
      throw new BadRequestException(
        `Không thể xóa Ngành học ID ${id} vì còn sinh viên.`,
      );
    }

    const classExist = await this.classService.getOne({ majorId: id });
    if (classExist) {
      throw new BadRequestException(
        `Không thể xóa Ngành học ID ${id} vì còn lớp học.`,
      );
    }

    const curriculum = await this.curriculumService.getOne({
      majorId: id,
    });
    if (curriculum) {
      throw new BadRequestException(
        `Không thể xóa Ngành học ID ${id} vì còn chương trình đào tạo.`,
      );
    }

    const courseMajor = await this.courseMajorService.getOne({
      majorId: id,
    });

    if (courseMajor) {
      throw new BadRequestException(
        `Không thể xóa Ngành học ID ${id} vì còn môn học được liên kết.`,
      );
    }

    await this.majorRepository.delete(id);
  }

  async getMajorCountByDepartmentId(departmentId: number): Promise<number> {
    const majorCount = await this.majorRepository.count({
      where: { departmentId: departmentId },
    });
    return majorCount;
  }
}
