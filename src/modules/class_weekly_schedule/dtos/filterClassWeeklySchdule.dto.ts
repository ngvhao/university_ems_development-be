import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterClassWeeklySchduleDto {
  @IsOptional()
  @IsString()
  semesterCode?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  @IsNumber({}, { each: true })
  classGroupIds?: number[];

  @IsOptional()
  @IsNumber()
  lecturerId?: number;

  @IsOptional()
  @IsNumber()
  roomId?: number;

  @IsOptional()
  @IsNumber()
  timeSlotId?: number;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsNumber()
  facultyId?: number;
}
