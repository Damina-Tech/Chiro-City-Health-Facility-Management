import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERMISSIONS } from '@/constants/permissions';
import {
  staffApi,
  facilitiesApi,
  type CreateStaffDto,
  type StaffSpecificFields,
} from '@/services/api';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal information', short: 'Personal' },
  { id: 2, title: 'Employment', short: 'Employment' },
  { id: 3, title: 'License & compliance', short: 'License' },
  { id: 4, title: 'Role-specific', short: 'Role' },
];

const STAFF_ROLE_OPTIONS = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'LAB_TECH', label: 'Lab technician' },
  { value: 'ADMIN', label: 'Administrative' },
];
const EMPLOYMENT_OPTIONS = [
  { value: 'PERMANENT', label: 'Permanent' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Temporary' },
];
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];
const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'SUBMITTED', 'APPROVED', 'INACTIVE'];
const NURSING_GRADES = ['JUNIOR', 'SENIOR', 'SPECIALIST'];

type FormState = CreateStaffDto & { specificFields?: StaffSpecificFields };

const emptyForm = (): FormState => ({
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  designation: '',
  status: 'DRAFT',
  staffRole: 'DOCTOR',
  specificFields: {},
});

function buildPayload(form: FormState): CreateStaffDto {
  const payload: CreateStaffDto = {
    employeeId: form.employeeId,
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    designation: form.designation,
    status: form.status || 'DRAFT',
  };
  if (form.gender) payload.gender = form.gender;
  if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
  if (form.nationalId) payload.nationalId = form.nationalId;
  if (form.phone) payload.phone = form.phone;
  if (form.address) payload.address = form.address;
  if (form.department) payload.department = form.department;
  if (form.staffRole) payload.staffRole = form.staffRole;
  if (form.employmentType) payload.employmentType = form.employmentType;
  if (form.facilityId) payload.facilityId = form.facilityId;
  if (form.departmentName) payload.departmentName = form.departmentName;
  if (form.licenseNo) payload.licenseNo = form.licenseNo;
  if (form.licenseIssueDate) payload.licenseIssueDate = form.licenseIssueDate;
  if (form.licenseExpiry) payload.licenseExpiry = form.licenseExpiry;
  if (form.joiningDate) payload.joiningDate = form.joiningDate;
  if (form.emergencyContact) payload.emergencyContact = form.emergencyContact;
  if (form.specificFields && Object.keys(form.specificFields).length > 0) payload.specificFields = form.specificFields;
  return payload;
}

