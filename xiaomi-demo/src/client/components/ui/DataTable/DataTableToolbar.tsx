'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Input, Button, Space, Dropdown, Select, DatePicker, Tooltip } from 'antd';
import {
    FilterOutlined,
    DownloadOutlined,
    ReloadOutlined,
    SettingOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { debounce } from 'lodash';
import { DataTableToolbarConfig, DataTableColumn, ExportFormat } from './types';
import { exportData } from './exportUtils';
import { useCodeListsTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';
const { RangePicker } = DatePicker;

interface DataTableToolbarProps<T = any> {
    config: DataTableToolbarConfig;
    columns: DataTableColumn<T>[];
    dataSource: T[];
    onSearch?: (value: string) => void;
    onFilter?: (filters: Record<string, any>) => void;
    onRefresh?: () => void;
    onColumnToggle?: (columnKey: string, visible: boolean) => void;
    hiddenColumns?: Set<string>;
    loading?: boolean;
}

const DataTableToolbar = <T extends Record<string, any>>({
    config,
    columns,
    dataSource,
    onSearch,
    onFilter,
    onRefresh,
    onColumnToggle,
    hiddenColumns = new Set(),
    loading = false
}: DataTableToolbarProps<T>) => {
    const { t } = useCodeListsTranslation();
    const { t: commonT } = useCommonTranslation();
    const [searchValue, setSearchValue] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, any>>(config.initialFilters || {});
    const [isComposing, setIsComposing] = useState(false);

    // Update filterValues when config.initialFilters changes (for hydration and state sync)
    useEffect(() => {
        if (config.initialFilters) {
            setFilterValues(config.initialFilters);

            // 同步搜索框的值
            if (config.initialFilters.search !== undefined) {
                setSearchValue(config.initialFilters.search || '');
            }
        }
    }, [config.initialFilters]);
    const [showColumnPanel, setShowColumnPanel] = useState(false);

    // 处理搜索过滤（通过统一的onFilter回调）
    const handleSearchFilter = useCallback((value: string) => {
        const newFilters = { ...filterValues };
        const trimmedValue = value.trim();

        if (trimmedValue === '') {
            delete newFilters.search;
        } else {
            newFilters.search = trimmedValue;
        }

        setFilterValues(newFilters);
        onFilter?.(newFilters);
    }, [filterValues, onFilter]);

    // 创建防抖搜索函数
    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            handleSearchFilter(value);
        }, 500),
        [handleSearchFilter]
    );

    // 处理搜索输入变化
    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);

        // 如果正在进行IME输入，不触发搜索
        if (isComposing) {
            return;
        }

        // 如果是清空操作，立即搜索
        if (value.trim() === '') {
            debouncedSearch.cancel(); // 取消pending的防抖调用
            handleSearchFilter(value);
        } else {
            debouncedSearch(value);
        }
    }, [debouncedSearch, handleSearchFilter, isComposing]);

    // 处理手动搜索（按钮或Enter键）
    const handleManualSearch = useCallback((value: string) => {
        // 取消防抖，立即执行搜索
        debouncedSearch.cancel();
        handleSearchFilter(value);
    }, [debouncedSearch, handleSearchFilter]);

    // 清理防抖函数
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // 处理筛选
    const handleFilterChange = useCallback((key: string, value: any) => {
        const newFilters = { ...filterValues };

        // 如果值为 undefined、null 或空字符串，则移除该筛选条件
        if (value === undefined || value === null || value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }

        // 确保搜索值也包含在筛选器中
        if (searchValue && searchValue.trim()) {
            newFilters.search = searchValue.trim();
        }

        setFilterValues(newFilters);

        // 总是传递完整的筛选器状态，而不只是变化的部分
        onFilter?.(newFilters);
    }, [filterValues, onFilter, searchValue]);

    // 重置筛选
    const handleFilterReset = useCallback(() => {
        setFilterValues({});
        onFilter?.({});
    }, [onFilter]);

    // 处理导出
    const handleExport = useCallback((format: ExportFormat) => {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `data_export_${timestamp}`;
        exportData(dataSource, columns, format, filename);
    }, [dataSource, columns]);

    // 导出菜单项
    const exportMenuItems: MenuProps['items'] = [
        {
            key: 'csv',
            label: 'CSV ' + commonT('table.fileFormat'),
            onClick: () => handleExport('csv')
        },
        {
            key: 'excel',
            label: 'Excel ' + commonT('table.fileFormat'),
            onClick: () => handleExport('excel')
        },
        {
            key: 'json',
            label: 'JSON ' + commonT('table.fileFormat'),
            onClick: () => handleExport('json')
        }
    ];

    // 列显示/隐藏菜单项
    const columnMenuItems: MenuProps['items'] = columns.map(col => {
        const isHidden = hiddenColumns.has(col.key);
        return {
            key: col.key,
            label: (
                <div
                    className="flex items-center justify-between w-full cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onColumnToggle?.(col.key, isHidden);
                    }}
                >
                    <span>{col.title}</span>
                    {isHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </div>
            )
        };
    });

    return (
        <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
                {/* 搜索框 */}
                {config.showSearch && (
                    <Input
                        placeholder={config.searchPlaceholder || commonT('table.searchPlaceholder') || '搜索...'}
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={(e) => {
                            setIsComposing(false);
                            // 直接触发搜索，不通过 handleSearchChange 避免状态异步问题
                            setTimeout(() => {
                                const inputValue = (e.target as HTMLInputElement).value;
                                setSearchValue(inputValue);

                                // 直接触发搜索逻辑
                                if (inputValue.trim() === '') {
                                    debouncedSearch.cancel();
                                    handleSearchFilter(inputValue);
                                } else {
                                    debouncedSearch(inputValue);
                                }
                            }, 0);
                        }}
                        onPressEnter={() => handleManualSearch(searchValue)}
                        style={{ width: 300 }}
                        allowClear
                        prefix={<SearchOutlined style={{ color: '#d1d5db' }} />}
                    />
                )}

                {/* 筛选字段 */}
                {config.showFilter && config.filterFields?.map(field => (
                    <div key={field.key} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                            {field.label}:
                        </span>
                        {field.type === 'select' && (
                            <Select
                                placeholder={field.placeholder}
                                allowClear
                                style={{ minWidth: 120 }}
                                value={filterValues[field.key]}
                                onChange={(value) => {
                                    handleFilterChange(field.key, value);
                                }}
                                options={field.options}
                            />
                        )}
                        {field.type === 'input' && (
                            <Input
                                placeholder={field.placeholder}
                                allowClear
                                style={{ width: 150 }}
                                value={filterValues[field.key]}
                                onChange={(e) => handleFilterChange(field.key, e.target.value)}
                            />
                        )}
                        {field.type === 'dateRange' && (
                            <RangePicker
                                placeholder={[commonT('table.startDate') || '开始日期', commonT('table.endDate') || '结束日期']}
                                value={filterValues[field.key]}
                                onChange={(dates) => handleFilterChange(field.key, dates)}
                            />
                        )}
                    </div>
                ))}

                {/* 重置筛选按钮 */}
                {config.showFilter && Object.keys(filterValues).length > 0 && (
                    <Button
                        onClick={handleFilterReset}
                        icon={<FilterOutlined />}
                        size="small"
                    >
                        {commonT('table.resetFilter') || '重置筛选'}
                    </Button>
                )}

                <div className="flex-1" />

                {/* 右侧操作区域 */}
                <Space>
                    {/* 自定义操作按钮 */}
                    {config.customActions}

                    {/* 列显示/隐藏控制 */}
                    {config.showColumnToggle && (
                        <Dropdown
                            menu={{ items: columnMenuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Tooltip title={commonT('table.columnSettings') || 'Column Settings'}>
                                <Button icon={<SettingOutlined />}>
                                    <span className="hidden sm:inline">
                                        {commonT('table.columnSettings')}
                                    </span>
                                </Button>
                            </Tooltip>
                        </Dropdown>
                    )}

                    {/* 导出按钮 */}
                    {config.showExport && (
                        <Dropdown
                            menu={{ items: exportMenuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Tooltip title={commonT('table.exportData') || 'Export Data'}>
                                <Button icon={<DownloadOutlined />}>
                                    <span className="hidden sm:inline">
                                        {commonT('table.exportData')}
                                    </span>
                                </Button>
                            </Tooltip>
                        </Dropdown>
                    )}

                    {/* 刷新按钮 */}
                    {config.showRefresh && (
                        <Tooltip title={commonT('table.refreshData') || '刷新数据'}>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={onRefresh}
                                loading={loading}
                            />
                        </Tooltip>
                    )}
                </Space>
            </div>
        </div>
    );
};

export default DataTableToolbar;