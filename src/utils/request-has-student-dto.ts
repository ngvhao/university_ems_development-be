import { IsNotEmpty } from 'class-validator';
import { StudentEntity } from 'src/modules/student/entities/student.entity';

export class RequestHasStudentDto {
  @IsNotEmpty({ message: 'Student must be provided.' })
  student: StudentEntity;

  constructor(student: StudentEntity) {
    this.student = student;
  }
}
