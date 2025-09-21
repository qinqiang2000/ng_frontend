import AuditedRulesInnerPage from './innerPage';
import ServerAuthGuard from '@/server/components/ServerAuthGuard';

interface PageProps {
    searchParams: Promise<{ domain?: string }>;
}

export default async function AuditedRulesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const domain = params?.domain;
    return (
        <ServerAuthGuard pathname="/audited-rules" domain={domain}>
            <AuditedRulesInnerPage />
        </ServerAuthGuard>
    );
}