import crypto from 'crypto';
import { TenantInfo, KingdeeSsoUserInfo } from '../types/session';
import logger from '../utils/logger';

export interface SecureTokenRequest {
    domain: string;
    appId: string;
    timestamp: number;
    sign: string;
}

export interface TokenRefreshResponse {
    code: string;
    message: string;
    success: boolean;
    data: KingdeeSsoUserInfo | null;
}

export class TokenRefreshService {
    private targetUrl: string;

    constructor() {
        this.targetUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-sit.piaozone.com';
    }

    /**
     * 刷新苍穹Token
     * @param tenantInfo 租户信息，包含clientId和clientSecret
     * @param domain 租户域名
     * @returns 新的Token信息
     */
    async refreshKingdeeToken(tenantInfo: TenantInfo, domain: string): Promise<KingdeeSsoUserInfo | null> {
        try {
            if (!tenantInfo.clientId || !tenantInfo.clientSecret) {
                logger.info('Token refresh failed: missing clientId or clientSecret');
                // 返回null表示需要重新登录
                return null;
            }

            // 生成时间戳
            const timestamp = Date.now();

            // 计算签名: MD5(appId + secret + timestamp)
            const signString = tenantInfo.clientId + tenantInfo.clientSecret + timestamp;
            const sign = crypto.createHash('md5').update(signString).digest('hex');

            const requestData: SecureTokenRequest = {
                domain,
                appId: tenantInfo.clientId,
                timestamp,
                sign
            };

            // 构造请求URL，使用targetUrl作为根地址
            const requestUrl = `${this.targetUrl}/xm-demo/api/sso/kingdee/token`;

            // 直接发送HTTP请求，避免循环依赖
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'TaxFlow-Pro/1.0.0',
                    'Accept-Language': 'zh-CN'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.warn('Token refresh HTTP error', errorText);
                // HTTP错误也返回null，表示Token刷新失败，需要重新登录
                return null;
            }

            const result: TokenRefreshResponse = await response.json();

            if (result.code !== '200' || !result.success || !result.data) {
                logger.info('刷新token失败，返回信息', result);
                // 返回null表示Token刷新失败，需要重新登录
                return null;
            }

            return result.data;

        } catch (error) {
            logger.info('刷新token出现异常', error);
            // 所有异常情况都返回null，表示Token刷新失败，需要重新登录
            return null;
        }
    }

    /**
     * 验证签名是否正确（用于测试）
     */
    validateSignature(appId: string, secret: string, timestamp: number, expectedSign: string): boolean {
        const signString = appId + secret + timestamp;
        const calculatedSign = crypto.createHash('md5').update(signString).digest('hex');
        return calculatedSign === expectedSign;
    }

    /**
     * 检查时间戳是否在有效期内（5分钟）
     */
    isTimestampValid(timestamp: number): boolean {
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        return Math.abs(now - timestamp) <= fiveMinutes;
    }
}

// 导出单例实例
export const tokenRefreshService = new TokenRefreshService();