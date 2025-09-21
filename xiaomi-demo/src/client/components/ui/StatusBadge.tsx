'use client';

interface StatusBadgeProps {
  status: string;
  type?: 'rule' | 'engine' | 'subscription' | 'invoice' | 'release' | 'filing' | 'audit';
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const getStatusColor = () => {
    const normalizedStatus = status.toLowerCase();

    // 规则状态专用颜色映射
    if (type === 'rule') {
      if (normalizedStatus.includes('active') || normalizedStatus.includes('enabled')) {
        return 'bg-green-100 text-green-800 border-green-200';
      }
      if (normalizedStatus.includes('draft')) {
        return 'bg-gray-100 text-gray-800 border-gray-200';
      }
      if (normalizedStatus.includes('testpassed') || normalizedStatus.includes('published')) {
        return 'bg-blue-100 text-blue-800 border-blue-200';
      }
      if (normalizedStatus.includes('disabled') || normalizedStatus.includes('deactivate')) {
        return 'bg-orange-100 text-orange-800 border-orange-200';
      }
      if (normalizedStatus.includes('testing') || normalizedStatus.includes('staged')) {
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      }
    }

    // 通用状态颜色
    if (normalizedStatus.includes('active') || normalizedStatus.includes('approved') || normalizedStatus.includes('delivered') ||
        normalizedStatus.includes('fullyinvoiced') || normalizedStatus.includes('fully invoiced') || normalizedStatus.includes('validated')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (normalizedStatus.includes('draft') || normalizedStatus.includes('pending') ||
        normalizedStatus.includes('submitted')) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    if (normalizedStatus.includes('review') || normalizedStatus.includes('validating') ||
        normalizedStatus.includes('enriching') || normalizedStatus.includes('processing')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (normalizedStatus.includes('failed') || normalizedStatus.includes('rejected') || normalizedStatus.includes('cancelled') ||
        normalizedStatus.includes('validfailed') || normalizedStatus.includes('valid failed') || normalizedStatus.includes('验证失败') || normalizedStatus.includes('失败')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (normalizedStatus.includes('staged') || normalizedStatus.includes('queued') ||
        normalizedStatus.includes('invoiceissuing') || normalizedStatus.includes('invoice issuing') ||
        normalizedStatus.includes('partinvoiced') || normalizedStatus.includes('part invoiced')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (normalizedStatus.includes('suspended') || normalizedStatus.includes('deprecated')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }

    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {status}
    </span>
  );
}