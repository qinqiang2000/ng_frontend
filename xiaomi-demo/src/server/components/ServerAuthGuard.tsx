/**
 * 服务端权限检查组件
 *
 * 用于包装需要权限检查的服务端组件
 * 直接渲染不同状态，避免频繁的 redirect
 */

import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { sessionMiddleware } from '../middleware/session';
import { checkServerPermission, PermissionCheckResult } from '../services/serverPermissionService';
import AuthStatusDisplay from './AuthStatusDisplay';
import logger from '../utils/logger';
import { ServerSessionProvider, ServerSessionData } from '../../client/contexts/ServerSessionContext';

interface ServerAuthGuardProps {
    children: ReactNode;
    pathname: string;
    domain?: string;
}

/**
 * 服务端权限检查守卫组件
 *
 * 在服务端进行完整的认证和权限检查
 * 根据不同情况直接渲染对应的状态组件
 */
export default async function ServerAuthGuard({
    children,
    pathname,
    domain = 'kingdee'
}: ServerAuthGuardProps) {
    try {
        // 1. 检查 session cookie
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('taxflow_session');
        const sessionId = sessionCookie ? sessionCookie.value : undefined;

        if (!sessionId) {
            logger.info('[ServerAuthGuard] No session cookie found');
            return (
                <AuthStatusDisplay
                    type="session-expired"
                    returnUrl={pathname}
                    domain={domain}
                />
            );
        }

        // 2. 验证 session
        logger.info(`[ServerAuthGuard] Validating session: ${sessionId.substring(0, 8)}...`);
        const session = await sessionMiddleware.getSession(sessionId);
        if (!session || !session.ssoUserInfo) {
            logger.info('[ServerAuthGuard] Invalid session');
            return (
                <AuthStatusDisplay
                    type="session-expired"
                    returnUrl={pathname}
                    domain={domain}
                />
            );
        }

        // 3. 检查权限
        logger.info(`[ServerAuthGuard] Checking permissions for user: ${session.ssoUserInfo.username}`);

        const permissionResult = await checkServerPermission(pathname, session);
        logger.info('Permission check result', {
            errcode: permissionResult.errcode,
            description: permissionResult.description,
            hasPermission: permissionResult.data?.hasPermission
        });

        // 根据 errcode 处理不同情况
        if (permissionResult.errcode === '0000') {
            // API 调用成功
            if (permissionResult.data?.hasPermission) {
                // 有权限，渲染子组件并传递 session 数据
                logger.info(`[ServerAuthGuard] Access granted for user: ${session.ssoUserInfo.username}`);

                // 构建与 SsoController.getSession 返回结构一致的 session 数据
                const serverSessionData: ServerSessionData = {
                    user: {
                        username: session.ssoUserInfo.username,
                        displayName: session.ssoUserInfo.displayName,
                        email: session.ssoUserInfo.email,
                        mobile: session.ssoUserInfo.mobile,
                        language: session.ssoUserInfo.language,
                        domain: session.domain || 'kingdee',
                        orgId: session.ssoUserInfo.orgId,
                        orgName: session.ssoUserInfo.orgName,
                        realUsername: session.ssoUserInfo.realUsername
                    },
                    tenant: session.tenantInfo ? {
                        domain: session.tenantInfo.domain,
                        url: session.tenantInfo.url,
                        username: session.tenantInfo.username,
                        active: session.tenantInfo.active
                    } : null
                };

                return (
                    <ServerSessionProvider sessionData={serverSessionData}>
                        {children}
                    </ServerSessionProvider>
                );
            } else {
                // 无权限
                logger.info(`[ServerAuthGuard] Access denied for user: ${session.ssoUserInfo.username}`);
                return (
                    <AuthStatusDisplay
                        type="unauthorized"
                        returnUrl={pathname}
                        message={permissionResult.description}
                    />
                );
            }
        } else if (permissionResult.errcode === '1300') {
            // 登录失效
            logger.info(`[ServerAuthGuard] Session expired for user: ${session.ssoUserInfo.username}`);
            return (
                <AuthStatusDisplay
                    type="session-expired"
                    returnUrl={pathname}
                    domain={domain}
                    message={permissionResult.description}
                />
            );
        } else {
            // 其他错误
            logger.info(`[ServerAuthGuard] Permission check failed: ${permissionResult.errcode} - ${permissionResult.description}`);
            return (
                <AuthStatusDisplay
                    type="error"
                    message={permissionResult.description}
                    errcode={permissionResult.errcode}
                />
            );
        }

    } catch (error) {
        console.error('[ServerAuthGuard] Unexpected error:', error);

        // 系统错误
        return (
            <AuthStatusDisplay
                type="error"
                message="系统异常，请稍后重试"
                errcode="500"
            />
        );
    }
}