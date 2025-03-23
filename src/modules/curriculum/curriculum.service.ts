import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumEntity } from './entities/curriculum.entity';
import { CreateCurriculumDto } from './dtos/createCurriculum.dto';
import { UpdateCurriculumDto } from './dtos/updateCurriculum.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(CurriculumEntity)
    private readonly curriculumRepository: Repository<CurriculumEntity>,
  ) {}

  async create(
    createCurriculumDto: CreateCurriculumDto,
  ): Promise<CurriculumEntity> {
    const curriculum = this.curriculumRepository.create({
      ...createCurriculumDto,
      major: { id: createCurriculumDto.majorId },
    });
    return this.curriculumRepository.save(curriculum);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: CurriculumEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.curriculumRepository.findAndCount({
      relations: ['major'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<CurriculumEntity> {
    const curriculum = await this.curriculumRepository.findOne({
      where: { id },
      relations: ['major'],
    });
    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    return curriculum;
  }

  async update(
    id: number,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<CurriculumEntity> {
    const curriculum = await this.findOne(id);
    if (updateCurriculumDto.majorId) {
      updateCurriculumDto['major'] = { id: updateCurriculumDto.majorId };
      delete updateCurriculumDto.majorId;
    }
    Object.assign(curriculum, updateCurriculumDto);
    return this.curriculumRepository.save(curriculum);
  }

  async remove(id: number): Promise<void> {
    const curriculum = await this.findOne(id);
    await this.curriculumRepository.remove(curriculum);
  }
}
