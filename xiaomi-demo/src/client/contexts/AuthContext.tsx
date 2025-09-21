'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { checkUserPermission, pathToPageTag } from '../services/permissionService';

export interface User {
  userId: string;
  username: string;
  displayName: string;
  email?: string;
  accountId?: string;
  domain?: string;
  orgId?: string;
}

export interface AuthSession {
  sessionId: string;
  createdAt: number;
  lastAccessAt: number;
  expiresAt: number;
}

export interface TenantInfo {
  id: number;
  domain: string;
  tenantType: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tenant: TenantInfo | null;
  loading: boolean;
  error: string | null;
  isLoggingOut: boolean;
  hasPermission: boolean;
  permissionLoading: boolean;
  currentPageTag: string;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tenant?: TenantInfo } }
  | { type: 'START_LOGOUT' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_USER'; payload: User }
  | { type: 'SET_PERMISSION_LOADING'; payload: boolean }
  | { type: 'SET_PERMISSION'; payload: { hasPermission: boolean; pageTag: string } };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  loading: true,
  error: null,
  isLoggingOut: false,
  hasPermission: false,
  permissionLoading: false,
  currentPageTag: '',
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        tenant: action.payload.tenant || null,
        loading: false,
        error: null,
      };

    case 'START_LOGOUT':
      return {
        ...state,
        isLoggingOut: true,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
        isLoggingOut: false,
      };

    case 'REFRESH_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_PERMISSION_LOADING':
      return {
        ...state,
        permissionLoading: action.payload,
      };

    case 'SET_PERMISSION':
      return {
        ...state,
        hasPermission: action.payload.hasPermission,
        currentPageTag: action.payload.pageTag,
        permissionLoading: false,
      };

    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (domain: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  checkPermission: (pathname: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const checkAuthStatus = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Get domain from URL query parameter, default to 'kingdee' if not present
      const urlParams = new URLSearchParams(window.location.search);
      const domain = urlParams.get('domain') || 'kingdee';

      const response = await fetch(`/api/sso/session?domain=${encodeURIComponent(domain)}`, {
        method: 'GET',
        credentials: 'same-origin',
      });

      const result = await response.json();

      if (response.ok && result.errcode === '0000' && result.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: result.data.user,
            tenant: result.data.tenant,
          },
        });
      } else if (result.errcode === '1300') {
        // Login expired or no active session
        dispatch({ type: 'LOGOUT' });
      } else {
        // Other session issues
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to check authentication status' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (domain: string, code: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetch('/api/sso/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          domain,
          code,
          nonce: Math.random().toString(36).substring(2, 15),
          language: navigator.language.replace('-', '_') || 'en_US',
        }),
      });

      const result = await response.json();

      if (!response.ok || result.errcode !== '0000') {
        throw new Error(result.message || 'Login failed');
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: result.data.user,
          tenant: result.data.tenant,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'START_LOGOUT' });

      await fetch('/api/sso/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (error) {
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      // Get domain from URL query parameter, default to 'kingdee' if not present
      const urlParams = new URLSearchParams(window.location.search);
      const domain = urlParams.get('domain') || 'kingdee';

      const response = await fetch(`/api/sso/session?domain=${encodeURIComponent(domain)}`, {
        method: 'GET',
        credentials: 'same-origin',
      });

      const result = await response.json();

      if (response.ok && result.errcode === '0000' && result.data) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: result.data.user,
            tenant: result.data.tenant,
          },
        });
      } else if (result.errcode === '1300') {
        // Login expired or no active session
        dispatch({ type: 'LOGOUT' });
      } else {
        // Other session issues
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const checkPermission = async (pathname: string): Promise<boolean> => {
    try {
      // Set permission loading state
      const pageTag = pathToPageTag(pathname);
      dispatch({ type: 'SET_PERMISSION_LOADING', payload: true });

      // Call permission service
      const hasPermission = await checkUserPermission(pathname);

      // Update permission state
      dispatch({
        type: 'SET_PERMISSION',
        payload: { hasPermission, pageTag }
      });

      return hasPermission;
    } catch (error) {
      // Check if it's a login expiration error (errcode: 1300)
      if (error instanceof Error && error.message === 'API_ERROR') {
        const apiError = error as any;
        if (apiError.errcode === '1300') {
          // Login expired, logout user
          dispatch({ type: 'LOGOUT' });
          // Don't re-throw, let AuthGuard handle the logout state
          return false;
        }
      }

      // On other errors, deny access and set permission to false
      dispatch({
        type: 'SET_PERMISSION',
        payload: { hasPermission: false, pageTag: pathToPageTag(pathname) }
      });
      // Re-throw error so AuthGuard can handle it
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAuth,
    checkAuthStatus,
    checkPermission,
  };


  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};