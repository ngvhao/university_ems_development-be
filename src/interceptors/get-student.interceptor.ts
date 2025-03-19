import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { StudentService } from 'src/modules/student/student.service';

@Injectable()
export class StudentInterceptor implements NestInterceptor {
  constructor(private readonly studentService: StudentService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const student = await this.studentService.getOne(
      { user: { id: user.id } },
      { major: true },
    );

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    request.student = student;

    return next.handle();
  }
}
