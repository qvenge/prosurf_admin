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

export const useLoginWithCredentials = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AdminLoginDto) => authClient.loginWithCredentials(request),
    onSuccess: (data: AdminAuthResponse) => {
      authUtils.saveAuthData(data);
      queryClient.setQueryData(authKeys.profile(), data.admin);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Credentials login failed:', error);
    },
  });
};

export const useLoginWithTelegram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TelegramLoginDto) => authClient.loginWithTelegram(request),
    onSuccess: (_data: ClientAuthResponse) => {
      console.warn('Telegram login used in admin panel - this returns a Client, not Admin');
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Telegram login failed:', error);
    },
  });
};

/** @deprecated Используйте useLoginWithCredentials для входа админа */
export const useLogin = () => {
  return useLoginWithCredentials();
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RefreshRequest) => authClient.refresh(request),
    onSuccess: (data: RefreshResponse) => {
      const currentAdmin = queryClient.getQueryData(authKeys.profile()) as Admin | null;
      if (currentAdmin) {
        authUtils.saveAuthData({
          ...data,
          admin: currentAdmin,
        });
      }
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      performLogout();
    },
  });
};

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
      authUtils.clearAuthData();
      queryClient.clear();
    },
    onSettled: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });
};

export const useCurrentAdmin = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async (): Promise<Admin | null> => {
      const authState = authUtils.initializeAuth();
      return authState.admin;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/** @deprecated Используйте useCurrentAdmin */
export const useCurrentUser = useCurrentAdmin;

export const useAuthStatus = () => {
  const { data: admin, isLoading } = useCurrentAdmin();

  return {
    admin,
    user: admin,
    isAuthenticated: Boolean(admin),
    isLoading,
    isAdmin: Boolean(admin),
    isUser: false,
  };
};
