'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/client/contexts/AuthContext';
import { useErrorsTranslation } from '@/client/hooks/useTranslation';

interface SsoCallbackState {
  loading: boolean;
  error: string | null;
  success: boolean;
  permissionDenied: boolean;
}

// Generate UUID in format like: 52878291-2b8f-4e74-9bfd-bd19bc9b18f4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function SsoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth, checkPermission } = useAuth();
  const { t } = useErrorsTranslation();
  const [state, setState] = useState<SsoCallbackState>({
    loading: true,
    error: null,
    success: false,
    permissionDenied: false
  });

  useEffect(() => {
    const handleSsoCallback = async () => {
      try {
        
        // Extract code from URL parameters
        const responseCode = searchParams.get('code');

        if (!responseCode) {
          setState({
            loading: false,
            error: 'Missing authorization code in callback URL',
            success: false,
            permissionDenied: false
          });
          return;
        }

        // Get domain from URL query parameter, default to 'kingdee' if not present
        const domain = searchParams.get('domain') || 'kingdee';

        // First, get tenant info to validate domain
        const tenantResponse = await fetch(`/api/sso/tenant/${domain}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const tenantResult = await tenantResponse.json();

        if (!tenantResponse.ok || tenantResult.errcode !== '0000') {
          setState({
            loading: false,
            error: tenantResult.message || 'Failed to retrieve tenant information',
            success: false,
            permissionDenied: false
          });
          return;
        }

        // Complete SSO login with the authorization code
        const loginResponse = await fetch('/api/sso/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            domain,
            code: responseCode,
            nonce: generateUUID(),
            language: navigator.language.replace('-', '_') || 'en_US'
          })
        });

        const loginResult = await loginResponse.json();

        if (!loginResponse.ok || loginResult.errcode !== '0000') {
          setState({
            loading: false,
            error: loginResult.message || 'SSO login failed',
            success: false,
            permissionDenied: false
          });
          return;
        }

        // Login successful - refresh AuthContext state first
        await refreshAuth();
        
        // Get return URL directly from URL parameters
        let returnUrl = '/'; // Default to dashboard
        const returnUrlParam = searchParams.get('returnUrl');
        
        if (returnUrlParam && returnUrlParam !== '/sso/callback') {
          returnUrl = returnUrlParam;
        }

        // Check permissions for the target page
        try {
          const hasPermission = await checkPermission(returnUrl);
          
          if (hasPermission) {
            setState({
              loading: false,
              error: null,
              success: true,
              permissionDenied: false
            });
            
            // Redirect to requested page
            router.push(returnUrl);
          } else {
            // No permission - show permission denied page
            setState({
              loading: false,
              error: null,
              success: false,
              permissionDenied: true
            });
            
            // Auto redirect after 3 seconds
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        } catch (permissionError) {
          console.error('Permission check failed:', permissionError);
          
          // Handle different error types with appropriate messages
          let errorMessage = 'Permission check failed. Please try again.';
          
          if (permissionError instanceof Error) {
            switch (permissionError.message) {
              case 'HTTP_ERROR':
                errorMessage = t('general.networkError');
                break;
              case 'API_ERROR':
                // Use backend message if available, otherwise use translation
                const backendMessage = (permissionError as any).backendMessage;
                errorMessage = backendMessage || t('permission.checkErrorMessage');
                break;
              case 'NETWORK_ERROR':
                errorMessage = t('general.networkError');
                break;
              default:
                errorMessage = t('permission.checkErrorMessage');
            }
          }
          
          // On permission check error, show error page
          setState({
            loading: false,
            error: errorMessage,
            success: false,
            permissionDenied: false
          });
        }

      } catch (error) {
        setState({
          loading: false,
          error: 'An unexpected error occurred during authentication',
          success: false,
          permissionDenied: false
        });
      }
    };

    handleSsoCallback();
  }, [searchParams, router]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Authentication Error</h2>
          <p className="mt-2 text-gray-600">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (state.permissionDenied) {
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

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return null;
}

function SsoCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading...</h2>
        <p className="mt-2 text-gray-600">Preparing authentication...</p>
      </div>
    </div>
  );
}

export default function SsoCallback() {
  return (
    <Suspense fallback={<SsoCallbackLoading />}>
      <SsoCallbackContent />
    </Suspense>
  );
}