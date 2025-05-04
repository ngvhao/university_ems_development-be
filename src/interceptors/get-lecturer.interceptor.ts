import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LecturerService } from 'src/modules/lecturer/lecturer.service';

@Injectable()
export class LecturerInterceptor implements NestInterceptor {
  constructor(private readonly lecturerService: LecturerService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const student = await this.lecturerService.getOne({
      user: { id: user.id },
    });

    request.student = student;

    return next.handle();
  }
}
