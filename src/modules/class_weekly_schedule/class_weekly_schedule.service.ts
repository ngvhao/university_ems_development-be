import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassWeeklyScheduleEntity } from './entities/class_weekly_schedule.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateClassWeeklyScheduleDto } from './dtos/createClassWeeklySchedule.dto';
import { UpdateClassWeeklyScheduleDto } from './dtos/updateClassWeeklySchedule.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class ClassWeeklyScheduleService {
  constructor(
    @InjectRepository(ClassWeeklyScheduleEntity)
    private classWeeklyScheduleRepository: Repository<ClassWeeklyScheduleEntity>,
  ) {}

  async create(dto: CreateClassWeeklyScheduleDto) {
    const schedule = this.classWeeklyScheduleRepository.create(dto);
    return await this.classWeeklyScheduleRepository.save(schedule);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: ClassWeeklyScheduleEntity[];
    meta: MetaDataInterface;
  }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.classWeeklyScheduleRepository.findAndCount(
      {
        relations: ['classGroup', 'room', 'timeSlot'],
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number) {
    const schedule = await this.classWeeklyScheduleRepository.findOneBy({ id });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async getScheduleByStudentId(studentId: number) {
    const schedules = await this.classWeeklyScheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.classGroup', 'classGroup')
      .leftJoin('classGroup.enrollments', 'enrollment')
      .where('enrollment.studentId = :studentId', { studentId })
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.timeSlot', 'timeSlot')
      .getMany();

    return schedules;
  }

  async update(id: number, dto: UpdateClassWeeklyScheduleDto) {
    const schedule = await this.classWeeklyScheduleRepository.preload({
      id,
      ...dto,
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return await this.classWeeklyScheduleRepository.save(schedule);
  }

  async remove(id: number) {
    const schedule = await this.classWeeklyScheduleRepository.findOneBy({ id });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return await this.classWeeklyScheduleRepository.remove(schedule);
  }
}
