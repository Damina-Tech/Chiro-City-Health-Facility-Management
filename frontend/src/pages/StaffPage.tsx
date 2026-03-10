import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { staffApi, facilitiesApi, type Staff, type CreateStaffDto } from '@/services/api';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';

const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED'];

export default function StaffPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateStaffDto>({
    employeeId: '',
    name: '',
    email: '',
    designation: '',
    status: 'DRAFT',
  });
  const [submitError, setSubmitError] = useState('');

  const canRead = hasPermission(PERMISSIONS.STAFF_READ);
  const canCreate = hasPermission(PERMISSIONS.STAFF_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.STAFF_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.STAFF_DELETE);
  const canEdit = canCreate || canUpdate;

  const loadStaff = () => {
    if (!canRead) return;
    setLoading(true);
    staffApi
      .list({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        facilityId: facilityFilter === 'all' ? undefined : facilityFilter,
      })
      .then(setStaff)
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStaff();
  }, [canRead, searchTerm, statusFilter, facilityFilter]);

  useEffect(() => {
    facilitiesApi.list().then((list) => setFacilities(list.map((f) => ({ id: f.id, name: f.name }))));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      facilityId: undefined,
      departmentName: '',
      licenseNo: '',
      status: 'DRAFT',
      joiningDate: '',
      address: '',
      emergencyContact: '',
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditingId(s.id);
    setForm({
      employeeId: s.employeeId,
      name: s.name,
      email: s.email,
      phone: s.phone ?? '',
      department: s.department ?? '',
      designation: s.designation,
      facilityId: s.facilityId ?? undefined,
      departmentName: s.departmentName ?? '',
      licenseNo: s.licenseNo ?? '',
      licenseExpiry: s.licenseExpiry ? s.licenseExpiry.slice(0, 10) : undefined,
      status: s.status,
      joiningDate: s.joiningDate ? s.joiningDate.slice(0, 10) : undefined,
      address: s.address ?? '',
      emergencyContact: s.emergencyContact ?? '',
    });
    setSubmitError('');
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const payload: CreateStaffDto = {
      employeeId: form.employeeId,
      name: form.name,
      email: form.email,
      designation: form.designation,
      status: form.status || 'DRAFT',
    };
    if (form.phone) payload.phone = form.phone;
    if (form.department) payload.department = form.department;
    if (form.facilityId) payload.facilityId = form.facilityId;
    if (form.departmentName) payload.departmentName = form.departmentName;
    if (form.licenseNo) payload.licenseNo = form.licenseNo;
    if (form.licenseExpiry) payload.licenseExpiry = form.licenseExpiry;
    if (form.joiningDate) payload.joiningDate = form.joiningDate;
    if (form.address) payload.address = form.address;
    if (form.emergencyContact) payload.emergencyContact = form.emergencyContact;
    try {
      if (editingId) {
        await staffApi.update(editingId, payload);
      } else {
        await staffApi.create(payload);
      }
      setDialogOpen(false);
      loadStaff();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this staff record?')) return;
    try {
      await staffApi.delete(id);
      loadStaff();
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

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  if (!canRead) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">No access</p>
          <p className="text-sm mt-1">You don&apos;t have permission to view staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600 mt-1">Manage health facility staff</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {staff.filter((s) => s.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>Search and filter staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, employee ID..."
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
            <Select value={facilityFilter} onValueChange={setFacilityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {facilities.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
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
                    <TableHead>Staff</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                              {getInitials(s.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-sm text-gray-500">{s.designation}</p>
                            <p className="text-xs text-gray-400">{s.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {s.facility ? (
                          <Badge variant="outline">{s.facility.name}</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>{s.departmentName || s.department || '—'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(s.status)}>{s.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {s.email}
                          </div>
                          {s.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {s.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/staff/${s.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(s.id)}
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
          {!loading && staff.length === 0 && (
            <div className="text-center py-8 text-gray-500">No staff found.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
            <DialogDescription>Enter staff details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee ID *</Label>
                <Input
                  value={form.employeeId}
                  onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                  required
                  placeholder="e.g. EMP-001"
                />
              </div>
              <div>
                <Label>Designation *</Label>
                <Input
                  value={form.designation}
                  onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                  required
                  placeholder="e.g. Nurse"
                />
              </div>
            </div>
            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Facility</Label>
              <Select
                value={form.facilityId ?? 'none'}
                onValueChange={(v) => setForm((p) => ({ ...p, facilityId: v === 'none' ? undefined : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={form.department ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value, departmentName: e.target.value }))}
                placeholder="Within facility"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>License No</Label>
                <Input
                  value={form.licenseNo ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, licenseNo: e.target.value }))}
                />
              </div>
              <div>
                <Label>License Expiry</Label>
                <Input
                  type="date"
                  value={form.licenseExpiry ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, licenseExpiry: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={form.joiningDate ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, joiningDate: e.target.value }))}
              />
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
