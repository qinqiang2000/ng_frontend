import ServerAuthGuard from '@/server/components/ServerAuthGuard';
import InvoiceRulesDetailInnerPage from './detailInnerPage';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ domain?: string }>;
}

/**
 * Invoice Rules Detail 页面 - 服务端组件
 *
 * 使用 ServerAuthGuard 进行权限检查，简化代码逻辑
 * 避免频繁的 redirect，提升用户体验
 */
export default async function InvoiceRulesDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const searchParamsData = await searchParams;
  const domain = searchParamsData?.domain;

  return (
    <ServerAuthGuard pathname={`/invoice-rules/${id}`} domain={domain}>
      <InvoiceRulesDetailInnerPage />
    </ServerAuthGuard>
  );
}