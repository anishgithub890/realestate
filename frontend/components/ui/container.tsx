'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from '@/components/ui/sidebar';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container
   * - 'sm': 640px
   * - 'md': 768px
   * - 'lg': 1024px
   * - 'xl': 1280px
   * - '2xl': 1536px
   * - 'full': Responsive width based on sidebar state (default)
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /**
   * Whether to add horizontal padding
   */
  padding?: boolean
  /**
   * Custom padding classes
   */
  paddingClassName?: string
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: '', // Will use responsive width system
}

// Create a fake sidebar context for use outside SidebarProvider
function useFallbackSidebar() {
  return {
    state: 'expanded' as const,
    open: true,
    setOpen: () => {},
    openMobile: false,
    setOpenMobile: () => {},
    isMobile: false,
    toggleSidebar: () => {},
  };
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    maxWidth = 'full',
    padding = true,
    paddingClassName,
    ...props 
  }, ref) => {
    const sidebar = (() => {
      try {
        return useSidebar();
      } catch (error) {
        return useFallbackSidebar();
      }
    })();

    const isSidebarExpanded = sidebar.state === 'expanded';
    
    const paddingClasses = paddingClassName || (padding ? 'px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6' : '');
    
    // If maxWidth is set to a specific size, use that instead of responsive system
    if (maxWidth !== 'full') {
      return (
        <div
          ref={ref}
          className={cn(
            'mx-auto box-border min-w-0 max-w-full',
            maxWidthClasses[maxWidth],
            paddingClasses,
            className
          )}
          {...props}
        />
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto box-border transition-all duration-300 ease-linear',
          // Base width for mobile - ensure it doesn't overflow viewport
          'w-full max-w-full min-w-0',
          // Small devices (tablets in portrait) with sidebar state - override max-w-full
          isSidebarExpanded 
            ? 'sm:max-w-[580px]' // Sidebar expanded: ~240px sidebar + content
            : 'sm:max-w-[600px]', // Sidebar collapsed: further reduced to prevent overflow
          // Medium devices with sidebar state
          isSidebarExpanded 
            ? 'md:max-w-[650px]' // Sidebar expanded: ~240px sidebar + content
            : 'md:max-w-[680px]', // Sidebar collapsed: further reduced to prevent overflow
          // Large devices with sidebar state
          isSidebarExpanded 
            ? 'lg:max-w-[1050px]' // Sidebar expanded: ~260px sidebar + content
            : 'lg:max-w-[1200px]', // Sidebar collapsed: further reduced to prevent overflow
          // Extra large devices with sidebar state
          isSidebarExpanded 
            ? 'xl:max-w-[1250px]' // Sidebar expanded: comfortable width
            : 'xl:max-w-[1400px]', // Sidebar collapsed: further reduced to prevent overflow
          // 2XL devices with sidebar state
          isSidebarExpanded 
            ? '2xl:max-w-[1420px]' // Sidebar expanded: optimal width
            : '2xl:max-w-[1550px]', // Sidebar collapsed: further reduced to prevent overflow
          // Padding scale
          paddingClasses,
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container }

