import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { notificationsApi, type Notification as ApiNotification } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/permissions";
import {
  Bell,
  BellOff,
  Plus,
  Mail,
  Smartphone,
  Slack,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Send,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
type NotificationType = "info" | "success" | "warning" | "error";

type RecipientTarget = "all" | "role";

const ROLE_OPTIONS = [
  { value: "STAFF", label: "Staff" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "NURSE", label: "Nurse" },
  { value: "PHARMACIST", label: "Pharmacist" },
  { value: "LAB_TECH", label: "Lab tech" },
  { value: "ADMIN", label: "Admin" },
  { value: "OFFICER", label: "Officer" },
] as const;

export default function NotificationsPage() {
  // System notifications from API (license expiry, staff assignment, facility activation)
  const [apiNotifications, setApiNotifications] = useState<ApiNotification[]>([]);
  useEffect(() => {
    notificationsApi.list({ limit: 20 }).then(setApiNotifications).catch(() => setApiNotifications([]));
  }, []);

  // Auth / permissions
  const { user, hasPermission } = useAuth();
  const role = user?.role;
  const roleNorm = (role ?? "").toUpperCase();
  const canManageNotifications =
    (user?.role ?? "").toUpperCase() === "ADMIN" ||
    hasPermission("admin") ||
    hasPermission("*");

  const canMarkSystemRead =
    hasPermission(PERMISSIONS.NOTIFICATIONS_MARK_READ) ||
    hasPermission("admin") ||
    hasPermission("*");

  const markApiRead = (id: string) => {
    if (!canMarkSystemRead) return;
    notificationsApi.markRead(id).then(() => {
      setApiNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    });
  };

  // Local notification list state
  const storeNotifications = useStore((s) => s.notifications);
  const sendManualNotification = useStore((s) => s.sendManualNotification);
  const markAsRead = useStore((s) => s.markAsRead);
  const markAllAsRead = useStore((s) => s.markAllAsRead);
  const clearNotifications = useStore((s) => s.clearNotifications);
  const removeNotification = useStore((s) => s.removeNotification);

  // Filter state
  const [filter, setFilter] = useState<
    "all" | "unread" | "read" | NotificationType
  >("all");

  // Dialog states
  const [sendDialog, setSendDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "info" as NotificationType,
    recipientTarget: "all" as RecipientTarget,
    role: "STAFF",
    channels: {
      inApp: true,
      email: false,
      push: false,
    },
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: true,
      frequency: "immediate",
      types: {
        leaveRequests: true,
        timesheetReminders: true,
        systemUpdates: false,
        announcements: true,
      },
    },
    push: {
      enabled: true,
      types: {
        leaveRequests: true,
        timesheetReminders: false,
        systemUpdates: false,
        announcements: false,
      },
    },
    slack: {
      enabled: false,
      webhook: "",
      types: {
        leaveRequests: false,
        timesheetReminders: false,
        systemUpdates: false,
        announcements: false,
      },
    },
  });

  const visibleNotifications = React.useMemo(() => {
    if (!roleNorm) {
      return storeNotifications.filter((n) => n.audience.type === "all");
    }
    return storeNotifications.filter((n) =>
      n.audience.type === "all"
        ? true
        : n.audience.roles.some((r) => r.toUpperCase() === roleNorm)
    );
  }, [roleNorm, storeNotifications]);

  // Filtered notifications list
  const filteredNotifications = visibleNotifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    if (filter !== "all" && filter !== notification.type) return false;
    return true;
  });

  // Unread count
  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length;

  // Stats for display
  const stats = {
    total: visibleNotifications.length,
    unread: unreadCount,
    today: visibleNotifications.filter(
      (n) =>
        format(n.createdAt, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    ).length,
    thisWeek: visibleNotifications.filter((n) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return n.createdAt >= weekAgo;
    }).length,
  };

  // Icons for notification types
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-l-green-500";
      case "warning":
        return "border-l-yellow-500";
      case "error":
        return "border-l-red-500";
      default:
        return "border-l-blue-500";
    }
  };

  // Handle sending notification
  const handleSendNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      return;
    }

    if (notificationForm.channels.inApp) {
      sendManualNotification({
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        actionUrl: "/notifications",
        audience:
          notificationForm.recipientTarget === "all"
            ? { type: "all" }
            : { type: "roles", roles: [notificationForm.role] },
      });
    }

    // Simulate sending via other channels
    if (notificationForm.channels.email) {
      console.log("Sending email notification...");
    }
    if (notificationForm.channels.push) {
      console.log("Sending push notification...");
    }

    setSendDialog(false);
    setNotificationForm({
      title: "",
      message: "",
      type: "info",
      recipientTarget: "all",
      role: "STAFF",
      channels: {
        inApp: true,
        email: false,
        push: false,
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    if (!canManageNotifications) return;
    clearNotifications();
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage and configure your notification preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
          </Dialog>
          {canManageNotifications && (
            <Dialog open={sendDialog} onOpenChange={setSendDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      </div>

      {/* System notifications (license expiry, staff assignment, facility activation) */}
      {apiNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Notifications
            </CardTitle>
            <CardDescription>
              License expiries, staff assignments, facility activations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apiNotifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between gap-4 p-3 rounded-lg border ${
                    n.readAt ? "bg-muted/30" : "bg-background"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(n.createdAt), "MMM d, yyyy HH:mm")} · {n.type}
                    </p>
                  </div>
                  {!n.readAt && canMarkSystemRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markApiRead(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.unread}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.today}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Bell className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.thisWeek}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Inbox</CardTitle>
              <CardDescription>
                Your recent notifications and alerts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select
                value={filter}
                onValueChange={(v) => setFilter(v as typeof filter)}
              >
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
              {canManageNotifications && (
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-4" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 bg-card rounded-lg p-4 transition-all hover:shadow-sm cursor-pointer ${getNotificationColor(
                    notification.type
                  )} ${
                    !notification.isRead ? "bg-blue-50 dark:bg-blue-950/10" : ""
                  }`}
                  onClick={() =>
                    !notification.isRead && handleMarkAsRead(notification.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(
                              notification.createdAt,
                              "MMM dd, yyyy HH:mm"
                            )}
                          </span>
                          {/* {notification.actionUrl && (
                            <span className="text-blue-600 hover:underline">
                              View Details →
                            </span>
                          )} */}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canManageNotifications) return;
                        removeNotification(notification.id);
                      }}
                      disabled={!canManageNotifications}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Send Notification Dialog (admin only) */}
      {canManageNotifications && (
      <Dialog open={sendDialog} onOpenChange={setSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification to users via multiple channels
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={notificationForm.title}
                onChange={(e) =>
                  setNotificationForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Notification title"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder="Notification message"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={notificationForm.type}
                  onValueChange={(value) =>
                    setNotificationForm((prev) => ({
                      ...prev,
                      type: value as NotificationType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Select
                  value={notificationForm.recipientTarget}
                  onValueChange={(value) =>
                    setNotificationForm((prev) => ({
                      ...prev,
                      recipientTarget: value as RecipientTarget,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="role">By Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {notificationForm.recipientTarget === "role" && (
              <div>
                <Label>Target role</Label>
                <Select
                  value={notificationForm.role}
                  onValueChange={(value) =>
                    setNotificationForm((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Delivery Channels</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">In-App Notification</span>
                  </div>
                  <Switch
                    checked={notificationForm.channels.inApp}
                    onCheckedChange={(checked) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, inApp: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Switch
                    checked={notificationForm.channels.email}
                    onCheckedChange={(checked) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, email: checked },
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">Push Notification</span>
                  </div>
                  <Switch
                    checked={notificationForm.channels.push}
                    onCheckedChange={(checked) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        channels: { ...prev.channels, push: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSendDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendNotification}>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Configure your notification preferences and delivery methods
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Email Settings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <h3 className="font-medium">Email Notifications</h3>
                </div>
                <Switch
                  checked={notificationSettings.email.enabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      email: { ...prev.email, enabled: checked },
                    }))
                  }
                />
              </div>
              {notificationSettings.email.enabled && (
                <div className="space-y-3 pl-7">
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={notificationSettings.email.frequency}
                      onValueChange={(value) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          email: { ...prev.email, frequency: value },
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notification Types</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(notificationSettings.email.types).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  email: {
                                    ...prev.email,
                                    types: {
                                      ...prev.email.types,
                                      [key]: checked,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Push Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  <h3 className="font-medium">Push Notifications</h3>
                </div>
                <Switch
                  checked={notificationSettings.push.enabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      push: { ...prev.push, enabled: checked },
                    }))
                  }
                />
              </div>
              {notificationSettings.push.enabled && (
                <div className="space-y-2 pl-7">
                  {Object.entries(notificationSettings.push.types).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              push: {
                                ...prev.push,
                                types: { ...prev.push.types, [key]: checked },
                              },
                            }))
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Slack Integration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Slack className="h-5 w-5" />
                  <h3 className="font-medium">Slack Integration</h3>
                </div>
                <Switch
                  checked={notificationSettings.slack.enabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      slack: { ...prev.slack, enabled: checked },
                    }))
                  }
                />
              </div>
              {notificationSettings.slack.enabled && (
                <div className="space-y-3 pl-7">
                  <div>
                    <Label>Webhook URL</Label>
                    <Input
                      value={notificationSettings.slack.webhook}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          slack: { ...prev.slack, webhook: e.target.value },
                        }))
                      }
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div>
                    <Label>Notification Types</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(notificationSettings.slack.types).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  slack: {
                                    ...prev.slack,
                                    types: {
                                      ...prev.slack.types,
                                      [key]: checked,
                                    },
                                  },
                                }))
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSettingsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  sendManualNotification({
                    title: "Settings Saved",
                    message: "Your notification preferences have been updated",
                    type: "success",
                    actionUrl: "/notifications",
                    audience: role ? { type: "roles", roles: [role] } : { type: "all" },
                  });
                  setSettingsDialog(false);
                }}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
