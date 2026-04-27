import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Briefcase,
  CreditCard,
  MapPin,
  Bell,
  Archive,
  UserPlus,
  LogOut,
  ChevronRight,
  Timer } from
'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

type MenuKey =
  | "dashboard"
  | "facilities"
  | "staff"
  | "employees"
  | "organization"
  | "leaveManagement"
  | "attendance"
  | "payroll"
  | "timesheet"
  | "assets"
  | "expenses"
  | "documents"
  | "reports"
  | "onboarding"
  | "notifications";

type SidebarItem = {
  key: MenuKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission: string;
};

type AdminKey = "userManagement" | "systemSettings";
type AdminItem = {
  key: AdminKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission: string;
};

const menuItems: SidebarItem[] = [
{
  key: "dashboard" as const,
  title: 'Dashboard',
  icon: BarChart3,
  href: '/dashboard',
  permission: PERMISSIONS.DASHBOARD_VIEW
},
{
  key: "facilities" as const,
  title: 'Facilities',
  icon: Building2,
  href: '/facilities',
  permission: PERMISSIONS.FACILITIES_READ
},
{
  key: "staff" as const,
  title: 'Staff',
  icon: Users,
  href: '/staff',
  permission: PERMISSIONS.STAFF_READ
},
{
  key: "employees" as const,
  title: 'Employees',
  icon: Users,
  href: '/employees',
  permission: 'employees.read'
},
{
  key: "organization" as const,
  title: 'Organization',
  icon: Building2,
  href: '/organization',
  permission: 'organization.view'
},
{
  key: "leaveManagement" as const,
  title: 'Leave Management',
  icon: Calendar,
  href: '/leave',
  permission: 'leave.view'
},
{
  key: "attendance" as const,
  title: 'Attendance',
  icon: Clock,
  href: '/attendance',
  permission: 'attendance.view'
},
{
  key: "payroll" as const,
  title: 'Payroll',
  icon: DollarSign,
  href: '/payroll',
  permission: 'payroll.read'
},
{
  key: "timesheet" as const,
  title: 'Timesheet',
  icon: Timer,
  href: '/timesheet',
  permission: 'timesheet.view'
},
{
  key: "assets" as const,
  title: 'Assets',
  icon: Archive,
  href: '/assets',
  permission: 'assets.view'
},
{
  key: "expenses" as const,
  title: 'Expenses',
  icon: CreditCard,
  href: '/expenses',
  permission: 'expenses.view'
},
{
  key: "documents" as const,
  title: 'Documents',
  icon: FileText,
  href: '/documents',
  permission: 'documents.view'
},
{
  key: "reports" as const,
  title: 'Reports',
  icon: BarChart3,
  href: '/reports',
  permission: 'reports.view'
},
{
  key: "onboarding" as const,
  title: 'Onboarding',
  icon: UserPlus,
  href: '/onboarding',
  permission: 'onboarding.view'
},
{
  key: "notifications" as const,
  title: 'Notifications',
  icon: Bell,
  href: '/notifications',
  permission: PERMISSIONS.NOTIFICATIONS_READ
}];


