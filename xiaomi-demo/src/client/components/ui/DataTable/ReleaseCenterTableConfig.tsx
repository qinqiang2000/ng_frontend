'use client';

import React from 'react';
import { DataTableColumn, DataTableProps } from './types';
import StatusBadge from '../StatusBadge';
import { getAssetPath } from '@/client/lib/paths';

// Release record interface
export interface ReleaseRecord {
    id: number;
    ruleCode: string;
    ruleName: string;
    ruleType: string;
    ruleVersion: string;
    status: number;
    publishTime: string;
    invoiceType: string;
    subInvoiceType: string;
    description: string;
    country: string;
    engineType: number;
}

// Status mapping function
const getStatusLabel = (status: number, t: any): string => {
    const statusMap: { [key: number]: string } = {
        1: t('statusLabels.draft'),
        2: t('statusLabels.testPassed'),
        3: t('statusLabels.published'),
        4: t('statusLabels.actived'),
        5: t('statusLabels.deactivate')
    };
    return statusMap[status] || t('statusLabels.unknown');
};

// Rule type mapping function
const getRuleTypeLabel = (ruleType: string, t: any): string => {
    const typeMap: { [key: string]: string } = {
        '1': t('ruleTypes.invoiceValidationEngine'),
        '2': t('ruleTypes.invoiceEnrichmentEngine')
    };
    return typeMap[ruleType] || ruleType;
};

// Format release date function
const formatReleaseDate = (dateString: string): string => {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
};

// Get record detail URL function
const getRecordDetailUrl = (record: ReleaseRecord): string => {
    const country = record.country || 'CN';

    if (record.engineType === 1) {
        return getAssetPath(`/invoice-rules/${record.id}?country=${country}`);
    } else if (record.engineType === 3) {
        return getAssetPath(`/audited-rules/${record.id}?country=${country}`);
    } else {
        return getAssetPath(`/invoice-rules/${record.id}?country=${country}`);
    }
};

