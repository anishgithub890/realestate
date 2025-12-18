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
  X
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/store/slices/authSlice';
import { useEffect } from 'react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Tenants', href: '/tenants', icon: UserCheck },
  { name: 'Landlords', href: '/landlords', icon: Users },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Leads', href: '/leads', icon: UserCheck },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    };
    
    if (pathname) {
      handleRouteChange();
    }
  }, [pathname, onClose]);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(clearAuth());
    router.push('/login');
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold">Real Estate</h1>
            <p className="text-sm text-gray-400 mt-1">Management System</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile when link is clicked
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-r-2 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 bottom-0">
        <div className="p-6">
          <h1 className="text-xl font-bold">Real Estate</h1>
          <p className="text-sm text-gray-400 mt-1">Management System</p>
        </div>
        
        <nav className="mt-8 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-r-2 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

