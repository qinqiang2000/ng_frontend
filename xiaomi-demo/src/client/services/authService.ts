import { User, AuthSession, TenantInfo } from '../contexts/AuthContext';

export interface AuthResponse<T = any> {
  errcode: string;
  message: string;
  data: T;
}

export interface SessionData {
  user: User;
  session: AuthSession;
  tenant?: TenantInfo;
}

export interface LoginRequest {
  domain: string;
  code: string;
  nonce?: string;
  language?: string;
}

export class AuthService {
  /**
   * Get current session information
   */
  async getSession(): Promise<SessionData | null> {
    try {
      // Get domain from URL query parameter, default to 'kingdee' if not present
      const urlParams = new URLSearchParams(window.location.search);
      const domain = urlParams.get('domain') || 'kingdee';

      const response = await fetch(`/api/sso/session?domain=${encodeURIComponent(domain)}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: AuthResponse<SessionData> = await response.json();

      if (response.ok && result.errcode === '0000' && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Complete SSO login
   */
  async login(request: LoginRequest): Promise<SessionData> {
    try {
      const response = await fetch('/api/sso/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          domain: request.domain,
          code: request.code,
          nonce: request.nonce || this.generateNonce(),
          language: request.language || this.getPreferredLanguage(),
        }),
      });

      const result: AuthResponse<SessionData> = await response.json();

      if (!response.ok || result.errcode !== '0000') {
        throw new Error(result.message || 'Login failed');
      }

      if (!result.data) {
        throw new Error('No session data returned from login');
      }

      return result.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Logout and destroy session
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch('/api/sso/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: AuthResponse = await response.json();

      if (!response.ok || result.errcode !== '0000') {
        console.warn('Logout API returned error:', result.message);
        // Continue with logout even if API fails
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with logout even if API fails
    }
  }

  /**
   * Get tenant information by domain
   */
  async getTenantInfo(domain: string): Promise<TenantInfo | null> {
    try {
      const response = await fetch(`/api/sso/tenant/${encodeURIComponent(domain)}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: AuthResponse<TenantInfo> = await response.json();

      if (response.ok && result.errcode === '0000' && result.data) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting tenant info:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) {
      return false;
    }

    // Check if session is expired
    const now = Date.now();
    if (session.session.expiresAt <= now) {
      return false;
    }

    return true;
  }

  /**
   * Generate random nonce for requests
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get preferred language from browser
   */
  private getPreferredLanguage(): string {
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language || (navigator as any).userLanguage;
      if (lang) {
        return lang.replace('-', '_');
      }
    }
    return 'en_US';
  }

  /**
   * Parse domain from URL
   */
  getDomainFromUrl(url?: string): string {
    if (typeof window === 'undefined') {
      return '';
    }

    try {
      const hostname = url ? new URL(url).hostname : window.location.hostname;
      return hostname;
    } catch (error) {
      console.error('Error parsing domain from URL:', error);
      return '';
    }
  }

  /**
   * Extract authorization code from URL
   */
  getAuthCodeFromUrl(url?: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const urlToCheck = url ? new URL(url) : new URL(window.location.href);
      const params = new URLSearchParams(urlToCheck.search);
      
      // Try both 'response_code' and 'code' parameters
      return params.get('response_code') || params.get('code');
    } catch (error) {
      console.error('Error extracting auth code from URL:', error);
      return null;
    }
  }

  /**
   * Format user display name
   */
  formatUserDisplayName(user: User): string {
    if (user.displayName && user.displayName !== user.username) {
      return user.displayName;
    }
    return user.username;
  }

  /**
   * Check if session needs refresh (within 5 minutes of expiry)
   */
  shouldRefreshSession(session: AuthSession): boolean {
    const now = Date.now();
    const timeUntilExpiry = session.expiresAt - now;
    const fiveMinutes = 5 * 60 * 1000;
    
    return timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0;
  }

  /**
   * Get session time remaining in human readable format
   */
  getSessionTimeRemaining(session: AuthSession): string {
    const now = Date.now();
    const timeRemaining = session.expiresAt - now;

    if (timeRemaining <= 0) {
      return 'Expired';
    }

    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Less than 1 minute';
    }
  }
}

// Singleton instance
export const authService = new AuthService();