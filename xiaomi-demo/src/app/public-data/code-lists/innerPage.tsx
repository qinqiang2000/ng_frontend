'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/client/components/Header';
import { seedStandards, seedMappings, mockValidationErrors, fetchStandardCodes, fetchMappingCodes, fetchCountryOptions, deleteStandardCode, deleteMappingCode, fetchCodeStatistics, fetchStandardCodesParallel, fetchMappingCodesParallel, type CodeListType, type StandardRow, type MappingRow, type CountryOption, type CodeListStatistics, type ParallelSearchResult, type SearchProgress, type MappingParallelSearchResult, type MappingSearchProgress } from '@/client/services/codeListService';
import { fetchCodeEnums, type MenuItem } from '@/client/services/codeEnumService';
import AddStandardDrawer from '@/client/components/ui/AddStandardDrawer';
import AddMappingDrawer from '@/client/components/ui/AddMappingDrawer';
import ImportModal from '@/client/components/ui/ImportModal';
import ErrorDrawer from '@/client/components/ui/ErrorDrawer';
import TranslationLoader from '@/client/components/ui/TranslationLoader';
import { useCodeListsTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';
import { useApiLanguage } from '@/client/contexts/LanguageContext';
import { useToast } from '@/client/components/ui/ToastContainer';
import DataTable from '@/client/components/ui/DataTable';
import { createStandardTableColumns, getStandardTableConfig } from '@/client/components/ui/DataTable/StandardTableConfig';
import { createMappingTableColumns, getMappingTableConfig } from '@/client/components/ui/DataTable/MappingTableConfig';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

export default function CodeListsInnerPage() {
    const { t, loading: translationLoading } = useCodeListsTranslation();
    const { t: commonT } = useCommonTranslation();
    const apiLanguage = useApiLanguage();
    const { showSuccess, showError } = useToast();

    // 基础状态
    const [currentType, setCurrentType] = useState<CodeListType>('UOM');
    const [tab, setTab] = useState<'standard' | 'mapping'>('standard');

    // Standard 标签页独立状态
    const [standardSearch, setStandardSearch] = useState('');
    const [standardScope, setStandardScope] = useState('');

    // Mapping 标签页独立状态
    const [mappingSearch, setMappingSearch] = useState('');
    const [mappingScope, setMappingScope] = useState('');

    // 向后兼容：基于当前标签页获取搜索和范围值
    const search = tab === 'standard' ? standardSearch : mappingSearch;
    const scope = tab === 'standard' ? standardScope : mappingScope;

    // 菜单项状态（从后端获取）
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError, setMenuError] = useState<string | null>(null);

    // 数据状态
    const [allStandards, setAllStandards] = useState(seedStandards);
    const [allMappings, setAllMappings] = useState(seedMappings);

    // 标准数据状态（从后端获取）
    const [standardsData, setStandardsData] = useState<StandardRow[]>([]);
    const [standardsLoading, setStandardsLoading] = useState(false);
    const [standardsError, setStandardsError] = useState<string | null>(null);

    // 分页状态 (标准数据)
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // 映射数据状态（从后端获取）
    const [mappingsData, setMappingsData] = useState<MappingRow[]>([]);
    const [mappingsLoading, setMappingsLoading] = useState(false);
    const [mappingsError, setMappingsError] = useState<string | null>(null);

    // 映射分页状态
    const [mappingPageNum, setMappingPageNum] = useState(1);
    const [mappingPageSize, setMappingPageSize] = useState(10);
    const [mappingTotalRecords, setMappingTotalRecords] = useState(0);
    const [mappingTotalPages, setMappingTotalPages] = useState(0);

    // 国家选项状态（用于范围选择器）
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
    const [countryLoading, setCountryLoading] = useState(false);
    const [countryError, setCountryError] = useState<string | null>(null);

    // 统计数据状态（从后端获取）
    const [statistics, setStatistics] = useState<CodeListStatistics | null>(null);
    const [statisticsLoading, setStatisticsLoading] = useState(false);
    const [statisticsError, setStatisticsError] = useState<string | null>(null);

    // 并行搜索状态 (Standard)
    const [searchProgress, setSearchProgress] = useState<SearchProgress>({ code: 'pending', name: 'pending' });
    const [searchResults, setSearchResults] = useState<ParallelSearchResult[]>([]);
    const [totalResults, setTotalResults] = useState<{ code: number; name: number; merged: number }>({ code: 0, name: 0, merged: 0 });
    const [isParallelSearching, setIsParallelSearching] = useState(false);

    // 并行搜索状态 (Mapping)
    const [mappingSearchProgress, setMappingSearchProgress] = useState<MappingSearchProgress>({ givenCode: 'pending', givenName: 'pending' });
    const [mappingSearchResults, setMappingSearchResults] = useState<MappingParallelSearchResult[]>([]);
    const [mappingTotalResults, setMappingTotalResults] = useState<{ givenCode: number; givenName: number; merged: number }>({ givenCode: 0, givenName: 0, merged: 0 });
    const [isMappingParallelSearching, setIsMappingParallelSearching] = useState(false);

    // 模态框和抽屉状态
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddStandardDrawer, setShowAddStandardDrawer] = useState(false);
    const [showAddMappingDrawer, setShowAddMappingDrawer] = useState(false);
    const [showErrorDrawer, setShowErrorDrawer] = useState(false);

    // 批量选择状态
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
    const [selectedMappingRowKeys, setSelectedMappingRowKeys] = useState<(string | number)[]>([]);

    // 当前菜单项信息
    const currentMenuMeta = useMemo(() => {
        if (menuItems.length === 0) return null;
        return menuItems.find(m => m.type === currentType) || menuItems[0];
    }, [menuItems, currentType]);

    // 当前数据 - 使用后端数据或回退到种子数据
    const standards = useMemo(() => {
        // 如果有后端数据且不在加载中，使用后端数据
        if (standardsData.length > 0 || standardsLoading) {
            return standardsData;
        }
        // 否则使用种子数据作为回退
        return allStandards[currentType] || [];
    }, [standardsData, standardsLoading, allStandards, currentType]);

    const mappings = useMemo(() => {
        // 如果有后端数据且不在加载中，使用后端数据
        if (mappingsData.length > 0 || mappingsLoading) {
            return mappingsData;
        }
        // 否则使用种子数据作为回退
        return allMappings[currentType] || [];
    }, [mappingsData, mappingsLoading, allMappings, currentType]);

    // 获取所有唯一的 scope 值
    const uniqueScopes = useMemo(() => {
        const scopes = new Set<string>();

        // 从标准数据中收集 scope
        standards.forEach(item => {
            if (item.scope) {
                scopes.add(item.scope);
            }
        });

        // 从映射数据中收集 scope
        mappings.forEach(item => {
            if (item.scope) {
                scopes.add(item.scope);
            }
        });

        return Array.from(scopes).sort();
    }, [standards, mappings]);

    // 过滤数据 - 后端数据已经过滤，直接使用；种子数据需要客户端过滤
    const filteredStandards = useMemo(() => {
        // 如果使用后端数据，直接返回（后端已处理过滤）
        if (standardsData.length > 0 || standardsLoading) {
            return standards;
        }
        // 如果使用种子数据，进行客户端过滤（使用Standard专用状态）
        return standards.filter((s: StandardRow) => {
            const scopeMatch = standardScope === '' || s.scope === standardScope;
            const searchMatch = !standardSearch ||
                (s.code?.toLowerCase().includes(standardSearch.toLowerCase()) ||
                 s.name?.toLowerCase().includes(standardSearch.toLowerCase()) ||
                 s.description?.toLowerCase().includes(standardSearch.toLowerCase()));
            return scopeMatch && searchMatch;
        });
    }, [standards, standardScope, standardSearch, standardsData.length, standardsLoading]);

    const filteredMappings = useMemo(() => {
        // 如果使用后端数据，直接返回（后端已处理过滤）
        if (mappingsData.length > 0 || mappingsLoading) {
            return mappings;
        }
        // 如果使用种子数据，进行客户端过滤（使用Mapping专用状态）
        return mappings.filter((m: MappingRow) => {
            const scopeMatch = mappingScope === '' || m.scope === mappingScope;
            const searchMatch = !mappingSearch ||
                (m.givenCode?.toLowerCase().includes(mappingSearch.toLowerCase()) ||
                 m.givenName?.toLowerCase().includes(mappingSearch.toLowerCase()) ||
                 m.standardCode?.toLowerCase().includes(mappingSearch.toLowerCase()));
            return scopeMatch && searchMatch;
        });
    }, [mappings, mappingScope, mappingSearch, mappingsData.length, mappingsLoading]);

    // KPI计算 - 只使用后端统计数据，不使用本地计算
    const kpi = useMemo(() => {
        if (statistics && !statisticsError) {
            // 使用后端统计数据
            return {
                totalStd: statistics.totalStandardEntries,
                coverage: statistics.mappingCoverage,
                pending: statistics.pendingFixes
            };
        } else {
            // 如果没有后端数据，显示空状态
            return {
                totalStd: 0,
                coverage: 0,
                pending: 0
            };
        }
    }, [statistics, statisticsError]);

    // 范围显示函数
    const scopeDisplay = (code: string | undefined, hasCountry: boolean) => {
        if (!code) return hasCountry ? t('scope.default') : code || 'ALL';
        if (code === '' || code === 'DEFAULT') return t('scope.default');
        if (code === 'GLOBAL') return code;
        return code;
    };

    // 处理类型切换
    const handleTypeChange = (type: CodeListType) => {
        setCurrentType(type);
        // 重置两个标签页的状态
        setStandardScope('');
        setStandardSearch('');
        setMappingScope('');
        setMappingSearch('');
        setTab('standard');
    };

    // 处理 Standard 标签页的过滤器变化
    const handleStandardTableFilter = (filters: Record<string, any>) => {
        const newSearch = filters.search || '';
        const newScope = filters.scope || '';

        setStandardSearch(newSearch);
        setStandardScope(newScope);
    };

    // 处理 Mapping 标签页的过滤器变化
    const handleMappingTableFilter = (filters: Record<string, any>) => {
        const newSearch = filters.search || '';
        const newScope = filters.scope || '';

        setMappingSearch(newSearch);
        setMappingScope(newScope);
    };

    // 加载菜单项数据
    const loadMenuItems = async () => {
        try {
            setMenuLoading(true);
            setMenuError(null);
            const items = await fetchCodeEnums();
            setMenuItems(items);

            // 如果当前类型不在新的菜单项中，设置为第一个
            if (items.length > 0 && !items.find(item => item.type === currentType)) {
                setCurrentType(items[0].type as CodeListType);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load code types';
            setMenuError(errorMessage);
            showError(t('messages.loadFailed'), t('messages.fetchFailed'));
        } finally {
            setMenuLoading(false);
        }
    };

    // 组件挂载时加载数据
    useEffect(() => {
        loadMenuItems();
    }, []);

    // 加载国家选项数据，当组件挂载或语言变化时
    useEffect(() => {
        loadCountryOptions();
    }, [apiLanguage]);

    // 加载标准数据
    const loadStandardsData = async () => {
        if (!currentType) return;

        // 检查是否有搜索条件，决定使用并行搜索还是普通搜索
        const hasSearchTerm = standardSearch && standardSearch.trim();

        if (hasSearchTerm) {
            // 使用并行搜索
            setIsParallelSearching(true);
            setStandardsLoading(true);
            setStandardsError(null);
            setSearchProgress({ code: 'pending', name: 'pending' });
            setSearchResults([]);

            try {
                const baseQuery = {
                    codeType: currentType,
                    pageNum,
                    pageSize,
                    country: standardScope || undefined,
                };

                const result = await fetchStandardCodesParallel(
                    baseQuery,
                    standardSearch,
                    (results, progress) => {
                        // 实时更新搜索进度和部分结果
                        setSearchProgress(progress);
                        setSearchResults(results);

                        // 合并已返回的结果并立即更新UI
                        const mergedMap = new Map<string, StandardRow>();
                        results.forEach(result => {
                            result.data.forEach(item => {
                                mergedMap.set(item.id, item);
                            });
                        });
                        const partialMergedData = Array.from(mergedMap.values());

                        // 只在有部分数据时更新UI，避免频繁重渲染
                        if (partialMergedData.length > 0) {
                            setStandardsData(partialMergedData);
                        }
                    }
                );

                // 最终更新所有数据
                setStandardsData(result.mergedData);
                setTotalRecords(result.totalResults.merged);
                setTotalPages(Math.ceil(result.totalResults.merged / pageSize));
                setTotalResults(result.totalResults);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch standards data';
                setStandardsError(errorMessage);
                showError('加载失败', errorMessage);
                setStandardsData([]);
                setSearchProgress({ code: 'error', name: 'error' });
            } finally {
                setStandardsLoading(false);
                setIsParallelSearching(false);
            }
        } else {
            // 使用普通搜索
            setStandardsLoading(true);
            setStandardsError(null);
            setIsParallelSearching(false);
            setSearchProgress({ code: 'pending', name: 'pending' });

            try {
                const result = await fetchStandardCodes({
                    codeType: currentType,
                    pageNum,
                    pageSize,
                    name: standardSearch || undefined,
                    country: standardScope || undefined,
                });

                setStandardsData(result.data);
                setTotalRecords(result.total);
                setTotalPages(result.pages);
                setTotalResults({ code: result.total, name: result.total, merged: result.total });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch standards data';
                setStandardsError(errorMessage);
                showError('加载失败', errorMessage);
                setStandardsData([]);
            } finally {
                setStandardsLoading(false);
            }
        }
    };

    // 加载映射数据
    const loadMappingsData = async () => {
        if (!currentType) return;

        // 检查是否有搜索条件，决定使用并行搜索还是普通搜索
        const hasSearchTerm = mappingSearch && mappingSearch.trim();

        if (hasSearchTerm) {
            // 使用并行搜索
            setIsMappingParallelSearching(true);
            setMappingsLoading(true);
            setMappingsError(null);
            setMappingSearchProgress({ givenCode: 'pending', givenName: 'pending' });
            setMappingSearchResults([]);

            try {
                const baseQuery = {
                    codeType: currentType,
                    pageNum: mappingPageNum,
                    pageSize: mappingPageSize,
                    country: mappingScope || undefined,
                };

                const result = await fetchMappingCodesParallel(
                    baseQuery,
                    mappingSearch,
                    (results, progress) => {
                        // 实时更新搜索进度和部分结果
                        setMappingSearchProgress(progress);
                        setMappingSearchResults(results);

                        // 合并已返回的结果并立即更新UI
                        const mergedMap = new Map<string, MappingRow>();
                        results.forEach(result => {
                            result.data.forEach(item => {
                                mergedMap.set(item.id, item);
                            });
                        });
                        const partialMergedData = Array.from(mergedMap.values());

                        // 只在有部分数据时更新UI，避免频繁重渲染
                        if (partialMergedData.length > 0) {
                            setMappingsData(partialMergedData);
                        }
                    }
                );

                // 最终更新所有数据
                setMappingsData(result.mergedData);
                setMappingTotalRecords(result.totalResults.merged);
                setMappingTotalPages(Math.ceil(result.totalResults.merged / mappingPageSize));
                setMappingTotalResults(result.totalResults);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch mappings data';
                setMappingsError(errorMessage);
                showError(t('messages.loadFailed'), errorMessage);
                setMappingsData([]);
                setMappingSearchProgress({ givenCode: 'error', givenName: 'error' });
            } finally {
                setMappingsLoading(false);
                setIsMappingParallelSearching(false);
            }
        } else {
            // 使用普通搜索
            setMappingsLoading(true);
            setMappingsError(null);
            setIsMappingParallelSearching(false);
            setMappingSearchProgress({ givenCode: 'pending', givenName: 'pending' });

            try {
                const result = await fetchMappingCodes({
                    codeType: currentType,
                    pageNum: mappingPageNum,
                    pageSize: mappingPageSize,
                    givenName: mappingSearch || undefined,
                    country: mappingScope || undefined,
                });

                setMappingsData(result.data);
                setMappingTotalRecords(result.total);
                setMappingTotalPages(result.pages);
                setMappingTotalResults({ givenCode: result.total, givenName: result.total, merged: result.total });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch mappings data';
                setMappingsError(errorMessage);
                showError(t('messages.loadFailed'), errorMessage);
                setMappingsData([]);
            } finally {
                setMappingsLoading(false);
            }
        }
    };

    // 删除标准数据条目
    const handleDeleteStandard = async (record: StandardRow) => {
        try {
            await deleteStandardCode(record.id.toString());
            showSuccess(t('messages.deleteSuccess'), t('messages.recordDeleted'));
            // 重新加载数据
            loadStandardsData();
            // 刷新统计数据
            loadStatistics();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete record';
            showError(t('messages.deleteFailed'), errorMessage);
        }
    };

    // 批量删除标准数据条目
    const handleBatchDeleteStandards = async () => {
        if (selectedRowKeys.length === 0) {
            showError(t('messages.noSelection'), t('messages.pleaseSelectRecords'));
            return;
        }

        if (!window.confirm(t('messages.confirmBatchDelete', { count: selectedRowKeys.length }))) {
            return;
        }

        try {
            // 循环调用删除API
            const deletePromises = selectedRowKeys.map(id => deleteStandardCode(id.toString()));
            await Promise.all(deletePromises);

            showSuccess(t('messages.deleteSuccess'), t('messages.batchDeleteSuccess', { count: selectedRowKeys.length }));

            // 清空选择并重新加载数据
            setSelectedRowKeys([]);
            loadStandardsData();
            // 刷新统计数据
            loadStatistics();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete records';
            showError(t('messages.deleteFailed'), errorMessage);
        }
    };

    // 删除映射数据条目
    const handleDeleteMapping = async (record: MappingRow) => {
        try {
            await deleteMappingCode(record.id.toString());
            showSuccess(t('messages.deleteSuccess'), t('messages.recordDeleted'));
            // 重新加载数据
            loadMappingsData();
            // 刷新统计数据
            loadStatistics();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete record';
            showError(t('messages.deleteFailed'), errorMessage);
        }
    };

    // 批量删除映射数据条目
    const handleBatchDeleteMappings = async () => {
        if (selectedMappingRowKeys.length === 0) {
            showError(t('messages.noSelection'), t('messages.pleaseSelectRecords'));
            return;
        }

        if (!window.confirm(t('messages.confirmBatchDelete', { count: selectedMappingRowKeys.length }))) {
            return;
        }

        try {
            // 循环调用删除API
            const deletePromises = selectedMappingRowKeys.map(id => deleteMappingCode(id.toString()));
            await Promise.all(deletePromises);

            showSuccess(t('messages.deleteSuccess'), t('messages.batchDeleteSuccess', { count: selectedMappingRowKeys.length }));

            // 清空选择并重新加载数据
            setSelectedMappingRowKeys([]);
            loadMappingsData();
            // 刷新统计数据
            loadStatistics();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete records';
            showError(t('messages.deleteFailed'), errorMessage);
        }
    };

    // 加载国家选项数据
    const loadCountryOptions = async () => {
        setCountryLoading(true);
        setCountryError(null);

        try {
            const options = await fetchCountryOptions(apiLanguage);
            setCountryOptions(options);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch country options';
            setCountryError(errorMessage);
            console.warn('Failed to load country options, using fallback:', errorMessage);
            // 错误会在fetchCountryOptions内部处理，包括回退到种子数据
        } finally {
            setCountryLoading(false);
        }
    };

    // 加载统计数据
    const loadStatistics = async () => {
        if (!currentType) return;

        setStatisticsLoading(true);
        setStatisticsError(null);

        try {
            const stats = await fetchCodeStatistics(currentType);
            setStatistics(stats);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch statistics';
            setStatisticsError(errorMessage);
            console.warn('Failed to load statistics, using client-side calculation:', errorMessage);
            // 保持使用客户端计算作为回退
            setStatistics(null);
        } finally {
            setStatisticsLoading(false);
        }
    };

    // 当类型、分页、Standard搜索条件变化时加载标准数据
    useEffect(() => {
        if (currentType && menuItems.length > 0) {
            loadStandardsData();
        }
    }, [currentType, pageNum, pageSize, standardSearch, standardScope, menuItems.length]);

    // Standard搜索条件变化时重置到第一页
    useEffect(() => {
        if (pageNum !== 1) {
            setPageNum(1);
        }
    }, [standardSearch, standardScope, currentType]);

    // 当类型、分页、Mapping搜索条件变化时加载映射数据
    useEffect(() => {
        if (currentType && menuItems.length > 0) {
            loadMappingsData();
        }
    }, [currentType, mappingPageNum, mappingPageSize, mappingSearch, mappingScope, menuItems.length]);

    // Mapping搜索条件变化时重置到第一页
    useEffect(() => {
        if (mappingPageNum !== 1) {
            setMappingPageNum(1);
        }
    }, [mappingSearch, mappingScope, currentType]);

    // 当类型变化时加载统计数据
    useEffect(() => {
        if (currentType && menuItems.length > 0) {
            loadStatistics();
        }
    }, [currentType, menuItems.length]);


    // 处理添加标准条目
    const handleAddStandard = (newStandard: StandardRow) => {
        // Only update seed data if we're using it (no backend data)
        if (standardsData.length === 0 && !standardsLoading) {
            setAllStandards(prev => ({
                ...prev,
                [currentType]: [...(prev[currentType] || []), newStandard]
            }));
        }

        // Refresh the backend data to show the newly created entry
        loadStandardsData();

        // Refresh statistics after adding new standard entry
        loadStatistics();

        // Note: Success message is now handled in AddStandardDrawer component
    };

    // 处理添加映射
    const handleAddMapping = () => {
        // Refresh the mapping data to show the newly created entry
        // Note: Success message is now handled in AddMappingDrawer component
        loadMappingsData();

        // Refresh statistics after adding new mapping entry
        loadStatistics();
    };

    // 处理导入
    const handleImport = (result: { added: number; updated: number; skipped: number }) => {
        showSuccess('导入完成', `已添加 ${result.added} 项，已更新 ${result.updated} 项，已跳过 ${result.skipped} 项`);
    };

    // 处理重试加载
    const handleRetryLoad = () => {
        loadMenuItems();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="px-6 py-8">
                <TranslationLoader loading={translationLoading || menuLoading}>
                    <div className="space-y-6">
                {/* 代码类型选择器 */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    {menuError ? (
                        <div className="text-center py-4">
                            <div className="text-red-600 mb-2">
                                <i className="ri-error-warning-line text-2xl"></i>
                            </div>
                            <p className="text-gray-600 mb-3">{menuError}</p>
                            <button
                                onClick={handleRetryLoad}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <i className="ri-refresh-line mr-2"></i>
                                {t('messages.reload')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                            {menuItems.map(item => {
                                const active = currentType === item.type;
                                const label = item.zh; // Use backend-provided name (multilingual support handled by backend)

                                return (
                                    <button
                                        key={item.type}
                                        onClick={() => handleTypeChange(item.type as CodeListType)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            active
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <i className={`${item.icon} text-base`}></i>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* KPI 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <div className="text-sm text-gray-500 mb-1">{t('kpi.standardEntries')}</div>
                                <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <i className="ri-tag-line h-5 w-5 text-blue-500"></i>
                                    {statisticsLoading ? (
                                        <div className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                    ) : (
                                        kpi.totalStd
                                    )}
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                                {scopeDisplay(scope, currentMenuMeta?.hasCountry || false)}
                            </span>
                        </div>
                        {statisticsError && (
                            <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                <i className="ri-information-line"></i>
                                API数据加载失败
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="text-sm text-gray-500 mb-1">{t('kpi.mappingCoverage')}</div>
                                <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <i className="ri-shield-check-line h-5 w-5 text-green-500"></i>
                                    {statisticsLoading ? (
                                        <div className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                    ) : (
                                        `${kpi.coverage}%`
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className={`h-2 rounded-full bg-gray-200 overflow-hidden`}>
                                <div
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{ width: `${statisticsLoading ? 0 : kpi.coverage}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {statisticsLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-3 w-20 rounded"></div>
                                ) : (
                                    t('kpi.completionRate', { rate: kpi.coverage })
                                )}
                            </div>
                        </div>
                        {statisticsError && (
                            <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                <i className="ri-information-line"></i>
                                API数据加载失败
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                         onClick={() => setShowErrorDrawer(true)}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <div className="text-sm text-gray-500 mb-1">{t('kpi.pendingFixes')}</div>
                                <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <i className="ri-flag-line h-5 w-5 text-red-500"></i>
                                    {statisticsLoading ? (
                                        <div className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                    ) : (
                                        kpi.pending
                                    )}
                                </div>
                            </div>
                        </div>
                        {statisticsError && (
                            <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                <i className="ri-information-line"></i>
                                API数据加载失败
                            </div>
                        )}
                    </div>
                </div>

                {/* 数据表格 - 使用新的 DataTable 组件 */}
                <div className="bg-white rounded-lg shadow-sm">
                    <Tabs
                        activeKey={tab}
                        onChange={(key) => setTab(key as 'standard' | 'mapping')}
                        className="px-4 pt-4"
                        items={[
                            {
                                key: 'standard',
                                label: `${t('tabs.standardEntries')} (${totalRecords})`,
                                children: (
                                    <DataTable
                                        dataSource={filteredStandards}
                                        columns={createStandardTableColumns(currentMenuMeta?.hasCountry || false, t, handleDeleteStandard)}
                                        rowKey="id"
                                        disableClientSideFiltering={true}
                                        loading={{
                                            loading: standardsLoading,
                                            tip: t('messages.loading')
                                        }}
                                        toolbar={{
                                            showSearch: true,
                                            showFilter: true,
                                            showColumnToggle: true,
                                            showExport: true,
                                            showRefresh: true,
                                            searchPlaceholder: t('toolbar.searchPlaceholder'),
                                            searchFields: ['code', 'name'],
                                            initialFilters: {
                                                search: standardSearch || undefined,
                                                scope: standardScope || undefined
                                            },
                                            filterFields: [
                                                {
                                                    key: 'scope',
                                                    label: t('columns.scope'),
                                                    type: 'select',
                                                    options: [
                                                        { label: t('toolbar.allCountries'), value: '' },
                                                        ...uniqueScopes.map(scope => ({
                                                            label: scope,
                                                            value: scope
                                                        }))
                                                    ],
                                                    placeholder: t('toolbar.selectScope')
                                                }
                                            ],
                                            customActions: [
                                                <button
                                                    key="add-standard"
                                                    onClick={() => setShowAddStandardDrawer(true)}
                                                    title={t('toolbar.add')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <i className="ri-add-line"></i>
                                                    <span className="hidden sm:inline">{t('toolbar.add')}</span>
                                                </button>,
                                                <button
                                                    key="batch-delete"
                                                    onClick={handleBatchDeleteStandards}
                                                    disabled={selectedRowKeys.length === 0}
                                                    title={`${commonT('table.batchDelete')} (${selectedRowKeys.length})`}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                                                        selectedRowKeys.length === 0
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-red-600 text-white hover:bg-red-700'
                                                    }`}
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                    <span className="hidden sm:inline">{commonT('table.batchDelete')}</span>
                                                    <span className="ml-1">({selectedRowKeys.length})</span>
                                                </button>,
                                                <button
                                                    key="import"
                                                    onClick={() => setShowImportModal(true)}
                                                    title={commonT('table.import')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    <i className="ri-upload-line"></i>
                                                    <span className="hidden sm:inline">{commonT('table.import')}</span>
                                                </button>
                                            ]
                                        }}
                                        pagination={{
                                            enabled: totalRecords > 0,
                                            current: pageNum,
                                            pageSize: pageSize,
                                            total: totalRecords,
                                            showSizeChanger: true,
                                            showQuickJumper: true,
                                            showTotal: true,
                                            onChange: (page, size) => {
                                                setPageNum(page);
                                                setPageSize(size);
                                            }
                                        }}
                                        rowSelection={{
                                            enabled: true,
                                            type: 'checkbox',
                                            selectedRowKeys,
                                            onChange: (selectedKeys) => {
                                                setSelectedRowKeys(selectedKeys);
                                            }
                                        }}
                                        onRefresh={loadStandardsData}
                                        onFilter={handleStandardTableFilter}
                                        size="middle"
                                        bordered={false}
                                        striped={true}
                                    />
                                )
                            },
                            {
                                key: 'mapping',
                                label: `${t('tabs.mappings')} (${mappingTotalRecords})`,
                                disabled: !currentMenuMeta?.supportsMapping,
                                children: currentMenuMeta?.supportsMapping ? (
                                    <DataTable
                                        dataSource={filteredMappings}
                                        columns={createMappingTableColumns(currentMenuMeta?.hasCountry || false, t, handleDeleteMapping)}
                                        rowKey="id"
                                        disableClientSideFiltering={true}
                                        loading={{
                                            loading: mappingsLoading,
                                            tip: t('messages.loading')
                                        }}
                                        toolbar={{
                                            showSearch: true,
                                            showFilter: true,
                                            showColumnToggle: true,
                                            showExport: true,
                                            showRefresh: true,
                                            searchPlaceholder: t('toolbar.searchPlaceholder'),
                                            searchFields: ['givenCode', 'givenName'],
                                            initialFilters: {
                                                search: mappingSearch || undefined,
                                                scope: mappingScope || undefined
                                            },
                                            filterFields: [
                                                {
                                                    key: 'scope',
                                                    label: t('columns.scope'),
                                                    type: 'select',
                                                    options: [
                                                        { label: t('toolbar.allCountries'), value: '' },
                                                        ...uniqueScopes.map(scope => ({
                                                            label: scope,
                                                            value: scope
                                                        }))
                                                    ],
                                                    placeholder: t('toolbar.selectScope')
                                                }
                                            ],
                                            customActions: [
                                                <button
                                                    key="add-mapping"
                                                    onClick={() => setShowAddMappingDrawer(true)}
                                                    title={t('toolbar.add')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <i className="ri-add-line"></i>
                                                    <span className="hidden sm:inline">{t('toolbar.add')}</span>
                                                </button>,
                                                <button
                                                    key="batch-delete-mapping"
                                                    onClick={handleBatchDeleteMappings}
                                                    disabled={selectedMappingRowKeys.length === 0}
                                                    title={`${commonT('table.batchDelete')} (${selectedMappingRowKeys.length})`}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                                                        selectedMappingRowKeys.length === 0
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-red-600 text-white hover:bg-red-700'
                                                    }`}
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                    <span className="hidden sm:inline">{commonT('table.batchDelete')}</span>
                                                    <span className="ml-1">({selectedMappingRowKeys.length})</span>
                                                </button>,
                                                <button
                                                    key="import"
                                                    onClick={() => setShowImportModal(true)}
                                                    title={commonT('table.import')}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    <i className="ri-upload-line"></i>
                                                    <span className="hidden sm:inline">{commonT('table.import')}</span>
                                                </button>
                                            ]
                                        }}
                                        pagination={{
                                            enabled: mappingTotalRecords > 0,
                                            current: mappingPageNum,
                                            pageSize: mappingPageSize,
                                            total: mappingTotalRecords,
                                            showSizeChanger: true,
                                            showQuickJumper: true,
                                            showTotal: true,
                                            onChange: (page, size) => {
                                                setMappingPageNum(page);
                                                setMappingPageSize(size);
                                            }
                                        }}
                                        rowSelection={{
                                            enabled: true,
                                            type: 'checkbox',
                                            selectedRowKeys: selectedMappingRowKeys,
                                            onChange: (selectedKeys) => {
                                                setSelectedMappingRowKeys(selectedKeys);
                                            }
                                        }}
                                        onRefresh={loadMappingsData}
                                        onFilter={handleMappingTableFilter}
                                        size="middle"
                                        bordered={false}
                                        striped={true}
                                    />
                                ) : (
                                    <div className="py-10 text-center text-gray-500">
                                        {t('messages.noMappingSupport')}
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>

                {/* 抽屉和模态框组件 */}
                <AddStandardDrawer
                    open={showAddStandardDrawer}
                    onClose={() => setShowAddStandardDrawer(false)}
                    onConfirm={handleAddStandard}
                    currentType={currentType}
                    hasCountry={currentMenuMeta?.hasCountry || false}
                    scopeOptions={uniqueScopes}
                />

                <AddMappingDrawer
                    open={showAddMappingDrawer}
                    onClose={() => setShowAddMappingDrawer(false)}
                    onConfirm={handleAddMapping}
                    currentType={currentType}
                    hasCountry={currentMenuMeta?.hasCountry || false}
                    standards={standards}
                    scopeOptions={uniqueScopes}
                />

                <ImportModal
                    open={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onConfirm={handleImport}
                    target={tab}
                    currentType={currentType}
                />

                <ErrorDrawer
                    open={showErrorDrawer}
                    onClose={() => setShowErrorDrawer(false)}
                    errors={mockValidationErrors}
                />
                    </div>
                </TranslationLoader>
            </main>

        </div>
    );
}