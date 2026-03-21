import React from 'react';
import type { StaffSpecificFields } from '@/services/api';

export const STAFF_ROLE_LABELS: Record<string, string> = {
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  PHARMACIST: 'Pharmacist',
  LAB_TECH: 'Lab technician',
  ADMIN: 'Administrative',
};

/** API may return JSON string; forms use object */
export function normalizeStaffSpecificFields(
  raw: StaffSpecificFields | string | null | undefined,
): StaffSpecificFields | null {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown;
      if (typeof p === 'object' && p !== null) return p as StaffSpecificFields;
      return null;
    } catch {
      return null;
    }
  }
  return raw;
}

function fmtBool(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  return v ? 'Yes' : 'No';
}

function str(v: unknown): string {
  if (v === undefined || v === null) return '';
  return String(v);
}

function numDisplay(v: unknown): React.ReactNode {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  const s = str(v);
  return s || null;
}

function pick(label: string, value: React.ReactNode): { label: string; value: React.ReactNode } | null {
  if (value === undefined || value === null || value === '') return null;
  return { label, value };
}

function buildRows(
  role: string,
  sf: StaffSpecificFields,
): Array<{ label: string; value: React.ReactNode }> {
  const doc = sf.doctor ?? {};
  const nurse = sf.nurse ?? {};
  const pharm = sf.pharmacist ?? {};
  const lab = sf.labTechnician ?? {};
  const admin = sf.administrative ?? {};

  const out: Array<{ label: string; value: React.ReactNode } | null> = [];

  switch (role) {
    case 'DOCTOR':
      out.push(
        pick('Specialization', str(doc.medicalSpecialization) || null),
        pick('Medical degree', str(doc.medicalDegree) || null),
        pick('Sub-specialization', str(doc.subSpecialization) || null),
        pick('Years of experience', numDisplay(doc.yearsOfExperience)),
        pick('Surgery authorization', fmtBool(doc.surgeryAuthorization)),
      );
      break;
    case 'NURSE':
      out.push(
        pick('Nursing qualification', str(nurse.nursingQualification) || null),
        pick('Nursing grade', str(nurse.nursingGrade) || null),
        pick('Department assignment', str(nurse.departmentAssignment) || null),
        pick('Years of experience', numDisplay(nurse.yearsOfExperience)),
      );
      break;
    case 'PHARMACIST':
      out.push(
        pick('Pharmacy degree', str(pharm.pharmacyDegree) || null),
        pick('Dispensing license', str(pharm.drugDispensingLicenseNumber) || null),
        pick('Controlled drug authorization', str(pharm.controlledDrugAuthorization) || null),
        pick('Years of experience', numDisplay(pharm.yearsOfExperience)),
      );
      break;
    case 'LAB_TECH':
      out.push(
        pick('Lab qualification', str(lab.laboratoryQualification) || null),
        pick('Equipment authorization', str(lab.equipmentAuthorization) || null),
        pick('Lab specialization', str(lab.labSpecialization) || null),
      );
      break;
    case 'ADMIN':
      out.push(
        pick('Position', str(admin.position) || null),
        pick('Department', str(admin.department) || null),
        pick('Education', str(admin.educationLevel) || null),
        pick('Work experience', str(admin.workExperience) || null),
      );
      break;
    default:
      return [];
  }

  return out.filter((r): r is { label: string; value: React.ReactNode } => r !== null);
}

export interface StaffRoleSpecificFieldsDisplayProps {
  staffRole: string | null | undefined;
  specificFields: StaffSpecificFields | string | null | undefined;
  /** Extra class on the rows container */
  className?: string;
}

/**
 * Human-readable role-specific staff fields (doctor, nurse, etc.) — not raw JSON.
 */
export function StaffRoleSpecificFieldsDisplay({
  staffRole,
  specificFields,
  className = '',
}: StaffRoleSpecificFieldsDisplayProps) {
  const role = staffRole || 'DOCTOR';
  const sf = normalizeStaffSpecificFields(specificFields) ?? {};
  const knownRole = ['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECH', 'ADMIN'].includes(role);
  const rows = knownRole ? buildRows(role, sf) : [];

  if (!knownRole) {
    return (
      <p className="text-sm text-muted-foreground">
        Unknown role <span className="font-mono">{role}</span>. Role-specific fields are not displayed.
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className={`text-sm text-muted-foreground ${className}`.trim()}>No role-specific details recorded.</p>
    );
  }

  return (
    <div className={className}>
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 sm:flex-row sm:gap-4 py-2 border-b border-gray-100 text-sm last:border-0"
        >
          <span className="text-muted-foreground sm:w-44 shrink-0">{label}</span>
          <span className="font-medium text-gray-900 break-words">{value}</span>
        </div>
      ))}
    </div>
  );
}
