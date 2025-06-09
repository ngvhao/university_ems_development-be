import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/decorators/roles.decorator';

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
      console.warn(
        'RolesGuard: User or user role is missing after authentication.',
      );
      throw new ForbiddenException(
        'User role information is missing. Access denied.',
      );
    }

    console.log('RolesGuard: Required Roles:', requiredRoles);
    console.log('RolesGuard: User Role:', user.role);

    const hasPermission = requiredRoles.includes(user.role);

    if (hasPermission) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}
