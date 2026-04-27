import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PERMISSIONS } from '@/constants/permissions';
import {
  facilitiesApi,
  documentsApi,
  type CreateFacilityDto,
  type FacilitySpecificFields,
  type FacilityDocument,
} from '@/services/api';
import {
  RegistrationLegalDocumentsSection,
  uploadPendingFacilityDocuments,
  type PendingLegalDocument,
} from '@/components/registration/RegistrationLegalDocumentsSection';
import { FacilityRegistrationWizardPreview } from '@/components/registration/RegistrationWizardPreview';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Info } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic info', short: 'Basic' },
  { id: 2, title: 'Location', short: 'Location' },
  { id: 3, title: 'Contact', short: 'Contact' },
  { id: 4, title: 'Legal & compliance', short: 'Legal' },
  { id: 5, title: 'Operational', short: 'Operational' },
  { id: 6, title: 'Facility-specific', short: 'Specific' },
];

const FACILITY_TYPES = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'HEALTH_CENTER', label: 'Health Center' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'LAB', label: 'Lab / Diagnostic Center' },
];
const OWNERSHIP_OPTIONS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'NGO', label: 'NGO' },
  { value: 'CHARITY', label: 'Charity' },
];
const CLINIC_CATEGORIES = [{ value: 'GENERAL', label: 'General' }, { value: 'SPECIALIZED', label: 'Specialized' }];
const CLINIC_SPECIALIZATIONS = ['Dental', 'Eye', 'Pediatrics', 'Dermatology', 'Orthopedic', 'Other'];
const PHARMACY_TYPES = [
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'HOSPITAL_PHARMACY', label: 'Hospital Pharmacy' },
];

type FormState = CreateFacilityDto & { specificFields?: FacilitySpecificFields };

const emptyForm = (): FormState => ({
  name: '',
  type: 'HEALTH_CENTER',
  status: 'DRAFT',
  ownershipType: '',
  registrationNo: '',
  tin: '',
  description: '',
  region: '',
  city: '',
  woreda: '',
  kebele: '',
  streetAddress: '',
  gpsLat: undefined,
  gpsLng: undefined,
  phone: '',
  altPhone: '',
  email: '',
  website: '',
  licenseNo: '',
  licenseIssueDate: '',
  licenseExpiry: '',
  regulatoryAuthority: '',
  accreditationLevel: '',
  operatingHours: '',
  approvalStatus: '',
  address: '',
  specificFields: {},
});

function buildPayload(form: FormState): CreateFacilityDto {
  const payload: CreateFacilityDto = {
    name: form.name,
    type: form.type,
    status: form.status || 'DRAFT',
  };
  if (form.ownershipType) payload.ownershipType = form.ownershipType;
  if (form.registrationNo) payload.registrationNo = form.registrationNo;
  if (form.tin) payload.tin = form.tin;
  if (form.description) payload.description = form.description;
  if (form.region) payload.region = form.region;
  if (form.city) payload.city = form.city;
  if (form.woreda) payload.woreda = form.woreda;
  if (form.kebele) payload.kebele = form.kebele;
  if (form.streetAddress) payload.streetAddress = form.streetAddress;
  if (form.gpsLat != null) payload.gpsLat = form.gpsLat;
  if (form.gpsLng != null) payload.gpsLng = form.gpsLng;
  if (form.phone) payload.phone = form.phone;
  if (form.altPhone) payload.altPhone = form.altPhone;
  if (form.email) payload.email = form.email;
  if (form.website) payload.website = form.website;
  if (form.licenseNo) payload.licenseNo = form.licenseNo;
  if (form.licenseIssueDate) payload.licenseIssueDate = form.licenseIssueDate;
  if (form.licenseExpiry) payload.licenseExpiry = form.licenseExpiry;
  if (form.regulatoryAuthority) payload.regulatoryAuthority = form.regulatoryAuthority;
  if (form.accreditationLevel) payload.accreditationLevel = form.accreditationLevel;
  if (form.operatingHours) payload.operatingHours = form.operatingHours;
  if (form.approvalStatus) payload.approvalStatus = form.approvalStatus;
  if (form.address) payload.address = form.address;
  if (form.specificFields && Object.keys(form.specificFields).length > 0) payload.specificFields = form.specificFields;
  return payload;
}

const OFFICER_FACILITY_STATUSES = ['DRAFT', 'PENDING', 'SUBMITTED'] as const;

