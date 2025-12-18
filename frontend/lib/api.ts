import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Auth endpoints
  async login(email: string, password: string, companyId?: number, twoFactorToken?: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
      company_id: companyId,
      two_factor_token: twoFactorToken,
    });
    return response.data;
  }

  async oauth2Token(
    grantType: string,
    username: string,
    password: string,
    clientId?: string,
    clientSecret?: string,
    companyId?: number,
    twoFactorToken?: string
  ) {
    const response = await this.client.post('/auth/oauth/token', {
      grant_type: grantType,
      username,
      password,
      client_id: clientId,
      client_secret: clientSecret,
      company_id: companyId,
      two_factor_token: twoFactorToken,
    });
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    this.clearToken();
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async getCompanies() {
    const response = await this.client.get('/auth/companies');
    return response.data;
  }

  async selectCompany(companyId: number) {
    const response = await this.client.post('/auth/select-company', {
      company_id: companyId,
    });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await this.client.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const api = new ApiClient();
export default api;

