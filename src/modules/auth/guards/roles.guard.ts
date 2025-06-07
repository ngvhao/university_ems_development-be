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
    const roles = this.reflector.get(Roles, context.getHandler());
    console.log('roles:', roles);
    if (!roles) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('user role:', user.role);
    if (roles.includes(user.role)) {
      return true;
    }
    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}
