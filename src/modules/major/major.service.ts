import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MajorEntity } from './entities/major.entity';
import { CreateMajorDto } from './dtos/createMajor.dto';
import { UpdateMajorDto } from './dtos/updateMajor.dto';

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

  async findAll(): Promise<MajorEntity[]> {
    return this.majorRepository.find({
      relations: ['department', 'students', 'classes', 'courses'],
    });
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
