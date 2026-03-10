import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PERMISSIONS } from '@/constants/permissions';
import { facilitiesApi, type Facility, type CreateFacilityDto } from '@/services/api';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

const FACILITY_TYPES = ['HOSPITAL', 'CLINIC', 'HEALTH_CENTER', 'PHARMACY'];
const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];

export default function FacilitiesPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFacilityDto>({
    name: '',
    type: 'HEALTH_CENTER',
    status: 'DRAFT',
  });
  const [submitError, setSubmitError] = useState('');

  const canRead = hasPermission(PERMISSIONS.FACILITIES_READ);
  const canCreate = hasPermission(PERMISSIONS.FACILITIES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.FACILITIES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.FACILITIES_DELETE);
  const canEdit = canCreate || canUpdate;

  const load = () => {
    if (!canRead) return;
    setLoading(true);
    facilitiesApi
      .list({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
      })
      .then(setFacilities)
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [canRead, searchTerm, statusFilter, typeFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      type: 'HEALTH_CENTER',
      registrationNo: '',
      licenseNo: '',
      address: '',
      phone: '',
      email: '',
      status: 'DRAFT',
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (f: Facility) => {
    setEditingId(f.id);
    setForm({
      name: f.name,
      type: f.type,
      registrationNo: f.registrationNo ?? '',
      licenseNo: f.licenseNo ?? '',
      licenseExpiry: f.licenseExpiry ? f.licenseExpiry.slice(0, 10) : undefined,
      address: f.address ?? '',
      phone: f.phone ?? '',
      email: f.email ?? '',
      status: f.status,
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const payload: CreateFacilityDto = {
      name: form.name,
      type: form.type,
      status: form.status || 'DRAFT',
    };
    if (form.registrationNo) payload.registrationNo = form.registrationNo;
    if (form.licenseNo) payload.licenseNo = form.licenseNo;
    if (form.licenseExpiry) payload.licenseExpiry = form.licenseExpiry;
    if (form.address) payload.address = form.address;
    if (form.phone) payload.phone = form.phone;
    if (form.email) payload.email = form.email;
    try {
      if (editingId) {
        await facilitiesApi.update(editingId, payload);
      } else {
        await facilitiesApi.create(payload);
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this facility?')) return;
    try {
      await facilitiesApi.delete(id);
      load();
    } catch {}
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

  if (!canRead) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">No access</p>
          <p className="text-sm mt-1">You don&apos;t have permission to view facilities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Facilities</h1>
          <p className="text-gray-600 mt-1">Manage facilities and view details</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-2xl font-bold">{facilities.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {facilities.filter((f) => f.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facility Directory</CardTitle>
          <CardDescription>Search and filter facilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, registration, license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {FACILITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{f.name}</p>
                          {f.registrationNo && (
                            <p className="text-xs text-gray-500">{f.registrationNo}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{f.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(f.status)}>{f.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {f.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {f.phone}
                            </div>
                          )}
                          {f.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {f.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/facilities/${f.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(f.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && facilities.length === 0 && (
            <div className="text-center py-8 text-gray-500">No facilities found.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Facility' : 'Add Facility'}</DialogTitle>
            <DialogDescription>Enter facility details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="Facility name"
              />
            </div>
            <div>
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FACILITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Registration No</Label>
                <Input
                  value={form.registrationNo ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, registrationNo: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>License No</Label>
                <Input
                  value={form.licenseNo ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, licenseNo: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            {editingId && (
              <div>
                <Label>License Expiry</Label>
                <Input
                  type="date"
                  value={form.licenseExpiry ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, licenseExpiry: e.target.value }))}
                />
              </div>
            )}
            <div>
              <Label>Address</Label>
              <Input
                value={form.address ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status ?? 'DRAFT'}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
