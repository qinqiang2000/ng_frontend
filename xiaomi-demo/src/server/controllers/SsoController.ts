import { NextRequest, NextResponse } from 'next/server';
import { ssoService, SsoLoginRequest } from '../services/ssoService';
import { sessionMiddleware } from '../middleware/session';
import { SessionData, TenantInfo, KingdeeSsoUserInfo } from '../types/session';
import logger from '../utils/logger';
import { BaseController } from './BaseController';

export class SsoController extends BaseController {
    /**
     * GET /api/sso/tenant/{domain}
     * Fetch tenant information by domain
     */
    async getTenantInfo(request: NextRequest, domain: string): Promise<NextResponse> {
        try {
            if (!domain) {
                return NextResponse.json({
                    errcode: '400',
                    message: 'Domain parameter is required',
                    data: null
                }, { status: 200 });
            }

            // Decode domain if it's URL encoded
            const decodedDomain = decodeURIComponent(domain);

            const result = await ssoService.getTenantInfo(decodedDomain);
            // Return the result with appropriate HTTP status
            // Backend returns errcode '0000' for success
            const statusCode = result.errcode === '0000' ? 200 : parseInt(result.errcode) || 200;

            return NextResponse.json(result, { status: statusCode });

        } catch (error) {
            logger.error('Error in getTenantInfo:', error);
            return NextResponse.json({
                errcode: '500',
                message: 'Internal server error',
                data: null
            }, { status: 200 });
        }
    }

    /**
     * POST /api/sso/login
     * Complete SSO login process
     */
    async login(request: NextRequest): Promise<NextResponse> {
        try {
            const body: SsoLoginRequest = await request.json();

            // Validate required fields
            if (!body.domain || !body.code) {
                return NextResponse.json({
                    errcode: '400',
                    message: 'Domain and authorization code are required',
                    data: null
                }, { status: 400 });
            }


            // First, get tenant information
            const tenantResult = await ssoService.getTenantInfo(body.domain);

            if (tenantResult.errcode !== '0000' || !tenantResult.data) {
                return NextResponse.json({
                    errcode: '404',
                    message: tenantResult.message || 'Tenant not found',
                    data: null
                }, { status: 404 });
            }

            const tenantInfo: TenantInfo = tenantResult.data;

            // Validate tenant for SSO
            const validation = ssoService.validateTenantForSso(tenantInfo);
            if (!validation.valid) {
                return NextResponse.json({
                    errcode: '403',
                    message: validation.error || 'Tenant not valid for SSO',
                    data: null
                }, { status: 403 });
            }

            // Complete SSO login
            const ssoResult = await ssoService.completeKingdeeSsoLogin(body);

            if (ssoResult.errcode !== '0000' || !ssoResult.data) {
                return NextResponse.json({
                    errcode: ssoResult.errcode,
                    message: ssoResult.message || 'SSO login failed',
                    data: null
                }, { status: parseInt(ssoResult.errcode) || 500 });
            }
            const ssoUserInfo: KingdeeSsoUserInfo = ssoResult.data;

            // Create session data
            const sessionData: Partial<SessionData> = {
                domain: body.domain,
                tenantInfo: tenantInfo,
                ssoUserInfo: ssoUserInfo
            };

            // Create session
            const session = await sessionMiddleware.createSession(sessionData);

            // Create response
            const response = NextResponse.json({
                errcode: '0000',
                message: 'Login successful'
            });

            // Set session cookie
            sessionMiddleware.setSessionCookie(response, session.sessionId);

            return response;

        } catch (error) {
            return NextResponse.json({
                errcode: '500',
                message: 'Internal server error during login',
                data: null
            }, { status: 200 });
        }
    }

