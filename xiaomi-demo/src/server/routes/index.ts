import { NextRequest } from 'next/server';
import { ProxyRoutes } from './proxyRoutes';

export class Router {
    private proxyRoutes: ProxyRoutes;

    constructor() {
        this.proxyRoutes = new ProxyRoutes();
    }

    async route(request: NextRequest, pathSegments: string[]) {
        if (!pathSegments || pathSegments.length === 0) {
            return new Response('Not Found', { status: 404 });
        }

        const [routeName, ...remainingSegments] = pathSegments;

        // Handle proxy routes
        const proxyRoutes = this.proxyRoutes.getRoutes();
        if (routeName in proxyRoutes) {
            return proxyRoutes[routeName as keyof typeof proxyRoutes](request, remainingSegments);
        }

        return new Response('Not Found', { status: 404 });
    }

    getProxyRoutes() {
        return this.proxyRoutes;
    }
}