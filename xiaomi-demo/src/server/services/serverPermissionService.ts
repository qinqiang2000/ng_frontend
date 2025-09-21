/**
 * 服务端权限检查服务
 *
 * 用于在服务端组件中执行权限检查
 * 直接访问 Redis session 数据并调用后端权限 API
 */

import { SessionData } from '../types/session';
import { ProxyMiddleware, ProxyConfig } from '../middleware/proxy';
import { NextRequest } from 'next/server';
import logger from '../utils/logger';

/**
 * 权限检查请求接口
 */
export interface ServerPermissionCheckRequest {
    domain: string;
    buttonType: string;
    email?: string;
    mobile?: string;
    name?: string;
    userName: string;
    workNumber?: string;
    pageTag: string;
}

/**
 * 权限检查结果接口
 */
export interface ServerPermissionCheckResult {
    hasPermission: boolean;
    buttonType: string;
    errorCode?: string;
    errorMessage?: string;
    status: boolean;
}

/**
 * API 响应接口
 */
export interface ServerPermissionCheckResponse {
    errcode: string;
    message: string;
    data: ServerPermissionCheckResult | null;
}

/**
 * 权限检查错误类型
 */
export class PermissionError extends Error {
    public errcode: string;
    public backendMessage?: string;
    public httpStatus?: number;

    constructor(message: string, errcode: string, backendMessage?: string, httpStatus?: number) {
        super(message);
        this.name = 'PermissionError';
        this.errcode = errcode;
        this.backendMessage = backendMessage;
        this.httpStatus = httpStatus;
    }
}

/**
 * 将 URL 路径转换为 pageTag 格式
 *
 * 示例：
 * "/" -> "dashboard"
 * "/invoice-requests" -> "invoiceRequests"
 * "/invoice-requests/123" -> "invoiceRequests_detail"
 */
export function pathToPageTag(pathname: string): string {
    // 处理根路径
    if (pathname === '/' || pathname === '') {
        return 'dashboard';
    }

    // 移除前导斜杠并分割为段落
    const segments = pathname.slice(1).split('/').filter(s => s);

    // 转换每个段落
    const convertedSegments = segments.map(segment => {
        // 检查段落是否为纯数字（动态路由参数）
        if (/^\d+$/.test(segment)) {
            return 'detail';
        }

        // 将 kebab-case 转换为 camelCase
        return segment.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    });

    // 用下划线连接段落
    return convertedSegments.join('_');
}

/**
 * 权限检查统一返回结果接口
 */
export interface PermissionCheckResult {
    errcode: string;
    description: string;
    data: {
        hasPermission: boolean;
        username?: string;
        pageTag?: string;
    } | null;
}

/**
 * 服务端权限检查函数
 *
 * @param pathname - 当前页面路径
 * @param session - 用户 session 信息
 * @returns Promise<PermissionCheckResult> - 统一格式的权限检查结果
 */
export async function checkServerPermission(pathname: string, session: SessionData): Promise<PermissionCheckResult> {
    try {
        // 转换路径为 pageTag
        const pageTag = pathToPageTag(pathname);

        // 验证 session 数据
        if (!session.ssoUserInfo) {
            return {
                errcode: '1300',
                description: '登录已失效，请重新登录',
                data: null
            };
        }

        // 准备权限检查请求参数
        const permissionRequest: ServerPermissionCheckRequest = {
            domain: session.domain || '',
            buttonType: 'view', // 页面访问总是使用 'view'
            email: session.ssoUserInfo.email || '',
            mobile: session.ssoUserInfo.mobile || '',
            name: session.ssoUserInfo.displayName || '',
            userName: session.ssoUserInfo.username || '',
            workNumber: session.ssoUserInfo.workNumber || '',
            pageTag: pageTag
        };

        logger.info('Server permission check', {
            pathname,
            pageTag,
            username: session.ssoUserInfo.username,
            domain: session.domain
        });

        // 使用 proxy 中间件调用后端权限检查 API
        const result = await callPermissionApiViaProxy(permissionRequest);
        logger.info('Server permission check result', result);

        // 统一处理返回结果
        if (result.errcode === '0000') {
            // API 调用成功
            // const hasPermission = result.data?.hasPermission === true;
            const hasPermission = true; // 临时允许访问页面

            logger.info('Permission check result', {
                pathname,
                pageTag,
                username: session.ssoUserInfo.username,
                hasPermission,
                errcode: result.errcode
            });

            return {
                errcode: '0000',
                description: hasPermission ? '权限检查通过' : '您没有访问此页面的权限',
                data: {
                    hasPermission,
                    username: session.ssoUserInfo.username,
                    pageTag
                }
            };
        } else if (result.errcode === '1300') {
            // 登录失效
            return {
                errcode: '1300',
                description: result.message || '登录已失效，请重新登录',
                data: null
            };
        } else {
            // 其他 API 错误
            return {
                errcode: result.errcode,
                description: result.message || '权限检查失败',
                data: null
            };
        }

    } catch (error) {
        // 网络或系统错误
        logger.error('Server permission check error', {
            pathname,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        return {
            errcode: '500',
            description: error instanceof Error ? error.message : '系统异常，请稍后重试',
            data: null
        };
    }
}

/**
 * 通过 proxy 中间件调用权限检查 API
 *
 * @param permissionRequest - 权限检查请求参数
 * @param session - 用户 session 信息
 * @returns Promise<ServerPermissionCheckResponse> - API 响应结果
 */
async function callPermissionApiViaProxy(
    permissionRequest: ServerPermissionCheckRequest
): Promise<ServerPermissionCheckResponse> {
    try {
        const targetUrl = process.env.NEXT_PUBLIC_API_URL || '';
        // 配置 proxy 中间件
        const proxyConfig: ProxyConfig = {
            targetUrl: targetUrl + '/xm-demo'
        };

        const proxyMiddleware = new ProxyMiddleware(proxyConfig);
        // 构造模拟的 NextRequest 对象
        const mockRequest = new NextRequest(`${targetUrl}/api/sso/kingdee/permission/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(permissionRequest)
        });

        // 调用 proxy 中间件处理请求
        const response = await proxyMiddleware.handle(mockRequest, ['api', 'sso', 'kingdee', 'permission', 'check']);

        // 解析响应
        const responseData = await response.json();

        return responseData;

    } catch (error) {
        logger.error('Proxy permission check error', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        // 返回错误响应
        return {
            errcode: '500',
            message: error instanceof Error ? error.message : '代理请求失败',
            data: null
        };
    }
}