export default function StaffRegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEdit = Boolean(id);
  const canCreate = hasPermission(PERMISSIONS.STAFF_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.STAFF_UPDATE);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(isEdit);

  const totalSteps = STEPS.length;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    facilitiesApi.list().then((list) => setFacilities(list.map((f) => ({ id: f.id, name: f.name }))));
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoadingStaff(true);
    staffApi
      .get(id)
      .then((s) => {
        let specificFields: StaffSpecificFields = {};
        try {
          if (typeof s.specificFields === 'object' && s.specificFields) specificFields = s.specificFields as StaffSpecificFields;
          else if (typeof s.specificFields === 'string' && s.specificFields) specificFields = JSON.parse(s.specificFields);
        } catch {
          // leave {}
        }
        setForm({
          employeeId: s.employeeId,
          firstName: s.firstName || s.name.split(' ')[0] || '',
          lastName: s.lastName || s.name.split(' ').slice(1).join(' ') || '',
          email: s.email,
          phone: s.phone ?? '',
          gender: s.gender ?? '',
          dateOfBirth: s.dateOfBirth ? String(s.dateOfBirth).slice(0, 10) : '',
          nationalId: s.nationalId ?? '',
          address: s.address ?? '',
          department: s.department ?? '',
          designation: s.designation,
          staffRole: s.staffRole || 'DOCTOR',
          employmentType: s.employmentType ?? '',
          facilityId: s.facilityId ?? undefined,
          departmentName: s.departmentName ?? '',
          licenseNo: s.licenseNo ?? '',
          licenseIssueDate: s.licenseIssueDate ? String(s.licenseIssueDate).slice(0, 10) : '',
          licenseExpiry: s.licenseExpiry ? String(s.licenseExpiry).slice(0, 10) : '',
          status: s.status,
          joiningDate: s.joiningDate ? String(s.joiningDate).slice(0, 10) : '',
          emergencyContact: s.emergencyContact ?? '',
          specificFields,
        });
      })
      .catch(() => navigate('/staff'))
      .finally(() => setLoadingStaff(false));
  }, [id, isEdit, navigate]);

  const setSpec = (key: keyof StaffSpecificFields, value: Record<string, unknown>) => {
    setForm((p) => ({ ...p, specificFields: { ...p.specificFields, [key]: value } }));
  };

  const handleSubmit = async () => {
    setSubmitError('');
    setLoading(true);
    const payload = buildPayload(form);
    try {
      if (isEdit && id) {
        await staffApi.update(id, payload);
        navigate(`/staff/${id}`);
      } else {
        const created = await staffApi.create(payload);
        navigate(`/staff/${created.id}`);
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!isEdit && !canCreate) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No access</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/staff')}>Back</Button>
      </div>
    );
  }
  if (isEdit && !canUpdate) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No access</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/staff')}>Back</Button>
      </div>
    );
  }

  if (loadingStaff) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const role = form.staffRole || 'DOCTOR';
  const doc = form.specificFields?.doctor ?? {};
  const nurse = form.specificFields?.nurse ?? {};
  const pharm = form.specificFields?.pharmacist ?? {};
  const lab = form.specificFields?.labTechnician ?? {};
  const admin = form.specificFields?.administrative ?? {};

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(isEdit && id ? `/staff/${id}` : '/staff')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit staff' : 'Register staff'}</h1>
          <p className="text-gray-600 text-sm mt-0.5">Step {step} of {totalSteps}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between gap-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex-1 flex flex-col items-center gap-1 ${s.id === step ? 'text-blue-600' : s.id < step ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  s.id < step ? 'bg-green-500 text-white border-green-500' : s.id === step ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {s.id < step ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{s.short}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {submitError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{STEPS[step - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>First name *</Label><Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required /></div>
                <div><Label>Last name *</Label><Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  <Select value={form.gender || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, gender: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">—</SelectItem>{GENDER_OPTIONS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date of birth</Label><Input type="date" value={form.dateOfBirth ?? ''} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} /></div>
              </div>
              <div><Label>National ID</Label><Input value={form.nationalId ?? ''} onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={form.phone ?? ''} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address ?? ''} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
            </>
          )}

          {step === 2 && (
            <>
              <div><Label>Staff ID *</Label><Input value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} required placeholder="e.g. EMP-001" /></div>
              <div>
                <Label>Facility</Label>
                <Select value={form.facilityId ?? 'none'} onValueChange={(v) => setForm((p) => ({ ...p, facilityId: v === 'none' ? undefined : v }))}>
                  <SelectTrigger><SelectValue placeholder="Assigned institution" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">— None —</SelectItem>{facilities.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Department</Label><Input value={form.department ?? ''} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} /></div>
                <div><Label>Department (display)</Label><Input value={form.departmentName ?? ''} onChange={(e) => setForm((p) => ({ ...p, departmentName: e.target.value }))} placeholder="Optional" /></div>
              </div>
              <div><Label>Job title / role *</Label><Input value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} required placeholder="e.g. Senior nurse" /></div>
              <div>
                <Label>Employment type</Label>
                <Select value={form.employmentType || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, employmentType: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">—</SelectItem>{EMPLOYMENT_OPTIONS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Join date</Label><Input type="date" value={form.joiningDate ?? ''} onChange={(e) => setForm((p) => ({ ...p, joiningDate: e.target.value }))} /></div>
                <div>
                  <Label>Staff status</Label>
                  <Select value={form.status ?? 'DRAFT'} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Emergency contact</Label><Input value={form.emergencyContact ?? ''} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: e.target.value }))} /></div>
            </>
          )}

          {step === 3 && (
            <>
              <div><Label>Professional license number</Label><Input value={form.licenseNo ?? ''} onChange={(e) => setForm((p) => ({ ...p, licenseNo: e.target.value }))} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>License issue date</Label><Input type="date" value={form.licenseIssueDate ?? ''} onChange={(e) => setForm((p) => ({ ...p, licenseIssueDate: e.target.value }))} /></div>
                <div><Label>License expiry date</Label><Input type="date" value={form.licenseExpiry ?? ''} onChange={(e) => setForm((p) => ({ ...p, licenseExpiry: e.target.value }))} /></div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <Label>Primary staff role *</Label>
                <Select value={form.staffRole ?? 'DOCTOR'} onValueChange={(v) => setForm((p) => ({ ...p, staffRole: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STAFF_ROLE_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {role === 'DOCTOR' && (
                <div className="space-y-3 pt-2 border-t">
                  <div><Label>Medical specialization</Label><Input value={String(doc.medicalSpecialization ?? '')} onChange={(e) => setSpec('doctor', { ...doc, medicalSpecialization: e.target.value })} placeholder="e.g. Cardiology" /></div>
                  <div><Label>Medical degree</Label><Input value={String(doc.medicalDegree ?? '')} onChange={(e) => setSpec('doctor', { ...doc, medicalDegree: e.target.value })} /></div>
                  <div><Label>Sub-specialization</Label><Input value={String(doc.subSpecialization ?? '')} onChange={(e) => setSpec('doctor', { ...doc, subSpecialization: e.target.value })} /></div>
                  <div><Label>Years of experience</Label><Input type="number" min={0} value={doc.yearsOfExperience != null ? String(doc.yearsOfExperience) : ''} onChange={(e) => setSpec('doctor', { ...doc, yearsOfExperience: e.target.value ? Number(e.target.value) : undefined })} /></div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(doc.surgeryAuthorization)} onChange={(e) => setSpec('doctor', { ...doc, surgeryAuthorization: e.target.checked })} /><span className="text-sm">Surgery authorization</span></label>
                </div>
              )}

              {role === 'NURSE' && (
                <div className="space-y-3 pt-2 border-t">
                  <div><Label>Nursing qualification</Label><Input value={String(nurse.nursingQualification ?? '')} onChange={(e) => setSpec('nurse', { ...nurse, nursingQualification: e.target.value })} /></div>
                  <div>
                    <Label>Nursing grade</Label>
                    <Select value={String(nurse.nursingGrade ?? 'none')} onValueChange={(v) => setSpec('nurse', { ...nurse, nursingGrade: v === 'none' ? '' : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="none">—</SelectItem>{NURSING_GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Department assignment</Label><Input value={String(nurse.departmentAssignment ?? '')} onChange={(e) => setSpec('nurse', { ...nurse, departmentAssignment: e.target.value })} /></div>
                  <div><Label>Years of experience</Label><Input type="number" min={0} value={nurse.yearsOfExperience != null ? String(nurse.yearsOfExperience) : ''} onChange={(e) => setSpec('nurse', { ...nurse, yearsOfExperience: e.target.value ? Number(e.target.value) : undefined })} /></div>
                </div>
              )}

              {role === 'PHARMACIST' && (
                <div className="space-y-3 pt-2 border-t">
                  <div><Label>Pharmacy degree</Label><Input value={String(pharm.pharmacyDegree ?? '')} onChange={(e) => setSpec('pharmacist', { ...pharm, pharmacyDegree: e.target.value })} /></div>
                  <div><Label>Drug dispensing license number</Label><Input value={String(pharm.drugDispensingLicenseNumber ?? '')} onChange={(e) => setSpec('pharmacist', { ...pharm, drugDispensingLicenseNumber: e.target.value })} /></div>
                  <div><Label>Controlled drug authorization</Label><Input value={String(pharm.controlledDrugAuthorization ?? '')} onChange={(e) => setSpec('pharmacist', { ...pharm, controlledDrugAuthorization: e.target.value })} /></div>
                  <div><Label>Years of experience</Label><Input type="number" min={0} value={pharm.yearsOfExperience != null ? String(pharm.yearsOfExperience) : ''} onChange={(e) => setSpec('pharmacist', { ...pharm, yearsOfExperience: e.target.value ? Number(e.target.value) : undefined })} /></div>
                </div>
              )}

              {role === 'LAB_TECH' && (
                <div className="space-y-3 pt-2 border-t">
                  <div><Label>Laboratory qualification</Label><Input value={String(lab.laboratoryQualification ?? '')} onChange={(e) => setSpec('labTechnician', { ...lab, laboratoryQualification: e.target.value })} /></div>
                  <div><Label>Equipment authorization</Label><Input value={String(lab.equipmentAuthorization ?? '')} onChange={(e) => setSpec('labTechnician', { ...lab, equipmentAuthorization: e.target.value })} /></div>
                  <div><Label>Lab specialization</Label><Input value={String(lab.labSpecialization ?? '')} onChange={(e) => setSpec('labTechnician', { ...lab, labSpecialization: e.target.value })} placeholder="e.g. Hematology" /></div>
                </div>
              )}

              {role === 'ADMIN' && (
                <div className="space-y-3 pt-2 border-t">
                  <div><Label>Position</Label><Input value={String(admin.position ?? '')} onChange={(e) => setSpec('administrative', { ...admin, position: e.target.value })} placeholder="HR / Reception / Finance" /></div>
                  <div><Label>Department</Label><Input value={String(admin.department ?? '')} onChange={(e) => setSpec('administrative', { ...admin, department: e.target.value })} /></div>
                  <div><Label>Education level</Label><Input value={String(admin.educationLevel ?? '')} onChange={(e) => setSpec('administrative', { ...admin, educationLevel: e.target.value })} /></div>
                  <div><Label>Work experience</Label><Input value={String(admin.workExperience ?? '')} onChange={(e) => setSpec('administrative', { ...admin, workExperience: e.target.value })} placeholder="Summary or years" /></div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}>
            Next<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Register'}
          </Button>
        )}
      </div>
    </div>
  );
}
