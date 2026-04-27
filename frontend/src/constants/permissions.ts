/**
 * RBAC permission names. Must match backend PERMISSIONS (common/constants.ts).
 * Use with useAuth().hasPermission(PERMISSIONS.DASHBOARD_VIEW) etc.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  FACILITIES_READ: 'facilities.read',
  FACILITIES_CREATE: 'facilities.create',
  FACILITIES_UPDATE: 'facilities.update',
  FACILITIES_DELETE: 'facilities.delete',

  STAFF_READ: 'staff.read',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',

  DOCUMENTS_FACILITY_READ: 'documents.facility.read',
  DOCUMENTS_FACILITY_UPLOAD: 'documents.facility.upload',
  DOCUMENTS_FACILITY_DELETE: 'documents.facility.delete',

  DOCUMENTS_STAFF_READ: 'documents.staff.read',
  DOCUMENTS_STAFF_UPLOAD: 'documents.staff.upload',
  DOCUMENTS_STAFF_DELETE: 'documents.staff.delete',

  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_MARK_READ: 'notifications.markRead',

  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  ROLES_READ: 'roles.read',
  ROLES_UPDATE: 'roles.update',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
