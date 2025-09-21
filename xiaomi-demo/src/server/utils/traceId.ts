import { AsyncLocalStorage } from 'async_hooks';
import crypto from 'crypto';

interface TraceContext {
    traceId: string;
}

// 创建异步本地存储实例
const asyncLocalStorage = new AsyncLocalStorage<TraceContext>();

// 生成随机的traceId
function generateTraceId(): string {
    return crypto.randomBytes(8).toString('hex');
}

// 从请求URL中提取reqid参数
function extractReqIdFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('reqid');
    } catch {
        return null;
    }
}

// 设置当前请求的traceId
export function setTraceId(traceId: string): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
        store.traceId = traceId;
    }
}

// 获取当前请求的traceId
export function getTraceId(): string | null {
    const store = asyncLocalStorage.getStore();
    return store?.traceId || null;
}

// 在异步上下文中运行代码，并设置traceId
export function runWithTraceId<T>(traceId: string, fn: () => T): T {
    return asyncLocalStorage.run({ traceId }, fn);
}

// 从请求中获取或生成traceId，并在上下文中运行函数
export function runWithRequestTraceId<T>(requestUrl: string, fn: () => T): T {
    // 尝试从URL中提取reqid参数
    let traceId = extractReqIdFromUrl(requestUrl);

    // 如果没有找到reqid参数，生成一个新的traceId
    if (!traceId) {
        traceId = generateTraceId();
    }

    return runWithTraceId(traceId, fn);
}

// 获取格式化的traceId用于日志显示
export function getFormattedTraceId(): string {
    const traceId = getTraceId();
    return traceId ? ` ${traceId}` : '';
}