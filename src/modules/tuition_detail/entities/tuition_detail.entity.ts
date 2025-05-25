import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { EnrollmentCourseEntity } from '../../enrollment_course/entities/enrollment_course.entity';
import { TuitionEntity } from 'src/modules/tuition/entities/tuition.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';

@Entity({ name: 'tuition_details' })
@Index(['tuitionId', 'enrollmentId'], { unique: true })
export class TuitionDetailEntity extends IEntity {
  @ApiProperty({ example: 1, description: 'ID của khoản học phí tổng' })
  @Column()
  tuitionId: number;

  @ManyToOne(() => TuitionEntity, (tuition) => tuition.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tuitionId' })
  tuition: TuitionEntity;

  @ApiProperty({
    example: 15,
    description: 'ID của bản ghi đăng ký môn học (EnrollmentCourseEntity)',
  })
  @Column()
  enrollmentId: number;

  @ManyToOne(
    () => EnrollmentCourseEntity,
    (enrollment) => enrollment.tuitionDetails,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: EnrollmentCourseEntity;

  @ApiProperty({
    example: 1500000,
    description: 'Số tiền học phí cho môn học/đăng ký này',
    type: 'number',
    format: 'float',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({
    example: 3,
    description: 'Số tín chỉ của môn học (tại thời điểm tính phí)',
    nullable: true,
  })
  @Column({ type: 'smallint', nullable: true })
  numberOfCredits: number;

  @ApiProperty({
    example: 500000,
    description: 'Đơn giá mỗi tín chỉ (tại thời điểm tính phí)',
    type: 'number',
    format: 'float',
    nullable: true,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerCredit: number;
}
