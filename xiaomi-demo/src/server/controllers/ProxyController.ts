import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { TaxFlowProxyService } from '../services/taxflowProxy';
import { sessionMiddleware } from '../middleware/session';
import logger from '../utils/logger';

export class ProxyController extends BaseController {
    private proxyService: TaxFlowProxyService | null = null;

    constructor() {
        super();
    }

    private getProxyService(): TaxFlowProxyService {
        if (!this.proxyService) {
            try {
                this.proxyService = new TaxFlowProxyService();
            } catch (error) {
                logger.error('Failed to initialize TaxFlowProxyService', {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                });
                throw error;
            }
        }
        return this.proxyService;
    }

    async handleTaxFlowProxy(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
        const startTime = Date.now();
        try {
            // Get session to extract orgId
            const session = await sessionMiddleware.getSessionFromRequest(request);

            logger.info('Proxy request received', {
                method: request.method,
                path: pathSegments.join('/'),
                username: session?.ssoUserInfo?.username
            });

            const proxyService = this.getProxyService();
            const response = await proxyService.handleRequest(request, pathSegments);

            logger.info('Proxy request completed', {
                method: request.method,
                path: pathSegments.join('/'),
                statusCode: response.status,
                duration: Date.now() - startTime
            });

            return response;
        } catch (error) {
            logger.error('Proxy request failed', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                method: request.method,
                path: pathSegments.join('/'),
                duration: Date.now() - startTime
            });
            return this.error(
                error instanceof Error ? error.message : 'Proxy service not available. Please check NEXT_PUBLIC_API_URL environment variable.',
                500
            );
        }
    }

    async healthCheck(request: NextRequest): Promise<NextResponse> {
        try {
            const targetUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!targetUrl) {
                return this.error('NEXT_PUBLIC_API_URL not configured', 500);
            }

            return this.success({
                status: 'healthy',
                targetUrl: targetUrl.replace(/\/$/, ''),
                timestamp: new Date().toISOString()
            }, 'Proxy service is healthy');
        } catch (error) {
            return this.error('Health check failed', 500);
        }
    }
}