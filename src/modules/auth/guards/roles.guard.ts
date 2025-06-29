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
      console.warn(
        'RolesGuard: User or user role is missing after authentication.',
        { user: user ? { id: user.id, email: user.universityEmail } : null },
      );
      throw new ForbiddenException(
        'User role information is missing. Access denied.',
      );
    }

    // Convert role to number if it's a string
    let userRole: number;
    if (typeof user.role === 'string') {
      userRole = parseInt(user.role, 10);
      console.log('RolesGuard - Converted string role to number:', {
        original: user.role,
        converted: userRole,
      });
    } else {
      userRole = user.role;
    }

    console.log('RolesGuard - Final comparison:', {
      requiredRoles,
      userRole,
      userRoleType: typeof userRole,
    });

    const hasPermission = requiredRoles.includes(userRole);

    console.log('RolesGuard - Permission check result:', {
      hasPermission,
      userRole,
      requiredRoles,
      includes: requiredRoles.includes(userRole),
    });

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
