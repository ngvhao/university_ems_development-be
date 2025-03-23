import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MajorEntity } from './entities/major.entity';
import { CreateMajorDto } from './dtos/createMajor.dto';
import { UpdateMajorDto } from './dtos/updateMajor.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(MajorEntity)
    private readonly majorRepository: Repository<MajorEntity>,
  ) {}

  async create(createMajorDto: CreateMajorDto): Promise<MajorEntity> {
    const major = this.majorRepository.create(createMajorDto);
    return this.majorRepository.save(major);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: MajorEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.majorRepository.findAndCount({
      relations: ['department', 'students', 'classes', 'courses'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<MajorEntity> {
    const major = await this.majorRepository.findOne({
      where: { id },
      relations: ['department', 'students', 'classes', 'courses'],
    });
    if (!major) {
      throw new NotFoundException(`Major with ID ${id} not found`);
    }
    return major;
  }

  async update(
    id: number,
    updateMajorDto: UpdateMajorDto,
  ): Promise<MajorEntity> {
    const major = await this.findOne(id);
    Object.assign(major, updateMajorDto);
    return this.majorRepository.save(major);
  }

  async remove(id: number): Promise<void> {
    await this.majorRepository.delete(id);
  }
}
