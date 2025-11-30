import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '../clients/auth';
import { authKeys, authUtils, performLogout } from '../auth';
import type {
  TelegramLoginDto,
  AdminLoginDto,
  AdminAuthResponse,
  ClientAuthResponse,
  RefreshRequest,
  RefreshResponse,
  Admin
} from '../types';

/**
 * Authentication hooks for Admin Panel
 */

// Email/password login mutation hook (main auth method for admin panel)
export const useLoginWithCredentials = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AdminLoginDto) => authClient.loginWithCredentials(request),
    onSuccess: (data: AdminAuthResponse) => {
      // Save auth data to localStorage
      authUtils.saveAuthData(data);

      // Update auth-related queries
      queryClient.setQueryData(authKeys.profile(), data.admin);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Credentials login failed:', error);
    },
  });
};

// Telegram login mutation hook (for clients, rarely used in admin panel)
export const useLoginWithTelegram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TelegramLoginDto) => authClient.loginWithTelegram(request),
    onSuccess: (_data: ClientAuthResponse) => {
      // Note: This is for client login, not admin. The admin panel typically uses credentials.
      console.warn('Telegram login used in admin panel - this returns a Client, not Admin');
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Telegram login failed:', error);
    },
  });
};

// Legacy login hook for backward compatibility
/**
 * @deprecated Use useLoginWithCredentials instead for admin login
 */
export const useLogin = () => {
  return useLoginWithCredentials();
};

// Refresh token mutation hook
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RefreshRequest) => authClient.refresh(request),
    onSuccess: (data: RefreshResponse) => {
      // Update tokens in localStorage
      const currentAdmin = queryClient.getQueryData(authKeys.profile()) as Admin | null;
      if (currentAdmin) {
        authUtils.saveAuthData({
          ...data,
          admin: currentAdmin,
        });
      }

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      performLogout();
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: () => {
      authUtils.clearAuthData();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Clear local data even if logout request fails
      authUtils.clearAuthData();
      queryClient.clear();
    },
    onSettled: () => {
      // Redirect to home/login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });
};

// Query current admin profile (requires authentication)
export const useCurrentAdmin = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async (): Promise<Admin | null> => {
      const authState = authUtils.initializeAuth();
      return authState.admin;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Legacy alias for backward compatibility
/**
 * @deprecated Use useCurrentAdmin instead
 */
export const useCurrentUser = useCurrentAdmin;

// Hook to check authentication status
export const useAuthStatus = () => {
  const { data: admin, isLoading } = useCurrentAdmin();

  return {
    admin,
    // Legacy field for backward compatibility
    user: admin,
    isAuthenticated: Boolean(admin),
    isLoading,
    // In admin panel, all authenticated users are admins
    isAdmin: Boolean(admin),
    isUser: false,
  };
};
