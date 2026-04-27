import { PERMISSIONS } from '@/constants/permissions';
import { checkPermission } from '@/lib/permissionCheck';

/** Order used after login / when redirecting away from a forbidden route. */
const NAV_ACCESS_ORDER: { path: string; permission: string }[] = [
  { path: '/dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
  { path: '/facilities', permission: PERMISSIONS.FACILITIES_READ },
  { path: '/staff', permission: PERMISSIONS.STAFF_READ },
  { path: '/notifications', permission: PERMISSIONS.NOTIFICATIONS_READ },
  { path: '/documents', permission: PERMISSIONS.DOCUMENTS_FACILITY_READ },
  { path: '/admin/users', permission: PERMISSIONS.USERS_READ },
  { path: '/admin/settings', permission: PERMISSIONS.USERS_READ },
];

export function firstAccessiblePath(
  hasPermission: (permission: string) => boolean,
): string {
  for (const { path, permission } of NAV_ACCESS_ORDER) {
    if (hasPermission(permission)) return path;
  }
  return '/facilities';
}

export function firstAccessiblePathFromPermissions(
  permissions: string[] | undefined,
): string {
  return firstAccessiblePath((p) => checkPermission(permissions, p));
}
