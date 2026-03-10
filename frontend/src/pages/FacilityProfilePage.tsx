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
import {
  facilitiesApi,
  documentsApi,
  type Facility,
  type Staff,
  type FacilityDocument,
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
  const [facility, setFacility] = useState<(Facility & { staffList?: Staff[]; services?: string[] }) | null>(null);
  const [documents, setDocuments] = useState<FacilityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [uploading, setUploading] = useState(false);

  const canUpload = hasPermission('facilities.*') || hasPermission('documents.*');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      facilitiesApi.get(id),
      documentsApi.facility.list(id),
    ])
      .then(([fac, docs]) => {
        setFacility(fac);
        setDocuments(docs);
      })
      .catch(() => setFacility(null))
      .finally(() => setLoading(false));
  }, [id]);

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
    } catch {}
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
              {facility.registrationNo && (
                <p><span className="font-medium text-gray-600">Registration:</span> {facility.registrationNo}</p>
              )}
              {facility.licenseNo && (
                <p><span className="font-medium text-gray-600">License:</span> {facility.licenseNo}</p>
              )}
              {facility.licenseExpiry && (
                <p><span className="font-medium text-gray-600">License expiry:</span>{' '}
                  {new Date(facility.licenseExpiry).toLocaleDateString()}
                </p>
              )}
              {facility.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" /> {facility.address}
                </p>
              )}
              {facility.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" /> {facility.phone}
                </p>
              )}
              {facility.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" /> {facility.email}
                </p>
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
              {documents.length === 0 ? (
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
