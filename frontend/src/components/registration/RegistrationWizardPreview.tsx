import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type {
  CreateFacilityDto,
  FacilitySpecificFields,
  FacilityDocument,
  CreateStaffDto,
  StaffSpecificFields,
  StaffDocument,
} from '@/services/api';
import type { PendingLegalDocument } from '@/components/registration/RegistrationLegalDocumentsSection';
import {
  StaffRoleSpecificFieldsDisplay,
  STAFF_ROLE_LABELS,
} from '@/components/staff/StaffRoleSpecificFieldsDisplay';
import { Info } from 'lucide-react';

function PreviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4 py-2 border-b border-gray-100 text-sm last:border-0">
      <span className="text-muted-foreground sm:w-44 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 break-words">{value}</span>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-4 space-y-1">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      {children}
    </div>
  );
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
  HOSPITAL: 'Hospital',
  CLINIC: 'Clinic',
  HEALTH_CENTER: 'Health Center',
  PHARMACY: 'Pharmacy',
  LAB: 'Lab / Diagnostic Center',
};

const OWNERSHIP_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  NGO: 'NGO',
  CHARITY: 'Charity',
};

function fmtBool(v: boolean | undefined) {
  if (v === undefined) return null;
  return v ? 'Yes' : 'No';
}

type FacilityForm = CreateFacilityDto & { specificFields?: FacilitySpecificFields };

export interface FacilityRegistrationWizardPreviewProps {
  form: FacilityForm;
  hasSpecificStep: boolean;
  pendingLegalDocs: PendingLegalDocument[];
  serverLegalDocs: FacilityDocument[];
  isOfficer: boolean;
}

