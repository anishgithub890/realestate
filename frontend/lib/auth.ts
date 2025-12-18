import { api } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  role_id?: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: User;
  };
  error?: string;
}

export interface Company {
  id: number;
  name: string;
}

class AuthService {
  async login(
    email: string,
    password: string,
    companyId?: number,
    twoFactorToken?: string
  ): Promise<AuthResponse> {
    const response = await api.login(email, password, companyId, twoFactorToken);
    
    if (response.success && response.data.access_token) {
      this.setToken(response.data.access_token);
      this.setRefreshToken(response.data.refresh_token);
      this.setUser(response.data.user);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('company_id');
    }
  }
}

export const authService = new AuthService();

