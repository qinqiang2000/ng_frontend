import { NextRequest } from 'next/server';
import { Router } from '@/server/routes';
import logger from '@/server/utils/logger';
import { runWithRequestTraceId } from '@/server/utils/traceId';

interface RouteParams {
    params: Promise<{
        slug: string[];
    }>;
}

// Lazy initialization to avoid build-time environment variable issues
let router: Router | null = null;

function getRouter(): Router {
    if (!router) {
        router = new Router();
    }
    return router;
}

async function handleRequest(request: NextRequest, { params }: RouteParams) {
    // 在traceId上下文中运行整个请求处理过程
    return runWithRequestTraceId(request.url, async () => {
        const startTime = Date.now();
        const { slug } = await params;
        const pathSegments = ['taxflow', ...slug];
        const logPath = pathSegments.join('/');

        try {
            // For taxflow routes, we prepend 'taxflow' to the path segments
            logger.info('API route request', logPath, {
                method: request.method,
                userAgent: request.headers.get('user-agent'),
                ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
            });

            const response = await getRouter().route(request, pathSegments);

            logger.info('API route response', logPath, {
                method: request.method,
                statusCode: response.status,
                duration: Date.now() - startTime,
                responseBody: response.body
            });

            return response;
        } catch (error) {
            logger.error('API route error', logPath, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                method: request.method,
                path: slug.join('/'),
                duration: Date.now() - startTime
            });
            throw error;
        }
    });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
export const HEAD = handleRequest;
export const OPTIONS = handleRequest;