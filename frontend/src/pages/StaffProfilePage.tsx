import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PERMISSIONS } from '@/constants/permissions';
import { staffApi, documentsApi, type Staff, type StaffDocument, type StaffSpecificFields } from '@/services/api';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  Building2,
  Calendar,
  User,
} from 'lucide-react';

export default function StaffProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [staff, setStaff] = useState<(Staff & { specificFields?: StaffSpecificFields | null }) | null>(null);
  const [documents, setDocuments] = useState<StaffDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploading, setUploading] = useState(false);

  const canReadStaff = hasPermission(PERMISSIONS.STAFF_READ);
  const canUpdateStaff = hasPermission(PERMISSIONS.STAFF_UPDATE);
  const canUpload = hasPermission(PERMISSIONS.DOCUMENTS_STAFF_UPLOAD);
  const canListDocs = hasPermission(PERMISSIONS.DOCUMENTS_STAFF_READ);

  useEffect(() => {
    if (!id || !canReadStaff) return;
    setLoading(true);
    Promise.all([
      staffApi.get(id),
      canListDocs ? documentsApi.staff.list(id) : Promise.resolve([]),
    ])
      .then(([s, docs]) => {
        setStaff(s);
        setDocuments(docs);
      })
      .catch(() => setStaff(null))
      .finally(() => setLoading(false));
  }, [id, canReadStaff, canListDocs]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !uploadFile) return;
    setUploading(true);
    try {
      await documentsApi.staff.upload(id, uploadFile, uploadName || uploadFile.name, uploadType);
      const docs = await documentsApi.staff.list(id);
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

  if (!canReadStaff) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No access</p>
        <p className="text-sm mt-1">You don&apos;t have permission to view this staff member.</p>
      </div>
    );
  }

  if (loading || !staff) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate('/staff')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">{staff.name}</h1>
          <p className="text-gray-600 flex flex-wrap items-center gap-2 mt-1">
            <Badge className={getStatusColor(staff.status)}>{staff.status}</Badge>
            <Badge variant="outline">{staff.employeeId}</Badge>
            {staff.staffRole && <Badge variant="outline">{staff.staffRole}</Badge>}
            {staff.facility && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => navigate(`/facilities/${staff.facility!.id}`)}>
                {staff.facility.name}
              </Badge>
            )}
          </p>
        </div>
        {canUpdateStaff && (
          <Button variant="outline" onClick={() => navigate(`/staff/${staff.id}/edit`)}>
            Edit registration
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(staff.firstName || staff.lastName) && (
                <p><span className="font-medium text-gray-600">Legal name:</span>{' '}
                  {[staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.name}
                </p>
              )}
              {staff.gender && <p><span className="font-medium text-gray-600">Gender:</span> {staff.gender}</p>}
              {staff.dateOfBirth && (
                <p><span className="font-medium text-gray-600">Date of birth:</span>{' '}
                  {new Date(staff.dateOfBirth).toLocaleDateString()}
                </p>
              )}
              {staff.nationalId && <p><span className="font-medium text-gray-600">National ID:</span> {staff.nationalId}</p>}
              <p><span className="font-medium text-gray-600">Designation:</span> {staff.designation}</p>
              <p><span className="font-medium text-gray-600">Department:</span> {staff.departmentName || staff.department || '—'}</p>
              {staff.employmentType && (
                <p><span className="font-medium text-gray-600">Employment type:</span> {staff.employmentType}</p>
              )}
              {staff.joiningDate && (
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Joined {new Date(staff.joiningDate).toLocaleDateString()}
                </p>
              )}
              {staff.licenseNo && (
                <p><span className="font-medium text-gray-600">License:</span> {staff.licenseNo}</p>
              )}
              {staff.licenseIssueDate && (
                <p><span className="font-medium text-gray-600">License issued:</span>{' '}
                  {new Date(staff.licenseIssueDate).toLocaleDateString()}
                </p>
              )}
              {staff.licenseExpiry && (
                <p><span className="font-medium text-gray-600">License expiry:</span>{' '}
                  {new Date(staff.licenseExpiry).toLocaleDateString()}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" /> {staff.email}
              </p>
              {staff.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" /> {staff.phone}
                </p>
              )}
              {staff.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" /> {staff.address}
                </p>
              )}
              {staff.emergencyContact && (
                <p><span className="font-medium text-gray-600">Emergency:</span> {staff.emergencyContact}</p>
              )}
              {staff.facility && (
                <p className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" /> {staff.facility.name}
                </p>
              )}
              {staff.specificFields && (
                <div className="pt-2 border-t">
                  <p className="font-medium text-gray-600 mb-2">Role-specific</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(staff.specificFields, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <CardDescription>Staff documents</CardDescription>
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
            <DialogTitle>Upload Staff Document</DialogTitle>
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
                placeholder="e.g. license, certificate"
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
