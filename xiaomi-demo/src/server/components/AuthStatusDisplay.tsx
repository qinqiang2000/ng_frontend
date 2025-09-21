'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthStatusDisplayProps {
    type: 'unauthorized' | 'session-expired' | 'error';
    message?: string;
    errcode?: string;
    returnUrl?: string;
    domain?: string;
}

/**
 * 认证状态显示组件
 * 
 * 统一处理不同的认证状态显示和交互逻辑
 */
export default function AuthStatusDisplay({ 
    type, 
    message, 
    errcode, 
    returnUrl, 
    domain = 'kingdee' 
}: AuthStatusDisplayProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // 构建 SSO 登录 URL
    const buildSsoUrl = async (domain: string = 'kingdee') => {
        try {
            const response = await fetch(`/api/sso/tenant/${domain}`);
            const result = await response.json();

            if (response.ok && result.errcode === '0000' && result.data) {
                const tenantInfo = result.data;
                const currentUrl = returnUrl || window.location.pathname;
                const callbackUrl = encodeURIComponent(
                    `${window.location.origin}/sso/callback?app_client_id=${tenantInfo.clientId}&response_code=code&returnUrl=${encodeURIComponent(currentUrl)}`
                );

                return `${tenantInfo.url}/login.html?response_type=code&app_client_id=${tenantInfo.clientId}&redirect=${callbackUrl}`;
            }
        } catch (error) {
            console.error('Error building SSO URL:', error);
        }

        // 降级处理
        const fallbackTenant = {
            clientId: 'ssotest',
            url: 'https://xinghan.piaozone.com/test01'
        };

        const currentUrl = returnUrl || window.location.pathname;
        const callbackUrl = encodeURIComponent(
            `${window.location.origin}/sso/callback?app_client_id=${fallbackTenant.clientId}&response_code=code&returnUrl=${encodeURIComponent(currentUrl)}`
        );

        return `${fallbackTenant.url}/login.html?response_type=code&app_client_id=${fallbackTenant.clientId}&redirect=${callbackUrl}`;
    };

    // 自动重定向逻辑
    useEffect(() => {
        if (type === 'error') {
            // 错误类型不自动重定向
            return;
        }

        let timer: NodeJS.Timeout;

        const handleRedirect = async () => {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            } else {
                setIsRedirecting(true);
                
                if (type === 'session-expired') {
                    // 登录失效，跳转 SSO
                    const ssoUrl = await buildSsoUrl(domain);
                    window.location.href = ssoUrl;
                } else {
                    // 权限不足，跳转首页
                    router.push('/');
                }
            }
        };

        handleRedirect();

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [countdown, type, returnUrl, router, domain]);

    // 重试按钮处理
    const handleRetry = () => {
        window.location.reload();
    };

    // 手动跳转首页
    const handleGoHome = () => {
        router.push('/');
    };

    // 渲染不同状态的内容
    const renderContent = () => {
        switch (type) {
            case 'unauthorized':
                return (
                    <div className="text-center max-w-md mx-auto">
                        <div className="rounded-full bg-orange-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                            <i className="ri-shield-cross-line text-2xl text-orange-600"></i>
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">权限不足</h2>
                        <p className="mt-2 text-gray-600">
                            您没有访问此页面的权限，请联系管理员
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                            {isRedirecting ? (
                                <span>正在返回首页...</span>
                            ) : (
                                <span>将在 {countdown} 秒后自动返回首页</span>
                            )}
                        </div>
                        <button
                            onClick={handleGoHome}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            立即返回首页
                        </button>
                    </div>
                );

            case 'session-expired':
                return (
                    <div className="text-center max-w-md mx-auto">
                        <div className="rounded-full bg-yellow-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                            <i className="ri-time-line text-2xl text-yellow-600"></i>
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">登录已失效</h2>
                        <p className="mt-2 text-gray-600">
                            您的登录信息已过期，请重新登录
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                            {isRedirecting ? (
                                <span>正在跳转到登录页...</span>
                            ) : (
                                <span>将在 {countdown} 秒后自动跳转到登录页</span>
                            )}
                        </div>
                    </div>
                );

            case 'error':
            default:
                return (
                    <div className="text-center max-w-md mx-auto">
                        <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                            <i className="ri-error-warning-line text-2xl text-red-600"></i>
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">系统异常</h2>
                        <p className="mt-2 text-gray-600">
                            {message || '系统出现异常，请稍后重试'}
                        </p>
                        {errcode && (
                            <p className="mt-1 text-sm text-gray-500">
                                错误代码: {errcode}
                            </p>
                        )}
                        <div className="mt-4 flex gap-2 justify-center">
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                重试
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                返回首页
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {renderContent()}
        </div>
    );
}