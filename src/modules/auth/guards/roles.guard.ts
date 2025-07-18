import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role === undefined || user.role === null) {
      throw new ForbiddenException('Access denied.');
    }

    let userRole: number;
    if (typeof user.role === 'string') {
      userRole = parseInt(user.role, 10);
    } else {
      userRole = user.role;
    }

    const hasPermission = requiredRoles.includes(userRole);

    if (hasPermission) {
      return true;
    }
    if (
      userRole === EUserRole.LECTURER &&
      requiredRoles.includes(EUserRole.HEAD_OF_FACULTY)
    ) {
      if (user.lecturer.isHeadOfFaculty) {
        return true;
      }
    }

    console.log('RolesGuard - Access denied');
    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}
