
'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import DataTable from '@/client/components/ui/DataTable/DataTable';
import { createRuleEngineTableColumns, RuleEngineRow } from '@/client/components/ui/DataTable/RuleEngineTableConfig';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { getApiBasePath } from '@/client/lib/paths';
import { useCommonTranslation, useReleaseCenterTranslation, useRuleEnginesTranslation } from '@/client/hooks/useTranslation';
import { useToast } from '@/client/components/ui/ToastContainer';

interface Rule {
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
}

interface ApiResponse {
  errcode: string;
  message: string;
  data: Rule[];
  totalPage: number;
  currentPage: number;
  totalElement: number;
  pageSize: number;
  success: boolean;
  error: boolean;
  traceId?: string;
  errorMsgArray?: string[];
  noise?: string;
  sign?: string;
}

interface SearchFilters {
  ruleType: string;
  status: string;
  ruleName: string;
}

// 移除了不再使用的 CategoryGroup 接口和 statusMapping

// 规则类型选项 - 参考 release-center 的 engineTypeOptions 模式
const getRuleTypeOptions = (t: any) => [
  { value: '', label: t('ruleTypes.all') },
  { value: '1', label: t('ruleTypes.invoiceValidationEngine') },
  { value: '2', label: t('ruleTypes.invoiceEnrichmentEngine') }
];


