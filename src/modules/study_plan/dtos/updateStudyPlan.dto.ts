import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyPlanDto } from './createStudyPlan.dto';

export class UpdateStudyPlanDto extends PartialType(CreateStudyPlanDto) {}
