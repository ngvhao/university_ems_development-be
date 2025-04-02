import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LecturerEntity } from './entities/lecturer.entity';
import { CreateLecturerDto } from './dtos/createLecturer.dto';
import { UpdateLecturerDto } from './dtos/updateLecturer.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class LecturerService {
  constructor(
    @InjectRepository(LecturerEntity)
    private readonly lecturerRepository: Repository<LecturerEntity>,
  ) {}

  async create(createLecturerDto: CreateLecturerDto): Promise<LecturerEntity> {
    const lecturer = this.lecturerRepository.create(createLecturerDto);
    return this.lecturerRepository.save(lecturer);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: LecturerEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.lecturerRepository.findAndCount({
      relations: ['user', 'department'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<LecturerEntity> {
    const lecturer = await this.lecturerRepository.findOne({
      where: { id },
      relations: ['user', 'department'],
    });
    if (!lecturer) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }
    return lecturer;
  }

  async update(
    id: number,
    updateLecturerDto: UpdateLecturerDto,
  ): Promise<LecturerEntity> {
    const lecture = await this.findOne(id);
    Object.assign(lecture, updateLecturerDto);
    return this.lecturerRepository.save(lecture);
  }

  async remove(id: number): Promise<void> {
    await this.lecturerRepository.delete(id);
  }
}
