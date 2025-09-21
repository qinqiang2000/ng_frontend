import { NextRequest } from 'next/server';
import { SsoController } from '@/server/controllers/SsoController';
import { runWithRequestTraceId } from '@/server/utils/traceId';

const ssoController = new SsoController();

export async function POST(request: NextRequest) {
    return runWithRequestTraceId(request.url, () => {
        return ssoController.login(request);
    });
}