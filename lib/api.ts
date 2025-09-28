import axios from 'axios';
import { toast } from 'sonner'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.familyfirst.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refreshing
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 Unauthorized and if it's an expired token
    if (error.response?.status === 401 && error.response.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request to prevent infinite loops

      try {
        // Attempt to refresh the token
        const response = await api.post('/auth/refresh-token');
        const newAccessToken = response.data.accessToken;

        // Update the stored access token
        localStorage.setItem('accessToken', newAccessToken);

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {        // If refresh token failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    // For any other error, or if refresh token failed, just reject the promise
    return Promise.reject(error);
  }
);

// SS Dashboard Types
export interface SsDashboardSummary {
  receivedKeys: number;
  receivedKeysDetails: {
    changeFromLastWeek: number;
    today: number;
    thisWeek: number;
    lastBatch: {
      date: string;
      count: number;
      from: string;
    } | null;
  };
  balanceKeys: number;
  transferStatus: number;
  transferredKeys: number;
  available: number;
  retailerCount: {
    totalActiveRetailers: number;
    growthThisMonth: string;
    regionalDistribution: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  dailyActivations: {
    today: number;
    avgDaily: number;
    weeklyPerformance: number[];
  };
}

export interface Distributor {
  password: string;
  username: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  receivedKeys: number;
  transferredKeys: number;
  createdBy: string;
  address: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DistributorStats {
  total: number;
  active: number;
  inactive: number;
  totalKeys: number;
}

export interface KeyTransferLog {
  transferId: string;
  timestamp: string;
  from: { id: string; name: string; role: string } | null;
  to: { id: string; name: string; role: string } | null;
  count: number;
  status: string;
  type: string;
  notes: string;
  direction: 'Sent' | 'Received' | null; // This is the key field from backend
}

export interface SsProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  receivedKeys: number;
  transferredKeys: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  status: string;
  address?: string;
}

// SS Dashboard API Functions

// GET /ss/dashboard/summary
export const getSsDashboardSummary = async (): Promise<SsDashboardSummary> => {
  try {
    const response = await api.get('/ss/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching SS dashboard summary:', error);
    throw error;
  }
};

// GET /ss/distributors
export const getDistributorList = async (): Promise<Distributor[]> => {
  try {
    const response = await api.get('/ss/distributors');
    // Map backend address to frontend address
    const distributors = response.data.map((distributor: any) => ({
      ...distributor,
      address: distributor.address || distributor.address,
    }));
    return distributors;
  } catch (error) {
    console.error('Error fetching distributor list:', error);
    throw error;
  }
};

// GET /ss/distributors/stats
export const getDistributorStats = async (): Promise<DistributorStats> => {
  try {
    const response = await api.get('/ss/distributors/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching distributor stats:', error);
    throw error;
  }
};

// GET /ss/key-transfer-logs
export const getSsKeyTransferLogs = async (
  page: number = 1,
  limit: number = 10,
  startDate?: string,
  endDate?: string,
  status?: string,
  type?: string,
  search?: string
): Promise<{ total: number; page: number; limit: number; logs: KeyTransferLog[] }> => {
  try {
    const response = await api.get('/ss/key-transfer-logs', {
      params: {
        page,
        limit,
        startDate,
        endDate,
        status,
        type,
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching SS key transfer logs:', error);
    throw error;
  }
};

// POST /ss/distributors
export const addDistributor = async (distributorData: {
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  status?: string;
  receivedKeys?: number;
  password: string;
}) => {
  try {
    // Backend expects 'address' and maps it to 'address' internally
    const backendData = {
      name: distributorData.name,
      username: distributorData.username,
      email: distributorData.email,
      phone: distributorData.phone,
      address: distributorData.address, // Backend will map this to address
      status: distributorData.status || 'active',
      receivedKeys: distributorData.receivedKeys || 0,
      password: distributorData.password
    };
    const response = await api.post('/ss/distributors', backendData);
    return response.data;
  } catch (error: any) {
    console.error('Error adding distributor:', error);
    console.error('Full error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestData: distributorData
    });
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Request data that was sent:', distributorData);
    }
    throw error;
  }
};

// PUT /ss/distributors/:id
export const updateDistributor = async (distributorId: string, updatedData: Partial<Distributor>) => {
  try {
    // Backend expects 'address' and maps it to 'address' internally
    const backendData = { ...updatedData };
    
    const response = await api.put(`/ss/distributors/${distributorId}`, backendData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating distributor:', error);
    if (error.response) {
      console.error('Update error response:', error.response.data);
      console.error('Update error status:', error.response.status);
    }
    throw error;
  }
};

// DELETE /ss/distributors/:id
export const deleteDistributor = async (distributorId: string) => {
  try {
    const response = await api.delete(`/ss/distributors/${distributorId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting distributor:', error);
    throw error;
  }
};

// POST /ss/transfer-keys-to-db
export const transferKeysToDb = async (dbId: string, keysToTransfer: number) => {
  try {
    const response = await api.post('/ss/transfer-keys-to-db', {
      dbId,
      keysToTransfer,
    });
    return response.data;
  } catch (error) {
    console.error('Error transferring keys to distributor:', error);
    throw error;
  }
};

// GET /ss/profile
export const getSsProfile = async (): Promise<SsProfile> => {
  try {
    const response = await api.get('/ss/profile');
    // Backend now maps address to address, so we can use it directly
    return response.data;
  } catch (error) {
    console.error('Error fetching SS profile:', error);
    throw error;
  }
};

// PUT /ss/profile
export const updateSsProfile = async (updatedData: Partial<SsProfile>) => {
  try {
    // Backend expects address and maps it to address internally
    const backendData = { ...updatedData };
    
    const response = await api.put('/ss/profile', backendData);
    return response.data;
  } catch (error) {
    console.error('Error updating SS profile:', error);
    throw error;
  }
};

// Authentication API Functions

// POST /auth/login
export const login = async (identifier: string, password: string) => {
  try {
    // Send identifier (email, username, or phone) and password
    const response = await api.post('/auth/login', { identifier, password, role: 'ss' });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    const errorMessage =
      (error as any)?.response?.data?.message || "Login failed. Please check your credentials.";
    toast(errorMessage);
    throw error;
  }
};

// POST /auth/logout
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    return response.data;
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// GET /auth/me
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// POST /ss/distributors/:id/change-password
export const changeDistributorPassword = async (distributorId: string, newPassword: string) => {
  try {
    const response = await api.post(`/ss/distributors/${distributorId}/change-password`, { newPassword });
    return response.data;
  } catch (error: any) {
    console.error('Error changing distributor password:', error);
    if (error.response) {
      console.error('Change password response:', error.response.data);
    }
    throw error;
  }
};

export default api;