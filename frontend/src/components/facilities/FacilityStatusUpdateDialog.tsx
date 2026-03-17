import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { facilitiesApi } from '@/services/api';

const STATUS_OPTIONS_ALL = [
  'DRAFT',
  'PENDING',
  'SUBMITTED',
  'APPROVED',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'TERMINATED',
];
const STATUS_OPTIONS_OFFICER = ['DRAFT', 'PENDING', 'SUBMITTED'];

export interface FacilityStatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  facilityName: string;
  currentStatus: string;
  onSuccess?: () => void;
}

export function FacilityStatusUpdateDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
  currentStatus,
  onSuccess,
}: FacilityStatusUpdateDialogProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const statusOptions =
    user?.role === 'Officer'
      ? currentStatus && !STATUS_OPTIONS_OFFICER.includes(currentStatus)
        ? [currentStatus, ...STATUS_OPTIONS_OFFICER]
        : STATUS_OPTIONS_OFFICER
      : STATUS_OPTIONS_ALL;

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setError('');
    }
  }, [open, currentStatus]);

  const handleSave = async () => {
    if (status === currentStatus) {
      onOpenChange(false);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await facilitiesApi.update(facilityId, { status });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update facility status</DialogTitle>
          <DialogDescription>
            Change the status for &quot;{facilityName}&quot;. Current status: <strong>{currentStatus}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}
          <div className="space-y-2">
            <Label>New status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user?.role === 'Officer' && (
              <p className="text-xs text-muted-foreground">
                Officer can only set DRAFT, PENDING, or SUBMITTED. Admin approves or activates.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || status === currentStatus}>
            {saving ? 'Saving...' : 'Update status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
