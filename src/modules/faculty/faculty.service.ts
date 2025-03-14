import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyEntity } from './entities/faculty.entity';
import { CreateFacultyDto } from './dtos/createFaculty.dto';
import { UpdateFacultyDto } from './dtos/updateFaculty.dto';

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

  async findAll(): Promise<FacultyEntity[]> {
    return this.facultyRepository.find({ relations: ['departments'] });
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
