import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CourseService } from 'src/modules/course/course.service'; // Để kiểm tra Course tồn tại
import { MajorService } from 'src/modules/major/major.service'; // Để kiểm tra Major tồn tại
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { CreateCourseMajorDto } from './dtos/createCourseMajor.dto';
import { UpdateCourseMajorDto } from './dtos/updateCourseMajor.dto';
import { CourseMajorEntity } from './entities/course_major.entity';

@Injectable()
export class CourseMajorService {
  constructor(
    @InjectRepository(CourseMajorEntity)
    private readonly courseMajorRepository: Repository<CourseMajorEntity>,
    private readonly courseService: CourseService,
    private readonly majorService: MajorService,
  ) {}

  async create(
    createCourseMajorDto: CreateCourseMajorDto,
  ): Promise<CourseMajorEntity> {
    const { courseId, majorId } = createCourseMajorDto;

    await this.courseService.findOne(courseId);
    await this.majorService.findOne(majorId);

    const existingRelation = await this.courseMajorRepository.findOne({
      where: {
        courseId,
        major: {
          id: majorId,
        },
      },
    });
    if (existingRelation) {
      throw new ConflictException(
        `Relationship between Course ID ${courseId} and Major ID ${majorId} already exists.`,
      );
    }

    const courseMajor = this.courseMajorRepository.create(createCourseMajorDto);
    // Gán entity đầy đủ nếu cần trả về thông tin chi tiết ngay lập tức (không bắt buộc nếu chỉ cần id)
    // courseMajor.course = await this.courseService.findOne(courseId);
    // courseMajor.major = await this.majorService.findOne(majorId);
    return await this.courseMajorRepository.save(courseMajor);
  }

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

  async findOne(id: number): Promise<CourseMajorEntity> {
    const courseMajor = await this.courseMajorRepository.findOne({
      where: { id },
      relations: ['course', 'major'],
    });
    if (!courseMajor) {
      throw new NotFoundException(
        `CourseMajor relationship with ID ${id} not found`,
      );
    }
    return courseMajor;
  }

  async findByMajor(majorId: number): Promise<CourseMajorEntity[]> {
    await this.majorService.findOne(majorId);
    return this.courseMajorRepository.find({
      where: {
        major: {
          id: majorId,
        },
      },
      relations: ['course'],
    });
  }

  async findByCourse(courseId: number): Promise<CourseMajorEntity[]> {
    await this.courseService.findOne(courseId);
    return this.courseMajorRepository.find({
      where: { courseId },
      relations: ['major'],
    });
  }

  async update(
    id: number,
    updateCourseMajorDto: UpdateCourseMajorDto,
  ): Promise<CourseMajorEntity> {
    const courseMajor = await this.findOne(id);

    const { courseId, majorId, ...restUpdateData } = updateCourseMajorDto;

    if (courseId && courseId !== courseMajor.courseId) {
      await this.courseService.findOne(courseId);
      courseMajor.courseId = courseId;
    }
    if (majorId && majorId !== courseMajor.major.id) {
      await this.majorService.findOne(majorId);
      courseMajor.major.id = majorId;
    }

    if (courseId || majorId) {
      const potentialConflict = await this.courseMajorRepository.findOne({
        where: {
          courseId: courseMajor.courseId,
          major: {
            id: courseMajor.major.id,
          },
          id: Not(id),
        },
      });
      if (potentialConflict) {
        throw new ConflictException(
          `Relationship between Course ID ${courseMajor.courseId} and Major ID ${courseMajor.major.id} already exists.`,
        );
      }
    }

    Object.assign(courseMajor, restUpdateData);

    return this.courseMajorRepository.save(courseMajor);
  }

  async remove(id: number): Promise<void> {
    const result = await this.courseMajorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `CourseMajor relationship with ID ${id} not found`,
      );
    }
  }
}
