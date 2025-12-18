'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuth, setLoading, clearAuth } from '@/store/slices/authSlice';
import { authService } from '@/lib/auth';
import { api } from '@/lib/api';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));
      
      // Initialize auth state from localStorage
      const token = authService.getToken();
      const user = authService.getUser();

      if (token && user) {
        try {
          // Verify token is still valid by calling /auth/me
          const response = await api.getCurrentUser();
          
          if (response && response.success && response.data) {
            // Token is valid, restore auth state with updated user data
            dispatch(
              setAuth({
                user: response.data,
                token,
              })
            );
          } else {
            // Token is invalid, clear auth
            authService.logout();
            dispatch(clearAuth());
          }
        } catch (error: any) {
          // Token is invalid or expired, clear auth
          // Don't show error to user, just clear silently
          console.log('Token validation failed, clearing auth');
          authService.logout();
          dispatch(clearAuth());
        }
      } else {
        // No token or user, clear any stale state
        dispatch(clearAuth());
      }
      
      dispatch(setLoading(false));
      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch]);

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}

