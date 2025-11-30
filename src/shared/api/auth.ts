import { createContext, useContext } from 'react';
import { apiClient, tokenStorage, STORAGE_KEYS } from './config';
import { RefreshRequestSchema, RefreshResponseSchema, AdminSchema } from './schemas';
import { validateResponse } from './config';
import type { AuthState, AdminAuthResponse, AdminLoginDto, RefreshRequest, RefreshResponse, Admin } from './types';

// Re-export STORAGE_KEYS for use in other modules
export { STORAGE_KEYS };

// Authentication context - uses Admin instead of User for admin panel
export const AuthContext = createContext<AuthState & {
  login: (request: AdminLoginDto) => Promise<AdminAuthResponse>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateAdmin: (admin: Admin) => void;
}>({
  admin: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => { throw new Error('AuthContext not initialized'); },
  refreshTokens: async () => { throw new Error('AuthContext not initialized'); },
  updateAdmin: () => { throw new Error('AuthContext not initialized'); },
});

// Auth API functions
export const authApi = {
  /**
   * Refresh access token using refresh token
   */
  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const validatedRequest = RefreshRequestSchema.parse(request);

    const response = await apiClient.post('/auth/refresh', validatedRequest);
    return validateResponse(response.data, RefreshResponseSchema);
  },

  /**
   * Logout and invalidate refresh token
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};

// Auth utilities
export const authUtils = {
  /**
   * Token storage utilities
   */
  tokenStorage,

  /**
   * Initialize auth state from localStorage
   */
  initializeAuth(): AuthState {
    if (typeof window === 'undefined') {
      return {
        admin: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    const adminString = localStorage.getItem(STORAGE_KEYS.USER); // Keep same key for migration

    let admin: Admin | null = null;
    if (adminString) {
      try {
        const parsedAdmin = JSON.parse(adminString);
        admin = AdminSchema.parse(parsedAdmin);
      } catch (error) {
        console.error('Invalid admin data in localStorage:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }

    const isAuthenticated = Boolean(accessToken && refreshToken && admin);

    return {
      admin,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading: false,
    };
  },

  /**
   * Save auth data to localStorage
   */
  saveAuthData(authResponse: AdminAuthResponse): void {
    tokenStorage.setAccessToken(authResponse.accessToken);
    tokenStorage.setRefreshToken(authResponse.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authResponse.admin));
  },

  /**
   * Clear auth data from localStorage
   */
  clearAuthData(): void {
    tokenStorage.clearTokens();
  },

  /**
   * Check if access token is expired
   * Note: JWT tokens should be checked on the server side for security
   * This is just a client-side helper
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  },

  /**
   * Get admin from token payload (for development/debugging)
   * In production, always fetch admin data from the server
   */
  getAdminFromToken(token: string): Partial<Admin> | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
      };
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return null;
    }
  },
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth query keys for React Query
export const authKeys = {
  all: ['auth'] as const,
  admin: () => [...authKeys.all, 'admin'] as const,
  profile: () => [...authKeys.admin(), 'profile'] as const,
  // Legacy keys for backward compatibility
  user: () => [...authKeys.all, 'user'] as const,
} as const;

// Logout helper that can be used anywhere
export const performLogout = async (): Promise<void> => {
  try {
    await authApi.logout();
  } catch (error) {
    console.error('Logout request failed:', error);
    // Continue with local cleanup even if server request fails
  }

  authUtils.clearAuthData();

  // Redirect to login or home page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Helper to check if admin has specific permission
export const hasPermission = (admin: Admin | null, permission: string): boolean => {
  return admin?.permissions?.includes(permission) ?? false;
};

// Helper to require authentication for components
export const requireAuth = (admin: Admin | null): Admin => {
  if (!admin) {
    throw new Error('Authentication required');
  }
  return admin;
};

// Helper to require specific permission
export const requirePermission = (admin: Admin | null, permission: string): Admin => {
  const authenticatedAdmin = requireAuth(admin);
  if (!hasPermission(authenticatedAdmin, permission)) {
    throw new Error(`Permission '${permission}' required`);
  }
  return authenticatedAdmin;
};

// Legacy helpers for backward compatibility
export const hasRole = (admin: Admin | null, _role: string): boolean => {
  // In the new system, admins don't have roles, they have permissions
  // Return true for any authenticated admin
  return admin !== null;
};

export const isAdmin = (admin: Admin | null): boolean => {
  return admin !== null;
};

export const isUser = (_admin: Admin | null): boolean => {
  // Admin panel users are always admins, not regular users
  return false;
};

export const requireAdmin = (admin: Admin | null): Admin => {
  return requireAuth(admin);
};
