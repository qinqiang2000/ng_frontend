import { NextRequest } from 'next/server';
import { SsoController } from '@/server/controllers/SsoController';

const ssoController = new SsoController();

export async function POST(request: NextRequest) {
    return ssoController.checkPermission(request);
}