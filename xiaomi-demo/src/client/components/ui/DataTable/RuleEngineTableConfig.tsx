'use client';

import React from 'react';
import StatusBadge from '@/client/components/ui/StatusBadge';
import { DataTableColumn } from './types';
import { getAssetPath } from '@/client/lib/paths';

// 规则引擎数据类型定义
export interface RuleEngineRow {
    id: string | number;
    name: string;
    description: string;
    region: string;
    category: string;
    priority: number;
    status: string | number;
    version: string;
    updateTime: string;
    usage: number;
    actions: string[];
    ruleCode?: string;
    ruleType?: number;
    companyId?: string;
    country?: string;
    tradeArea?: string;
    province?: string;
    city?: string;
    tags?: string;
    invoiceType?: string;
    active?: boolean;
    applyTo?: string;
    errorMessage?: string;
    fieldPath?: string;
    ruleExpression?: string;
    startTime?: string;
    endTime?: string;
    createTime?: string;
    ruleName?: string;
    engineType?: number;
}

// Get record detail URL function based on engineType
const getRecordDetailUrl = (record: RuleEngineRow): string => {
    const country = record.country || 'CN';
    const id = String(record.id);

    if (record.engineType === 1) {
        return getAssetPath(`/invoice-rules/${id}?country=${country}`);
    } else if (record.engineType === 3) {
        return getAssetPath(`/audited-rules/${id}?country=${country}`);
    } else {
        // 默认跳转到invoice-rules
        return getAssetPath(`/invoice-rules/${id}?country=${country}`);
    }
};

// 创建规则引擎表格列配置
export const createRuleEngineTableColumns = (
    t: (key: string) => string,
    commonT: (key: string) => string,
    onView?: (record: RuleEngineRow) => void,
    onEdit?: (record: RuleEngineRow) => void,
    onCopy?: (record: RuleEngineRow) => void
): DataTableColumn<RuleEngineRow>[] => [
    {
        key: 'ruleCode',
        title: t('tableHeaders.ruleCode'),
        dataIndex: 'ruleCode',
        width: 150,
        ellipsis: true,
        render: (value: string, record: RuleEngineRow) => {
            const ruleCode = value || String(record.id);

            // 如果有engineType，创建链接；否则显示普通文本
            if (record.engineType) {
                return (
                    <a
                        href={getRecordDetailUrl(record)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                        {ruleCode}
                    </a>
                );
            } else {
                return (
                    <span className="font-mono text-sm text-blue-600">
                        {ruleCode}
                    </span>
                );
            }
        }
    },
    {
        key: 'name',
        title: t('tableHeaders.ruleName'),
        dataIndex: 'name',
        width: 250,
        ellipsis: true,
        render: (value: string, record: RuleEngineRow) => (
            <div>
                <p className="font-medium text-gray-900 mb-1">{value}</p>
                <p className="text-sm text-gray-500 truncate">{record.description}</p>
            </div>
        )
    },
    {
        key: 'region',
        title: t('tableHeaders.regionJurisdiction'),
        dataIndex: 'region',
        width: 180,
        render: (value: string) => (
            <span className="text-sm text-gray-700">{value}</span>
        )
    },
    {
        key: 'category',
        title: t('tableHeaders.ruleType'),
        dataIndex: 'category',
        width: 180,
        render: (value: string) => {
            const categoryColorMap: Record<string, string> = {
                // 验证类规则 - 蓝色系（参考 release-center 的风格）
                'Format Validation': 'bg-blue-100 text-blue-800',
                'Validation Rules': 'bg-blue-100 text-blue-800',
                'Sales Tax Validation': 'bg-blue-100 text-blue-800',

                // 补全类规则 - 绿色系
                'Information Completion': 'bg-green-100 text-green-800',
                'Digital Services Tax Completion': 'bg-green-100 text-green-800',

                // 税务处理 - 紫色系（统一使用紫色，参考 release-center）
                'Tax Validation': 'bg-purple-100 text-purple-800',
                'VAT Processing': 'bg-purple-100 text-purple-800',
                'Export Trade': 'bg-purple-100 text-purple-800',

                // 业务特定 - 橙色系
                'Manufacturing': 'bg-orange-100 text-orange-800',

                // 通用规则 - 灰色系
                'General Rules': 'bg-gray-100 text-gray-800'
            };

            const colorClass = categoryColorMap[value] || 'bg-gray-100 text-gray-800';

            return (
                <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                    {value}
                </span>
            );
        }
    },
    {
        key: 'priority',
        title: t('tableHeaders.priority'),
        dataIndex: 'priority',
        width: 100,
        align: 'center',
        render: (value: number) => (
            <span className="font-medium text-gray-900">{value}</span>
        )
    },
    {
        key: 'status',
        title: commonT('filters.statusFilter'),
        dataIndex: 'status',
        width: 120,
        render: (value: string | number | any) => {
            // 确保状态值始终是有效字符串
            let statusText: string;

            if (typeof value === 'string' && value.length > 0) {
                statusText = value;
            } else if (typeof value === 'number') {
                // 根据数值状态码映射到标准状态文本
                const statusMap: { [key: number]: string } = {
                    1: 'Draft',
                    2: 'TestPassed',
                    3: 'Published',
                    4: 'Active',
                    5: 'Disabled'
                };
                statusText = statusMap[value] || `Status${value}`;
            } else if (value && typeof value === 'object') {
                console.warn('Status value is an object:', value);
                statusText = value.toString?.() || 'Unknown';
            } else {
                console.warn('Invalid status value:', value);
                statusText = 'Unknown';
            }

            return <StatusBadge status={statusText} type="rule" />;
        }
    },
    {
        key: 'version',
        title: t('tableHeaders.version'),
        dataIndex: 'version',
        width: 100,
        render: (value: string, record: RuleEngineRow) => (
            <div>
                <span className="font-medium text-gray-900">{value}</span>
                <p className="text-xs text-gray-500">{record.updateTime}</p>
            </div>
        )
    },
    {
        key: 'actions',
        title: commonT('table.actions'),
        width: 120,
        align: 'center',
        render: (value: any, record: RuleEngineRow) => (
            <div className="flex items-center justify-center space-x-2">
                <button
                    onClick={() => onView?.(record)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                    title={commonT('buttons.view')}
                >
                    <i className="ri-eye-line"></i>
                </button>
                <button
                    onClick={() => onEdit?.(record)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 cursor-pointer transition-colors"
                    title={commonT('buttons.edit')}
                >
                    <i className="ri-edit-line"></i>
                </button>
                <button
                    onClick={() => onCopy?.(record)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 cursor-pointer transition-colors"
                    title={commonT('buttons.copy')}
                >
                    <i className="ri-file-copy-line"></i>
                </button>
            </div>
        )
    }
];

// 获取规则引擎表格配置
export const getRuleEngineTableConfig = () => ({
    size: 'middle' as const,
    bordered: false,
    striped: true,
    showHeader: true
});