import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dtos/createDepartment.dto';
import { DepartmentEntity } from './entities/department.entity';
import { UpdateDepartmentDto } from './dtos/updateDepartment.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<DepartmentEntity[]> {
    return this.departmentRepository.find({
      relations: ['faculty', 'lecturers', 'majors'],
    });
  }

  async findOne(id: number): Promise<DepartmentEntity> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['faculty', 'lecturers', 'majors'],
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentEntity> {
    const department = await this.findOne(id);
    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: number): Promise<void> {
    await this.departmentRepository.delete(id);
  }
}
