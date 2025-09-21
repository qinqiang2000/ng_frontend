import { NextRequest, NextResponse } from 'next/server';
import { sessionMiddleware } from '../middleware/session';
import { tokenRefreshService } from '../services/tokenRefreshService';
import logger from '../utils/logger';

export interface ProxyConfig {
    targetUrl: string;
    pathRewrite?: (path: string) => string;
}

export class ProxyMiddleware {
    private config: ProxyConfig;

    constructor(config: ProxyConfig) {
        this.config = config;
    }

    async handle(request: NextRequest, pathSegments: string[], isRetry: boolean = false): Promise<NextResponse> {
        return this.executeRequest(request, pathSegments, isRetry);
    }

    private async executeRequest(request: NextRequest, pathSegments: string[], isRetry: boolean = false): Promise<NextResponse> {
        const { targetUrl, pathRewrite } = this.config;
        const session = await sessionMiddleware.getSessionFromRequest(request);
        const orgId = session?.ssoUserInfo?.orgId;
        const accessToken = session?.ssoUserInfo?.accessToken;

        // Construct the original path
        const originalPath = '/' + pathSegments.join('/');

        // Apply path rewriting if provided
        const targetPath = pathRewrite ? pathRewrite(originalPath) : originalPath;

        // Build target URL
        const targetFullUrl = `${targetUrl}${targetPath}`;

        // Add query parameters if present
        const url = new URL(request.url);

        // For GET requests, add companyId as query parameter
        if (request.method === 'GET' && orgId) {
            url.searchParams.set('companyId', orgId);
        }

        const finalUrl = url.search
            ? `${targetFullUrl}${targetFullUrl.includes('?') ? '&' : '?'}${url.search.slice(1)}`
            : targetFullUrl;

        let requestBody: BodyInit | undefined;

        try {
            // Handle request body for POST/PUT/PATCH requests
            if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
                const bodyText = await request.text();

                // Try to parse as JSON and add companyId
                if (bodyText && orgId) {
                    try {
                        const bodyData = JSON.parse(bodyText);
                        bodyData.companyId = orgId;
                        requestBody = JSON.stringify(bodyData);
                    } catch (e) {
                        // If not JSON, use original body
                        requestBody = bodyText;
                    }
                } else {
                    requestBody = bodyText;
                }
            }

            // Forward the request
            const forwardHeaders = new Headers();

            // Copy headers from original request, excluding problematic ones
            for (const [key, value] of request.headers.entries()) {
                const lowerKey = key.toLowerCase();
                // Skip headers that can cause issues when body is modified
                if (!['content-length', 'content-encoding', 'host'].includes(lowerKey)) {
                    forwardHeaders.set(key, value);
                }
            }

            // Set required headers
            forwardHeaders.set('host', new URL(targetUrl).host);
            if (accessToken) {
                forwardHeaders.set('Authorization', accessToken);
            }

            if (requestBody) {
                forwardHeaders.set('content-type', 'application/json');
            }

            const response = await fetch(finalUrl, {
                method: request.method,
                headers: forwardHeaders,
                body: requestBody
            });

            // Check if response indicates token expiration (errcode: 1300)
            if (response.ok) {
                const responseClone = response.clone();
                try {
                    const responseData = await responseClone.json();

                    // Token expired (errcode: '1300'), attempt refresh and retry
                    if (responseData.errcode === '1300' && !isRetry) {
                        logger.info('Token expired (errcode: 1300), attempting refresh', {
                            path: originalPath,
                            method: request.method,
                            sessionId: session?.sessionId?.substring(0, 8) + '...'
                        });

                        const refreshResult = await this.handleTokenRefresh(request, session);
                        if (refreshResult.success) {
                            logger.info('Token refresh successful, retrying original request', {
                                path: originalPath,
                                method: request.method
                            });

                            // Retry the original request with new token (only once)
                            return this.executeRequest(request, pathSegments, true);
                        } else {
                            logger.error('Token refresh failed', {
                                path: originalPath,
                                error: refreshResult.error,
                                sessionExists: !!session
                            });

                            // Return login required response with errcode 1300
                            return NextResponse.json({
                                errcode: '1300',
                                message: '登录已失效，请重新登录',
                                data: null
                            }, { status: 200 });
                        }
                    }
                } catch (parseError) {
                    // Response is not JSON, continue with normal flow
                    logger.debug('Response is not JSON, continuing normal flow', {
                        path: originalPath,
                        contentType: response.headers.get('content-type')
                    });
                }
            }

            // Create response with original headers
            const responseHeaders = new Headers(response.headers);

            // Remove headers that might cause issues
            responseHeaders.delete('content-encoding');
            responseHeaders.delete('content-length');

            return new NextResponse(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
            });

        } catch (error) {
            logger.error('Proxy request failed', {
                url: finalUrl,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                path: originalPath,
                method: request.method,
                isRetry
            });
            return NextResponse.json(
                { error: 'Proxy request failed', message: error instanceof Error ? error.message : 'Unknown error' },
                { status: 500 }
            );
        }
    }

    private async handleTokenRefresh(request: NextRequest, session: any): Promise<{ success: boolean; error?: string }> {
        try {
            // Check if session exists
            if (!session || !session.tenantInfo || !session.domain) {
                logger.warn('Token refresh skipped: no valid session', {
                    hasSession: !!session,
                    hasTenantInfo: !!session?.tenantInfo,
                    hasDomain: !!session?.domain
                });
                return { success: false, error: 'No valid session found' };
            }

            // Attempt to refresh token
            const newTokenInfo = await tokenRefreshService.refreshKingdeeToken(
                session.tenantInfo,
                session.domain
            );

            if (!newTokenInfo) {
                // await sessionMiddleware.destroySession(session.sessionId);
                return { success: false, error: 'Token refresh failed, session destroyed' };
            }

            // Update session with new token
            await sessionMiddleware.updateAccessToken(session.sessionId, newTokenInfo.accessToken);

            logger.info('Session updated with new token', {
                sessionId: session.sessionId.substring(0, 8) + '...',
                username: newTokenInfo.username,
                expiresIn: newTokenInfo.expiresIn
            });

            return { success: true };

        } catch (error) {
            // 异常情况也清理session
            if (session?.sessionId) {
                // await sessionMiddleware.destroySession(session.sessionId);
            }

            logger.error('Token refresh process failed', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                sessionId: session?.sessionId?.substring(0, 8) + '...'
            });
            return { success: false, error: error instanceof Error ? error.message : 'Unknown refresh error' };
        }
    }
}