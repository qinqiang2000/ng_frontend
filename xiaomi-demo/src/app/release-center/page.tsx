import ServerAuthGuard from '@/server/components/ServerAuthGuard';
import ReleaseCenterInnerPage from './innerPage';

interface PageProps {
  searchParams: Promise<{ domain?: string }>;
}

/**
 * Release Center 页面 - 服务端组件
 *
 * 使用 ServerAuthGuard 进行权限检查，简化代码逻辑
 * 避免频繁的 redirect，提升用户体验
 */
export default async function ReleaseCenterPage({ searchParams }: PageProps) {
  // 从查询参数获取 domain
  const params = await searchParams;
  const domain = params?.domain;

  return (
    <ServerAuthGuard pathname="/release-center" domain={domain}>
      <ReleaseCenterInnerPage />
    </ServerAuthGuard>
  );
}