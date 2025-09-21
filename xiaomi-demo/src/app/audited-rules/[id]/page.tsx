import AuditedRulesDetailInnerPage from './detailInnerPage';
import ServerAuthGuard from '@/server/components/ServerAuthGuard';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ domain?: string }>;
}

export default async function AuditedRulesPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const searchParamsData = await searchParams;
    const domain = searchParamsData?.domain;
    return (
        <ServerAuthGuard pathname={`/audited-rules/${id}`} domain={domain}>
            <AuditedRulesDetailInnerPage />
        </ServerAuthGuard>
    );
}