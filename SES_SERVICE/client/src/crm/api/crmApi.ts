/**
 * CRM API client
 * All CRM-specific API calls with JWT auth header
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('crm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    });

    const json = await res.json();

    if (res.status === 401) {
      // Token expired or invalid
      if (!window.location.pathname.includes('/login')) {
         localStorage.removeItem('crm_token');
         window.location.href = '/crm/login';
      }
      return { success: false, message: 'Session expired' };
    }

    return json;
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
}

// ==================== AUTH ====================
export const authApi = {
  login: (email: string, password: string) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request('/api/auth/me'),

  updateProfile: (data: { name?: string; phone?: string; department?: string }) =>
    request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  register: (data: any) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUsers: (params?: any) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => searchParams.set(key, String(params[key])));
    }
    return request(`/api/auth/users?${searchParams.toString()}`);
  },

  updateUser: (id: string, data: any) =>
    request(`/api/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    request(`/api/auth/users/${id}`, { method: 'DELETE' }),
};

// ==================== LEADS ====================
export const leadsApi = {
  getAll: (params?: any) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => searchParams.set(key, String(params[key])));
    }
    return request(`/api/crm/leads?${searchParams.toString()}`);
  },
  getById: (id: string) => request(`/api/crm/leads/${id}`),
  create: (data: any) => request('/api/crm/leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/crm/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/crm/leads/${id}`, { method: 'DELETE' }),
};

// ==================== CUSTOMERS ====================
export const customersApi = {
  getAll: (params?: any) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => searchParams.set(key, String(params[key])));
    }
    return request(`/api/crm/customers?${searchParams.toString()}`);
  },
  getById: (id: string) => request(`/api/crm/customers/${id}`),
  create: (data: any) => request('/api/crm/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/api/crm/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ==================== PIPELINE ====================
export const pipelineApi = {
  getAll: () => request('/api/crm/pipelines'),
  getLeads: (id: string) => request(`/api/crm/pipelines/${id}/leads`),
  create: (data: any) => request('/api/crm/pipelines', { method: 'POST', body: JSON.stringify(data) }),
  moveStage: (leadId: string, stage: string) =>
    request(`/api/crm/pipelines/leads/${leadId}/stage`, { method: 'PUT', body: JSON.stringify({ stage }) }),
};

// ==================== INVENTORY (Phase 2) ====================
export const inventoryApi = {
  getAll: () => request('/api/crm/products'),
  create: (data: any) => request('/api/crm/products', { method: 'POST', body: JSON.stringify(data) }),
  updateStock: (id: string, quantity: number) =>
    request(`/api/crm/products/${id}/stock`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
};

// ==================== ORDERS (Phase 2) ====================
export const ordersApi = {
  getAll: () => request('/api/crm/orders'),
  create: (data: any) => request('/api/crm/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    request(`/api/crm/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ==================== CAMPAIGNS (Phase 2) ====================
export const campaignsApi = {
  getAll: () => request('/api/crm/campaigns'),
  create: (data: any) => request('/api/crm/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  run: (id: string) => request(`/api/crm/campaigns/${id}/run`, { method: 'POST' }),
};

// ==================== ANALYTICS & AI (Phase 4) ====================
export const analyticsApi = {
  getOverview: () => request('/api/crm/analytics/overview'),
};

export const aiApi = {
  scoreLead: (id: string) => request(`/api/crm/ai/score-lead/${id}`, { method: 'POST' }),
};
