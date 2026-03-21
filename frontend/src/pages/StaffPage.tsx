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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERMISSIONS } from '@/constants/permissions';
import { staffApi, facilitiesApi, type Staff } from '@/services/api';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
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

  const canRead = hasPermission(PERMISSIONS.STAFF_READ);
  const canCreate = hasPermission(PERMISSIONS.STAFF_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.STAFF_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.STAFF_DELETE);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead, searchTerm, statusFilter, facilityFilter]);

  useEffect(() => {
    facilitiesApi.list().then((list) => setFacilities(list.map((f) => ({ id: f.id, name: f.name }))));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this staff record?')) return;
    try {
      await staffApi.delete(id);
      loadStaff();
    } catch {
      // ignore
    }
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
          <p className="text-gray-600 mt-1">Register and manage health facility staff</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/staff/register')}>
            <Plus className="h-4 w-4 mr-2" />
            Register staff
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
                placeholder="Search by name, email, staff ID, national ID..."
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
                            {s.staffRole && (
                              <Badge variant="outline" className="text-[10px] mt-1">{s.staffRole}</Badge>
                            )}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/staff/${s.id}/edit`)}
                            >
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
    </div>
  );
}
