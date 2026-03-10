import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

/**
 * Returns true if user has "admin" or "*" (full access) or has the required permission
 * (exact match or wildcard: e.g. "facilities.*" satisfies "facilities.create").
 */
function userHasPermission(userPermissions: string[] | undefined, required: string): boolean {
  if (!userPermissions?.length) return false;
  if (userPermissions.includes('*') || userPermissions.includes('admin')) return true;
  if (userPermissions.includes(required)) return true;
  const [resource, action] = required.split('.');
  const wildcard = action ? `${resource}.*` : required;
  return userPermissions.includes(wildcard);
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredList = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredList?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    const permissions: string[] = user?.permissions ?? [];
    return requiredList.some((required) => userHasPermission(permissions, required));
  }
}
