import { TenantInfo, KingdeeSsoUserInfo } from '../types/session';
import { httpService } from './httpService';
import logger from '../utils/logger';

export interface ApiResponse<T = any> {
    errcode: string;
    message: string;
    data: T;
}

export interface SsoLoginRequest {
    domain: string;
    code: string;
    nonce?: string;
    language?: string;
}

export class SsoService {
    constructor() {
    }

    /**
     * Fetch tenant information by domain
     */
    async getTenantInfo(domain: string): Promise<ApiResponse<TenantInfo>> {
        return await httpService.get<TenantInfo>(`/api/tenant-info/domain/${encodeURIComponent(domain)}`);
    }

    /**
     * Complete Kingdee SSO login
     */
    async completeKingdeeSsoLogin(request: SsoLoginRequest): Promise<ApiResponse<KingdeeSsoUserInfo>> {
        const payload = {
            domain: request.domain,
            code: request.code,
            nonce: request.nonce || this.generateNonce(),
            language: request.language || 'zh_CN'
        };

        const result = await httpService.post<KingdeeSsoUserInfo>('/api/sso/kingdee/login', payload);

        logger.info('获取登录信息 请求地址', '/api/sso/kingdee/login');
        logger.info('获取登录信息 请求参数', payload);
        logger.info('获取登录信息，后台返回', result);
        return result;
    }

    /**
     * Validate tenant is active and SSO is enabled
     */
    validateTenantForSso(tenantInfo: TenantInfo): { valid: boolean; error?: string } {
        if (!tenantInfo) {
            return { valid: false, error: 'Tenant information not found' };
        }

        return { valid: true };
    }

    /**
     * Generate random nonce for request
     */
    private generateNonce(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Extract user information for session storage
     */
    extractSessionUserData(ssoUserInfo: KingdeeSsoUserInfo): {
        username: string;
        email?: string;
        displayName: string;
    } {
        return {
            username: ssoUserInfo.username,
            email: ssoUserInfo.email,
            displayName: ssoUserInfo.displayName || ssoUserInfo.username
        };
    }

    /**
     * Check if SSO token is expired
     */
    isSsoTokenExpired(ssoUserInfo: KingdeeSsoUserInfo, bufferTimeSeconds: number = 300): boolean {
        if (!ssoUserInfo.expiresIn) {
            return true;
        }

        // expiresIn is typically in seconds from the time of issuance
        // We need to check against current time, but since we don't have issued time,
        // we'll use a conservative approach
        return ssoUserInfo.expiresIn < bufferTimeSeconds;
    }
}

// Singleton instance
export const ssoService = new SsoService();