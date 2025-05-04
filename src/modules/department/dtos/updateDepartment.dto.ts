import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './createDepartment.dto';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
