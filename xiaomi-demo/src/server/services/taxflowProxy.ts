import { ProxyMiddleware, ProxyConfig } from '../middleware/proxy';
import logger from '../utils/logger';

export class TaxFlowProxyService {
  private proxy: ProxyMiddleware;

  constructor() {
    const targetUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!targetUrl) {
      logger.warn('NEXT_PUBLIC_API_URL environment variable is not set');
      // Don't throw error during build time, just set a placeholder
      const placeholderConfig: ProxyConfig = {
        targetUrl: 'http://localhost:3000',
        pathRewrite: (path: string) => `/xm-demo${path}`
      };
      this.proxy = new ProxyMiddleware(placeholderConfig);
      return;
    }

    const config: ProxyConfig = {
      targetUrl: targetUrl.replace(/\/$/, ''), // Remove trailing slash
      pathRewrite: (path: string) => {
        // At this point, the path comes in without the 'taxflow' prefix
        // e.g., '/invoice-request/hourly-status-statistics'
        // We need to add '/xm-demo' prefix
        return `/xm-demo${path}`;
      }
    };
    this.proxy = new ProxyMiddleware(config);
  }

  async handleRequest(request: Request, pathSegments: string[]) {
    // Runtime check for environment variable
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required for proxy functionality');
    }
    return this.proxy.handle(request as any, pathSegments);
  }
}