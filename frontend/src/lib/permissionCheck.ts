/**
 * Same rules as AuthContext.hasPermission — keep in sync for route checks.
 */
export function checkPermission(
  permissions: string[] | undefined,
  permission: string,
): boolean {
  if (!permissions?.length) return false;
  if (permissions.includes('*') || permissions.includes('admin')) return true;
  if (permissions.includes(permission)) return true;
  const [resource, action] = permission.split('.');
  if (action && permissions.includes(`${resource}.*`)) return true;
  return false;
}
