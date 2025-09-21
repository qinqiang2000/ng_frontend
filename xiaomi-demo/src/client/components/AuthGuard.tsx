'use client';

import { useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useErrorsTranslation, useCommonTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/useToast';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

export default function AuthGuard({
  children,
  showLoading = true
}: AuthGuardProps) {
  const { isAuthenticated, loading, error, isLoggingOut, checkPermission, hasPermission, permissionLoading } = useAuth();
  const { t } = useErrorsTranslation();
  const { t: tCommon } = useCommonTranslation();
  const { error: showErrorToast } = useToast();
  const router = useRouter();
  const [redirectState, setRedirectState] = useState<'loading' | 'authenticated' | 'permission-denied' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectInitiatedRef = useRef(false);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const [hasCompletedInitialCheck, setHasCompletedInitialCheck] = useState(false);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  // Stable permission check function
  const handlePermissionCheck = useCallback(async () => {
    try {
      // State is already 'permission-checking' when this function is called
      const pathname = window.location.pathname;
      const hasAccess = await checkPermission(pathname);

      if (hasAccess) {
        setRedirectState('authenticated');
      } else {
        // No permission - show permission denied page with auto redirect
        setRedirectState('permission-denied');
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }
    } catch (error) {
      // Handle different error types with appropriate translations
      if (error instanceof Error) {
        let specificErrorMessage = t('permission.checkErrorMessage'); // Default fallback

        switch (error.message) {
          case 'HTTP_ERROR':
            specificErrorMessage = t('general.networkError');
            break;
          case 'API_ERROR':
            // Use backend message if available, otherwise use translation
            const backendMessage = (error as any).backendMessage;
            specificErrorMessage = backendMessage || t('permission.checkErrorMessage');
            break;
          case 'NETWORK_ERROR':
            specificErrorMessage = t('general.networkError');
            break;
          default:
            specificErrorMessage = t('permission.checkErrorMessage');
        }

        // Store error message for error page display
        setErrorMessage(specificErrorMessage);
      }

      // Permission check error - show error page
      setRedirectState('error');
    }
  }, [checkPermission, t, showErrorToast, router]);

  // Reset permission check status when authentication status changes
  useEffect(() => {
    setHasCheckedPermission(false);
  }, [isAuthenticated]);

  // Handle permission check when user is authenticated and state is loading
  useEffect(() => {
    if (isAuthenticated && !hasCheckedPermission && redirectState === 'loading') {
      setHasCheckedPermission(true);
      handlePermissionCheck();
    }
  }, [isAuthenticated, hasCheckedPermission, redirectState, handlePermissionCheck]);

  // Main authentication effect
  useEffect(() => {
    // Always update the ref with current authentication state
    isAuthenticatedRef.current = isAuthenticated;

    let cancelled = false;

    // If still loading, stay in loading state
    if (loading) {
      setRedirectState('loading');
      redirectInitiatedRef.current = false;
      setHasCompletedInitialCheck(false);
      setHasCheckedPermission(false);
      return;
    }

    // Mark that we've completed the initial authentication check
    if (!hasCompletedInitialCheck) {
      setHasCompletedInitialCheck(true);
    }

    // If there's an error, set error state
    if (error) {
      setRedirectState('error');
      redirectInitiatedRef.current = false;
      setHasCheckedPermission(false);
      return;
    }

    // If user is authenticated, stay in loading state for permission check
    if (isAuthenticated) {
      setRedirectState('loading');
      redirectInitiatedRef.current = false;
      return;
    }

    // Only start redirect logic after initial check is complete
    // If user is not authenticated and we haven't started redirecting yet
    // But don't redirect if user is actively logging out
    if (!isAuthenticated && !isLoggingOut && !redirectInitiatedRef.current && hasCompletedInitialCheck) {
      setRedirectState('loading');
      redirectInitiatedRef.current = true;

      // Get domain from URL query parameter, default to 'kingdee' if not present
      const urlParams = new URLSearchParams(window.location.search);
      const domain = urlParams.get('domain') || 'kingdee';

      // First, get tenant info to determine SSO URL
      const redirectToSSO = async () => {
        try {
          // Check if this effect was cancelled
          if (cancelled) {
            return;
          }

          // Double-check authentication status before fetching tenant info
          if (cancelled || isAuthenticatedRef.current) {
            return;
          }

          const response = await fetch(`/api/sso/tenant/${domain}`);

          // Check again after async operation
          if (cancelled || isAuthenticatedRef.current) {
            return;
          }

          const result = await response.json();

          if (response.ok && result.errcode === '0000' && result.data) {
            const tenantInfo = result.data;

            // Final check before actual redirect
            if (cancelled || isAuthenticatedRef.current) {
              return;
            }

            // Construct callback URL (SSO will add the actual authorization code)
            // Add returnUrl directly in callback URL since state parameter is not supported
            const currentUrl = window.location.pathname + window.location.search;
            const callbackUrl = encodeURIComponent(`${window.location.origin}/sso/callback?app_client_id=${tenantInfo.clientId}&response_code=code&returnUrl=${encodeURIComponent(currentUrl)}`);

            // Construct SSO redirect URL using tenant configuration
            const ssoUrl = `${tenantInfo.url}/login.html?response_type=code&app_client_id=${tenantInfo.clientId}&redirect=${callbackUrl}`;

            window.location.href = ssoUrl;
          } else {
            if (!cancelled) {
              setRedirectState('error');
            }
          }
        } catch (error) {
          if (!cancelled) {
            // Fallback: redirect to a default SSO URL if tenant info fetch fails
            try {
              // Use default tenant configuration for kingdee domain
              const fallbackTenant = {
                clientId: 'ssotest',
                url: 'https://xinghan.piaozone.com/test01'
              };

              const currentUrl = window.location.pathname + window.location.search;
              const callbackUrl = encodeURIComponent(`${window.location.origin}/sso/callback?app_client_id=${fallbackTenant.clientId}&response_code=code&returnUrl=${encodeURIComponent(currentUrl)}`);

              // Final check before fallback redirect
              if (cancelled || isAuthenticatedRef.current) {
                return;
              }

              const ssoUrl = `${fallbackTenant.url}/login.html?response_type=code&app_client_id=${fallbackTenant.clientId}&redirect=${callbackUrl}`;

              window.location.href = ssoUrl;
            } catch (fallbackError) {
              setRedirectState('error');
            }
          }
        }
      };

      redirectToSSO();
    }

    // Cleanup function to cancel ongoing redirect operations
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loading, error, isLoggingOut, hasCompletedInitialCheck]);

  // Render based on redirect state - only show children when fully authenticated and has permission
  if (redirectState === 'authenticated' && isAuthenticated && hasPermission && !loading && !permissionLoading) {
    return <>{children}</>;
  }

  if (redirectState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{t('permission.checkError')}</h2>
          <p className="mt-2 text-gray-600">{errorMessage || t('permission.checkErrorMessage')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {tCommon('buttons.refresh') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (redirectState === 'permission-denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="rounded-full bg-orange-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <i className="ri-shield-cross-line text-2xl text-orange-600"></i>
          </div>
          <p className="mt-2 text-gray-600">{t('permission.deniedMessage')}</p>
          <div className="mt-4 text-sm text-gray-500">
            {t('permission.redirectCountdown')}
          </div>
        </div>
      </div>
    );
  }

  // For all other cases (loading, authenticating, checking permissions), show loading or nothing
  if (redirectState === 'loading' && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // Default: show nothing if conditions not met
  return null;
}