
'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import StatusBadge from '@/client/components/ui/StatusBadge';
import PublishModal from '@/client/components/ui/PublishModal';
import DataTable from '@/client/components/ui/DataTable/DataTable';
import { createReleaseCenterTableColumns, getReleaseCenterTableConfig, ReleaseRecord } from '@/client/components/ui/DataTable/ReleaseCenterTableConfig';
import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRuleStatusStatistics, getRuleMonthlyPublishStatistics, RuleStatusStatistics } from '@/client/services/releaseService';
import { useToast } from '@/client/components/ui/ToastContainer';
import { getApiBasePath, getAssetPath } from '@/client/lib/paths';
import { useReleaseCenterTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';
import TranslationLoader from '@/client/components/ui/TranslationLoader';

interface ChartData {
  month: string;
  invoiceEnrichmentEngine: number;
  invoiceValidationEngine: number;
}


interface SearchFilters {
  ruleType: string;
  status: string;
  ruleName: string;
}

interface ApiResponse {
  errcode: string;
  data: ReleaseRecord[];
  totalPage: number;
  currentPage: number;
  totalElement: number;
  pageSize: number;
  success: boolean;
  error: boolean;
}

export default function ReleaseCenterPage() {
  const { t, loading: translationLoading } = useReleaseCenterTranslation();
  const { t: commonT } = useCommonTranslation();
  const { showSuccess, showError } = useToast();
  const [selectedTab, setSelectedTab] = useState('releases');
  const [statusStats, setStatusStats] = useState<RuleStatusStatistics[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [releaseRecords, setReleaseRecords] = useState<ReleaseRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    ruleType: '',
    status: '',
    ruleName: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishingRecords, setPublishingRecords] = useState<number[]>([]);

  const engineTypeOptions = [
    { value: '', label: t('ruleTypes.all') },
    { value: '2', label: t('ruleTypes.invoiceEnrichmentEngine') },
    { value: '1', label: t('ruleTypes.invoiceValidationEngine') }
  ];

  const statusOptions = [
    { value: '', label: t('statusLabels.allStatus') },
    { value: '1', label: t('statusLabels.draft') },
    { value: '2', label: t('statusLabels.testPassed') },
    { value: '3', label: t('statusLabels.published') },
    { value: '4', label: t('statusLabels.actived') },
    { value: '5', label: t('statusLabels.deactivate') }
  ];





  const fetchReleaseRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const requestBody = {
        pageNum: currentPage,
        pageSize: pageSize,
        ...(searchFilters.ruleType && { ruleType: searchFilters.ruleType }),
        ...(searchFilters.status && { status: searchFilters.status }),
        ...(searchFilters.ruleName && { ruleName: searchFilters.ruleName })
      };

      const response = await fetch(getApiBasePath('/invoice-rules/page'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      // Check for API-level errors (errcode not 0000)
      if (data.errcode !== '0000' && data.errcode !== '0') {
        const errorMsg = data.error ? t('messages.requestFailed') : t('messages.unknownApiError');
        throw new Error(`API Error (${data.errcode}): ${errorMsg}`);
      }

      // Check if API indicates failure
      if (data.error === true || data.success === false) {
        const errorMsg = t('messages.apiRequestFailed');
        throw new Error(`Request Failed: ${errorMsg}`);
      }

      const records = data.data || [];
      setReleaseRecords(records);
      setCurrentPage(data.currentPage);
      setTotalRecords(data.totalElement);
      setTotalPages(data.totalPage);
    } catch (error) {
      console.error('Failed to fetch release records:', error);
      const errorMessage = error instanceof Error ? error.message : t('messages.loadError');

      // Show toast error notification
      showError(
        t('messages.dataLoadingFailed'),
        `${t('messages.loadingReleases')}: ${errorMessage}`
      );
    } finally {
      setRecordsLoading(false);
    }
  }, [currentPage, pageSize, searchFilters.ruleType, searchFilters.status, searchFilters.ruleName, showError]);

  // Handle DataTable filter changes
  const handleTableFilter = (filters: Record<string, any>) => {
    // Extract filter values with fallbacks
    const newRuleType = filters.ruleType || '';
    const newStatus = filters.status || '';
    const newRuleName = filters.search || '';

    // Update all search filter state at once
    setSearchFilters({
      ruleType: newRuleType,
      status: newStatus,
      ruleName: newRuleName
    });

    // Reset to first page when filters change
    setCurrentPage(1);
  };


  const handleBulkPublish = () => {
    if (selectedRecords.length === 0) {
      showError(t('messages.selectionRequired'), t('messages.pleaseSelectRecords'));
      return;
    }
    setPublishingRecords(selectedRecords);
    setPublishModalOpen(true);
  };

  const handlePublishSingle = (recordId: number) => {
    setPublishingRecords([recordId]);
    setPublishModalOpen(true);
  };

  const handlePublishConfirm = async (version: string) => {
    try {
      setPublishLoading(true);

      // 获取要发布的记录的 ruleCode
      const ruleCodes = releaseRecords
        .filter(record => publishingRecords.includes(record.id))
        .map(record => record.ruleCode);

      if (ruleCodes.length === 0) {
        throw new Error(t('messages.noValidRuleCodes'));
      }

      const response = await fetch(getApiBasePath('/invoice-rules/publish'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleCodes: ruleCodes,
          version: version
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('messages.publishRequestFailed'));
      }

      const result = await response.json();

      if (result.success) {
        showSuccess(
          t('messages.publishSuccessful'),
          `${publishingRecords.length} ${publishingRecords.length > 1 ? 'rules' : 'rule'} published successfully with version ${version}`
        );

        // 重新加载数据
        await fetchReleaseRecords();

        // 清空选中状态
        setSelectedRecords([]);
      } else {
        throw new Error(result.message || t('messages.publishFailed'));
      }
    } catch (error) {
      console.error('Publish error:', error);
      showError(
        t('messages.publishFailed'),
        error instanceof Error ? error.message : t('messages.unexpectedError')
      );
    } finally {
      setPublishLoading(false);
      setPublishModalOpen(false);
      setPublishingRecords([]);
    }
  };

  const handlePublishCancel = () => {
    if (!publishLoading) {
      setPublishModalOpen(false);
      setPublishingRecords([]);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch status statistics
        const statusData = await getRuleStatusStatistics();
        setStatusStats(statusData);

        // Fetch monthly publish statistics
        const monthlyData = await getRuleMonthlyPublishStatistics();

        // Transform data for chart
        const chartDataMap = new Map<string, ChartData>();

        monthlyData.forEach(ruleTypeData => {
          ruleTypeData.monthlyData.forEach(monthData => {
            const month = monthData.publishMonth;

            if (!chartDataMap.has(month)) {
              chartDataMap.set(month, {
                month: month,
                invoiceEnrichmentEngine: 0,
                invoiceValidationEngine: 0
              });
            }

            const chartMonth = chartDataMap.get(month)!;

            // Map rule types to chart lines
            // ruleType 2 = "补全" -> Invoice Enrichment Engine
            if (ruleTypeData.ruleType === 2) {
              chartMonth.invoiceEnrichmentEngine = monthData.count;
            }
            // For now, assume other rule types are validation engine
            // You can add more specific mapping based on actual rule types
            else {
              chartMonth.invoiceValidationEngine += monthData.count;
            }
          });
        });

        // Convert map to array and sort by month
        const transformedData = Array.from(chartDataMap.values()).sort((a, b) =>
          a.month.localeCompare(b.month)
        );

        setChartData(transformedData);
      } catch (error) {
        console.error('Failed to fetch statistics data:', error);
        const errorMessage = error instanceof Error ? error.message : t('messages.loadError');

        // Show toast error notification for statistics loading failure
        showError(
          t('messages.statisticsLoadingFailed'),
          `${t('messages.loadingReleases')}: ${errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  useEffect(() => {
    if (selectedTab === 'releases') {
      fetchReleaseRecords();
    }
  }, [selectedTab, searchFilters, currentPage, pageSize, fetchReleaseRecords]);

  const getStatValue = (statusKey: string): number => {
    const stat = statusStats.find(s => s.statusKey === statusKey || s.statusKey.toLowerCase() === statusKey.toLowerCase());
    return stat ? stat.count : 0;
  };

  return (
    <TranslationLoader loading={translationLoading} variant="dashboard">
    <div className="min-h-screen bg-gray-50">
        <Header />

    <main className="px-6 py-8">
    {/* Page Header */}
    <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
            title={t('statCards.published')}
            value={loading ? "-" : getStatValue('Published').toString()}
            icon="ri-rocket-line"
            color="blue"
        />
        <StatCard
            title={t('statCards.activeVersions')}
            value={loading ? "-" : getStatValue('actived').toString()}
            icon="ri-check-double-line"
            color="green"
        />
        <StatCard
            title={t('statCards.testPassed')}
            value={loading ? "-" : getStatValue('TestPassed').toString()}
            icon="ri-shield-check-line"
            color="orange"
        />
        <StatCard
            title={t('statCards.draft')}
            value={loading ? "-" : getStatValue('Draft').toString()}
            icon="ri-draft-line"
            color="purple"
        />
        </div>
    </div>

    {/* Version Trend Chart */}
    <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{t('chart.title')}</h3>
        </div>
        <div className="p-6">
        {loading ? (
            <div className="flex items-center justify-center h-[300px]">
            <div className="text-gray-500">{t('messages.loading')}</div>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                />
                <YAxis
                stroke="#6b7280"
                fontSize={12}
                />
                <Tooltip
                contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                }}
                />
                <Legend />
                <Line
                type="monotone"
                dataKey="invoiceEnrichmentEngine"
                stroke="#10b981"
                strokeWidth={2}
                name={t('chart.invoiceEnrichmentEngine')}
                />
                <Line
                type="monotone"
                dataKey="invoiceValidationEngine"
                stroke="#f59e0b"
                strokeWidth={2}
                name={t('chart.invoiceValidationEngine')}
                />
            </LineChart>
            </ResponsiveContainer>
        )}
        </div>
    </div>

    {/* Tabs */}
    <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
            <button
            onClick={() => setSelectedTab('releases')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                selectedTab === 'releases'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            >
            {t('tabs.releases')}
            </button>
            <button
            onClick={() => setSelectedTab('approvals')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                selectedTab === 'approvals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            >
            {t('tabs.approvals')}
            </button>
            <button
            onClick={() => setSelectedTab('rollbacks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                selectedTab === 'rollbacks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            >
            {t('tabs.rollbacks')}
            </button>
        </div>
        </div>

        {selectedTab === 'releases' && (
        <div className="p-6">
            {/* DataTable */}
            <DataTable
            dataSource={releaseRecords}
            columns={createReleaseCenterTableColumns(t, handlePublishSingle)}
            rowKey="id"
            loading={{
                loading: recordsLoading,
                tip: t('messages.loading')
            }}
            toolbar={{
                showSearch: true,
                showFilter: true,
                showColumnToggle: true,
                showExport: true,
                showRefresh: true,
                searchPlaceholder: t('search.placeholder'),
                searchFields: ['ruleCode', 'ruleName'],
                initialFilters: {
                    ruleType: searchFilters.ruleType || undefined,
                    status: searchFilters.status || undefined,
                    search: searchFilters.ruleName || undefined
                },
                filterFields: [
                {
                    key: 'ruleType',
                    label: commonT('filters.ruleType'),
                    type: 'select',
                    options: engineTypeOptions.map(option => ({
                    label: option.label,
                    value: option.value
                    })),
                    placeholder: t('ruleTypes.all')
                },
                {
                    key: 'status',
                    label: commonT('filters.statusFilter'),
                    type: 'select',
                    options: statusOptions.map(option => ({
                    label: option.label,
                    value: option.value
                    })),
                    placeholder: t('statusLabels.allStatus')
                }
                ],
                customActions: [
                <button
                    key="batch-publish"
                    onClick={handleBulkPublish}
                    disabled={selectedRecords.length === 0}
                    className={`px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 ${
                    selectedRecords.length > 0
                        ? 'bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                >
                    <i className="ri-rocket-line"></i>
                    <span>{t('actions.publish')}</span>
                </button>
                ]
            }}
            pagination={{
                enabled: true,
                current: currentPage,
                pageSize: pageSize,
                total: totalRecords,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: true,
                onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
                },
                pageSizeOptions: ['10', '20', '50', '100', '200', '500']
            }}
            rowSelection={{
                enabled: true,
                type: 'checkbox',
                selectedRowKeys: selectedRecords,
                onChange: (selectedKeys) => {
                setSelectedRecords(selectedKeys.map(key => Number(key)));
                },
                getCheckboxProps: (record: ReleaseRecord) => ({
                disabled: record.status !== 1 && record.status !== 2
                })
            }}
            onRefresh={fetchReleaseRecords}
            onFilter={handleTableFilter}
            disableClientSideFiltering={true}
            size="middle"
            bordered={false}
            striped={true}
            t={t}
            />
        </div>
        )}

        {selectedTab === 'approvals' && (
        <div className="p-6">
            <div className="text-center py-12">
            <i className="ri-user-settings-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">{t('comingSoon')}</p>
            </div>
        </div>
        )}

        {selectedTab === 'rollbacks' && (
        <div className="p-6">
            <div className="text-center py-12">
            <i className="ri-history-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">{t('comingSoon')}</p>
            </div>
        </div>
        )}
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-rocket-line text-white"></i>
                </div>
                <div className="text-left">
                <p className="font-medium text-gray-900">Create New Release</p>
                <p className="text-sm text-gray-600">Start a new version release process</p>
                </div>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-check-double-line text-white"></i>
                </div>
                <div className="text-left">
                <p className="font-medium text-gray-900">Batch Approval</p>
                <p className="text-sm text-gray-600">Perform batch operations on pending releases</p>
                </div>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-arrow-go-back-line text-white"></i>
                </div>
                <div className="text-left">
                <p className="font-medium text-gray-900">Emergency Rollback</p>
                <p className="text-sm text-gray-600">Quickly rollback problematic versions</p>
                </div>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            </button>
        </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Calendar</h3>
        <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                <p className="font-medium text-gray-900">Tax Rules Engine v2.2.0</p>
                <p className="text-sm text-gray-600">Scheduled Release Date</p>
                </div>
                <span className="text-sm text-blue-600 font-medium">2024-02-01</span>
            </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                <p className="font-medium text-gray-900">Invoice Validation Engine v3.3.0</p>
                <p className="text-sm text-gray-600">Scheduled Release Date</p>
                </div>
                <span className="text-sm text-green-600 font-medium">2024-02-15</span>
            </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                <p className="font-medium text-gray-900">Invoice Enrichment Engine v1.9.0</p>
                <p className="text-sm text-gray-600">Scheduled Release Date</p>
                </div>
                <span className="text-sm text-purple-600 font-medium">2024-03-01</span>
            </div>
            </div>
        </div>
        </div>
    </div>
    </main>

    {/* Publish Modal */}
    <PublishModal
    isOpen={publishModalOpen}
    onClose={handlePublishCancel}
    onConfirm={handlePublishConfirm}
    loading={publishLoading}
    selectedCount={publishingRecords.length}
    title={publishingRecords.length > 1 ? t('publishModal.batchPublishRules') : t('publishModal.publishRule')}
    />
    </div>
    </TranslationLoader>
  );
}