export default function FacilityRegistrationPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const isOfficer = user?.role === 'Officer';
  const isEdit = Boolean(id);
  const canCreate = hasPermission(PERMISSIONS.FACILITIES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.FACILITIES_UPDATE);
  const canDocRead = hasPermission(PERMISSIONS.DOCUMENTS_FACILITY_READ);
  const canDocUpload = hasPermission(PERMISSIONS.DOCUMENTS_FACILITY_UPLOAD);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFacility, setLoadingFacility] = useState(isEdit);
  const [pendingLegalDocs, setPendingLegalDocs] = useState<PendingLegalDocument[]>([]);
  const [serverLegalDocs, setServerLegalDocs] = useState<FacilityDocument[]>([]);

  const loadFacilityDocuments = useCallback(() => {
    if (!id || !canDocRead) {
      setServerLegalDocs([]);
      return;
    }
    documentsApi.facility
      .list(id)
      .then(setServerLegalDocs)
      .catch(() => setServerLegalDocs([]));
  }, [id, canDocRead]);

  useEffect(() => {
    loadFacilityDocuments();
  }, [loadFacilityDocuments]);

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoadingFacility(true);
    facilitiesApi
      .get(id)
      .then((f) => {
        let specificFields: FacilitySpecificFields = {};
        try {
          if (typeof f.specificFields === 'object' && f.specificFields) specificFields = f.specificFields;
          else if (typeof f.specificFields === 'string' && f.specificFields) specificFields = JSON.parse(f.specificFields);
        } catch {
          // leave specificFields as {}
        }
        setForm({
          name: f.name,
          type: f.type,
          status: f.status,
          ownershipType: f.ownershipType ?? '',
          registrationNo: f.registrationNo ?? '',
          tin: f.tin ?? '',
          description: f.description ?? '',
          region: f.region ?? '',
          city: f.city ?? '',
          woreda: f.woreda ?? '',
          kebele: f.kebele ?? '',
          streetAddress: f.streetAddress ?? '',
          gpsLat: f.gpsLat ?? undefined,
          gpsLng: f.gpsLng ?? undefined,
          phone: f.phone ?? '',
          altPhone: f.altPhone ?? '',
          email: f.email ?? '',
          website: f.website ?? '',
          licenseNo: f.licenseNo ?? '',
          licenseIssueDate: f.licenseIssueDate ? String(f.licenseIssueDate).slice(0, 10) : '',
          licenseExpiry: f.licenseExpiry ? String(f.licenseExpiry).slice(0, 10) : '',
          regulatoryAuthority: f.regulatoryAuthority ?? '',
          accreditationLevel: f.accreditationLevel ?? '',
          operatingHours: f.operatingHours ?? '',
          approvalStatus: f.approvalStatus ?? '',
          address: f.address ?? '',
          specificFields,
        });
      })
      .catch(() => navigate('/facilities'))
      .finally(() => setLoadingFacility(false));
  }, [id, isEdit, navigate]);

  const setSpecific = <K extends keyof FacilitySpecificFields>(key: K, value: FacilitySpecificFields[K]) => {
    setForm((p) => ({ ...p, specificFields: { ...p.specificFields, [key]: value } }));
  };

  const hasSpecificStep = ['HOSPITAL', 'CLINIC', 'HEALTH_CENTER', 'PHARMACY'].includes(form.type);
  const totalSteps = (hasSpecificStep ? 6 : 5) + 1; // + review & submit
  const isLastStep = step === totalSteps;
  const progress = (step / totalSteps) * 100;

  const wizardSteps = useMemo(() => {
    const items = [...STEPS.slice(0, 5)];
    if (hasSpecificStep) items.push(STEPS[5]);
    items.push({ id: 99, title: 'Review & submit', short: 'Review' });
    return items;
  }, [hasSpecificStep]);

  useEffect(() => {
    if (step > totalSteps) setStep(totalSteps);
  }, [totalSteps, step]);

  const handleSubmit = async () => {
    setSubmitError('');
    setLoading(true);
    let payload = buildPayload(form);
    if (isEdit && id && isOfficer && payload.status && !OFFICER_FACILITY_STATUSES.includes(payload.status as (typeof OFFICER_FACILITY_STATUSES)[number])) {
      const { status: _omitStatus, ...rest } = payload;
      payload = rest as CreateFacilityDto;
    }
    try {
      if (isEdit && id) {
        await facilitiesApi.update(id, payload);
        const queued = pendingLegalDocs.length;
        if (queued > 0 && canDocUpload) {
          try {
            await uploadPendingFacilityDocuments(id, pendingLegalDocs);
          } catch (docErr) {
            setPendingLegalDocs([]);
            toast({
              title: 'Facility updated; document upload failed',
              description: docErr instanceof Error ? docErr.message : 'Some files could not be uploaded.',
              variant: 'destructive',
            });
            navigate(`/facilities/${id}`);
            return;
          }
        }
        setPendingLegalDocs([]);
        toast({
          title: 'Facility updated',
          description:
            queued > 0 && canDocUpload
              ? `Changes saved and ${queued} legal document(s) uploaded.`
              : 'Changes have been saved successfully.',
        });
        navigate(`/facilities/${id}`);
      } else {
        const created = await facilitiesApi.create(payload);
        const queued = pendingLegalDocs.length;
        if (queued > 0 && canDocUpload) {
          try {
            await uploadPendingFacilityDocuments(created.id, pendingLegalDocs);
          } catch (docErr) {
            setPendingLegalDocs([]);
            toast({
              title: 'Facility created; document upload failed',
              description: docErr instanceof Error ? docErr.message : 'Add documents from the facility profile.',
              variant: 'destructive',
            });
            navigate(`/facilities/${created.id}`);
            return;
          }
        }
        setPendingLegalDocs([]);
        const baseDesc = isOfficer
          ? 'Submitted as SUBMITTED — an admin will review and set the final status.'
          : 'The facility has been created.';
        toast({
          title: 'Facility registered',
          description:
            queued > 0 && canDocUpload ? `${baseDesc} ${queued} legal document(s) uploaded.` : baseDesc,
        });
        navigate(`/facilities/${created.id}`);
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save');
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isEdit && !canCreate) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">{t('common.noAccess')}</p>
        <p className="text-sm mt-1">{t('facilityRegistration.noCreateAccess')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/facilities')}>{t('common.backToList')}</Button>
      </div>
    );
  }
  if (isEdit && !canUpdate) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">{t('common.noAccess')}</p>
        <p className="text-sm mt-1">{t('facilityRegistration.noEditAccess')}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/facilities')}>{t('common.backToList')}</Button>
      </div>
    );
  }

  if (loadingFacility) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(isEdit && id ? `/facilities/${id}` : '/facilities')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? t('facilityRegistration.editTitle') : t('facilityRegistration.registerTitle')}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">{t('common.stepOf', { step, total: totalSteps })}</p>
        </div>
      </div>

      {!isEdit && isOfficer && (
        <Alert className="border-blue-200 bg-blue-50/80">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">{t('common.adminApprovalRequired')}</AlertTitle>
          <AlertDescription className="text-blue-800">
            When you finish registration, the system sets status to <strong>SUBMITTED</strong> and approval to{' '}
            <strong>PENDING</strong>. An administrator will approve and assign the final status (e.g. APPROVED or ACTIVE).
          </AlertDescription>
        </Alert>
      )}

      {/* Stepper */}
      <div className="space-y-2">
        <div className="flex justify-between gap-1">
          {wizardSteps.map((s, idx) => {
            const n = idx + 1;
            return (
              <div
                key={`${s.short}-${idx}`}
                className={`flex-1 flex flex-col items-center gap-1 ${n === step ? 'text-blue-600' : n < step ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    n < step ? 'bg-green-500 text-white border-green-500' : n === step ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {n < step ? <Check className="h-4 w-4" /> : n}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{s.short}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</p>
      )}

      {/* Step content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{wizardSteps[step - 1]?.title ?? t('common.reviewAndSubmit')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label>Facility Name *</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Facility name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Facility Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FACILITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ownership Type</Label>
                  <Select value={form.ownershipType || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, ownershipType: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {OWNERSHIP_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Registration Number</Label>
                  <Input value={form.registrationNo ?? ''} onChange={(e) => setForm((p) => ({ ...p, registrationNo: e.target.value }))} placeholder="Optional" />
                </div>
                <div>
                  <Label>Tax ID (TIN)</Label>
                  <Input value={form.tin ?? ''} onChange={(e) => setForm((p) => ({ ...p, tin: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Region</Label><Input value={form.region ?? ''} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} /></div>
                <div><Label>City</Label><Input value={form.city ?? ''} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Woreda</Label><Input value={form.woreda ?? ''} onChange={(e) => setForm((p) => ({ ...p, woreda: e.target.value }))} /></div>
                <div><Label>Kebele</Label><Input value={form.kebele ?? ''} onChange={(e) => setForm((p) => ({ ...p, kebele: e.target.value }))} /></div>
              </div>
              <div>
                <Label>Street Address</Label>
                <Input value={form.streetAddress ?? ''} onChange={(e) => setForm((p) => ({ ...p, streetAddress: e.target.value }))} placeholder="Full street address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>GPS Latitude</Label>
                  <Input type="number" step="any" value={form.gpsLat ?? ''} onChange={(e) => setForm((p) => ({ ...p, gpsLat: e.target.value ? Number(e.target.value) : undefined }))} placeholder="e.g. 9.0320" />
                </div>
                <div>
                  <Label>GPS Longitude</Label>
                  <Input type="number" step="any" value={form.gpsLng ?? ''} onChange={(e) => setForm((p) => ({ ...p, gpsLng: e.target.value ? Number(e.target.value) : undefined }))} placeholder="e.g. 38.7469" />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={form.phone ?? ''} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Alternative Phone</Label><Input value={form.altPhone ?? ''} onChange={(e) => setForm((p) => ({ ...p, altPhone: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email ?? ''} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Website</Label><Input value={form.website ?? ''} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://" /></div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <Label>Health Operation License Number</Label>
                <Input value={form.licenseNo ?? ''} onChange={(e) => setForm((p) => ({ ...p, licenseNo: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>License Issue Date</Label>
                  <Input type="date" value={form.licenseIssueDate ?? ''} onChange={(e) => setForm((p) => ({ ...p, licenseIssueDate: e.target.value }))} />
                </div>
                <div>
                  <Label>License Expiry Date</Label>
                  <Input type="date" value={form.licenseExpiry ?? ''} onChange={(e) => setForm((p) => ({ ...p, licenseExpiry: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Regulatory Authority</Label><Input value={form.regulatoryAuthority ?? ''} onChange={(e) => setForm((p) => ({ ...p, regulatoryAuthority: e.target.value }))} /></div>
                <div><Label>Accreditation Level</Label><Input value={form.accreditationLevel ?? ''} onChange={(e) => setForm((p) => ({ ...p, accreditationLevel: e.target.value }))} placeholder="Optional" /></div>
              </div>

              <RegistrationLegalDocumentsSection
                variant="facility"
                entityId={isEdit ? id : undefined}
                pending={pendingLegalDocs}
                onPendingChange={setPendingLegalDocs}
                serverDocuments={serverLegalDocs}
                onRefreshServerDocuments={loadFacilityDocuments}
                canRead={canDocRead}
                canUpload={canDocUpload}
              />
            </>
          )}

          {step === 5 && (
            <div>
              <Label>Operating Hours</Label>
              <Input value={form.operatingHours ?? ''} onChange={(e) => setForm((p) => ({ ...p, operatingHours: e.target.value }))} placeholder="e.g. 08:00-18:00 Mon-Sat" />
              <p className="text-xs text-muted-foreground mt-2">To change facility status, use &quot;Change status&quot; on the facility profile or the status action on the list.</p>
            </div>
          )}

          {step === 6 && hasSpecificStep && form.type === 'HOSPITAL' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Number of Beds</Label>
                  <Input type="number" min={0} value={form.specificFields?.hospital?.numberOfBeds ?? ''} onChange={(e) => setSpecific('hospital', { ...form.specificFields?.hospital, numberOfBeds: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div>
                  <Label>Number of Departments</Label>
                  <Input type="number" min={0} value={form.specificFields?.hospital?.numberOfDepartments ?? ''} onChange={(e) => setSpecific('hospital', { ...form.specificFields?.hospital, numberOfDepartments: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Label className="w-full">Services</Label>
                {['icuAvailability', 'emergencyService', 'ambulanceService', 'surgeryService', 'laboratoryAvailable', 'bloodBankAvailable'].map((key) => (
                  <label key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={(form.specificFields?.hospital as Record<string, boolean>)?.[key] ?? false} onChange={(e) => setSpecific('hospital', { ...form.specificFields?.hospital, [key]: e.target.checked })} />
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 6 && hasSpecificStep && form.type === 'CLINIC' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Clinic Category</Label>
                  <Select value={form.specificFields?.clinic?.clinicCategory || 'none'} onValueChange={(v) => setSpecific('clinic', { ...form.specificFields?.clinic, clinicCategory: v === 'none' ? undefined : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">—</SelectItem>{CLINIC_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Consultation Rooms</Label><Input type="number" min={0} value={form.specificFields?.clinic?.consultationRoomsCount ?? ''} onChange={(e) => setSpecific('clinic', { ...form.specificFields?.clinic, consultationRoomsCount: e.target.value ? Number(e.target.value) : undefined })} /></div>
              </div>
              <div>
                <Label>Specialization</Label>
                <Select value={form.specificFields?.clinic?.specialization || 'none'} onValueChange={(v) => setSpecific('clinic', { ...form.specificFields?.clinic, specialization: v === 'none' ? undefined : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">—</SelectItem>{CLINIC_SPECIALIZATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.specificFields?.clinic?.laboratoryAvailable ?? false} onChange={(e) => setSpecific('clinic', { ...form.specificFields?.clinic, laboratoryAvailable: e.target.checked })} />
                <span className="text-sm">Laboratory Available</span>
              </label>
            </>
          )}

          {step === 6 && hasSpecificStep && form.type === 'HEALTH_CENTER' && (
            <>
              <div><Label>Catchment Population</Label><Input type="number" min={0} value={form.specificFields?.healthCenter?.catchmentPopulation ?? ''} onChange={(e) => setSpecific('healthCenter', { ...form.specificFields?.healthCenter, catchmentPopulation: e.target.value ? Number(e.target.value) : undefined })} /></div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.specificFields?.healthCenter?.maternalCareAvailable ?? false} onChange={(e) => setSpecific('healthCenter', { ...form.specificFields?.healthCenter, maternalCareAvailable: e.target.checked })} /><span className="text-sm">Maternal Care Available</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.specificFields?.healthCenter?.vaccinationService ?? false} onChange={(e) => setSpecific('healthCenter', { ...form.specificFields?.healthCenter, vaccinationService: e.target.checked })} /><span className="text-sm">Vaccination Service</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.specificFields?.healthCenter?.communityHealthProgram ?? false} onChange={(e) => setSpecific('healthCenter', { ...form.specificFields?.healthCenter, communityHealthProgram: e.target.checked })} /><span className="text-sm">Community Health Program</span></label>
              </div>
            </>
          )}

          {step === 6 && hasSpecificStep && form.type === 'PHARMACY' && (
            <>
              <div>
                <Label>Pharmacy Type</Label>
                <Select value={form.specificFields?.pharmacy?.pharmacyType || 'none'} onValueChange={(v) => setSpecific('pharmacy', { ...form.specificFields?.pharmacy, pharmacyType: v === 'none' ? undefined : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">—</SelectItem>{PHARMACY_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Controlled Drug Authorization Number</Label><Input value={form.specificFields?.pharmacy?.controlledDrugAuthorizationNumber ?? ''} onChange={(e) => setSpecific('pharmacy', { ...form.specificFields?.pharmacy, controlledDrugAuthorizationNumber: e.target.value || undefined })} /></div>
              <div><Label>Pharmacist in Charge (Staff ID)</Label><Input value={form.specificFields?.pharmacy?.pharmacistInChargeId ?? ''} onChange={(e) => setSpecific('pharmacy', { ...form.specificFields?.pharmacy, pharmacistInChargeId: e.target.value || undefined })} placeholder="Staff ID reference" /></div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.specificFields?.pharmacy?.drugStorageFacility ?? false} onChange={(e) => setSpecific('pharmacy', { ...form.specificFields?.pharmacy, drugStorageFacility: e.target.checked })} /><span className="text-sm">Drug Storage Facility</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.specificFields?.pharmacy?.coldStorageAvailable ?? false} onChange={(e) => setSpecific('pharmacy', { ...form.specificFields?.pharmacy, coldStorageAvailable: e.target.checked })} /><span className="text-sm">Cold Storage Available</span></label>
              </div>
            </>
          )}

          {step === totalSteps && (
            <FacilityRegistrationWizardPreview
              form={form}
              hasSpecificStep={hasSpecificStep}
              pendingLegalDocs={pendingLegalDocs}
              serverLegalDocs={serverLegalDocs}
              isOfficer={isOfficer}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        {!isLastStep ? (
          <Button onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}>
            {t('common.next')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('common.saving') : isEdit ? t('common.confirmAndUpdate') : t('common.confirmAndRegister')}
          </Button>
        )}
      </div>
    </div>
  );
}
