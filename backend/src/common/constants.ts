/**
 * Status workflow: DRAFT → SUBMITTED → APPROVED → ACTIVE | INACTIVE → SUSPENDED → TERMINATED
 */
export const ENTITY_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
} as const;

export const FACILITY_TYPES = ['HOSPITAL', 'CLINIC', 'HEALTH_CENTER', 'PHARMACY', 'LAB'] as const;

export const OWNERSHIP_TYPES = ['PUBLIC', 'PRIVATE', 'NGO', 'CHARITY'] as const;

/** Facility status for registration workflow */
export const FACILITY_STATUS_OPTIONS = [
  'PENDING',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'DRAFT',
  'SUBMITTED',
  'INACTIVE',
  'TERMINATED',
] as const;

export const ROLES = {
  ADMIN: 'Admin',
  OFFICER: 'Officer',
} as const;

/** Staff primary role — drives role-specific registration fields */
export const STAFF_ROLES = [
  'DOCTOR',
  'NURSE',
  'PHARMACIST',
  'LAB_TECH',
  'ADMIN',
] as const;

export const EMPLOYMENT_TYPES = ['PERMANENT', 'CONTRACT', 'TEMPORARY'] as const;

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

/**
 * RBAC: Permission names used for guards and seed.
 * Use RequirePermissions('permission.name') on routes; user must have exact or wildcard (e.g. facilities.*).
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
} as const;

/** All permission values for seed (Admin gets these). */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
