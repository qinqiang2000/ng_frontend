import InvoiceRequestsInnerPage from './innerPage';
import ServerAuthGuard from '@/server/components/ServerAuthGuard';

interface PageProps {
  searchParams: Promise<{ domain?: string }>;
}

/**
 * Invoice Requests 页面 - 服务端组件
 *
 * 使用 ServerAuthGuard 进行权限检查，简化代码逻辑
 * 避免频繁的 redirect，提升用户体验
 */
export default async function InvoiceRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const domain = params?.domain;

  return (
    <ServerAuthGuard pathname="/invoice-requests" domain={domain}>
      <InvoiceRequestsInnerPage />
    </ServerAuthGuard>
  );
}