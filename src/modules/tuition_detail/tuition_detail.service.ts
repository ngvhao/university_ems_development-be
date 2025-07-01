import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TuitionDetailEntity } from './entities/tuition_detail.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EnrollmentCourseService } from '../enrollment_course/enrollment_course.service';
import { TuitionService } from '../tuition/tuition.service';
import { CreateTuitionDetailDto } from './dto/createTuitionDetail.dto';
import { UpdateTuitionDetailDto } from './dto/updateTutionDetail.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';

@Injectable()
export class TuitionDetailService {
  constructor(
    @InjectRepository(TuitionDetailEntity)
    private readonly tuitionDetailRepository: Repository<TuitionDetailEntity>,
    private readonly tuitionService: TuitionService,
    private readonly enrollmentCourseService: EnrollmentCourseService,
  ) {}

  private async _validateDependencies(
    tuitionId: number,
    enrollmentId: number,
  ): Promise<void> {
    await this.tuitionService.findOne(tuitionId);
    await this.enrollmentCourseService.findOneById(enrollmentId);
  }

  private async _recalculateAndSaveParentTuition(
    tuitionId: number,
  ): Promise<void> {
    const details = await this.tuitionDetailRepository.find({
      where: { tuitionId },
    });
    const newTotalAmountDue = details.reduce(
      (sum, detail) => sum + Number(detail.amount),
      0,
    );

    // Gọi service của Tuition để cập nhật totalAmountDue và các trường liên quan
    await this.tuitionService.updateTuitionFinancials(
      tuitionId,
      newTotalAmountDue,
    );
  }

  async create(
    createTuitionDetailDto: CreateTuitionDetailDto,
  ): Promise<TuitionDetailEntity> {
    const { tuitionId, enrollmentId, amount, ...rest } = createTuitionDetailDto;

    await this._validateDependencies(tuitionId, enrollmentId);

    const existingDetail = await this.tuitionDetailRepository.findOne({
      where: { tuitionId, enrollmentId },
    });
    if (existingDetail) {
      throw new ConflictException(
        `Chi tiết học phí cho khoản học phí ID ${tuitionId} và đăng ký môn học ID ${enrollmentId} đã tồn tại.`,
      );
    }

    const newDetail = this.tuitionDetailRepository.create({
      tuitionId,
      enrollmentId,
      amount,
      ...rest,
    });

    const savedDetail = await this.tuitionDetailRepository.save(newDetail);
    await this._recalculateAndSaveParentTuition(tuitionId);
    return savedDetail;
  }

  async findAllByTuitionId(
    tuitionId: number,
    paginationDto: PaginationDto,
  ): Promise<{
    data: TuitionDetailEntity[];
    meta: MetaDataInterface;
  }> {
    await this.tuitionService.findOne(tuitionId);

    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.tuitionDetailRepository.findAndCount({
      where: { tuitionId },
      relations: {
        enrollment: {
          classGroup: {
            course: true,
          },
        },
      },
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
    });
    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findOne(id: number): Promise<TuitionDetailEntity> {
    const detail = await this.tuitionDetailRepository.findOne({
      where: { id },
      relations: ['tuition', 'enrollment', 'enrollment.course'],
    });
    if (!detail) {
      throw new NotFoundException(
        `Không tìm thấy chi tiết học phí với ID ${id}`,
      );
    }
    return detail;
  }

  async update(
    id: number,
    updateTuitionDetailDto: UpdateTuitionDetailDto,
  ): Promise<TuitionDetailEntity> {
    const detail = await this.findOne(id);

    const { tuitionId, enrollmentId, ...restOfUpdates } =
      updateTuitionDetailDto;

    if (tuitionId && tuitionId !== detail.tuitionId) {
      throw new BadRequestException(
        'Không thể thay đổi ID học phí tổng của một chi tiết. Hãy tạo chi tiết mới.',
      );
    }
    if (enrollmentId && enrollmentId !== detail.enrollmentId) {
      throw new BadRequestException(
        'Không thể thay đổi ID đăng ký môn học của một chi tiết. Hãy tạo chi tiết mới.',
      );
    }

    this.tuitionDetailRepository.merge(detail, restOfUpdates);

    const updatedDetail = await this.tuitionDetailRepository.save(detail);
    if (
      updateTuitionDetailDto.amount !== undefined &&
      updateTuitionDetailDto.amount !== Number(detail.amount)
    ) {
      await this._recalculateAndSaveParentTuition(detail.tuitionId);
    }
    return updatedDetail;
  }

  async remove(id: number): Promise<void> {
    const detail = await this.findOne(id);

    const result = await this.tuitionDetailRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy chi tiết học phí với ID ${id} để xóa`,
      );
    }

    await this._recalculateAndSaveParentTuition(detail.tuitionId);
  }

  async getTotalAmountForTuition(tuitionId: number): Promise<number> {
    const details = await this.tuitionDetailRepository.find({
      where: { tuitionId },
    });
    return details.reduce((sum, detail) => sum + Number(detail.amount), 0);
  }
}
