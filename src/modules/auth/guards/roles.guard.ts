import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/decorators/roles.decorator';
import { EALLROLE, EUserRole } from 'src/utils/enums/user.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return false;
    }
    if (roles[0] == EALLROLE[EALLROLE.ALL]) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(roles);
    console.log(EUserRole[user.role]);
    return roles.includes(EUserRole[user.role]);
  }
}
