import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  me: () => api.get('/auth/me'),
  
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/password', { currentPassword, newPassword }),
};

// Tickets API
export const ticketsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/tickets', { params }),
  
  getById: (id: string) => api.get(`/tickets/${id}`),
  
  import: (source: string, payload: any) =>
    api.post('/tickets/import', { source, payload }),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/tickets/${id}/status`, { status }),
  
  prefillPermit: (id: string, municipality: string, permitType: string) =>
    api.post(`/tickets/${id}/prefill-permit`, { municipality, permitType }),
  
  getDashboard: () => api.get('/tickets/dashboard/summary'),
};

// Permits API
export const permitsApi = {
  getAll: () => api.get('/permits'),
  
  getById: (id: string) => api.get(`/permits/${id}`),
  
  prefill: (ticketId: string, municipality: string, permitType: string) =>
    api.post('/permits/prefill', { ticketId, municipality, permitType }),
  
  update: (id: string, data: any) => api.patch(`/permits/${id}`, data),
  
  submit: (id: string) => api.post(`/permits/${id}/submit`),
};

// Audit API
export const auditApi = {
  getByTicket: (ticketId: string) => api.get(`/audit/${ticketId}`),
  
  exportPackage: (ticketId: string) => api.get(`/audit/${ticketId}/export`),
  
  getOrganizationSummary: () => api.get('/audit/organization/summary'),
};