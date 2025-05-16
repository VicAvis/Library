// libs/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'; 
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestUser {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const routePath = `${request.method} ${request.url}`;

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log(`No roles required for route: ${routePath}. Access granted.`);
      return true;
    }

    console.log(`Route ${routePath} requires roles: [${requiredRoles.join(', ')}]`);

    const { user } = request as { user?: RequestUser };

    if (!user) {
      console.log(`User object not found on request for role-protected route: ${routePath}. AuthGuard might not have run or failed. Access denied.`);
      return false;
    }
    
    if (!user.role) {
      console.log(`User object found for ${user.email}, but 'role' property is missing for route: ${routePath}. Access denied.`);
      return false;
    }

    console.log(`User attempting access: ${user.email}, Role: ${user.role} for route ${routePath}`);

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (hasRequiredRole) {
      console.log(`Access GRANTED for user ${user.email} (Role: ${user.role}) to route ${routePath}.`);
      return true;
    } else {
      console.log(`Access DENIED for user ${user.email} (Role: ${user.role}). Lacks required roles: [${requiredRoles.join(', ')}] for route ${routePath}.`);
      return false;
    }
  }
}