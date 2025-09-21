'use client';

import React from 'react';
import { DataTableColumn, DataTableProps } from './types';
import StatusBadge from '../StatusBadge';
import { StandardRow } from '@/client/services/codeListService';

// 范围显示函数
const scopeDisplay = (code: string | undefined, hasCountry: boolean, t: any) => {
    if (!code) return hasCountry ? t('scope.default') : code || 'ALL';
    if (code === '' || code === 'DEFAULT') return t('scope.default');
    if (code === 'GLOBAL') return code;
    return code;
};

// 标准表格列配置
export const createStandardTableColumns = (
    hasCountry: boolean = false,
    t: any,
    onDelete?: (record: StandardRow) => void
): DataTableColumn<StandardRow>[] => [
    {
        key: 'scope',
        title: t('columns.scope'),
        dataIndex: 'scope',
        width: 120,
        align: 'center',
        render: (scope: string) => (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {scopeDisplay(scope, hasCountry, t)}
            </span>
        ),
        filterable: true
    },
    {
        key: 'code',
        title: t('columns.code'),
        dataIndex: 'code',
        width: 150,
        render: (code: string) => (
            <span className="font-mono font-medium text-gray-900">
                {code}
            </span>
        ),
        sortable: true,
        searchable: true,
        ellipsis: true
    },
    {
        key: 'name',
        title: t('columns.name'),
        dataIndex: 'name',
        render: (name: string) => (
            <span className="text-gray-900">{name}</span>
        ),
        sortable: true,
        searchable: true,
        ellipsis: true
    },
    {
        key: 'description',
        title: t('columns.description'),
        dataIndex: 'description',
        render: (description: string) => (
            <span className="text-gray-600">{description || '—'}</span>
        ),
        searchable: true,
        ellipsis: true
    },
    {
        key: 'status',
        title: t('columns.status'),
        dataIndex: 'status',
        width: 100,
        align: 'center',
        render: (status: string) => <StatusBadge status={status} />,
        filterable: true,
        filters: [
            { text: t('status.enabled'), value: 'ENABLED' },
            { text: t('status.disabled'), value: 'DISABLED' }
        ]
    },
    ...(onDelete ? [{
        key: 'actions',
        title: t('columns.actions'),
        width: 100,
        align: 'center' as const,
        render: (_: any, record: StandardRow) => (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(t('messages.confirmDelete'))) {
                        onDelete(record);
                    }
                }}
                className="text-red-600 hover:text-red-800 transition-colors p-1"
                title={t('actions.delete')}
            >
                <i className="ri-delete-bin-line text-lg"></i>
            </button>
        )
    }] : [])
];

// 标准表格默认配置
export const getStandardTableConfig = (
    t: any,
    countryOptions: Array<{ code: string; name: string }> = []
): Partial<DataTableProps<StandardRow>> => ({
    size: 'middle',
    bordered: false,
    striped: true,
    sticky: false,
    toolbar: {
        showSearch: true,
        showFilter: true,
        showColumnToggle: true,
        showExport: true,
        showRefresh: true,
        searchPlaceholder: t('toolbar.searchPlaceholder'),
        searchFields: ['code', 'name', 'description'],
        filterFields: [
            {
                key: 'scope',
                label: t('columns.scope'),
                type: 'select',
                options: [
                    { label: t('toolbar.allCountries'), value: '' },
                    ...countryOptions.map(country => ({
                        label: country.code,
                        value: country.code
                    }))
                ],
                placeholder: t('toolbar.selectScope')
            },
            {
                key: 'status',
                label: t('columns.status'),
                type: 'select',
                options: [
                    { label: t('status.all'), value: '' },
                    { label: t('status.enabled'), value: 'ENABLED' },
                    { label: t('status.disabled'), value: 'DISABLED' }
                ],
                placeholder: t('toolbar.selectStatus')
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
        filename: 'standard_codes'
    }
});

// 预定义的标准表格组件
interface StandardTableProps {
    dataSource: StandardRow[];
    loading?: boolean;
    hasCountry?: boolean;
    countryOptions?: Array<{ code: string; name: string }>;
    onRefresh?: () => void;
    onRowClick?: (record: StandardRow) => void;
    t: any; // 国际化函数
    className?: string;
}

export const StandardTable: React.FC<StandardTableProps> = ({
    dataSource,
    loading = false,
    hasCountry = false,
    countryOptions = [],
    onRefresh,
    onRowClick,
    t,
    className
}) => {
    const columns = createStandardTableColumns(hasCountry, t);
    const config = getStandardTableConfig(t, countryOptions);

    return (
        <div className={className}>
            {/* 这里会被实际的 DataTable 组件替换 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500 mb-4">
                    标准数据表格配置已创建，共 {dataSource.length} 条记录
                </p>
                <div className="text-xs text-gray-400">
                    列配置: {columns.map(col => col.title).join(', ')}
                </div>
            </div>
        </div>
    );
};