import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LecturerEntity } from './entities/lecture.entity';
import { CreateLecturerDto } from './dtos/createLecture.dto';
import { UpdateLecturerDto } from './dtos/updateLecture.dto';

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

  async findAll(): Promise<LecturerEntity[]> {
    return this.lecturerRepository.find({ relations: ['user', 'department'] });
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
