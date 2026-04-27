import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { documentsApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { FileText, Trash2, Upload } from 'lucide-react';

export type PendingLegalDocument = {
  id: string;
  file: File;
  name: string;
  docType: string;
};

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'license', label: 'License' },
  { value: 'registration', label: 'Registration' },
  { value: 'accreditation', label: 'Accreditation' },
  { value: 'contract', label: 'Contract' },
  { value: 'identity', label: 'Identity / ID' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
];

type ServerDoc = { id: string; name: string; type: string };

export interface RegistrationLegalDocumentsSectionProps {
  variant: 'facility' | 'staff';
  /** When set, files can be uploaded immediately; otherwise they are queued until registration is saved. */
  entityId: string | undefined;
  pending: PendingLegalDocument[];
  onPendingChange: (next: PendingLegalDocument[]) => void;
  serverDocuments: ServerDoc[];
  onRefreshServerDocuments: () => void;
  canRead: boolean;
  canUpload: boolean;
}

export function RegistrationLegalDocumentsSection({
  variant,
  entityId,
  pending,
  onPendingChange,
  serverDocuments,
  onRefreshServerDocuments,
  canRead,
  canUpload,
}: RegistrationLegalDocumentsSectionProps) {
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState('license');
  const [uploading, setUploading] = useState(false);

  const resetDraft = () => {
    setDraftFile(null);
    setDraftName('');
    setDraftType('license');
  };

  const addToQueue = () => {
    if (!draftFile || !canUpload) return;
    const item: PendingLegalDocument = {
      id: crypto.randomUUID(),
      file: draftFile,
      name: draftName.trim() || draftFile.name,
      docType: draftType || 'other',
    };
    onPendingChange([...pending, item]);
    resetDraft();
    toast({
      title: 'Added to batch',
      description: `${item.name} will upload when you save registration.`,
    });
  };

  const uploadNow = async () => {
    if (!entityId || !draftFile || !canUpload) return;
    setUploading(true);
    try {
      const name = draftName.trim() || draftFile.name;
      if (variant === 'facility') {
        await documentsApi.facility.upload(entityId, draftFile, name, draftType);
      } else {
        await documentsApi.staff.upload(entityId, draftFile, name, draftType);
      }
      toast({ title: 'Document uploaded', description: name });
      resetDraft();
      onRefreshServerDocuments();
    } catch (e) {
      toast({
        title: 'Upload failed',
        description: e instanceof Error ? e.message : 'Upload failed',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removePending = (pid: string) => {
    onPendingChange(pending.filter((p) => p.id !== pid));
  };

  if (!canRead && !canUpload) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-900">
        You don&apos;t have permission to attach documents here.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <FileText className="h-4 w-4 shrink-0" />
        Supporting documents
      </div>
      <p className="text-xs text-muted-foreground">
        Attach license copies, registration certificates, accreditation letters, contracts, or other legal paperwork.
        {entityId
          ? ' Uploads are saved to this record immediately.'
          : ' Queued files upload automatically after you submit registration.'}
      </p>

      {canRead && serverDocuments.length > 0 && (
        <ul className="space-y-1 text-sm">
          {serverDocuments.map((d) => (
            <li key={d.id} className="flex justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5">
              <span className="truncate font-medium">{d.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{d.type}</span>
            </li>
          ))}
        </ul>
      )}

      {canUpload && (
        <div className="space-y-3 rounded-lg border border-dashed bg-muted/10 p-3">
          <div>
            <Label>File</Label>
            <Input
              type="file"
              onChange={(e) => setDraftFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>
          <div>
            <Label>Document name</Label>
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="e.g. Operating license 2024"
            />
          </div>
          <div>
            <Label>Document type</Label>
            <Select value={draftType} onValueChange={setDraftType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {entityId ? (
              <Button type="button" size="sm" onClick={() => void uploadNow()} disabled={!draftFile || uploading}>
                <Upload className="h-4 w-4 mr-1" />
                {uploading ? 'Uploading…' : 'Upload now'}
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={addToQueue} disabled={!draftFile}>
                <Upload className="h-4 w-4 mr-1" />
                Add to upload batch
              </Button>
            )}
          </div>
        </div>
      )}

      {!entityId && pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">
            Queued for upload when you save ({pending.length})
          </p>
          <ul className="space-y-1">
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-sm"
              >
                <span className="min-w-0 truncate">
                  {p.name} <span className="text-muted-foreground">({p.docType})</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removePending(p.id)}
                  aria-label="Remove from queue"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Upload all queued documents after create/update (facility). */
export async function uploadPendingFacilityDocuments(
  facilityId: string,
  pending: PendingLegalDocument[],
): Promise<void> {
  for (const p of pending) {
    await documentsApi.facility.upload(facilityId, p.file, p.name, p.docType);
  }
}

/** Upload all queued documents after create/update (staff). */
export async function uploadPendingStaffDocuments(
  staffId: string,
  pending: PendingLegalDocument[],
): Promise<void> {
  for (const p of pending) {
    await documentsApi.staff.upload(staffId, p.file, p.name, p.docType);
  }
}
