/**
 * Chiro City Health Facilities & HR Management - API client
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

function headers(includeAuth = true): HeadersInit {
  const h: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (includeAuth && token) {
    (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(Array.isArray(err.message) ? err.message[0] : err.message || res.statusText);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T;
  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((res) => handleResponse<{ access_token: string; user: AuthUser }>(res)),

  /** Fresh user + permissions from DB (call on app load so role changes apply without re-login). */
  me: () =>
    fetch(`${API_BASE}/auth/me`, { headers: headers() }).then((res) =>
      handleResponse<AuthUser>(res),
    ),
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

// Dashboard
export const dashboardApi = {
  getStats: () =>
    fetch(`${API_BASE}/dashboard/stats`, { headers: headers() }).then((res) =>
      handleResponse<{
        totalFacilities: number;
        totalStaff: number;
        activeFacilities: number;
        licenseExpiringCount: number;
      }>(res),
    ),
};

// Facilities - Common + type-specific registration
export interface FacilitySpecificFields {
  hospital?: HospitalSpecific;
  clinic?: ClinicSpecific;
  healthCenter?: HealthCenterSpecific;
  pharmacy?: PharmacySpecific;
}

export interface HospitalSpecific {
  numberOfBeds?: number;
  icuAvailability?: boolean;
  emergencyService?: boolean;
  numberOfDepartments?: number;
  ambulanceService?: boolean;
  surgeryService?: boolean;
  laboratoryAvailable?: boolean;
  bloodBankAvailable?: boolean;
}

export interface ClinicSpecific {
  clinicCategory?: string;
  specialization?: string;
  consultationRoomsCount?: number;
  laboratoryAvailable?: boolean;
}

export interface HealthCenterSpecific {
  catchmentPopulation?: number;
  maternalCareAvailable?: boolean;
  vaccinationService?: boolean;
  communityHealthProgram?: boolean;
}

export interface PharmacySpecific {
  pharmacyType?: string;
  drugStorageFacility?: boolean;
  coldStorageAvailable?: boolean;
  controlledDrugAuthorizationNumber?: string;
  pharmacistInChargeId?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  ownershipType: string | null;
  registrationNo: string | null;
  tin: string | null;
  description: string | null;
  region: string | null;
  city: string | null;
  woreda: string | null;
  kebele: string | null;
  streetAddress: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  phone: string | null;
  altPhone: string | null;
  email: string | null;
  website: string | null;
  licenseNo: string | null;
  licenseIssueDate: string | null;
  licenseExpiry: string | null;
  regulatoryAuthority: string | null;
  accreditationLevel: string | null;
  operatingHours: string | null;
  status: string;
  approvalStatus: string | null;
  address: string | null;
  services: string | null;
  legalInfo: string | null;
  specificFields: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { documents: number };
  documents?: FacilityDocument[];
  staffList?: Staff[];
}

export interface FacilityDocument {
  id: string;
  facilityId: string;
  name: string;
  type: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number | null;
  uploadedAt: string;
}

