import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type PropsWithChildren, useState, useEffect } from 'react';
import { authUtils, AuthContext } from '../auth';
import { logError, getErrorInfo, isValidationResponseError } from '../error-handler';
import type { AuthState, User, LoginRequest, LoginResponse } from '../types';
import { authClient } from '../clients/auth';
import { performLogout } from '../auth';

// Create QueryClient with proper configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global query defaults
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          // Don't retry validation errors - these indicate schema mismatch
          if (isValidationResponseError(error)) {
            return false;
          }

          // Don't retry auth errors
          const errorInfo = getErrorInfo(error);
          if (errorInfo.status === 401 || errorInfo.status === 403) {
            return false;
          }

          // Retry server errors up to 3 times
          if (errorInfo.status && errorInfo.status >= 500) {
            return failureCount < 3;
          }

          // Default retry logic for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Global mutation defaults
        retry: false, // Don't retry mutations by default
        onError: (error) => {
          logError(error, 'Mutation Error');
        },
      },
    },
  });
};

// Auth Provider component
const AuthProvider = ({ children }: PropsWithChildren) => {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    ...authUtils.initializeAuth(),
    isLoading: true,
  }));

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialAuth = authUtils.initializeAuth();
        setAuthState({
          ...initialAuth,
          isLoading: false,
        });

        // If we have tokens but no user, try to refresh
        if (initialAuth.accessToken && initialAuth.refreshToken && !initialAuth.user) {
          try {
            const refreshResponse = await authClient.refresh({ refreshToken: initialAuth.refreshToken });
            // RefreshResponse doesn't include user, so we need to set tokens separately
            authUtils.tokenStorage.setAccessToken(refreshResponse.accessToken);
            authUtils.tokenStorage.setRefreshToken(refreshResponse.refreshToken);
            
            // TODO: Get user profile after refresh if needed
            setAuthState({
              user: null, // We don't have user from refresh
              accessToken: refreshResponse.accessToken,
              refreshToken: refreshResponse.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('Failed to refresh token on init:', error);
            authUtils.clearAuthData();
            setAuthState({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initAuth();
  }, []);

  const login = async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await authClient.login(request);
    authUtils.saveAuthData(response);
    
    setAuthState({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
    
    return response;
  };

  const logout = async (): Promise<void> => {
    await performLogout();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshTokens = async (): Promise<void> => {
    if (!authState.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authClient.refresh({ refreshToken: authState.refreshToken });
    authUtils.saveAuthData({ ...response, user: authState.user! });
    
    setAuthState(prev => ({
      ...prev,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }));
  };

  const updateUser = (user: User): void => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
    localStorage.setItem('surf_user', JSON.stringify(user));
  };

  const contextValue = {
    ...authState,
    login,
    logout,
    refreshTokens,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Main API Provider component
export const ApiProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {/* Only show devtools in development */}
        {/* TODO: Install @tanstack/react-query-devtools for development
        {import.meta.env.MODE === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            buttonPosition="bottom-left"
          />
        )} */}
      </AuthProvider>
    </QueryClientProvider>
  );
};

