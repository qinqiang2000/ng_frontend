import { NextRequest } from 'next/server';
import { ProxyController } from '../controllers/ProxyController';

export class ProxyRoutes {
    private controller: ProxyController;

    constructor() {
        this.controller = new ProxyController();
    }

    async handleTaxFlow(request: NextRequest, pathSegments: string[]) {
        return this.controller.handleTaxFlowProxy(request, pathSegments);
    }

    async healthCheck(request: NextRequest) {
        return this.controller.healthCheck(request);
    }

    getRoutes() {
        return {
            'taxflow': this.handleTaxFlow.bind(this),
            'health': this.healthCheck.bind(this)
        };
    }
}