    /**
     * GET /api/sso/session
     * Get current session information with domain validation
     */
    async getSession(request: NextRequest): Promise<NextResponse> {
        try {
            // Extract domain query parameter from URL
            const domain = request.nextUrl.searchParams.get('domain');

            // Validate that domain parameter is not empty
            if (!domain) {
                return NextResponse.json({
                    errcode: '400',
                    message: 'domain参数不能为空',
                    data: null
                }, { status: 200 });
            }

            const session = await sessionMiddleware.getSessionFromRequest(request);

            // If no session or domain doesn't match, treat as not logged in
            if (!session || session.domain !== domain) {
                return NextResponse.json({
                    errcode: '1300',
                    message: '登录已失效，请重新登录',
                    data: null
                }, { status: 200 });
            }

            // Return only user info, no session details
            const userInfo = {
                user: {
                    username: session.ssoUserInfo?.username,
                    displayName: session.ssoUserInfo?.displayName,
                    email: session.ssoUserInfo?.email,
                    mobile: session.ssoUserInfo?.mobile,
                    language: session.ssoUserInfo?.language,
                    domain: session.domain,
                    orgId: session.ssoUserInfo?.orgId,
                    orgName: session.ssoUserInfo?.orgName,
                    realUsername: session.ssoUserInfo?.realUsername
                },
                tenant: session.tenantInfo ? {
                    domain: session.tenantInfo.domain,
                    url: session.tenantInfo.url,
                    username: session.tenantInfo.username,
                    active: session.tenantInfo.active
                } : null
            };
            return NextResponse.json({
                errcode: '0000',
                message: 'Session retrieved successfully',
                data: userInfo
            });

        } catch (error) {
            console.error('Error getting session:', error);
            return NextResponse.json({
                errcode: '500',
                message: 'Internal server error',
                data: null
            }, { status: 200 });
        }
    }

    /**
     * POST /api/sso/logout
     * Logout and destroy session
     */
    async logout(request: NextRequest): Promise<NextResponse> {
        try {
            const session = await sessionMiddleware.getSessionFromRequest(request);

            if (session) {
                await sessionMiddleware.destroySession(session.sessionId);
            }

            const response = NextResponse.json({
                errcode: '0000',
                message: 'Logout successful',
                data: null
            });

            // Clear session cookie
            sessionMiddleware.clearSessionCookie(response);

            return response;

        } catch (error) {
            console.error('Error during logout:', error);
            return NextResponse.json({
                errcode: '500',
                message: 'Internal server error during logout',
                data: null
            }, { status: 500 });
        }
    }

    /**
     * POST /api/sso/kingdee/permission/check
     * Check user permission for specific page
     */
    async checkPermission(request: NextRequest): Promise<NextResponse> {
        try {
            const session = await sessionMiddleware.getSessionFromRequest(request);

            if (!session || !session.ssoUserInfo) {
                return NextResponse.json({
                    errcode: '1300',
                    message: 'No active session',
                    data: null
                }, { status: 200 });
            }

            const body = await request.json();
            const { buttonType, pageTag } = body;

            // Validate required fields
            if (!buttonType || !pageTag) {
                return NextResponse.json({
                    errcode: '400',
                    message: 'buttonType and pageTag are required',
                    data: null
                }, { status: 400 });
            }

            // Prepare permission check request with session data
            const permissionRequest = {
                domain: session.domain,
                buttonType: buttonType,
                email: session.ssoUserInfo.email || '',
                mobile: session.ssoUserInfo.mobile || '',
                name: session.ssoUserInfo.displayName || '',
                userName: session.ssoUserInfo.username || '',
                workNumber: session.ssoUserInfo.workNumber || '',
                pageTag: pageTag
            };

            const fullUrl = `${this.backendUrl}/api/sso/kingdee/permission/check`;
            logger.info('页面权限校验 url和参数', fullUrl, permissionRequest);
            // Create a new request with the assembled parameters
            const proxyRequest = new NextRequest(fullUrl, {
                method: 'POST',
                headers: request.headers,
                body: JSON.stringify(permissionRequest)
            });

            // Use proxy middleware to forward the request to backend API
            // The proxy will automatically handle accessToken, orgId, etc.
            const pathSegments = ['api', 'sso', 'kingdee', 'permission', 'check'];

            const res: any = await this.proxyMiddleware.handle(proxyRequest, pathSegments);
            // 临时允许访问页面
            const tempRes = { errcode: '0000', message: '页面权限校验成功', data: { hasPermission: true } };
            return NextResponse.json(tempRes);
        } catch (error) {
            console.log('error', error);
            logger.error('Error checking permission:', error);
            return NextResponse.json({
                errcode: '500',
                message: 'Internal server error during permission check',
                data: null
            }, { status: 500 });
        }
    }
}