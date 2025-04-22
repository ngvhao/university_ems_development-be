import { CreateClassDto } from './createClass.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateClassDto extends PartialType(CreateClassDto) {}
