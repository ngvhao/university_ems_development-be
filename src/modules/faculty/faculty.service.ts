import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyEntity } from './entities/faculty.entity';
import { CreateFacultyDto } from './dtos/createFaculty.dto';
import { UpdateFacultyDto } from './dtos/updateFaculty.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(FacultyEntity)
    private readonly facultyRepository: Repository<FacultyEntity>,
  ) {}

  async create(createFacultyDto: CreateFacultyDto): Promise<FacultyEntity> {
    const faculty = this.facultyRepository.create(createFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: FacultyEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.facultyRepository.findAndCount({
      relations: ['departments'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<FacultyEntity> {
    const faculty = await this.facultyRepository.findOne({
      where: { id },
      relations: ['departments'],
    });
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }
    return faculty;
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<FacultyEntity> {
    const faculty = await this.findOne(id);
    Object.assign(faculty, updateFacultyDto);
    return this.facultyRepository.save(faculty);
  }

  async remove(id: number): Promise<void> {
    await this.facultyRepository.delete(id);
  }
}
