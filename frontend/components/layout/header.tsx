'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center flex-1 gap-4">
          {/* Sidebar trigger */}
          <SidebarTrigger />
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

