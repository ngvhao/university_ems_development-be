import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { ClassAdjustmentScheduleEntity } from './entities/class_adjustment_schedule.dto';
import { CreateAdjustmentScheduleDto } from './dto/createClassAdjustmentSchedule.dto';
import { UpdateAdjustmentScheduleDto } from './dto/updateClassAdjustmentSchedule.dto';

@Injectable()
export class ClassAdjustmentScheduleService {
  constructor(
    @InjectRepository(ClassAdjustmentScheduleEntity)
    private readonly adjustmentRepo: Repository<ClassAdjustmentScheduleEntity>,
  ) {}

  async create(dto: CreateAdjustmentScheduleDto) {
    const newAdjustment = this.adjustmentRepo.create(dto);
    return await this.adjustmentRepo.save(newAdjustment);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.adjustmentRepo.findAndCount({
      relations: ['classGroup', 'room', 'timeSlot'],
      skip: (page - 1) * limit,
      take: limit,
      order: { adjustmentDate: 'DESC' },
    });
    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findOne(id: number) {
    const schedule = await this.adjustmentRepo.findOne({
      where: { id },
      relations: ['classGroup', 'room', 'timeSlot'],
    });
    if (!schedule) throw new NotFoundException('Adjustment not found');
    return schedule;
  }

  async update(id: number, dto: UpdateAdjustmentScheduleDto) {
    const adjustment = await this.adjustmentRepo.preload({ id, ...dto });
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    return await this.adjustmentRepo.save(adjustment);
  }

  async remove(id: number) {
    const existing = await this.adjustmentRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Adjustment not found');
    return await this.adjustmentRepo.remove(existing);
  }
}
