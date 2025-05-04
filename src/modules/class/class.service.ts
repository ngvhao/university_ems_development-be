import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ClassEntity } from './entities/class.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsRelations } from 'typeorm';
import { UpdateClassDto } from './dtos/updateClass.dto';
import { CreateClassDto } from './dtos/createClass.dto';
import { MajorService } from '../major/major.service';
import { LecturerService } from '../lecturer/lecturer.service';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { LecturerEntity } from '../lecturer/entities/lecturer.entity';
import { StudentService } from '../student/student.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @Inject(forwardRef(() => MajorService))
    private readonly majorService: MajorService,
    private readonly lecturerService: LecturerService,
    private readonly studentService: StudentService,
  ) {}

  /**
   * Tìm kiếm lớp học dựa trên điều kiện
   * @param where - Điều kiện tìm kiếm TypeORM
   * @param checkExist - Nếu true và không tìm thấy, sẽ throw NotFoundException
   * @param relations - Các mối quan hệ cần load
   * @returns ClassEntity hoặc null/throw exception
   */
  async findByCondition(
    where: FindOptionsWhere<ClassEntity>,
    checkExist: boolean = false,
    relations?: string[],
  ): Promise<ClassEntity | null> {
    const classEntity = await this.classRepository.findOne({
      where,
      relations,
    });
    if (!classEntity && checkExist) {
      const criteria = Object.entries(where)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      throw new NotFoundException(
        `Không tìm thấy lớp học với điều kiện: ${criteria}`,
      );
    }
    return classEntity;
  }

  async create(createClassDto: CreateClassDto): Promise<ClassEntity> {
    const { classCode, majorId, homeroomLecturerId, ...restData } =
      createClassDto;

    // 1. Kiểm tra trùng mã lớp
    const existingClass = await this.findByCondition({ classCode });
    if (existingClass) {
      throw new ConflictException(`Mã lớp '${classCode}' đã tồn tại`);
    }

    // 2. Kiểm tra sự tồn tại của Ngành học
    const major = await this.majorService.findOne(majorId);

    // 3. Kiểm tra sự tồn tại của Giảng viên chủ nhiệm (nếu có)
    let lecturer: LecturerEntity | null = null;
    if (homeroomLecturerId) {
      lecturer = await this.lecturerService.findOne(homeroomLecturerId);
    }

    // 4. Tạo entity mới
    try {
      const newClass = this.classRepository.create({
        ...restData,
        classCode,
        major,
        majorId,
        lecturer: lecturer ?? undefined,
        homeroomLecturerId: lecturer ? lecturer.id : null,
      });

      return await this.classRepository.save(newClass);
    } catch (error) {
      console.error('Lỗi khi tạo lớp:', error);
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: ClassEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const queryBuilder = this.classRepository.createQueryBuilder('class');

    queryBuilder
      .leftJoinAndSelect('class.major', 'major')
      .leftJoinAndSelect('class.lecturer', 'lecturer')
      .loadRelationCountAndMap('class.studentCount', 'class.students')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('class.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<ClassEntity> {
    const classEntity = await this.findByCondition({ id }, true, [
      'major',
      'lecturer',
      'students',
    ]);
    return classEntity!;
  }

  async update(
    id: number,
    updateClassDto: UpdateClassDto,
  ): Promise<ClassEntity> {
    // 1. Sử dụng preload để lấy entity hiện tại và merge dữ liệu mới
    const existingClass = await this.classRepository.preload({
      id: id,
      ...updateClassDto,
    });

    if (!existingClass) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${id}`);
    }

    // 2. Kiểm tra trùng mã lớp
    if (
      updateClassDto.classCode &&
      updateClassDto.classCode !== existingClass.classCode
    ) {
      const classWithNewCode = await this.findByCondition({
        classCode: updateClassDto.classCode,
      });
      if (classWithNewCode && classWithNewCode.id !== id) {
        throw new ConflictException(
          `Mã lớp '${updateClassDto.classCode}' đã tồn tại`,
        );
      }
    }

    // 3. Xử lý cập nhật majorId
    if (
      updateClassDto.majorId &&
      updateClassDto.majorId !== existingClass.majorId
    ) {
      const major = await this.majorService.findOne(updateClassDto.majorId);
      existingClass.major = major;
      existingClass.majorId = major.id;
    }

    // 4. Xử lý cập nhật homeroomLecturerId
    if (updateClassDto.hasOwnProperty('homeroomLecturerId')) {
      // Kiểm tra xem có key này trong DTO không
      if (
        updateClassDto.homeroomLecturerId !== null &&
        updateClassDto.homeroomLecturerId !== undefined
      ) {
        // Nếu có ID mới, tìm giảng viên
        const lecturer = await this.lecturerService.findOne(
          updateClassDto.homeroomLecturerId,
        );
        existingClass.lecturer = lecturer;
        existingClass.homeroomLecturerId = lecturer.id;
      } else {
        existingClass.lecturer = null;
        existingClass.homeroomLecturerId = null;
      }
    }

    // 5. Lưu thay đổi
    try {
      return await this.classRepository.save(existingClass);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Mã lớp '${existingClass.classCode}' có thể đã tồn tại.`,
        );
      }
      console.error('Lỗi khi cập nhật lớp:', error);
      throw error;
    }
  }

  async getOne(
    condition: FindOptionsWhere<ClassEntity> | FindOptionsWhere<ClassEntity>[],
    relations?: FindOptionsRelations<ClassEntity>,
  ): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({
      where: condition,
      relations,
    });
    if (!classEntity) {
      throw new NotFoundException(
        `Không tìm thấy lớp học với điều kiện: ${condition}`,
      );
    }
    return classEntity;
  }

  async remove(id: number): Promise<void> {
    const studentCount = await this.studentService.getStudentsByClass(id);
    if (studentCount.length > 0) {
      throw new ConflictException(
        `Không thể xóa lớp ID ${id} vì vẫn còn ${studentCount} sinh viên.`,
      );
    }
    await this.classRepository.delete(id);
  }
}