export const facilitiesApi = {
  list: (params?: { search?: string; status?: string; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    const query = q.toString();
    return fetch(`${API_BASE}/facilities${query ? `?${query}` : ''}`, {
      headers: headers(),
    }).then((res) => handleResponse<Facility[]>(res));
  },
  get: (id: string) =>
    fetch(`${API_BASE}/facilities/${id}`, { headers: headers() }).then((res) =>
      handleResponse<
        Facility & {
          staffList: Staff[];
          services: string[];
          legalInfo: Record<string, unknown> | null;
          specificFields: FacilitySpecificFields | null;
        }
      >(res),
    ),
  getStaff: (id: string) =>
    fetch(`${API_BASE}/facilities/${id}/staff`, { headers: headers() }).then((res) =>
      handleResponse<Staff[]>(res),
    ),
  create: (body: CreateFacilityDto) =>
    fetch(`${API_BASE}/facilities`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<Facility>(res)),
  update: (id: string, body: UpdateFacilityDto) =>
    fetch(`${API_BASE}/facilities/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<Facility>(res)),
  delete: (id: string) =>
    fetch(`${API_BASE}/facilities/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then((res) => handleResponse<{ deleted: boolean }>(res)),
};

export interface CreateFacilityDto {
  name: string;
  type: string;
  ownershipType?: string;
  registrationNo?: string;
  tin?: string;
  description?: string;
  region?: string;
  city?: string;
  woreda?: string;
  kebele?: string;
  streetAddress?: string;
  gpsLat?: number;
  gpsLng?: number;
  phone?: string;
  altPhone?: string;
  email?: string;
  website?: string;
  licenseNo?: string;
  licenseIssueDate?: string;
  licenseExpiry?: string;
  regulatoryAuthority?: string;
  accreditationLevel?: string;
  operatingHours?: string;
  status?: string;
  approvalStatus?: string;
  address?: string;
  services?: string[];
  legalInfo?: Record<string, unknown>;
  specificFields?: FacilitySpecificFields;
  createdBy?: string;
}

export type UpdateFacilityDto = Partial<CreateFacilityDto>;

// Staff — common + role-specific (specificFields JSON)
export interface StaffSpecificFields {
  doctor?: Record<string, unknown>;
  nurse?: Record<string, unknown>;
  pharmacist?: Record<string, unknown>;
  labTechnician?: Record<string, unknown>;
  administrative?: Record<string, unknown>;
}

export interface Staff {
  id: string;
  employeeId: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  nationalId: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  department: string | null;
  designation: string;
  staffRole: string | null;
  employmentType: string | null;
  facilityId: string | null;
  facility?: { id: string; name: string; type: string };
  departmentName: string | null;
  licenseNo: string | null;
  licenseIssueDate: string | null;
  licenseExpiry: string | null;
  status: string;
  joiningDate: string | null;
  emergencyContact: string | null;
  specificFields: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: StaffDocument[];
}

export interface StaffDocument {
  id: string;
  staffId: string;
  name: string;
  type: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number | null;
  uploadedAt: string;
}

export interface CreateStaffDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  nationalId?: string;
  email: string;
  phone?: string;
  address?: string;
  department?: string;
  designation: string;
  staffRole?: string;
  employmentType?: string;
  facilityId?: string;
  departmentName?: string;
  licenseNo?: string;
  licenseIssueDate?: string;
  licenseExpiry?: string;
  status?: string;
  joiningDate?: string;
  emergencyContact?: string;
  specificFields?: StaffSpecificFields;
  createdBy?: string;
  name?: string;
}

export type UpdateStaffDto = Partial<CreateStaffDto>;

export const staffApi = {
  list: (params?: { search?: string; status?: string; facilityId?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.facilityId) q.set('facilityId', params.facilityId);
    const query = q.toString();
    return fetch(`${API_BASE}/staff${query ? `?${query}` : ''}`, {
      headers: headers(),
    }).then((res) => handleResponse<Staff[]>(res));
  },
  get: (id: string) =>
    fetch(`${API_BASE}/staff/${id}`, { headers: headers() }).then((res) =>
      handleResponse<Staff & { specificFields: StaffSpecificFields | null }>(res),
    ),
  licenseExpiring: (days?: number) =>
    fetch(`${API_BASE}/staff/license-expiring${days != null ? `?days=${days}` : ''}`, {
      headers: headers(),
    }).then((res) => handleResponse<Staff[]>(res)),
  create: (body: CreateStaffDto) =>
    fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<Staff>(res)),
  update: (id: string, body: UpdateStaffDto) =>
    fetch(`${API_BASE}/staff/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<Staff>(res)),
  delete: (id: string) =>
    fetch(`${API_BASE}/staff/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then((res) => handleResponse<{ deleted: boolean }>(res)),
};

// Documents (upload uses FormData)
export const documentsApi = {
  facility: {
    list: (facilityId: string) =>
      fetch(`${API_BASE}/documents/facility/${facilityId}`, { headers: headers() }).then((res) =>
        handleResponse<FacilityDocument[]>(res),
      ),
    upload: (facilityId: string, file: File, name?: string, type?: string) => {
      const form = new FormData();
      form.append('file', file);
      if (name) form.append('name', name);
      if (type) form.append('type', type);
      return fetch(`${API_BASE}/documents/facility/${facilityId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      }).then((res) => handleResponse<FacilityDocument>(res));
    },
    delete: (id: string) =>
      fetch(`${API_BASE}/documents/facility/doc/${id}`, {
        method: 'DELETE',
        headers: headers(),
      }).then((res) => handleResponse<{ deleted: boolean }>(res)),
  },
  staff: {
    list: (staffId: string) =>
      fetch(`${API_BASE}/documents/staff/${staffId}`, { headers: headers() }).then((res) =>
        handleResponse<StaffDocument[]>(res),
      ),
    upload: (staffId: string, file: File, name?: string, type?: string) => {
      const form = new FormData();
      form.append('file', file);
      if (name) form.append('name', name);
      if (type) form.append('type', type);
      return fetch(`${API_BASE}/documents/staff/${staffId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      }).then((res) => handleResponse<StaffDocument>(res));
    },
    delete: (id: string) =>
      fetch(`${API_BASE}/documents/staff/doc/${id}`, {
        method: 'DELETE',
        headers: headers(),
      }).then((res) => handleResponse<{ deleted: boolean }>(res)),
  },
};

// Notifications
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  recipient: string | null;
  sentAt: string | null;
  readAt: string | null;
  metadata: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: (params?: { type?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.limit != null) q.set('limit', String(params.limit));
    const query = q.toString();
    return fetch(`${API_BASE}/notifications${query ? `?${query}` : ''}`, {
      headers: headers(),
    }).then((res) => handleResponse<Notification[]>(res));
  },
  markRead: (id: string) =>
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: headers(),
    }).then((res) => handleResponse<Notification>(res)),
  broadcast: (body: {
    title: string;
    message: string;
    type?: string;
    audience: 'ALL' | 'ROLE';
    role?: string;
    inApp: boolean;
    email: boolean;
  }) =>
    fetch(`${API_BASE}/notifications/broadcast`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<{ created: number; recipients: number }>(res)),
};

