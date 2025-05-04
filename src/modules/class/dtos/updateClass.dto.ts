import { PartialType } from '@nestjs/swagger';
import { CreateClassDto } from './createClass.dto';

export class UpdateClassDto extends PartialType(CreateClassDto) {}
