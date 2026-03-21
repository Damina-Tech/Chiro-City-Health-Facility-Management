import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from '@/hooks/use-toast';
import { PERMISSIONS } from '@/constants/permissions';
import {
  usersApi,
  rolesApi,
  type ManagedUser,
  type RoleWithPermissions,
  type PermissionRecord,
} from '@/services/api';
import { Shield, UserPlus, Trash2, Edit, Save, Loader2 } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const canReadUsers = hasPermission(PERMISSIONS.USERS_READ);
  const canCreateUser = hasPermission(PERMISSIONS.USERS_CREATE);
  const canUpdateUser = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDeleteUser = hasPermission(PERMISSIONS.USERS_DELETE);
  const canReadRoles = hasPermission(PERMISSIONS.ROLES_READ);
  const canUpdateRoles = hasPermission(PERMISSIONS.ROLES_UPDATE);
  /** Matches backend: list roles/permissions with users.read OR roles.read */
  const canLoadRolesAndPermissions = canReadRoles || canReadUsers;

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesTabLoading, setRolesTabLoading] = useState(false);
  const [error, setError] = useState('');

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    password: '',
    roleId: '',
  });
  const [savingUser, setSavingUser] = useState(false);

  /** roleId -> Set of permission names (for editing before save) */
  const [rolePermissionDraft, setRolePermissionDraft] = useState<Record<string, Set<string>>>({});
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  const loadUsers = useCallback(() => {
    if (!canReadUsers) return;
    setLoading(true);
    usersApi
      .list()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load users'))
      .finally(() => setLoading(false));
  }, [canReadUsers]);

  const loadRolesData = useCallback(() => {
    if (!canLoadRolesAndPermissions) return;
    setRolesTabLoading(true);
    Promise.all([usersApi.listRoles(), usersApi.listPermissions()])
      .then(([r, p]) => {
        setRoles(r);
        setAllPermissions(p);
        const draft: Record<string, Set<string>> = {};
        r.forEach((role) => {
          draft[role.id] = new Set(role.permissions.map((x) => x.name));
        });
        setRolePermissionDraft(draft);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load roles'))
      .finally(() => setRolesTabLoading(false));
  }, [canLoadRolesAndPermissions]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreateUser = async () => {
    let r = roles;
    if (!r.length && canReadUsers) {
      try {
        r = await usersApi.listRoles();
        setRoles(r);
      } catch {
        r = [];
      }
    }
    setEditingUser(null);
    setUserForm({
      email: '',
      name: '',
      password: '',
      roleId: r[0]?.id || '',
    });
    setUserDialogOpen(true);
  };

  const openEditUser = (u: ManagedUser) => {
    setEditingUser(u);
    setUserForm({
      email: u.email,
      name: u.name,
      password: '',
      roleId: u.roleId,
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    setError('');
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          email: userForm.email,
          name: userForm.name,
          roleId: userForm.roleId,
          ...(userForm.password ? { password: userForm.password } : {}),
        });
      } else {
        if (!userForm.password || userForm.password.length < 8) {
          setError('Password must be at least 8 characters');
          toast({
            title: 'Invalid password',
            description: 'Password must be at least 8 characters.',
            variant: 'destructive',
          });
          setSavingUser(false);
          return;
        }
        await usersApi.create({
          email: userForm.email,
          name: userForm.name,
          password: userForm.password,
          roleId: userForm.roleId,
        });
      }
      setUserDialogOpen(false);
      loadUsers();
      toast({
        title: editingUser ? 'User updated' : 'User created',
        description: editingUser
          ? `${userForm.name}'s account has been updated.`
          : `${userForm.name} can now sign in.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Save failed',
        variant: 'destructive',
      });
    } finally {
      setSavingUser(false);
    }
  };

  const openDeleteUserDialog = (u: ManagedUser) => {
    setUserToDelete({ id: u.id, name: u.name });
    setDeleteUserDialogOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const { id: deleteId, name: deletedName } = userToDelete;
    try {
      await usersApi.delete(deleteId);
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
      toast({
        title: 'User removed',
        description: `${deletedName} will no longer be able to sign in.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  const togglePermission = (roleId: string, permName: string) => {
    setRolePermissionDraft((prev) => {
      const next = { ...prev };
      const set = new Set(next[roleId] || []);
      if (set.has(permName)) set.delete(permName);
      else set.add(permName);
      next[roleId] = set;
      return next;
    });
  };

  const saveRolePermissions = async (roleId: string) => {
    const names = Array.from(rolePermissionDraft[roleId] || []);
    setSavingRoleId(roleId);
    setError('');
    try {
      const updated = await rolesApi.updatePermissions(roleId, names);
      setRoles((prev) => prev.map((r) => (r.id === roleId ? updated : r)));
      const roleName = roles.find((r) => r.id === roleId)?.name ?? 'Role';
      toast({
        title: 'Permissions saved',
        description: `${roleName} permissions were updated.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setSavingRoleId(null);
    }
  };

  if (!canReadUsers && !canLoadRolesAndPermissions) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No access</p>
        <p className="text-sm mt-1">You don&apos;t have permission to manage users or roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          User management
        </h1>
        <p className="text-gray-600 mt-1">System users, Admin &amp; Officer roles, and permissions</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <Tabs
        defaultValue="users"
        onValueChange={(v) => {
          if (v === 'roles' && roles.length === 0 && canLoadRolesAndPermissions) loadRolesData();
        }}
      >
        <TabsList>
          {canReadUsers && <TabsTrigger value="users">Users</TabsTrigger>}
          {canLoadRolesAndPermissions && <TabsTrigger value="roles">Roles &amp; permissions</TabsTrigger>}
        </TabsList>

        {canReadUsers && (
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>System users</CardTitle>
                  <CardDescription>Accounts that can sign in to Chiro City Health Management</CardDescription>
                </div>
                {canCreateUser && (
                  <Button onClick={() => void openCreateUser()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add user
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.role.name === 'Admin' ? 'default' : 'secondary'}>{u.role.name}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <span className="text-xs text-gray-600 line-clamp-2">
                                {u.role.permissions?.length ?? 0} assigned
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {canUpdateUser && (
                                  <Button variant="ghost" size="icon" onClick={() => openEditUser(u)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDeleteUser && u.id !== currentUser?.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600"
                                    onClick={() => openDeleteUserDialog(u)}
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
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canLoadRolesAndPermissions && (
          <TabsContent value="roles" className="space-y-4">
            {rolesTabLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{role.name}</span>
                        <Badge variant="outline">{role.permissions.length} permissions</Badge>
                      </CardTitle>
                      <CardDescription>{role.description || '—'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
                      {allPermissions.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={rolePermissionDraft[role.id]?.has(p.name) ?? false}
                            disabled={!canUpdateRoles}
                            onCheckedChange={() => togglePermission(role.id, p.name)}
                          />
                          <span className="font-mono text-xs">{p.name}</span>
                        </label>
                      ))}
                      {canUpdateRoles && (
                        <Button
                          className="w-full mt-4"
                          onClick={() => saveRolePermissions(role.id)}
                          disabled={savingRoleId === role.id}
                        >
                          {savingRoleId === role.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save {role.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit user' : 'Add user'}</DialogTitle>
            <DialogDescription>
              Assign role <strong>Admin</strong> (full access) or <strong>Officer</strong> (operational access without delete / user admin).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <Label>{editingUser ? 'New password (optional)' : 'Password *'}</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editingUser ? 'Leave blank to keep current' : 'Min 8 characters'}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={userForm.roleId} onValueChange={(v) => setUserForm((f) => ({ ...f, roleId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingUser}>{savingUser ? 'Saving…' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{userToDelete?.name}&quot;? They will no longer be able to sign in. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDeleteUser()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