const adminItems: AdminItem[] = [
{
  key: "userManagement" as const,
  title: 'User Management',
  icon: Shield,
  href: '/admin/users',
  permission: PERMISSIONS.USERS_READ
},
{
  key: "systemSettings" as const,
  title: 'System Settings',
  icon: Settings,
  href: '/admin/settings',
  permission: PERMISSIONS.USERS_READ
}];


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user, logout, hasPermission } = useAuth();
  const { t } = useTranslation();

  const filteredMenuItems = menuItems.filter((item) =>
  item.permission === '*' || hasPermission(item.permission)
  );

  const filteredAdminItems = adminItems.filter((item) =>
  item.permission === '*' || hasPermission(item.permission)
  );

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
    isCollapsed ? 'w-16' : 'w-64'} h-full flex flex-col`
    } data-id="3ce1ss1zx" data-path="src/components/layout/Sidebar.tsx">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800" data-id="n4gahyf58" data-path="src/components/layout/Sidebar.tsx">
        <div className="flex items-center space-x-3" data-id="trw5ahq22" data-path="src/components/layout/Sidebar.tsx">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center" data-id="cr39wgsho" data-path="src/components/layout/Sidebar.tsx">
            <Building2 className="h-5 w-5 text-white" data-id="4s2kuqqzd" data-path="src/components/layout/Sidebar.tsx" />
          </div>
          {!isCollapsed &&
          <div data-id="vhsmmnm2b" data-path="src/components/layout/Sidebar.tsx">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100" data-id="00zu1xik0" data-path="src/components/layout/Sidebar.tsx">Health Sector</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400" data-id="fix24iosm" data-path="src/components/layout/Sidebar.tsx">Portal</p>
            </div>
          }
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user &&
      <div className="p-4 border-b border-gray-200 dark:border-gray-800" data-id="7yw383wmm" data-path="src/components/layout/Sidebar.tsx">
          <div className="flex items-center space-x-3" data-id="nh4dbq063" data-path="src/components/layout/Sidebar.tsx">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center" data-id="kjxmlbrk2" data-path="src/components/layout/Sidebar.tsx">
              <span className="text-white font-medium text-sm" data-id="skxif0yac" data-path="src/components/layout/Sidebar.tsx">
                {user.name.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0" data-id="uxi6y0a92" data-path="src/components/layout/Sidebar.tsx">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" data-id="3cxcd7hhp" data-path="src/components/layout/Sidebar.tsx">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" data-id="6i0bmtzoc" data-path="src/components/layout/Sidebar.tsx">
                {user.designation}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1" data-id="f5482szou" data-path="src/components/layout/Sidebar.tsx">
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      }

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4" data-id="7gjixw7mc" data-path="src/components/layout/Sidebar.tsx">
        <nav className="space-y-1" data-id="vlfl8b3tl" data-path="src/components/layout/Sidebar.tsx">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ?
                'bg-blue-50 text-blue-700 border-r-2 border-blue-700' :
                'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'} ${
                isCollapsed ? 'justify-center' : ''}`
                } data-id="5ohyipyz1" data-path="src/components/layout/Sidebar.tsx">

                <Icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} data-id="wisqmjoni" data-path="src/components/layout/Sidebar.tsx" />
                {!isCollapsed &&
                <>
                    {t(`nav.${item.key}`)}
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" data-id="31g9ykea2" data-path="src/components/layout/Sidebar.tsx" />
                  </>
                }
              </NavLink>);

          })}

          {filteredAdminItems.length > 0 &&
          <>
              <Separator className="my-3" data-id="wihi5eimr" data-path="src/components/layout/Sidebar.tsx" />
              <div className={`px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
            isCollapsed ? 'text-center' : ''}`
            } data-id="u9zr3q5x0" data-path="src/components/layout/Sidebar.tsx">
                {!isCollapsed ? t("nav.admin") : 'A'}
              </div>
              {filteredAdminItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ?
                  'bg-red-50 text-red-700 border-r-2 border-red-700' :
                  'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'} ${
                  isCollapsed ? 'justify-center' : ''}`
                  } data-id="o5qqg63ks" data-path="src/components/layout/Sidebar.tsx">

                    <Icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} data-id="0kjwqjby3" data-path="src/components/layout/Sidebar.tsx" />
                    {!isCollapsed &&
                  <>
                        {t(`nav.${item.key}`)}
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" data-id="06s2g2k8e" data-path="src/components/layout/Sidebar.tsx" />
                      </>
                  }
                  </NavLink>);

            })}
            </>
          }
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800" data-id="jiv1wmmqn" data-path="src/components/layout/Sidebar.tsx">
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? 'px-2' : 'justify-start'} text-red-600 hover:text-red-700 hover:bg-red-50`}
          onClick={logout} data-id="eae2oox58" data-path="src/components/layout/Sidebar.tsx">

          <LogOut className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} data-id="ay49tknnc" data-path="src/components/layout/Sidebar.tsx" />
          {!isCollapsed && t("nav.logout")}
        </Button>
      </div>
    </div>);

};

export default Sidebar;