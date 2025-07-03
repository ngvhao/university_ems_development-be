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
  Repository,
  FindOptionsWhere,
  Not,
  FindOptionsRelations,
} from 'typeorm';
import { CreateDepartmentDto } from './dtos/createDepartment.dto';
import { DepartmentEntity } from './entities/department.entity';
import { UpdateDepartmentDto } from './dtos/updateDepartment.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { FacultyService } from '../faculty/faculty.service';
import { LecturerService } from '../lecturer/lecturer.service';
import { MajorService } from '../major/major.service';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @Inject(forwardRef(() => FacultyService))
    private readonly facultyService: FacultyService,
    private readonly lecturerService: LecturerService,
    @Inject(forwardRef(() => MajorService))
    private readonly majorService: MajorService,
  ) {}

  /**
   * Helper: Tìm Khoa/Bộ môn theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của Department.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<DepartmentEntity> - Department tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findDepartmentByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations,
    });
    if (!department) {
      throw new NotFoundException(`Không tìm thấy Khoa/Bộ môn với ID ${id}`);
    }
    return department;
  }

  /**
   * Helper: Kiểm tra trùng lặp mã Khoa/Bộ môn.
   * @param departmentCode - Mã cần kiểm tra.
   * @param excludeId - (Optional) ID cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu mã đã tồn tại.
   */
  private async checkDepartmentCodeConflict(
    departmentCode: string,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<DepartmentEntity> = { departmentCode };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.departmentRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(
        `Mã Khoa/Bộ môn '${departmentCode}' đã tồn tại.`,
      );
    }
  }

  /**
   * Tạo một Khoa/Bộ môn mới.
   * @param createDepartmentDto - Dữ liệu tạo mới.
   * @returns Promise<DepartmentEntity> - Department vừa tạo.
   * @throws NotFoundException nếu Faculty không tồn tại.
   * @throws ConflictException nếu departmentCode bị trùng.
   */
  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const { facultyId, departmentCode, ...restData } = createDepartmentDto;
    await this.facultyService.findOne(facultyId);

    await this.checkDepartmentCodeConflict(departmentCode);

    // ạo entity và lưu
    try {
      const department = this.departmentRepository.create({
        ...restData,
        departmentCode,
        facultyId: facultyId,
      });
      const saved = await this.departmentRepository.save(department);
      return this.findDepartmentByIdOrThrow(saved.id, ['faculty']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Mã Khoa/Bộ môn '${departmentCode}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi tạo Khoa/Bộ môn:', error);
      throw new BadRequestException('Không thể tạo Khoa/Bộ môn.');
    }
  }

  /**
   * Lấy danh sách Khoa/Bộ môn (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: DepartmentEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
    facultyId?: number,
  ): Promise<{ data: DepartmentEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const where: FindOptionsWhere<DepartmentEntity> = { facultyId };

    const [data, total] = await this.departmentRepository.findAndCount({
      where,
      relations: {
        faculty: true,
        lecturers: {
          user: true,
        },
        majors: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { facultyId: 'ASC', name: 'ASC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một Khoa/Bộ môn theo ID.
   * @param id - ID của Department.
   * @returns Promise<DepartmentEntity> - Thông tin chi tiết.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<DepartmentEntity> {
    return this.findDepartmentByIdOrThrow(id, [
      'faculty',
      'lecturers',
      'majors',
    ]);
  }

  /**
   * Cập nhật thông tin một Khoa/Bộ môn.
   * @param id - ID của Department cần cập nhật.
   * @param updateDepartmentDto - Dữ liệu cập nhật.
   * @returns Promise<DepartmentEntity> - Department sau khi cập nhật.
   * @throws NotFoundException nếu Department hoặc Faculty mới không tồn tại.
   * @throws ConflictException nếu departmentCode mới bị trùng.
   */
  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const departmentToUpdate = await this.departmentRepository.preload({
      id: id,
      ...updateDepartmentDto,
      ...(updateDepartmentDto.facultyId && {
        faculty: { id: updateDepartmentDto.facultyId },
      }),
    });

    if (!departmentToUpdate) {
      throw new NotFoundException(`Không tìm thấy Khoa/Bộ môn với ID ${id}`);
    }
    const originalDepartment = await this.findDepartmentByIdOrThrow(id);

    // Validate Faculty mới
    if (
      updateDepartmentDto.facultyId &&
      updateDepartmentDto.facultyId !== originalDepartment.facultyId
    ) {
      await this.facultyService.findOne(updateDepartmentDto.facultyId);
      departmentToUpdate.facultyId = updateDepartmentDto.facultyId;
    }

    // heck conflict departmentCode nếu thay đổi
    if (
      updateDepartmentDto.departmentCode &&
      updateDepartmentDto.departmentCode !== originalDepartment.departmentCode
    ) {
      await this.checkDepartmentCodeConflict(
        updateDepartmentDto.departmentCode,
        id,
      );
    }

    // Lưu thay đổi
    try {
      await this.departmentRepository.save(departmentToUpdate);
      return this.findDepartmentByIdOrThrow(id, ['faculty']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Mã Khoa/Bộ môn '${departmentToUpdate.departmentCode}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi cập nhật Khoa/Bộ môn:', error);
      throw new BadRequestException('Không thể cập nhật Khoa/Bộ môn.');
    }
  }

  /**
   * Xóa một Khoa/Bộ môn.
   * @param id - ID của Department cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy.
   * @throws BadRequestException nếu còn Giảng viên hoặc Ngành học liên kết.
   */
  async remove(id: number): Promise<void> {
    await this.findDepartmentByIdOrThrow(id);

    const lecturerCount =
      await this.lecturerService.getLecturerCountByDepartmentId(id);
    if (lecturerCount > 0) {
      throw new BadRequestException(
        `Không thể xóa Khoa/Bộ môn ID ${id} vì còn ${lecturerCount} giảng viên liên kết.`,
      );
    }

    const majorCount = await this.majorService.getMajorCountByDepartmentId(id);
    if (majorCount > 0) {
      throw new BadRequestException(
        `Không thể xóa Khoa/Bộ môn ID ${id} vì còn ${majorCount} ngành học liên kết.`,
      );
    }
    await this.departmentRepository.delete(id);
  }

  async getOne(
    condition:
      | FindOptionsWhere<DepartmentEntity>
      | FindOptionsWhere<DepartmentEntity>[],
    relations?: FindOptionsRelations<DepartmentEntity>,
  ): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findOne({
      where: condition,
      relations: relations,
    });
    return department;
  }
}
