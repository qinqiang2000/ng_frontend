import ServerAuthGuard from '@/server/components/ServerAuthGuard';
import CodeListsInnerPage from './innerPage';

interface PageProps {
    searchParams: Promise<{ domain?: string }>;
}

export default async function CodeListsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const domain = params?.domain;

    return (
        <ServerAuthGuard pathname="/public-data/code-lists" domain={domain}>
            <CodeListsInnerPage />
        </ServerAuthGuard>
    );
}