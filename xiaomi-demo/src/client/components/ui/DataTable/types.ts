'use client';

import { TableProps } from 'antd/es/table';
import { ReactNode } from 'react';

// 基础数据行接口
export interface BaseDataRow {
    id: string | number;
    [key: string]: any;
}

// 列配置接口
export interface DataTableColumn<T = any> {
    key: string;
    title: string;
    dataIndex?: string;
    width?: number | string;
    fixed?: 'left' | 'right';
    sortable?: boolean;
    filterable?: boolean;
    searchable?: boolean;
    render?: (value: any, record: T, index: number) => ReactNode;
    align?: 'left' | 'center' | 'right';
    ellipsis?: boolean;
    hidden?: boolean;
    filters?: Array<{ text: string; value: any }>;
    filterMultiple?: boolean;
    className?: string;
}

// 工具栏配置接口
export interface DataTableToolbarConfig {
    showSearch?: boolean;
    showFilter?: boolean;
    showColumnToggle?: boolean;
    showExport?: boolean;
    showRefresh?: boolean;
    customActions?: ReactNode[];
    searchPlaceholder?: string;
    searchFields?: string[];
    filterFields?: Array<{
        key: string;
        label: string;
        type: 'select' | 'input' | 'date' | 'dateRange';
        options?: Array<{ label: string; value: any }>;
        placeholder?: string;
    }>;
    initialFilters?: Record<string, any>;
}

// 分页配置接口
export interface DataTablePaginationConfig {
    enabled?: boolean;
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: boolean;
    pageSizeOptions?: string[];
    onChange?: (page: number, pageSize: number) => void;
}

// 行选择配置接口
export interface DataTableRowSelectionConfig<T = any> {
    enabled?: boolean;
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: (string | number)[];
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => any;
    preserveSelectedRowKeys?: boolean;
}

// 数据导出配置接口
export interface DataTableExportConfig {
    enabled?: boolean;
    filename?: string;
    formats?: ('csv' | 'excel' | 'json')[];
    includeColumns?: string[];
    excludeColumns?: string[];
    customExporter?: (data: any[], format: string) => void;
}

// 加载状态接口
export interface DataTableLoadingConfig {
    loading?: boolean;
    skeleton?: boolean;
    tip?: string;
}

// 主组件属性接口
export interface DataTableProps<T extends BaseDataRow = BaseDataRow> {
    // 数据相关
    dataSource: T[];
    columns: DataTableColumn<T>[];
    rowKey?: string | ((record: T) => string);

    // 过滤配置
    disableClientSideFiltering?: boolean;

    // 工具栏配置
    toolbar?: DataTableToolbarConfig;

    // 分页配置
    pagination?: DataTablePaginationConfig | boolean;

    // 行选择配置
    rowSelection?: DataTableRowSelectionConfig<T>;

    // 导出配置
    export?: DataTableExportConfig;

    // 加载状态
    loading?: DataTableLoadingConfig | boolean;

    // 表格配置
    size?: 'small' | 'middle' | 'large';
    bordered?: boolean;
    striped?: boolean;
    showHeader?: boolean;
    sticky?: boolean;
    scroll?: { x?: number | string; y?: number | string };

    // 样式配置
    className?: string;
    style?: React.CSSProperties;

    // 国际化
    locale?: {
        emptyText?: string;
        filterTitle?: string;
        filterConfirm?: string;
        filterReset?: string;
        selectAll?: string;
        selectInvert?: string;
        selectionAll?: string;
        sortTitle?: string;
        expand?: string;
        collapse?: string;
        triggerDesc?: string;
        triggerAsc?: string;
        cancelSort?: string;
    };
    // 自定义翻译函数
    t?: (key: string, params?: Record<string, any>) => string;

    // 事件回调
    onRowClick?: (record: T, index: number) => void;
    onRowDoubleClick?: (record: T, index: number) => void;
    onHeaderClick?: (column: DataTableColumn<T>) => void;
    onRefresh?: () => void;
    onFilter?: (filters: Record<string, any>) => void;
    onChange?: TableProps<T>['onChange'];

    // 其他
    expandable?: TableProps<T>['expandable'];
    summary?: TableProps<T>['summary'];
}

// 导出文件格式类型
export type ExportFormat = 'csv' | 'excel' | 'json';

// 筛选操作符类型
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'notIn';

// 筛选条件接口
export interface FilterCondition {
    field: string;
    operator: FilterOperator;
    value: any;
    label?: string;
}

// 排序配置接口
export interface SortConfig {
    field: string;
    order: 'asc' | 'desc';
}