'use client';

import React from 'react';
import { DataTableColumn, DataTableProps } from './types';
import StatusBadge from '../StatusBadge';
import { InvoiceResultItem, formatDisplayAmount, formatDateOnly } from '@/client/services/invoiceRequestService';

// 状态显示映射函数
const getStatusDisplayFromNumber = (statusNum?: number, t?: any): string => {
    if (!t) return 'Unknown';

    const statusMap: Record<number, string> = {
        1: t('statusLabels.invoiceReady'),
        2: t('statusLabels.reporting'),
        3: t('statusLabels.reported'),
        4: t('statusLabels.reportFailed'),
        5: t('statusLabels.delivering'),
        6: t('statusLabels.delivered'),
        7: t('statusLabels.deliverFailed')
    };
    return statusMap[statusNum || 0] || t('statusLabels.unknown');
};

// Invoice Results表格列配置
export const createInvoiceResultTableColumns = (
    t: any,
    onViewInvoice?: (record: InvoiceResultItem) => void,
    onDownloadInvoice?: (record: InvoiceResultItem) => void
): DataTableColumn<InvoiceResultItem>[] => [
    {
        key: 'invoiceNo',
        title: t('tableHeaders.resultId'),
        dataIndex: 'invoiceNo',
        width: 150,
        render: (invoiceNo: string, record: InvoiceResultItem) => (
            <span className="font-mono text-sm text-blue-600">
                {invoiceNo || record.id || 'N/A'}
            </span>
        ),
        sortable: true,
        searchable: true,
        ellipsis: true
    },
    {
        key: 'companyInfo',
        title: t('tableHeaders.companyName'),
        dataIndex: 'sendCompanyName',
        width: 200,
        render: (sendCompanyName: string, record: InvoiceResultItem) => (
            <div>
                <p className="font-medium text-gray-900">
                    {sendCompanyName || record.company || '--'}
                </p>
                <p className="text-xs text-gray-500">
                    {record.country || '--'}
                </p>
            </div>
        ),
        searchable: true,
        ellipsis: true
    },
    {
        key: 'invoiceInfo',
        title: t('tableHeaders.invoiceInfo'),
        dataIndex: 'totalAmount',
        width: 150,
        render: (totalAmount: number, record: InvoiceResultItem) => (
            <p className="font-medium text-gray-900">
                {formatDisplayAmount(totalAmount, record.currency)}
            </p>
        ),
        sortable: true,
        align: 'right'
    },
    {
        key: 'taxInfo',
        title: t('tableHeaders.taxInfo'),
        dataIndex: 'taxAmount',
        width: 150,
        render: (taxAmount: number, record: InvoiceResultItem) => (
            <div className="text-right">
                <div className="flex items-center justify-end space-x-1 mb-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {record.invoiceType || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">
                        /{record.invoiceSubType || '--'}
                    </span>
                </div>
                <p className="text-xs text-gray-600 text-right">
                    {formatDisplayAmount(taxAmount, record.currency)}
                </p>
            </div>
        ),
        sortable: true,
        align: 'right'
    },
    {
        key: 'status',
        title: t('tableHeaders.status'),
        dataIndex: 'status',
        width: 120,
        align: 'center',
        render: (status: number) => (
            <StatusBadge status={getStatusDisplayFromNumber(status, t)} />
        ),
        filterable: true,
        filters: [
            { text: t('statusLabels.invoiceReady'), value: 1 },
            { text: t('statusLabels.reporting'), value: 2 },
            { text: t('statusLabels.reported'), value: 3 },
            { text: t('statusLabels.reportFailed'), value: 4 },
            { text: t('statusLabels.delivering'), value: 5 },
            { text: t('statusLabels.delivered'), value: 6 },
            { text: t('statusLabels.deliverFailed'), value: 7 }
        ]
    },
    {
        key: 'issueDate',
        title: t('tableHeaders.issueDate'),
        dataIndex: 'issueDate',
        width: 120,
        render: (issueDate: string) => (
            <span className="text-sm text-gray-600">
                {issueDate ? formatDateOnly(issueDate) : 'N/A'}
            </span>
        ),
        sortable: true
    },
    {
        key: 'actions',
        title: t('tableHeaders.actions'),
        width: 100,
        align: 'center',
        render: (_: any, record: InvoiceResultItem) => (
            <div className="flex items-center space-x-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewInvoice?.(record);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 cursor-pointer"
                    title={t('actions.viewInvoice')}
                >
                    <i className="ri-eye-line"></i>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownloadInvoice?.(record);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 cursor-pointer"
                    title={t('actions.downloadPdf')}
                >
                    <i className="ri-download-line"></i>
                </button>
            </div>
        )
    }
];

// Invoice Results表格默认配置
export const getInvoiceResultTableConfig = (
    t: any,
    commonT: any,
    statusOptions: Array<{ value: string; label: string }> = [],
    timeRangeOptions: Array<{ value: string; label: string }> = []
): Partial<DataTableProps<InvoiceResultItem>> => ({
    size: 'middle',
    bordered: false,
    striped: true,
    sticky: false,
    showHeader: true,
    toolbar: {
        showSearch: true,
        showFilter: true,
        showColumnToggle: true,
        showExport: true,
        showRefresh: true,
        searchPlaceholder: t('searchPlaceholder'),
        searchFields: ['invoiceNo', 'sendCompanyName', 'company', 'country'],
        filterFields: [
            {
                key: 'status',
                label: commonT('filters.statusFilter'),
                type: 'select',
                options: statusOptions,
                placeholder: t('statusFilter')
            },
            {
                key: 'dateRange',
                label: commonT('filters.timeRange'),
                type: 'select',
                options: timeRangeOptions,
                placeholder: t('timeRange')
            }
        ]
    },
    pagination: {
        enabled: true,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
        pageSizeOptions: ['10', '20', '50', '100']
    },
    rowSelection: {
        enabled: false
    },
    export: {
        enabled: true,
        formats: ['csv', 'excel'],
        filename: 'invoice_results'
    },
    loading: {
        loading: false,
        tip: t('messages.loading')
    }
});

// 预定义的Invoice Results表格组件
interface InvoiceResultTableProps {
    dataSource: InvoiceResultItem[];
    loading?: boolean;
    onRefresh?: () => void;
    onRowClick?: (record: InvoiceResultItem) => void;
    onViewInvoice?: (record: InvoiceResultItem) => void;
    onDownloadInvoice?: (record: InvoiceResultItem) => void;
    t: any; // 国际化函数
    className?: string;
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
    };
}

export const InvoiceResultTable: React.FC<InvoiceResultTableProps> = ({
    dataSource,
    loading = false,
    onRefresh,
    onRowClick,
    onViewInvoice,
    onDownloadInvoice,
    t,
    className,
    pagination
}) => {
    const columns = createInvoiceResultTableColumns(t, onViewInvoice, onDownloadInvoice);
    // Note: This example table config doesn't use actual commonT, but provides a placeholder
    const config = getInvoiceResultTableConfig(t, t);

    return (
        <div className={className}>
            {/* 这里会被实际的 DataTable 组件替换 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500 mb-4">
                    Invoice Results数据表格配置已创建，共 {dataSource.length} 条记录
                </p>
                <div className="text-xs text-gray-400">
                    列配置: {columns.map(col => col.title).join(', ')}
                </div>
                {pagination && (
                    <div className="text-xs text-gray-400 mt-2">
                        分页: 第{pagination.current}页，每页{pagination.pageSize}条，共{pagination.total}条
                    </div>
                )}
            </div>
        </div>
    );
};