export function FacilityRegistrationWizardPreview({
  form,
  hasSpecificStep,
  pendingLegalDocs,
  serverLegalDocs,
  isOfficer,
}: FacilityRegistrationWizardPreviewProps) {
  const sf = form.specificFields;

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Review before submitting</AlertTitle>
        <AlertDescription>
          Check that everything is correct. Use <strong>Back</strong> to edit a section. {isOfficer && 'As an officer, this will be submitted for admin approval.'}
        </AlertDescription>
      </Alert>

      <PreviewSection title="Basic information">
        <PreviewRow label="Facility name" value={form.name} />
        <PreviewRow label="Type" value={FACILITY_TYPE_LABELS[form.type] ?? form.type} />
        <PreviewRow label="Ownership" value={form.ownershipType ? OWNERSHIP_LABELS[form.ownershipType] ?? form.ownershipType : null} />
        <PreviewRow label="Registration no." value={form.registrationNo} />
        <PreviewRow label="TIN" value={form.tin} />
        <PreviewRow label="Description" value={form.description} />
      </PreviewSection>

      <PreviewSection title="Location">
        <PreviewRow label="Region" value={form.region} />
        <PreviewRow label="City" value={form.city} />
        <PreviewRow label="Woreda" value={form.woreda} />
        <PreviewRow label="Kebele" value={form.kebele} />
        <PreviewRow label="Street address" value={form.streetAddress} />
        <PreviewRow label="GPS" value={[form.gpsLat, form.gpsLng].every((x) => x == null) ? null : `${form.gpsLat ?? '—'}, ${form.gpsLng ?? '—'}`} />
      </PreviewSection>

      <PreviewSection title="Contact">
        <PreviewRow label="Phone" value={form.phone} />
        <PreviewRow label="Alt. phone" value={form.altPhone} />
        <PreviewRow label="Email" value={form.email} />
        <PreviewRow label="Website" value={form.website} />
      </PreviewSection>

      <PreviewSection title="Legal & compliance">
        <PreviewRow label="License number" value={form.licenseNo} />
        <PreviewRow label="License issued" value={form.licenseIssueDate} />
        <PreviewRow label="License expires" value={form.licenseExpiry} />
        <PreviewRow label="Regulatory authority" value={form.regulatoryAuthority} />
        <PreviewRow label="Accreditation" value={form.accreditationLevel} />
        {serverLegalDocs.length > 0 && (
          <div className="pt-2 text-sm">
            <span className="text-muted-foreground">Existing documents: </span>
            {serverLegalDocs.map((d) => (
              <Badge key={d.id} variant="secondary" className="mr-1 mt-1">
                {d.name}
              </Badge>
            ))}
          </div>
        )}
        {pendingLegalDocs.length > 0 && (
          <div className="pt-2 text-sm">
            <span className="text-muted-foreground">Queued uploads: </span>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {pendingLegalDocs.map((p) => (
                <li key={p.id}>
                  {p.name} <span className="text-muted-foreground">({p.docType})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PreviewSection>

      <PreviewSection title="Operational">
        <PreviewRow label="Operating hours" value={form.operatingHours} />
      </PreviewSection>

      {hasSpecificStep && (
        <PreviewSection title="Facility-specific">
          {form.type === 'HOSPITAL' && sf?.hospital && (
            <>
              <PreviewRow label="Beds" value={sf.hospital.numberOfBeds} />
              <PreviewRow label="Departments" value={sf.hospital.numberOfDepartments} />
              <PreviewRow label="ICU" value={fmtBool(sf.hospital.icuAvailability)} />
              <PreviewRow label="Emergency" value={fmtBool(sf.hospital.emergencyService)} />
              <PreviewRow label="Ambulance" value={fmtBool(sf.hospital.ambulanceService)} />
              <PreviewRow label="Surgery" value={fmtBool(sf.hospital.surgeryService)} />
              <PreviewRow label="Laboratory" value={fmtBool(sf.hospital.laboratoryAvailable)} />
              <PreviewRow label="Blood bank" value={fmtBool(sf.hospital.bloodBankAvailable)} />
            </>
          )}
          {form.type === 'CLINIC' && sf?.clinic && (
            <>
              <PreviewRow label="Category" value={sf.clinic.clinicCategory} />
              <PreviewRow label="Consultation rooms" value={sf.clinic.consultationRoomsCount} />
              <PreviewRow label="Specialization" value={sf.clinic.specialization} />
              <PreviewRow label="Laboratory" value={fmtBool(sf.clinic.laboratoryAvailable)} />
            </>
          )}
          {form.type === 'HEALTH_CENTER' && sf?.healthCenter && (
            <>
              <PreviewRow label="Catchment population" value={sf.healthCenter.catchmentPopulation} />
              <PreviewRow label="Maternal care" value={fmtBool(sf.healthCenter.maternalCareAvailable)} />
              <PreviewRow label="Vaccination" value={fmtBool(sf.healthCenter.vaccinationService)} />
              <PreviewRow label="Community program" value={fmtBool(sf.healthCenter.communityHealthProgram)} />
            </>
          )}
          {form.type === 'PHARMACY' && sf?.pharmacy && (
            <>
              <PreviewRow label="Pharmacy type" value={sf.pharmacy.pharmacyType} />
              <PreviewRow label="Controlled drug auth." value={sf.pharmacy.controlledDrugAuthorizationNumber} />
              <PreviewRow label="Pharmacist in charge (ID)" value={sf.pharmacy.pharmacistInChargeId} />
              <PreviewRow label="Drug storage" value={fmtBool(sf.pharmacy.drugStorageFacility)} />
              <PreviewRow label="Cold storage" value={fmtBool(sf.pharmacy.coldStorageAvailable)} />
            </>
          )}
        </PreviewSection>
      )}
    </div>
  );
}

type StaffForm = CreateStaffDto & { specificFields?: StaffSpecificFields };

export interface StaffRegistrationWizardPreviewProps {
  form: StaffForm;
  facilityName?: string;
  pendingLegalDocs: PendingLegalDocument[];
  serverLegalDocs: StaffDocument[];
  isOfficer: boolean;
}

export function StaffRegistrationWizardPreview({
  form,
  facilityName,
  pendingLegalDocs,
  serverLegalDocs,
  isOfficer,
}: StaffRegistrationWizardPreviewProps) {
  const role = form.staffRole || 'DOCTOR';

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Review before submitting</AlertTitle>
        <AlertDescription>
          Check that everything is correct. Use <strong>Back</strong> to edit a section. {isOfficer && 'As an officer, this record will be submitted for admin approval.'}
        </AlertDescription>
      </Alert>

      <PreviewSection title="Personal information">
        <PreviewRow label="Name" value={`${form.firstName} ${form.lastName}`.trim()} />
        <PreviewRow label="Gender" value={form.gender} />
        <PreviewRow label="Date of birth" value={form.dateOfBirth} />
        <PreviewRow label="National ID" value={form.nationalId} />
        <PreviewRow label="Phone" value={form.phone} />
        <PreviewRow label="Email" value={form.email} />
        <PreviewRow label="Address" value={form.address} />
      </PreviewSection>

      <PreviewSection title="Employment">
        <PreviewRow label="Staff ID" value={form.employeeId} />
        <PreviewRow label="Facility" value={facilityName || form.facilityId || '—'} />
        <PreviewRow label="Department" value={form.department} />
        <PreviewRow label="Department (display)" value={form.departmentName} />
        <PreviewRow label="Job title" value={form.designation} />
        <PreviewRow label="Employment type" value={form.employmentType} />
        <PreviewRow label="Join date" value={form.joiningDate} />
        <PreviewRow label="Status" value={form.status} />
        <PreviewRow label="Emergency contact" value={form.emergencyContact} />
      </PreviewSection>

      <PreviewSection title="License & compliance">
        <PreviewRow label="License number" value={form.licenseNo} />
        <PreviewRow label="License issued" value={form.licenseIssueDate} />
        <PreviewRow label="License expires" value={form.licenseExpiry} />
        {serverLegalDocs.length > 0 && (
          <div className="pt-2 text-sm">
            <span className="text-muted-foreground">Existing documents: </span>
            {serverLegalDocs.map((d) => (
              <Badge key={d.id} variant="secondary" className="mr-1 mt-1">
                {d.name}
              </Badge>
            ))}
          </div>
        )}
        {pendingLegalDocs.length > 0 && (
          <div className="pt-2 text-sm">
            <span className="text-muted-foreground">Queued uploads: </span>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {pendingLegalDocs.map((p) => (
                <li key={p.id}>
                  {p.name} <span className="text-muted-foreground">({p.docType})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PreviewSection>

      <PreviewSection title={`Role-specific (${STAFF_ROLE_LABELS[role] ?? role})`}>
        <StaffRoleSpecificFieldsDisplay staffRole={role} specificFields={form.specificFields} />
      </PreviewSection>
    </div>
  );
}
