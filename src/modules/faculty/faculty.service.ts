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
import { FacultyEntity } from './entities/faculty.entity';
import { CreateFacultyDto } from './dtos/createFaculty.dto';
import { UpdateFacultyDto } from './dtos/updateFaculty.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { DepartmentService } from '../department/department.service';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(FacultyEntity)
    private readonly facultyRepository: Repository<FacultyEntity>,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
  ) {}

  /**
   * Helper: Tìm Khoa theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của Khoa.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<FacultyEntity> - Khoa tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findFacultyByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<FacultyEntity> {
    const faculty = await this.facultyRepository.findOne({
      where: { id },
      relations,
    });
    if (!faculty) {
      throw new NotFoundException(`Không tìm thấy Khoa với ID ${id}`);
    }
    return faculty;
  }

  /**
   * Helper: Kiểm tra trùng lặp mã Khoa.
   * @param facultyCode - Mã Khoa cần kiểm tra.
   * @param excludeId - (Optional) ID Khoa cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu mã đã tồn tại.
   */
  private async checkFacultyCodeConflict(
    facultyCode: string,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<FacultyEntity> = { facultyCode };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.facultyRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(`Mã Khoa '${facultyCode}' đã tồn tại.`);
    }
  }

  /**
   * Tạo một Khoa mới.
   * @param createFacultyDto - Dữ liệu tạo Khoa.
   * @returns Promise<FacultyEntity> - Khoa vừa tạo.
   * @throws ConflictException nếu mã Khoa bị trùng.
   */
  async create(createFacultyDto: CreateFacultyDto): Promise<FacultyEntity> {
    const { facultyCode } = createFacultyDto;

    await this.checkFacultyCodeConflict(facultyCode);

    try {
      const faculty = this.facultyRepository.create(createFacultyDto);
      return await this.facultyRepository.save(faculty);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Mã Khoa '${facultyCode}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi tạo Khoa:', error);
      throw new BadRequestException('Không thể tạo Khoa.');
    }
  }

  /**
   * Lấy danh sách Khoa (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: FacultyEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
    facultyCode?: string,
  ): Promise<{ data: FacultyEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const where: FindOptionsWhere<FacultyEntity> = { facultyCode };

    const [data, total] = await this.facultyRepository.findAndCount({
      where,
      loadRelationIds: { relations: ['departments'] },
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một Khoa theo ID.
   * @param id - ID của Khoa.
   * @returns Promise<FacultyEntity> - Thông tin chi tiết.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<FacultyEntity> {
    return this.findFacultyByIdOrThrow(id, [
      'departments',
      'registrationSchedules',
    ]);
  }

  /**
   * Cập nhật thông tin một Khoa.
   * @param id - ID Khoa cần cập nhật.
   * @param updateFacultyDto - Dữ liệu cập nhật.
   * @returns Promise<FacultyEntity> - Khoa sau khi cập nhật.
   * @throws NotFoundException nếu Khoa không tồn tại.
   * @throws ConflictException nếu mã Khoa mới bị trùng.
   */
  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<FacultyEntity> {
    const facultyToUpdate = await this.facultyRepository.preload({
      id: id,
      ...updateFacultyDto,
    });

    if (!facultyToUpdate) {
      throw new NotFoundException(`Không tìm thấy Khoa với ID ${id}`);
    }

    const originalFaculty = await this.findFacultyByIdOrThrow(id);
    if (
      updateFacultyDto.facultyCode &&
      updateFacultyDto.facultyCode !== originalFaculty.facultyCode
    ) {
      await this.checkFacultyCodeConflict(updateFacultyDto.facultyCode, id);
    }

    try {
      return await this.facultyRepository.save(facultyToUpdate);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Mã Khoa '${facultyToUpdate.facultyCode}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi cập nhật Khoa:', error);
      throw new BadRequestException('Không thể cập nhật Khoa.');
    }
  }

  /**
   * Xóa một Khoa.
   * @param id - ID Khoa cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy Khoa.
   * @throws BadRequestException nếu còn Khoa/Bộ môn trực thuộc.
   */
  async remove(id: number): Promise<void> {
    await this.findFacultyByIdOrThrow(id);

    const department = await this.departmentService.getOne({ facultyId: id });
    if (department) {
      throw new BadRequestException(
        `Không thể xóa Khoa ID ${id} vì còn Bộ môn trực thuộc.`,
      );
    }
    await this.facultyRepository.delete(id);
  }
}