export default function RuleEnginesPage() {
  const { t: commonT } = useCommonTranslation();
  const { t: releaseCenterT } = useReleaseCenterTranslation();
  const { t: ruleEnginesT } = useRuleEnginesTranslation();
  const { showError } = useToast();

  const [selectedEngine, setSelectedEngine] = useState('tax');
  const [apiRules, setApiRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 采用 release-center 的状态管理模式
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

  // Tax rules engine data - memoized to prevent infinite re-renders
  const taxRules: Rule[] = useMemo(() => [
    {
      id: 'COMP_VAT_EU_STANDARD',
      name: 'EU Standard VAT Information Completion Rules',
      description: 'Standard completion operations for invoice_vat_details fields in EU region',
      region: 'European Union',
      category: 'Information Completion',
      priority: 10,
      status: 'Active',
      version: 'v1.3.2',
      updateTime: '5 hours ago',
      usage: 100,
      actions: ['View', 'Edit', 'Copy'],
      ruleCode: 'COMP_VAT_EU_STANDARD'
    },
    {
      id: 'COMP_US1_SG_DIGITAL',
      name: 'Singapore Digital Services Tax Information Completion',
      description: 'Completion for invoice_digital_service fields in Singapore',
      region: 'Singapore',
      category: 'Digital Services Tax Completion',
      priority: 12,
      status: 'Active',
      version: 'v2.1.0',
      updateTime: '7 hours ago',
      usage: 85,
      actions: ['View', 'Edit', 'Copy'],
      ruleCode: 'COMP_US1_SG_DIGITAL'
    },
    {
      id: 'COMP_UK_EXPORT',
      name: 'UK Export Trade Tax Completion',
      description: 'Completion for invoice_export_details fields in UK',
      region: 'United Kingdom',
      category: 'Export Trade',
      priority: 16,
      status: 'Staged',
      version: 'v1.5.1',
      updateTime: '18 hours ago',
      usage: 80,
      actions: ['View', 'Edit', 'Copy'],
      ruleCode: 'COMP_UK_EXPORT'
    }
  ], []);

  // Invoice rules engine data - memoized to prevent infinite re-renders
  const invoiceRules: Rule[] = useMemo(() => [
    {
      id: 'VAL_DE_INVOICE_FORMAT',
      name: 'German Invoice Format Validation Rules',
      description: 'Validate German invoice format compliance and required field completeness',
      region: 'Germany',
      category: 'Format Validation',
      priority: 15,
      status: 'Active',
      version: 'v2.0.1',
      updateTime: '3 hours ago',
      usage: 95,
      actions: ['View', 'Edit', 'Copy'],
      ruleCode: 'VAL_DE_INVOICE_FORMAT'
    },
    {
      id: 'VAL_FR_VAT_CHECK',
      name: 'French VAT Validation Rules',
      description: 'Validate French VAT calculation and tax rate application accuracy',
      region: 'France',
      category: 'Tax Validation',
      priority: 12,
      status: 'Active',
      version: 'v1.8.3',
      updateTime: '6 hours ago',
      usage: 88,
      actions: ['View', 'Edit', 'Copy'],
      ruleCode: 'VAL_FR_VAT_CHECK'
    },
    {
      id: 'VAL_US_SALES_TAX',
      name: 'US Sales Tax Validation Rules',
      description: 'Validate US state sales tax calculation and filing compliance',
      region: 'United States',
      category: 'Sales Tax Validation',
      priority: 18,
      status: 'Testing',
      version: 'v3.0.0-beta',
      updateTime: '1 day ago',
      usage: 72,
      actions: ['View', 'Edit', 'Copy'],
      ruleCode: 'VAL_US_SALES_TAX'
    }
  ], []);

  // 采用 release-center 的 fetchReleaseRecords 模式
  const fetchRules = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const requestBody = {
        pageNum: currentPage,
        pageSize: pageSize,
        country: 'CN',
        ...(searchFilters.ruleName && { ruleName: searchFilters.ruleName }),
        ...(searchFilters.ruleType && { ruleType: searchFilters.ruleType }),
        ...(searchFilters.status && { status: searchFilters.status })
      };

      const response = await fetch(getApiBasePath('/invoice-rules/subscribed-rules'), {
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
        const errorMsg = data.error ? 'Request failed' : 'Unknown API error';
        throw new Error(`API Error (${data.errcode}): ${errorMsg}`);
      }

      // Check if API indicates failure
      if (data.error === true || data.success === false) {
        const errorMsg = 'API request failed';
        throw new Error(`Request Failed: ${errorMsg}`);
      }

      const transformedRules = (data.data || []).map((rule) => ({
        id: rule.ruleCode || (typeof rule.id === 'string' ? rule.id : rule.id.toString()),
        name: rule.ruleName || rule.name || '',
        description: rule.ruleExpression || rule.description || '',
        region: `${rule.country || ''} ${rule.province || ''} ${rule.city || ''}`.trim() || 'Unknown',
        category: getCategoryFromRuleType(rule.ruleType, rule.tags),
        priority: rule.priority || 1,
        status: getStatusFromCode(rule.status),
        version: 'v1.0.0',
        updateTime: formatTimeAgo(rule.updateTime),
        usage: Math.floor(Math.random() * 100) + 50,
        actions: ['View', 'Edit', 'Copy'],
        ruleCode: rule.ruleCode,
        ruleType: rule.ruleType,
        companyId: rule.companyId,
        country: rule.country,
        tradeArea: rule.tradeArea,
        province: rule.province,
        city: rule.city,
        tags: rule.tags,
        invoiceType: rule.invoiceType,
        active: rule.active,
        applyTo: rule.applyTo,
        errorMessage: rule.errorMessage,
        fieldPath: rule.fieldPath,
        ruleExpression: rule.ruleExpression,
        startTime: rule.startTime,
        endTime: rule.endTime,
        createTime: rule.createTime,
        ruleName: rule.ruleName
      }));

      setApiRules(transformedRules);
      setCurrentPage(data.currentPage || currentPage);
      setTotalRecords(data.totalElement || transformedRules.length);
      setTotalPages(data.totalPage || 1);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      const errorMessage = error instanceof Error ? error.message : 'Load error';

      // Show toast error notification
      showError(
        'Data loading failed',
        `Loading rules: ${errorMessage}`
      );

      // Fallback to static data
      const fallbackRules = selectedEngine === 'tax' ? taxRules : invoiceRules;
      setApiRules(fallbackRules);
      setTotalRecords(fallbackRules.length);
      setTotalPages(1);
    } finally {
      setRecordsLoading(false);
    }
  }, [currentPage, pageSize, searchFilters.ruleName, searchFilters.ruleType, searchFilters.status, selectedEngine, showError, invoiceRules, taxRules]);

  // 采用 release-center 的 handleTableFilter 模式
  const handleTableFilter = useCallback((filters: Record<string, any>) => {
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
  }, []);

  // Helper functions
  const getCategoryFromRuleType = (ruleType?: number, tags?: string): string => {
    if (ruleType === 1) return 'Validation Rules';
    if (ruleType === 2) return 'Information Completion';
    if (tags?.includes('制造业')) return 'Manufacturing';
    if (tags?.includes('VAT')) return 'VAT Processing';
    return 'General Rules';
  };

  const getStatusFromCode = (statusCode?: number | string | any): string => {
    // 处理各种可能的输入类型
    let code: number;

    if (typeof statusCode === 'string') {
      code = parseInt(statusCode);
    } else if (typeof statusCode === 'number') {
      code = statusCode;
    } else if (statusCode && typeof statusCode === 'object' && statusCode.value) {
      // 处理可能的对象形式的状态
      code = typeof statusCode.value === 'string' ? parseInt(statusCode.value) : statusCode.value;
    } else {
      console.warn('Invalid status code received:', statusCode);
      return 'Unknown';
    }

    // 检查是否为有效数字
    if (isNaN(code)) {
      console.warn('Status code is not a valid number:', statusCode);
      return 'Unknown';
    }

    // 根据Java枚举值映射状态
    switch (code) {
      case 1: return 'Draft';           // 草稿
      case 2: return 'TestPassed';      // 测试通过
      case 3: return 'Published';       // 已发布
      case 4: return 'Enabled';         // 启用
      case 5: return 'Disabled';        // 停用
      default:
        console.warn('Unknown status code:', code);
        return 'Unknown';
    }
  };

  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    } catch {
      return 'Unknown';
    }
  };

  // 删除了不再需要的 generateCategoryGroups 函数

  // Use API rules or fallback to static data
  // 获取当前引擎的数据
  const getCurrentEngineRules = (): RuleEngineRow[] => {
    const sourceRules = apiRules.length > 0 ? apiRules : (selectedEngine === 'tax' ? taxRules : invoiceRules);
    return sourceRules.map(rule => ({
      ...rule,
      id: rule.id,
      ruleCode: rule.ruleCode || String(rule.id)
    })) as RuleEngineRow[];
  };

  const currentRules = getCurrentEngineRules();

  // 行操作处理函数
  const handleView = useCallback((record: RuleEngineRow) => {
    console.log('View rule:', record);
    // TODO: 实现查看功能
  }, []);

  const handleEdit = useCallback((record: RuleEngineRow) => {
    console.log('Edit rule:', record);
    // TODO: 实现编辑功能
  }, []);

  const handleCopy = useCallback((record: RuleEngineRow) => {
    console.log('Copy rule:', record);
    // TODO: 实现复制功能
  }, []);

  // 采用 release-center 的 useEffect 模式
  useEffect(() => {
    // 当引擎切换时，重置搜索过滤器
    setSearchFilters({
      ruleType: '',
      status: '',
      ruleName: ''
    });
    setCurrentPage(1);
  }, [selectedEngine]);

  useEffect(() => {
    fetchRules();
  }, [searchFilters, currentPage, pageSize, selectedEngine, fetchRules]);

  // 列配置
  const columns = createRuleEngineTableColumns(
    ruleEnginesT, // 使用 rule-engines 翻译函数
    commonT,
    handleView,
    handleEdit,
    handleCopy
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{ruleEnginesT('title')}</h1>
              <p className="text-gray-600 mt-2">{ruleEnginesT('subtitle')}</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-add-line mr-2"></i>
              {commonT('buttons.create')} {ruleEnginesT('buttons.newRule')}
            </button>
          </div>

          {/* Engine Type Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setSelectedEngine('tax')}
              className={`px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedEngine === 'tax'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {ruleEnginesT('tabs.invoiceEngine')}
            </button>
            <button
              onClick={() => setSelectedEngine('invoice')}
              className={`px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedEngine === 'invoice'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {ruleEnginesT('tabs.taxEngine')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={ruleEnginesT('stats.activeRules')}
            value={selectedEngine === 'tax' ? '89' : '156'}
            change="+7"
            changeType="increase"
            icon="ri-settings-3-line"
            color="blue"
          />
          <StatCard
            title={ruleEnginesT('stats.validationPassed')}
            value={selectedEngine === 'tax' ? '156' : '198'}
            change="+12"
            changeType="increase"
            icon="ri-check-line"
            color="green"
          />
          <StatCard
            title={ruleEnginesT('stats.errorCount')}
            value={selectedEngine === 'tax' ? '198' : '342'}
            change="-15"
            changeType="decrease"
            icon="ri-close-line"
            color="red"
          />
          <StatCard
            title={ruleEnginesT('stats.fieldCoverage')}
            value={selectedEngine === 'tax' ? '342' : '425'}
            change="+28"
            changeType="increase"
            icon="ri-database-line"
            color="orange"
          />
        </div>

        {/* 引擎数据表格 */}
        {selectedEngine === 'tax' && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{ruleEnginesT('sections.invoiceEngineRules')} ({totalRecords})</h3>
              <p className="text-gray-600 mt-1">{ruleEnginesT('sections.invoiceRulesSubtitle')}</p>
            </div>

            <DataTable
              dataSource={currentRules}
              columns={columns}
              rowKey="id"
              loading={{
                loading: recordsLoading,
                tip: commonT('buttons.loading')
              }}
              toolbar={{
                showSearch: true,
                showFilter: true,
                showColumnToggle: true,
                showExport: true,
                showRefresh: true,
                searchPlaceholder: releaseCenterT('search.placeholder'),
                searchFields: ['ruleCode', 'ruleName'],
                initialFilters: {
                  ruleType: searchFilters.ruleType || undefined,
                  status: searchFilters.status || undefined,
                  search: searchFilters.ruleName || undefined,
                },
                filterFields: [
                  {
                    key: 'ruleType',
                    label: commonT('filters.ruleType'),
                    type: 'select',
                    options: getRuleTypeOptions(releaseCenterT).filter(option => option.value !== '').map(option => ({
                      label: option.label,
                      value: option.value
                    })),
                    placeholder: releaseCenterT('ruleTypes.all')
                  }
                ],
                customActions: []
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
              onRefresh={fetchRules}
              onFilter={handleTableFilter}
              disableClientSideFiltering={true}
              size="middle"
              bordered={false}
              striped={true}
            />
          </div>
        )}

        {selectedEngine === 'invoice' && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{ruleEnginesT('sections.taxEngineRules')} ({totalRecords})</h3>
              <p className="text-gray-600 mt-1">{ruleEnginesT('sections.taxRulesSubtitle')}</p>
            </div>

            <DataTable
              dataSource={currentRules}
              columns={columns}
              rowKey="id"
              loading={{
                loading: recordsLoading,
                tip: commonT('buttons.loading')
              }}
              toolbar={{
                showSearch: true,
                showFilter: true,
                showColumnToggle: true,
                showExport: true,
                showRefresh: true,
                searchPlaceholder: releaseCenterT('search.placeholder'),
                searchFields: ['ruleCode', 'ruleName'],
                initialFilters: {
                  ruleType: searchFilters.ruleType || undefined,
                  status: searchFilters.status || undefined,
                  search: searchFilters.ruleName || undefined,
                },
                filterFields: [
                  {
                    key: 'ruleType',
                    label: commonT('filters.ruleType'),
                    type: 'select',
                    options: getRuleTypeOptions(releaseCenterT).filter(option => option.value !== '').map(option => ({
                      label: option.label,
                      value: option.value
                    })),
                    placeholder: releaseCenterT('ruleTypes.all')
                  }
                ],
                customActions: []
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
              onRefresh={fetchRules}
              onFilter={handleTableFilter}
              disableClientSideFiltering={true}
              size="middle"
              bordered={false}
              striped={true}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <i className="ri-error-warning-line text-red-600 text-xl"></i>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">{commonT('table.loading')} {ruleEnginesT('messages.loadingFailed')}</h3>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => fetchRules()}
                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    <i className="ri-refresh-line mr-1"></i>
                    {commonT('buttons.refresh')}
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    {commonT('buttons.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{ruleEnginesT('quickActions.title')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href={selectedEngine === 'tax' ? '/tax-rules' : '/invoice-rules'} className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-settings-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ruleEnginesT('quickActions.ruleConfiguration')}</p>
                  <p className="text-sm text-gray-600">{ruleEnginesT('quickActions.ruleConfigurationDesc')}</p>
                </div>
              </Link>

              <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer text-left">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-play-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ruleEnginesT('quickActions.batchTesting')}</p>
                  <p className="text-sm text-gray-600">{ruleEnginesT('quickActions.batchTestingDesc')}</p>
                </div>
              </button>

              <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer text-left">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-download-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ruleEnginesT('quickActions.exportRules')}</p>
                  <p className="text-sm text-gray-600">{ruleEnginesT('quickActions.exportRulesDesc')}</p>
                </div>
              </button>

              <button className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer text-left">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-upload-line text-white"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ruleEnginesT('quickActions.importRules')}</p>
                  <p className="text-sm text-gray-600">{ruleEnginesT('quickActions.importRulesDesc')}</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{ruleEnginesT('engineStatus.title')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedEngine === 'tax' ? ruleEnginesT('engineStatus.taxRulesEngine') : ruleEnginesT('engineStatus.invoiceValidationEngine')}
                    </p>
                    <p className="text-sm text-gray-600">{ruleEnginesT('engineStatus.runningNormally')}</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">99.9%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">{ruleEnginesT('engineStatus.apiCalls')}</p>
                    <p className="text-sm text-gray-600">{ruleEnginesT('engineStatus.responseNormal')}</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Avg 120ms</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">{ruleEnginesT('engineStatus.dataSync')}</p>
                    <p className="text-sm text-gray-600">{ruleEnginesT('engineStatus.minorDelay')}</p>
                  </div>
                </div>
                <span className="text-sm text-yellow-600">2 {ruleEnginesT('messages.minutesAgo')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}