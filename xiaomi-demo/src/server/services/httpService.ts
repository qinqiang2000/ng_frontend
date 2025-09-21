export interface HttpResponse<T = any> {
    errcode: string;
    message: string;
    data: T;
}

export interface HttpRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

export class HttpService {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'https://api-sit.piaozone.com';
        this.defaultHeaders = {
            'Accept': 'application/json',
            'Accept-Language': 'zh-CN',
            'User-Agent': 'TaxFlow-Pro/1.0.0'
        };
    }

    /**
     * 构造完整的API URL
     */
    private buildUrl(path: string): string {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}/xm-demo${cleanPath}`;
    }

    /**
     * 通用HTTP请求方法
     */
    async request<T = any>(path: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
        const {
            method = 'GET',
            headers = {},
            body,
            timeout = 30000
        } = options;

        try {
            const url = this.buildUrl(path);

            // 合并默认headers和自定义headers
            const mergedHeaders = {
                ...this.defaultHeaders,
                ...headers
            };

            // 如果有body且没有设置Content-Type，自动设置为JSON
            if (body && !mergedHeaders['Content-Type']) {
                mergedHeaders['Content-Type'] = 'application/json';
            }

            // 构造fetch选项
            const fetchOptions: RequestInit = {
                method,
                headers: mergedHeaders,
                body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
            };

            // 创建AbortController用于超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    ...fetchOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // 记录请求信息（隐藏敏感数据）
                const logPayload = body ? this.sanitizeLogData(body) : undefined;
                console.log(`HTTP ${method} ${url}:`, {
                    status: response.status,
                    statusText: response.statusText,
                    payload: logPayload
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`HTTP ${method} failed:`, {
                        url,
                        status: response.status,
                        statusText: response.statusText,
                        error: errorText
                    });

                    return {
                        errcode: response.status.toString(),
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        data: null as any
                    };
                }

                // 尝试解析JSON响应
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    return data;
                } else {
                    // 非JSON响应
                    const text = await response.text();
                    return {
                        errcode: '0000',
                        message: 'Success',
                        data: text as any
                    };
                }

            } catch (fetchError) {
                clearTimeout(timeoutId);
                throw fetchError;
            }

        } catch (error) {
            // 处理网络错误、超时等
            console.error(`HTTP ${method} ${path} error:`, error);

            let errorMessage = 'Unknown error occurred';
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timeout';
                } else {
                    errorMessage = error.message;
                }
            }

            return {
                errcode: '500',
                message: errorMessage,
                data: null as any
            };
        }
    }

    /**
     * GET请求
     */
    async get<T = any>(path: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
        return this.request<T>(path, { method: 'GET', headers });
    }

    /**
     * POST请求
     */
    async post<T = any>(path: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
        return this.request<T>(path, { method: 'POST', body, headers });
    }

    /**
     * PUT请求
     */
    async put<T = any>(path: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
        return this.request<T>(path, { method: 'PUT', body, headers });
    }

    /**
     * DELETE请求
     */
    async delete<T = any>(path: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
        return this.request<T>(path, { method: 'DELETE', headers });
    }

    /**
     * 清理日志数据，隐藏敏感信息
     */
    private sanitizeLogData(data: any): any {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const sanitized = { ...data };
        const sensitiveFields = ['password', 'code1', 'token', 'secret', 'key'];

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '***';
            }
        }

        return sanitized;
    }
}

// 创建单例实例
export const httpService = new HttpService();