// Release Center table columns configuration
export const createReleaseCenterTableColumns = (
    t: any,
    onPublishSingle?: (recordId: number) => void
): DataTableColumn<ReleaseRecord>[] => [
    {
        key: 'ruleCode',
        title: t('tableHeaders.ruleCode'),
        dataIndex: 'ruleCode',
        width: 180,
        render: (ruleCode: string, record: ReleaseRecord) => (
            <a
                href={getRecordDetailUrl(record)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
                {ruleCode}
            </a>
        ),
        sortable: true,
        searchable: true,
        ellipsis: true
    },
    {
        key: 'ruleName',
        title: t('tableHeaders.ruleName'),
        dataIndex: 'ruleName',
        width: 200,
        render: (ruleName: string) => (
            <span className="font-medium text-gray-900">{ruleName || '-'}</span>
        ),
        searchable: true,
        ellipsis: true
    },
    {
        key: 'ruleType',
        title: t('tableHeaders.ruleType'),
        dataIndex: 'ruleType',
        width: 180,
        render: (ruleType: string) => (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                {ruleType ? getRuleTypeLabel(ruleType, t) : '-'}
            </span>
        ),
        filterable: true,
        filters: [
            { text: t('ruleTypes.invoiceValidationEngine'), value: '1' },
            { text: t('ruleTypes.invoiceEnrichmentEngine'), value: '2' }
        ]
    },
    {
        key: 'ruleVersion',
        title: t('tableHeaders.version'),
        dataIndex: 'ruleVersion',
        width: 120,
        render: (ruleVersion: string) => (
            <span className="font-mono text-sm text-gray-900">{ruleVersion || '-'}</span>
        ),
        sortable: true
    },
    {
        key: 'invoiceTypes',
        title: `${t('tableHeaders.invoiceType')}/${t('tableHeaders.subInvoiceType')}`,
        dataIndex: 'invoiceType',
        width: 180,
        render: (invoiceType: string, record: ReleaseRecord) => (
            <div>
                {(!record.invoiceType || record.invoiceType.trim() === '') &&
                (!record.subInvoiceType || record.subInvoiceType.trim() === '') ? (
                    <p className="text-sm text-gray-900">{t('general')}</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-900">
                            {record.invoiceType && record.invoiceType.trim() !== '' ? record.invoiceType : t('general')}
                        </p>
                        <p className="text-xs text-gray-500">
                            {record.subInvoiceType && record.subInvoiceType.trim() !== '' ? record.subInvoiceType : t('general')}
                        </p>
                    </>
                )}
            </div>
        ),
        ellipsis: true
    },
    {
        key: 'status',
        title: t('tableHeaders.status'),
        dataIndex: 'status',
        width: 120,
        align: 'center',
        render: (status: number) => (
            <StatusBadge status={getStatusLabel(status, t)} type="release" />
        ),
        filterable: true,
        filters: [
            { text: t('statusLabels.draft'), value: 1 },
            { text: t('statusLabels.testPassed'), value: 2 },
            { text: t('statusLabels.published'), value: 3 },
            { text: t('statusLabels.actived'), value: 4 },
            { text: t('statusLabels.deactivate'), value: 5 }
        ]
    },
    {
        key: 'publishTime',
        title: t('tableHeaders.publishTime'),
        dataIndex: 'publishTime',
        width: 120,
        render: (publishTime: string) => (
            <span className="text-sm text-gray-600">{formatReleaseDate(publishTime)}</span>
        ),
        sortable: true
    },
    {
        key: 'actions',
        title: t('tableHeaders.actions'),
        width: 100,
        align: 'center',
        render: (_: any, record: ReleaseRecord) => (
            <div className="flex items-center justify-center">
                {record.status === 1 || record.status === 2 ? (
                    <button
                        onClick={() => onPublishSingle?.(record.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center space-x-1"
                    >
                        <i className="ri-rocket-line"></i>
                        <span>{t('actions.publish')}</span>
                    </button>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )}
            </div>
        )
    }
];

// Release Center table default configuration
export const getReleaseCenterTableConfig = (
    t: any,
    commonT: any,
    engineTypeOptions: Array<{ value: string; label: string }> = [],
    statusOptions: Array<{ value: string; label: string }> = [],
    selectedRowKeys: (string | number)[] = [],
    onBatchPublish?: () => void,
    isPublishing?: boolean
): Partial<DataTableProps<ReleaseRecord>> => ({
    size: 'middle',
    bordered: false,
    striped: true,
    sticky: false,
    showHeader: true,
    disableClientSideFiltering: true, // Server-side filtering
    toolbar: {
        showSearch: true,
        showFilter: true,
        showColumnToggle: true,
        showExport: true,
        showRefresh: true,
        searchPlaceholder: t('search.placeholder'),
        searchFields: ['ruleCode', 'ruleName'],
        filterFields: [
            {
                key: 'ruleType',
                label: commonT('filters.ruleType'),
                type: 'select',
                options: engineTypeOptions,
                placeholder: t('ruleTypes.all')
            },
            {
                key: 'status',
                label: commonT('filters.statusFilter'),
                type: 'select',
                options: statusOptions,
                placeholder: t('statusLabels.allStatus')
            }
        ],
        customActions: [
            <button
                key="batch-publish"
                onClick={onBatchPublish}
                disabled={selectedRowKeys.length === 0 || isPublishing}
                className={`px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 ${
                    selectedRowKeys.length > 0 && !isPublishing
                        ? 'bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
            >
                <i className="ri-rocket-line"></i>
                <span>{t('actions.publish')}</span>
            </button>
        ]
    },
    pagination: {
        enabled: true,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
        pageSizeOptions: ['10', '20', '50', '100', '200', '500']
    },
    rowSelection: {
        enabled: true,
        type: 'checkbox',
        preserveSelectedRowKeys: false,
        getCheckboxProps: (record: ReleaseRecord) => ({
            disabled: record.status !== 1 && record.status !== 2 // Only allow selection for draft and test passed
        })
    },
    export: {
        enabled: true,
        formats: ['csv', 'excel'],
        filename: 'release_center_data'
    },
    loading: {
        loading: false,
        tip: t('messages.loading')
    }
});