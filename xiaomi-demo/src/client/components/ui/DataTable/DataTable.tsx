'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Table, ConfigProvider, Empty, Spin } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { DataTableProps, BaseDataRow, DataTableColumn, FilterCondition, FilterOperator, SortConfig, DataTablePaginationConfig } from './types';
import DataTableToolbar from './DataTableToolbar';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useCodeListsTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';
import { useLanguage } from '@/client/contexts/LanguageContext';

// 默认的空状态组件 - 将在组件内部使用翻译
const DefaultEmpty = ({ t }: { t: (key: string) => string }) => (
    <Empty
        description={t('table.noData')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
);

// 主 DataTable 组件
const DataTable = <T extends BaseDataRow>({
    dataSource,
    columns,
    rowKey = 'id',
    disableClientSideFiltering = false,
    toolbar,
    pagination = {
        enabled: true,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
        pageSizeOptions: ['10', '20', '50', '100']
    },
    rowSelection,
    export: exportConfig,
    loading = false,
    size = 'middle',
    bordered = false,
    striped = true,
    showHeader = true,
    sticky = false,
    scroll,
    className = '',
    style,
    locale,
    onRowClick,
    onRowDoubleClick,
    onHeaderClick,
    onRefresh,
    onFilter,
    onChange,
    expandable,
    summary,
    t: customT,
    ...restProps
}: DataTableProps<T>) => {
    const { t: defaultT } = useCodeListsTranslation();
    const { t: commonT } = useCommonTranslation();
    const { currentLanguage } = useLanguage();
    const t = customT || defaultT;
    // 状态管理
    const [searchValue, setSearchValue] = useState('');
    const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
        rowSelection?.selectedRowKeys || []
    );

    // 更新选中行状态
    useEffect(() => {
        if (rowSelection?.selectedRowKeys) {
            setSelectedRowKeys(rowSelection.selectedRowKeys);
        }
    }, [rowSelection?.selectedRowKeys]);

    // 处理搜索
    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        // 当禁用客户端过滤时，通过onFilter回调将搜索传递给父组件
        if (disableClientSideFiltering && onFilter) {
            onFilter({ search: value });
        }
    }, [disableClientSideFiltering, onFilter]);

    // 处理筛选
    const handleFilter = useCallback((filters: Record<string, any>) => {
        const conditions: FilterCondition[] = Object.entries(filters)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([field, value]) => {
                // 确定操作符类型
                // 对于来自工具栏filterFields的下拉选择器，使用精确匹配
                const filterField = toolbar?.filterFields?.find(f => f.key === field);
                const operator: FilterOperator = filterField?.type === 'select' ? 'eq' : 'like';

                return {
                    field,
                    operator,
                    value
                };
            });

        setFilterConditions(conditions);

        // 调用外部的过滤回调
        onFilter?.(filters);
    }, [onFilter, toolbar?.filterFields]);

    // 处理列显示/隐藏
    const handleColumnToggle = useCallback((columnKey: string, visible: boolean) => {
        setHiddenColumns(prev => {
            const newSet = new Set(prev);
            if (visible) {
                newSet.delete(columnKey);
            } else {
                newSet.add(columnKey);
            }
            return newSet;
        });
    }, []);

    // 过滤和搜索数据
    const filteredData = useMemo(() => {
        // 如果禁用客户端过滤，直接返回原始数据
        if (disableClientSideFiltering) {
            return dataSource;
        }

        let result = [...dataSource];

        // 应用搜索
        if (searchValue) {
            const searchFields = toolbar?.searchFields || columns.map(col => col.dataIndex || col.key);
            result = result.filter(record =>
                searchFields.some(field => {
                    const value = record[field];
                    return value &&
                        String(value).toLowerCase().includes(searchValue.toLowerCase());
                })
            );
        }

        // 应用筛选条件
        filterConditions.forEach(condition => {
            const beforeCount = result.length;
            result = result.filter(record => {
                const value = record[condition.field];
                let matches = false;

                switch (condition.operator) {
                    case 'eq':
                        matches = value === condition.value;
                        break;
                    case 'ne':
                        matches = value !== condition.value;
                        break;
                    case 'like':
                        matches = value &&
                            String(value).toLowerCase().includes(String(condition.value).toLowerCase());
                        break;
                    case 'gt':
                        matches = Number(value) > Number(condition.value);
                        break;
                    case 'gte':
                        matches = Number(value) >= Number(condition.value);
                        break;
                    case 'lt':
                        matches = Number(value) < Number(condition.value);
                        break;
                    case 'lte':
                        matches = Number(value) <= Number(condition.value);
                        break;
                    case 'in':
                        matches = Array.isArray(condition.value) && condition.value.includes(value);
                        break;
                    case 'notIn':
                        matches = Array.isArray(condition.value) && !condition.value.includes(value);
                        break;
                    default:
                        matches = true;
                }

                return matches;
            });

        });

        // 应用排序
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.field];
                const bValue = b[sortConfig.field];

                if (aValue < bValue) {
                    return sortConfig.order === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.order === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [dataSource, searchValue, filterConditions, sortConfig, columns, toolbar?.searchFields, disableClientSideFiltering]);

    // 动态生成筛选选项
    const generateFilters = useCallback((columnKey: string, data: T[]) => {
        const uniqueValues = new Set<string>();
        data.forEach(record => {
            const value = record[columnKey];
            if (value !== null && value !== undefined && value !== '') {
                uniqueValues.add(String(value));
            }
        });

        return Array.from(uniqueValues).sort().map(value => ({
            text: value,
            value: value
        }));
    }, []);

    // 转换列配置为 Ant Design 格式
    const antdColumns: ColumnType<T>[] = useMemo(() => {
        return columns
            .filter(col => !hiddenColumns.has(col.key))
            .map((col): ColumnType<T> => {
                const antColumn: ColumnType<T> = {
                    key: col.key,
                    title: col.title,
                    dataIndex: col.dataIndex || col.key,
                    width: col.width,
                    fixed: col.fixed,
                    align: col.align,
                    ellipsis: col.ellipsis,
                    className: col.className,
                    sorter: col.sortable ? (a, b) => {
                        const aValue = a[col.dataIndex || col.key];
                        const bValue = b[col.dataIndex || col.key];
                        if (aValue < bValue) return -1;
                        if (aValue > bValue) return 1;
                        return 0;
                    } : false,
                    onHeaderCell: () => ({
                        onClick: () => onHeaderClick?.(col)
                    }),
                    render: col.render ? (value, record, index) => {
                        return col.render!(value, record, index);
                    } : undefined
                };

                // 添加筛选功能
                if (col.filterable) {
                    // 如果有预定义的筛选选项就使用，否则从数据中动态生成
                    const filters = col.filters || generateFilters(col.dataIndex || col.key, dataSource);
                    antColumn.filters = filters;
                    antColumn.filterMultiple = col.filterMultiple !== false;
                    antColumn.onFilter = (value: any, record: T) => {
                        const fieldValue = record[col.dataIndex || col.key];
                        return fieldValue === value;
                    };
                }

                return antColumn;
            });
    }, [columns, hiddenColumns, onHeaderClick, dataSource, generateFilters]);

    // 行选择配置
    const rowSelectionConfig = useMemo(() => {
        if (!rowSelection?.enabled) return undefined;

        return {
            type: rowSelection.type || 'checkbox',
            selectedRowKeys,
            preserveSelectedRowKeys: rowSelection.preserveSelectedRowKeys,
            onChange: (keys: React.Key[], rows: T[]) => {
                const stringKeys = keys.map(key => String(key));
                setSelectedRowKeys(stringKeys);
                rowSelection.onChange?.(stringKeys, rows);
            },
            getCheckboxProps: rowSelection.getCheckboxProps,
        };
    }, [rowSelection, selectedRowKeys]);

    // 分页配置
    const paginationConfig = useMemo(() => {
        if (pagination === false) return false;

        // 处理分页配置
        let config: DataTablePaginationConfig;
        if (pagination === true) {
            config = { enabled: true };
        } else {
            config = pagination;
        }

        return {
            current: config.current || 1,
            pageSize: config.pageSize || 10,
            total: disableClientSideFiltering ? (config.total || filteredData.length) : filteredData.length,
            showSizeChanger: config.showSizeChanger ?? true,
            showQuickJumper: config.showQuickJumper ?? true,
            showTotal: config.showTotal ? (total: number, range: [number, number]) =>
                commonT('pagination.showing', { start: range[0], end: range[1], total, type: commonT('pagination.entries') }) : undefined,
            pageSizeOptions: config.pageSizeOptions || ['10', '20', '50', '100'],
            onChange: config.onChange,
        };
    }, [pagination, filteredData.length, commonT, disableClientSideFiltering]);

    // 获取Antd locale
    const getAntdLocale = useMemo(() => {
        const langCode = currentLanguage.split('-')[0];
        switch (langCode) {
            case 'zh':
                return zhCN;
            case 'en':
            default:
                return enUS;
        }
    }, [currentLanguage]);

    // 加载状态处理
    const isLoading = typeof loading === 'boolean' ? loading : loading.loading;
    const loadingTip = typeof loading === 'object' ? loading.tip : undefined;

    // 表格事件处理
    const handleTableChange: TableProps<T>['onChange'] = (pagination, filters, sorter, extra) => {
        // 处理排序
        if (sorter && !Array.isArray(sorter)) {
            if (sorter.order) {
                setSortConfig({
                    field: sorter.field as string,
                    order: sorter.order === 'ascend' ? 'asc' : 'desc'
                });
            } else {
                setSortConfig(null);
            }
        }

        // 调用外部的 onChange
        onChange?.(pagination, filters, sorter, extra);
    };

    // 行点击事件处理
    const onRow: TableProps<T>['onRow'] = (record, index) => ({
        onClick: () => onRowClick?.(record, index || 0),
        onDoubleClick: () => onRowDoubleClick?.(record, index || 0),
        className: striped && index! % 2 === 1 ? 'bg-gray-25' : '',
    });

    return (
        <ConfigProvider
            locale={getAntdLocale}
            theme={{
                components: {
                    Table: {
                        colorBgContainer: '#ffffff',
                        borderColor: '#e5e7eb',
                        colorTextHeading: '#374151',
                        colorText: '#6b7280',
                    }
                }
            }}
        >
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`} style={style}>
                {/* 工具栏 */}
                {toolbar && (
                    <DataTableToolbar
                        config={toolbar}
                        columns={columns}
                        dataSource={filteredData}
                        onSearch={handleSearch}
                        onFilter={handleFilter}
                        onColumnToggle={handleColumnToggle}
                        onRefresh={onRefresh}
                        hiddenColumns={hiddenColumns}
                        loading={isLoading}
                    />
                )}

                {/* 表格容器 */}
                <Spin spinning={isLoading} tip={loadingTip}>
                    <Table<T>
                        {...restProps}
                        dataSource={filteredData}
                        columns={antdColumns}
                        rowKey={(record) => {
                            // Generate unique key using rowKey field
                            const keyValue = typeof rowKey === 'function' ? rowKey(record) : record[rowKey];
                            return String(keyValue);
                        }}
                        rowSelection={rowSelectionConfig}
                        pagination={paginationConfig}
                        size={size}
                        bordered={bordered}
                        showHeader={showHeader}
                        sticky={sticky}
                        scroll={scroll}
                        locale={{
                            emptyText: <DefaultEmpty t={commonT} />,
                            ...locale
                        }}
                        onChange={handleTableChange}
                        onRow={onRow}
                        expandable={expandable}
                        summary={summary}
                    />
                </Spin>
            </div>
        </ConfigProvider>
    );
};

export default DataTable;