'use client';

import React from 'react';
import Link from 'next/link';
import { DataTableColumn, DataTableProps } from './types';
import StatusBadge from '../StatusBadge';
import { Bill } from '@/client/services/invoiceRequestService';

// Status mapping for display
const getStatusMapping = (t: any): Record<number, string> => ({
    1: t ? t('statusOptions.pending') : 'Pending',
    2: t ? t('statusOptions.inProgress') : 'In Progress',
    3: t ? t('statusOptions.approved') : 'Approved',
    4: t ? t('statusOptions.rejected') : 'Rejected'
});

// Create Audited Request table columns
export const createAuditedRequestTableColumns = (
    t: any,
    onRuleGroupsClick?: (bill: Bill) => void,
    onSingleSubmit?: (id: number) => void,
    isSubmitting?: boolean
): DataTableColumn<Bill>[] => {
    const statusMapping = getStatusMapping(t);

    return [
        {
            key: 'requestId',
            title: t('table.headers.requestId'),
            dataIndex: 'requestId',
            width: 180,
            render: (requestId: string, record: Bill) => (
                <Link
                    href={`/audited-requests/${record.id}`}
                    className="font-mono text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                    {requestId}
                </Link>
            ),
            sortable: true,
            searchable: true,
            ellipsis: true
        },
        {
            key: 'companyName',
            title: t('table.headers.companyName'),
            dataIndex: 'companyName',
            width: 200,
            render: (companyName: string) => (
                <span className="font-medium text-gray-900">{companyName}</span>
            ),
            searchable: true,
            ellipsis: true
        },
        {
            key: 'country',
            title: t('table.headers.country'),
            dataIndex: 'country',
            width: 120,
            render: (country: string) => (
                <span className="text-sm text-gray-700">{country}</span>
            ),
            searchable: true
        },
        {
            key: 'billNo',
            title: t('table.headers.billNo'),
            dataIndex: 'billNo',
            width: 150,
            render: (billNo: string) => (
                <span className="font-mono text-sm text-gray-900">{billNo}</span>
            ),
            searchable: true,
            ellipsis: true
        },
        {
            key: 'billName',
            title: t('table.headers.billName'),
            dataIndex: 'billName',
            width: 200,
            render: (billName: string) => (
                <span className="text-sm text-gray-700" title={billName}>{billName}</span>
            ),
            searchable: true,
            ellipsis: true
        },
        {
            key: 'ruleGroups',
            title: t('table.headers.ruleGroups'),
            dataIndex: 'fauditRuleGroupCodes',
            width: 150,
            render: (fauditRuleGroupCodes: string, record: Bill) => (
                fauditRuleGroupCodes ? (
                    <button
                        onClick={() => onRuleGroupsClick?.(record)}
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded cursor-pointer transition-colors"
                        title={t('tooltips.ruleGroupDetails', { codes: fauditRuleGroupCodes })}
                    >
                        {fauditRuleGroupCodes}
                    </button>
                ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        --
                    </span>
                )
            ),
            ellipsis: true
        },
        {
            key: 'status',
            title: t('table.headers.status'),
            dataIndex: 'status',
            width: 120,
            align: 'center',
            render: (status: number) => (
                <StatusBadge status={statusMapping[status] || 'Unknown'} type="audit" />
            ),
            filterable: true,
            filters: [
                { text: statusMapping[1], value: 1 },
                { text: statusMapping[2], value: 2 },
                { text: statusMapping[3], value: 3 },
                { text: statusMapping[4], value: 4 }
            ]
        },
        {
            key: 'auditTime',
            title: t('table.headers.auditTime'),
            dataIndex: 'auditTime',
            width: 150,
            render: (auditTime: string) => (
                <span className="text-sm text-gray-600">{auditTime || '--'}</span>
            ),
            sortable: true
        },
        {
            key: 'actions',
            title: t('table.headers.actions'),
            width: 100,
            align: 'center',
            render: (_: any, record: Bill) => (
                <div className="flex items-center justify-center space-x-2">
                    {record.status !== 3 && (
                        <button
                            onClick={() => onSingleSubmit?.(record.id)}
                            disabled={isSubmitting}
                            className={`w-8 h-8 flex items-center justify-center transition-colors ${
                                isSubmitting
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-blue-600 cursor-pointer'
                            }`}
                            title={t('tooltips.submitForAudit')}
                        >
                            <i className="ri-file-paper-line"></i>
                        </button>
                    )}
                </div>
            )
        }
    ];
};

// Create Audited Request table default configuration
export const getAuditedRequestTableConfig = (
    t: any,
    commonT: any,
    statusOptions: Array<{ value: string; label: string }> = [],
    timeOptions: Array<{ value: string; label: string }> = [],
    selectedRowKeys: (string | number)[] = [],
    onBatchSubmit?: () => void,
    isSubmitting?: boolean
): Partial<DataTableProps<Bill>> => ({
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
        searchPlaceholder: t('filters.searchPlaceholder'),
        searchFields: ['requestId', 'companyName', 'billNo', 'billName'],
        filterFields: [
            {
                key: 'status',
                label: commonT('filters.statusFilter'),
                type: 'select',
                options: statusOptions,
                placeholder: t('statusOptions.allStatus')
            },
            {
                key: 'dateRange',
                label: commonT('filters.timeRange'),
                type: 'select',
                options: timeOptions,
                placeholder: t('timeOptions.quarter')
            }
        ],
        customActions: [
            <button
                key="batch-submit"
                onClick={onBatchSubmit}
                disabled={selectedRowKeys.length === 0 || isSubmitting}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRowKeys.length > 0 && !isSubmitting
                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                <i className={`${isSubmitting ? 'ri-loader-4-line animate-spin' : 'ri-file-paper-line'} mr-2`}></i>
                {isSubmitting ? t('buttons.submitting') : `${t('buttons.submitForAudit')} (${selectedRowKeys.length})`}
            </button>
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
        enabled: true,
        type: 'checkbox',
        preserveSelectedRowKeys: false,
        getCheckboxProps: (record: Bill) => ({
            disabled: record.status === 3 // Disable selection for approved items
        })
    },
    export: {
        enabled: true,
        formats: ['csv', 'excel'],
        filename: 'audited_requests'
    },
    loading: {
        loading: false,
        tip: t('messages.loading')
    }
});