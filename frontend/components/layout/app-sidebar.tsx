'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Building2, 
  FileText, 
  DollarSign, 
  UserCheck,
  Settings,
  LogOut,
  Ticket,
  MessageSquare,
  BarChart3,
  Layout,
  MapPin,
  GitBranch,
  Zap,
  Plug,
  Globe,
  Clock,
  Calendar,
  Bell,
  CheckCircle2,
  FolderOpen,
  Database,
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/store/slices/authSlice';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Locations', href: '/locations', icon: MapPin },
  { name: 'Tenants', href: '/tenants', icon: UserCheck },
  { name: 'Landlords', href: '/landlords', icon: Users },
  { name: 'Brokers', href: '/brokers', icon: UserCheck },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Viewings', href: '/viewings', icon: Calendar },
  { name: 'Leads', href: '/leads', icon: UserCheck },
  { name: 'Routing', href: '/routing', icon: GitBranch },
  { name: 'Automation', href: '/automation', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Microsites', href: '/microsites', icon: Globe },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Kanban', href: '/kanban', icon: Layout },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  { name: 'Announcements', href: '/announcements', icon: Bell },
  { name: 'Rental Approvals', href: '/rental-approvals', icon: CheckCircle2 },
  { name: 'Requests', href: '/requests', icon: FolderOpen },
  { name: 'Master Data', href: '/master-data', icon: Database },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await authService.logout();
    dispatch(clearAuth());
    router.push('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Real Estate</span>
            <span className="truncate text-xs text-muted-foreground">Management System</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

