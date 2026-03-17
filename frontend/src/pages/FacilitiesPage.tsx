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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FacilityStatusUpdateDialog } from '@/components/facilities/FacilityStatusUpdateDialog';
import { PERMISSIONS } from '@/constants/permissions';
import { facilitiesApi, type Facility } from '@/services/api';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

const FACILITY_TYPES = [
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'HEALTH_CENTER', label: 'Health Center' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'LAB', label: 'Lab / Diagnostic Center' },
];
const STATUS_OPTIONS = [
  'DRAFT',
  'PENDING',
  'SUBMITTED',
  'APPROVED',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'TERMINATED',
];

export default function FacilitiesPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<{ id: string; name: string } | null>(null);
  const [statusDialogFacility, setStatusDialogFacility] = useState<{ id: string; name: string; status: string } | null>(null);

  const canRead = hasPermission(PERMISSIONS.FACILITIES_READ);
  const canCreate = hasPermission(PERMISSIONS.FACILITIES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.FACILITIES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.FACILITIES_DELETE);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load depends on filters
  }, [canRead, searchTerm, statusFilter, typeFilter]);

  const openDeleteDialog = (facility: Facility) => {
    setFacilityToDelete({ id: facility.id, name: facility.name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!facilityToDelete) return;
    try {
      await facilitiesApi.delete(facilityToDelete.id);
      setDeleteDialogOpen(false);
      setFacilityToDelete(null);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('not found')) {
        setDeleteDialogOpen(false);
        setFacilityToDelete(null);
        load();
      }
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-cyan-100 text-cyan-800',
      PENDING: 'bg-amber-100 text-amber-800',
      INACTIVE: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Chiro City Health Facilities</h1>
          <p className="text-gray-600 mt-1">Register and manage facilities</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/facilities/register')}>
            <Plus className="h-4 w-4 mr-2" />
            Register Facility
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
                placeholder="Search by name, registration, license, TIN..."
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
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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
                          {(f.registrationNo || f.tin) && (
                            <p className="text-xs text-gray-500">
                              {f.registrationNo}
                              {f.registrationNo && f.tin ? ' · ' : ''}
                              {f.tin}
                            </p>
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
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusDialogFacility({ id: f.id, name: f.name, status: f.status })}
                                title="Update status"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/facilities/${f.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => openDeleteDialog(f)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete facility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{facilityToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {statusDialogFacility && (
        <FacilityStatusUpdateDialog
          open={!!statusDialogFacility}
          onOpenChange={(open) => !open && setStatusDialogFacility(null)}
          facilityId={statusDialogFacility.id}
          facilityName={statusDialogFacility.name}
          currentStatus={statusDialogFacility.status}
          onSuccess={load}
        />
      )}
    </div>
  );
}
