'use client';

import React from 'react';
import { DataTableColumn, DataTableProps } from './types';
import StatusBadge from '../StatusBadge';
import { MappingRow } from '@/client/services/codeListService';

// 范围显示函数
const scopeDisplay = (code: string | undefined, hasCountry: boolean, t: any) => {
    if (!code) return hasCountry ? t('scope.default') : code || 'ALL';
    if (code === '' || code === 'DEFAULT') return t('scope.default');
    if (code === 'GLOBAL') return code;
    return code;
};

// 置信度渲染组件
const ConfidenceRenderer: React.FC<{ confidence: number }> = ({ confidence }) => {
    const percentage = Math.round((confidence || 0) * 100);
    const color = confidence < 0.7 ? 'bg-red-500' : 'bg-green-500';

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden" style={{ width: '80px' }}>
                <div
                    className={`h-full transition-all duration-300 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs text-gray-500 w-10">
                {percentage}%
            </span>
        </div>
    );
};

// 来源渲染组件
const SourceRenderer: React.FC<{ source: string }> = ({ source }) => {
    const getSourceStyle = (source: string) => {
        switch (source) {
            case 'MANUAL':
                return 'bg-green-100 text-green-800';
            case 'AI':
                return 'bg-blue-100 text-blue-800';
            case 'IMPORT':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`px-2 py-1 text-xs rounded-full ${getSourceStyle(source)}`}>
            {source}
        </span>
    );
};

// 映射表格列配置
export const createMappingTableColumns = (
    hasCountry: boolean = false,
    t: any,
    onDelete?: (record: MappingRow) => void
): DataTableColumn<MappingRow>[] => [
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
        filterable: true,
        filters: [
            { text: 'Global', value: 'GLOBAL' },
            { text: 'Default', value: 'DEFAULT' },
            { text: 'ALL', value: '' }
        ]
    },
    {
        key: 'givenCode',
        title: t('columns.givenCode'),
        dataIndex: 'givenCode',
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
        key: 'givenName',
        title: t('columns.givenName'),
        dataIndex: 'givenName',
        render: (name: string) => (
            <span className="text-gray-900">{name || '—'}</span>
        ),
        sortable: true,
        searchable: true,
        ellipsis: true
    },
    {
        key: 'standardCode',
        title: t('columns.standardCode'),
        dataIndex: 'standardCode',
        width: 150,
        render: (code: string) => (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {code}
            </span>
        ),
        sortable: true,
        searchable: true
    },
    {
        key: 'confidence',
        title: t('columns.confidence'),
        dataIndex: 'confidence',
        width: 140,
        align: 'center',
        render: (confidence: number) => <ConfidenceRenderer confidence={confidence} />,
        sortable: true,
        filters: [
            { text: '高置信度 (≥70%)', value: 'high' },
            { text: '低置信度 (<70%)', value: 'low' }
        ]
    },
    {
        key: 'source',
        title: t('columns.source'),
        dataIndex: 'source',
        width: 100,
        align: 'center',
        render: (source: string) => <SourceRenderer source={source} />,
        filterable: true,
        filters: [
            { text: '手动', value: 'MANUAL' },
            { text: 'AI 生成', value: 'AI' },
            { text: '导入', value: 'IMPORT' }
        ]
    },
    ...(onDelete ? [{
        key: 'actions',
        title: t('columns.actions'),
        width: 100,
        align: 'center' as const,
        render: (_: any, record: MappingRow) => (
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

// 映射表格默认配置
export const getMappingTableConfig = (
    t: any,
    countryOptions: Array<{ code: string; name: string }> = []
): Partial<DataTableProps<MappingRow>> => ({
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
        searchFields: ['givenCode', 'givenName', 'standardCode'],
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
                key: 'source',
                label: t('columns.source'),
                type: 'select',
                options: [
                    { label: '全部来源', value: '' },
                    { label: '手动添加', value: 'MANUAL' },
                    { label: 'AI 生成', value: 'AI' },
                    { label: '批量导入', value: 'IMPORT' }
                ],
                placeholder: '选择来源'
            },
            {
                key: 'confidence',
                label: t('columns.confidence'),
                type: 'select',
                options: [
                    { label: '全部置信度', value: '' },
                    { label: '高置信度 (≥70%)', value: 'high' },
                    { label: '低置信度 (<70%)', value: 'low' }
                ],
                placeholder: '选择置信度'
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
        filename: 'mapping_codes'
    }
});

// 预定义的映射表格组件
interface MappingTableProps {
    dataSource: MappingRow[];
    loading?: boolean;
    hasCountry?: boolean;
    countryOptions?: Array<{ code: string; name: string }>;
    onRefresh?: () => void;
    onRowClick?: (record: MappingRow) => void;
    t: any; // 国际化函数
    className?: string;
}

export const MappingTable: React.FC<MappingTableProps> = ({
    dataSource,
    loading = false,
    hasCountry = false,
    countryOptions = [],
    onRefresh,
    onRowClick,
    t,
    className
}) => {
    const columns = createMappingTableColumns(hasCountry, t);
    const config = getMappingTableConfig(t, countryOptions);

    return (
        <div className={className}>
            {/* 这里会被实际的 DataTable 组件替换 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500 mb-4">
                    映射数据表格配置已创建，共 {dataSource.length} 条记录
                </p>
                <div className="text-xs text-gray-400">
                    列配置: {columns.map(col => col.title).join(', ')}
                </div>

                {/* 统计信息 */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                    <div className="p-2 bg-green-50 rounded">
                        <div className="text-green-600 font-medium">手动添加</div>
                        <div className="text-green-800">
                            {dataSource.filter(item => item.source === 'MANUAL').length} 条
                        </div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                        <div className="text-blue-600 font-medium">AI 生成</div>
                        <div className="text-blue-800">
                            {dataSource.filter(item => item.source === 'AI').length} 条
                        </div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                        <div className="text-purple-600 font-medium">批量导入</div>
                        <div className="text-purple-800">
                            {dataSource.filter(item => item.source === 'IMPORT').length} 条
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};