'use client';

import Header from '@/client/components/Header';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuditedRequestsTranslation } from '@/client/hooks/useTranslation';

const DocumentCanvas = dynamic(() => import('./components/DocumentCanvas'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Loading document canvas...</span>
      </div>
    </div>
  )
});

interface AuditedRequestDetailProps {
  requestId: string;
}

export default function AuditedRequestDetail({ requestId }: AuditedRequestDetailProps) {
  const { t } = useAuditedRequestsTranslation();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <Header />

    <main className="flex-1 flex flex-col px-6 py-6 overflow-hidden">
    {/* Header */}
    <div className="mb-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
        <Link href="/audited-requests" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
            <i className="ri-arrow-left-line text-gray-600"></i>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('detailTitle')}</h1>
        </div>
        </div>
    </div>

    {/* Main Content Area - Full Width Document Canvas */}
    <div className="flex-1 min-h-0">
        <DocumentCanvas billId={parseInt(requestId, 10) || 0} />
    </div>
    </main>
    </div>
  );
}