// User management & RBAC
export interface PermissionRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  role: RoleWithPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManagedUserDto {
  email: string;
  password: string;
  name: string;
  roleId: string;
}

export interface UpdateManagedUserDto {
  email?: string;
  name?: string;
  roleId?: string;
  password?: string;
}

export const usersApi = {
  list: () =>
    fetch(`${API_BASE}/users`, { headers: headers() }).then((res) => handleResponse<ManagedUser[]>(res)),
  get: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, { headers: headers() }).then((res) => handleResponse<ManagedUser>(res)),
  create: (body: CreateManagedUserDto) =>
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<ManagedUser>(res)),
  update: (id: string, body: UpdateManagedUserDto) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((res) => handleResponse<ManagedUser>(res)),
  delete: (id: string) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then((res) => handleResponse<{ deleted: boolean }>(res)),
  listRoles: () =>
    fetch(`${API_BASE}/users/roles`, { headers: headers() }).then((res) => handleResponse<RoleWithPermissions[]>(res)),
  listPermissions: () =>
    fetch(`${API_BASE}/users/permissions`, { headers: headers() }).then((res) =>
      handleResponse<PermissionRecord[]>(res),
    ),
};

export const rolesApi = {
  updatePermissions: (roleId: string, permissionNames: string[]) =>
    fetch(`${API_BASE}/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ permissionNames }),
    }).then((res) => handleResponse<RoleWithPermissions>(res)),
};
