import { CreateDepartmentDto } from './createDepartment.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
