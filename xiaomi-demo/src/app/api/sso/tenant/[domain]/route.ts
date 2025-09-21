import { NextRequest } from 'next/server';
import { SsoController } from '@/server/controllers/SsoController';
import { runWithRequestTraceId } from '@/server/utils/traceId';

interface RouteParams {
    params: Promise<{
        domain: string;
    }>;
}

const ssoController = new SsoController();

export async function GET(request: NextRequest, { params }: RouteParams) {
    return runWithRequestTraceId(request.url, async () => {
        const { domain } = await params;
        return ssoController.getTenantInfo(request, domain);
    });
}