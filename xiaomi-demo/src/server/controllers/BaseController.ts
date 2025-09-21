import { NextRequest, NextResponse } from 'next/server';
import { ProxyMiddleware } from '../middleware/proxy';

export abstract class BaseController {
    protected proxyMiddleware: ProxyMiddleware;
    protected backendUrl: string;

    constructor() {
        // Initialize proxy middleware for backend API calls
        this.backendUrl = process.env.NEXT_PUBLIC_API_URL || '';
        this.proxyMiddleware = new ProxyMiddleware({
            targetUrl: this.backendUrl + '/xm-demo'
        });
    }

    protected success(data?: any, message: string = 'Success') {
        return NextResponse.json({
            errcode: '0000',
            message,
            data
        });
    }

    protected error(message: string = 'Internal Server Error', status: number = 500, errcode: string = '500') {
        return NextResponse.json({
            errcode,
            message,
            data: null
        }, { status });
    }

    protected badRequest(message: string = 'Bad Request', errcode: string = '400') {
        return this.error(message, 400, errcode);
    }

    protected notFound(message: string = 'Not Found', errcode: string = '404') {
        return this.error(message, 404, errcode);
    }

    protected unauthorized(message: string = 'Unauthorized', errcode: string = '401') {
        return this.error(message, 401, errcode);
    }

    protected forbidden(message: string = 'Forbidden', errcode: string = '403') {
        return this.error(message, 403, errcode);
    }

    protected async parseRequestBody(request: NextRequest): Promise<any> {
        try {
            const contentType = request.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                return await request.json();
            } else if (contentType?.includes('application/x-www-form-urlencoded')) {
                const formData = await request.formData();
                const data: Record<string, any> = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                return data;
            } else if (contentType?.includes('multipart/form-data')) {
                return await request.formData();
            }

            return null;
        } catch (error) {
            throw new Error('Failed to parse request body');
        }
    }

    protected getQueryParams(request: NextRequest): Record<string, string> {
        const url = new URL(request.url);
        const params: Record<string, string> = {};

        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return params;
    }
}