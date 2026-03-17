import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PERMISSIONS } from '@/constants/permissions';
import {
  facilitiesApi,
  documentsApi,
  type Facility,
  type Staff,
  type FacilityDocument,
  type FacilitySpecificFields,
} from '@/services/api';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  Users,
  Calendar,
} from 'lucide-react';

export default function FacilityProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [facility, setFacility] = useState<
    (Facility & { staffList?: Staff[]; services?: string[]; specificFields?: FacilitySpecificFields | null }) | null
  >(null);
  const [documents, setDocuments] = useState<FacilityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploading, setUploading] = useState(false);

  const canReadFacility = hasPermission(PERMISSIONS.FACILITIES_READ);
  const canUpload = hasPermission(PERMISSIONS.DOCUMENTS_FACILITY_UPLOAD);
  const canListDocs = hasPermission(PERMISSIONS.DOCUMENTS_FACILITY_READ);

  useEffect(() => {
    if (!id || !canReadFacility) return;
    setLoading(true);
    Promise.all([
      facilitiesApi.get(id),
      canListDocs ? documentsApi.facility.list(id) : Promise.resolve([]),
    ])
      .then(([fac, docs]) => {
        setFacility(fac);
        setDocuments(docs);
      })
      .catch(() => setFacility(null))
      .finally(() => setLoading(false));
  }, [id, canReadFacility, canListDocs]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !uploadFile) return;
    setUploading(true);
    try {
      await documentsApi.facility.upload(id, uploadFile, uploadName || uploadFile.name, uploadType);
      const docs = await documentsApi.facility.list(id);
      setDocuments(docs);
      setUploadOpen(false);
      setUploadFile(null);
      setUploadName('');
      setUploadType('other');
    } catch {
      // ignore
    }
    setUploading(false);
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-cyan-100 text-cyan-800',
      INACTIVE: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  if (!canReadFacility) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No access</p>
        <p className="text-sm mt-1">You don&apos;t have permission to view this facility.</p>
      </div>
    );
  }

  if (loading || !facility) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const staffList = facility.staffList || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/facilities')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(facility.status)}>{facility.status}</Badge>
            <Badge variant="outline">{facility.type}</Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {facility.ownershipType && (
                <p><span className="font-medium text-gray-600">Ownership:</span> {facility.ownershipType}</p>
              )}
              {facility.registrationNo && (
                <p><span className="font-medium text-gray-600">Registration:</span> {facility.registrationNo}</p>
              )}
              {facility.tin && (
                <p><span className="font-medium text-gray-600">TIN:</span> {facility.tin}</p>
              )}
              {facility.description && (
                <p><span className="font-medium text-gray-600">Description:</span> {facility.description}</p>
              )}
              {(facility.region || facility.city || facility.woreda || facility.kebele || facility.streetAddress) && (
                <div className="space-y-1">
                  <p className="font-medium text-gray-600">Location</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                    {[facility.region, facility.city, facility.woreda, facility.kebele, facility.streetAddress]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {facility.gpsLat != null && facility.gpsLng != null && (
                    <p className="text-sm text-gray-500">GPS: {facility.gpsLat}, {facility.gpsLng}</p>
                  )}
                </div>
              )}
              {facility.address && !facility.streetAddress && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" /> {facility.address}
                </p>
              )}
              {(facility.phone || facility.altPhone || facility.email || facility.website) && (
                <div className="space-y-1">
                  <p className="font-medium text-gray-600">Contact</p>
                  {facility.phone && (
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-500" /> {facility.phone}</p>
                  )}
                  {facility.altPhone && <p className="text-sm">Alt: {facility.altPhone}</p>}
                  {facility.email && (
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-500" /> {facility.email}</p>
                  )}
                  {facility.website && (
                    <p className="text-sm"><a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{facility.website}</a></p>
                  )}
                </div>
              )}
              {(facility.licenseNo || facility.licenseExpiry || facility.regulatoryAuthority) && (
                <div className="space-y-1">
                  <p className="font-medium text-gray-600">Legal & compliance</p>
                  {facility.licenseNo && <p>License: {facility.licenseNo}</p>}
                  {facility.licenseExpiry && (
                    <p>Expiry: {new Date(facility.licenseExpiry).toLocaleDateString()}</p>
                  )}
                  {facility.regulatoryAuthority && <p>Authority: {facility.regulatoryAuthority}</p>}
                  {facility.accreditationLevel && <p>Accreditation: {facility.accreditationLevel}</p>}
                </div>
              )}
              {facility.operatingHours && (
                <p><span className="font-medium text-gray-600">Operating hours:</span> {facility.operatingHours}</p>
              )}
              {facility.services && Array.isArray(facility.services) && facility.services.length > 0 && (
                <div>
                  <p className="font-medium text-gray-600 mb-1">Services</p>
                  <div className="flex flex-wrap gap-1">
                    {facility.services.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {facility.specificFields && (facility.specificFields.hospital || facility.specificFields.clinic || facility.specificFields.healthCenter || facility.specificFields.pharmacy) && (
                <div className="pt-2 border-t">
                  <p className="font-medium text-gray-600 mb-2">Facility-specific</p>
                  <div className="text-sm space-y-1">
                    {facility.specificFields.hospital && (
                      <p>Beds: {facility.specificFields.hospital.numberOfBeds ?? '—'} · Departments: {facility.specificFields.hospital.numberOfDepartments ?? '—'} · ICU: {facility.specificFields.hospital.icuAvailability ? 'Yes' : 'No'} · Emergency: {facility.specificFields.hospital.emergencyService ? 'Yes' : 'No'} · Lab: {facility.specificFields.hospital.laboratoryAvailable ? 'Yes' : 'No'} · Blood bank: {facility.specificFields.hospital.bloodBankAvailable ? 'Yes' : 'No'}</p>
                    )}
                    {facility.specificFields.clinic && (
                      <p>Category: {facility.specificFields.clinic.clinicCategory ?? '—'} · Specialization: {facility.specificFields.clinic.specialization ?? '—'} · Consultation rooms: {facility.specificFields.clinic.consultationRoomsCount ?? '—'} · Lab: {facility.specificFields.clinic.laboratoryAvailable ? 'Yes' : 'No'}</p>
                    )}
                    {facility.specificFields.healthCenter && (
                      <p>Catchment: {facility.specificFields.healthCenter.catchmentPopulation ?? '—'} · Maternal care: {facility.specificFields.healthCenter.maternalCareAvailable ? 'Yes' : 'No'} · Vaccination: {facility.specificFields.healthCenter.vaccinationService ? 'Yes' : 'No'} · Community program: {facility.specificFields.healthCenter.communityHealthProgram ? 'Yes' : 'No'}</p>
                    )}
                    {facility.specificFields.pharmacy && (
                      <p>Type: {facility.specificFields.pharmacy.pharmacyType ?? '—'} · Drug storage: {facility.specificFields.pharmacy.drugStorageFacility ? 'Yes' : 'No'} · Cold storage: {facility.specificFields.pharmacy.coldStorageAvailable ? 'Yes' : 'No'}{facility.specificFields.pharmacy.controlledDrugAuthorizationNumber ? ` · Controlled drug auth: ${facility.specificFields.pharmacy.controlledDrugAuthorizationNumber}` : ''}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff ({staffList.length})
                </CardTitle>
                <CardDescription>Assigned to this facility</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {staffList.length === 0 ? (
                <p className="text-gray-500 text-sm">No staff assigned.</p>
              ) : (
                <div className="space-y-3">
                  {staffList.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/staff/${s.id}`)}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                          {getInitials(s.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.designation} · {s.departmentName || s.department || '—'}</p>
                      </div>
                      <Badge variant="outline">{s.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <CardDescription>Facility documents</CardDescription>
              </div>
              {canUpload && (
                <Button size="sm" onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!canListDocs && !canUpload ? (
                <p className="text-gray-500 text-sm">No access to documents.</p>
              ) : documents.length === 0 ? (
                <p className="text-gray-500 text-sm">No documents uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between text-sm p-2 rounded bg-gray-50"
                    >
                      <span className="font-medium truncate">{d.name}</span>
                      <Badge variant="outline" className="text-xs">{d.type}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Facility Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label>File</Label>
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Document name"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Input
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                placeholder="e.g. license, registration"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!uploadFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
