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

    console.log('RolesGuard - Required Roles:', requiredRoles);

    if (!requiredRoles) {
      console.log('RolesGuard - No roles required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('RolesGuard - Request user:', {
      user: user
        ? {
            id: user.id,
            role: user.role,
            roleType: typeof user.role,
            email: user.universityEmail,
          }
        : null,
    });

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
      console.log('RolesGuard - Access granted');
      return true;
    }

    console.log('RolesGuard - Access denied');
    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}
