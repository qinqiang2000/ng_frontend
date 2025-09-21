'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import DataTable from '@/client/components/ui/DataTable/DataTable';
import { createAuditedRequestTableColumns } from '@/client/components/ui/DataTable/AuditedRequestTableConfig';
import { useState, useEffect, useCallback } from 'react';
import { useAuditedRequestsTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';
import {
  fetchBillAuditStatusStats,
  fetchBillsSearch,
  BillSearchQuery,
  Bill,
  submitBillsForAudit,
  BillAuditStatusStats
} from '@/client/services/invoiceRequestService';
import { fetchRulesInGroup } from '@/client/services/ruleGroupService';
import { useRouter } from 'next/navigation';

export default function AuditedRequestsPage() {
  const router = useRouter();
  const { t } = useAuditedRequestsTranslation();
  const { t: commonT } = useCommonTranslation();

  // Initialize state with defaults first, then hydrate from localStorage
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [isHydrated, setIsHydrated] = useState(false);
  // Removed hourlyData state - not needed
  const [statusStats, setStatusStats] = useState<BillAuditStatusStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed chartError state - not needed

  // New state for audited request list (bills)
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Selection state for checkboxes (bill IDs are numbers)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Search state
  const [billNoSearch, setBillNoSearch] = useState('');


  // Date range calculation functions
  const getDateRange = (range: string): { startTime: string; endTime: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
        break;
      case 'week':
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(today);
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
    }

    // Format dates to backend expected format: 2025-07-23T16:00:00.000+00:00
    const formatToBackendTime = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

      // Get timezone offset in format +/-HH:MM
      const timezoneOffset = -date.getTimezoneOffset();
      const offsetHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
      const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
    };

    return {
      startTime: formatToBackendTime(startDate),
      endTime: formatToBackendTime(endDate)
    };
  };

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error'>('success');

  // Load audited request data (bills)
  const loadAuditedRequests = useCallback(async () => {
    setListLoading(true);
    setListError(null);

    try {
      const dateRangeFilter = getDateRange(dateRange);

      const query: BillSearchQuery = {
        pageNum: currentPage,
        pageSize: pageSize,
        startTime: dateRangeFilter.startTime,
        endTime: dateRangeFilter.endTime,
        ...(selectedStatus !== 'all' && { status: parseInt(selectedStatus) }),
        // Use billNo for the search API
        ...(billNoSearch && { billNo: billNoSearch }),
      };

      const response = await fetchBillsSearch(query);

      setBills(response.data);
      setTotalRecords(response.totalElement);
      setListError(null);
    } catch (error) {
      console.error('Error loading audited requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load audited requests';
      setListError(`API Error: ${errorMessage}`);
      setBills([]);
      setTotalRecords(0);
    } finally {
      setListLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus, dateRange, billNoSearch]);

  // Load data from APIs
  const loadData = async () => {
    setLoading(true);

    // Fetch statistics data
    try {
      const data = await fetchBillAuditStatusStats('050');
      setStatusStats(data);
    } catch (err) {
      console.error('Error loading bill audit statistics:', err);
      // Set empty stats when API fails, all counts will be 0 due to our null coalescing
      setStatusStats({
        PENDING: { count: 0 },
        IN_PROGRESS: { count: 0 },
        APPROVED: { count: 0 },
        REJECTED: { count: 0 }
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Hydrate from localStorage on client side only
  useEffect(() => {
    const savedStatus = localStorage.getItem('auditedRequests_status');
    const savedDateRange = localStorage.getItem('auditedRequests_dateRange');

    if (savedStatus && savedStatus !== 'all') {
      setSelectedStatus(savedStatus);
    }
    if (savedDateRange && savedDateRange !== 'month') {
      setDateRange(savedDateRange);
    }
    setIsHydrated(true);
  }, [loadAuditedRequests]);


  // Save selectedStatus to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auditedRequests_status', selectedStatus);
    }
  }, [selectedStatus]);

  // Save dateRange to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auditedRequests_dateRange', dateRange);
    }
  }, [dateRange]);

  // Load audited requests when filters change, but only after hydration
  useEffect(() => {
    if (isHydrated) {
      loadAuditedRequests();
    }
  }, [currentPage, pageSize, selectedStatus, dateRange, billNoSearch, loadAuditedRequests, isHydrated]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Clear selections when changing pages
    setSelectedIds([]);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setSelectedIds([]); // Clear selections
  };



  // Submit bills for audit function
  const handleSubmitBills = async (ids: number[]) => {
    if (ids.length === 0) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await submitBillsForAudit(ids);

      if (response.success && response.data) {
        const { successCount, failedBills } = response.data;
        const failedCount = failedBills ? failedBills.length : 0;

        if (failedCount > 0) {
          const failedInfo = failedBills.map(bill => `ID:${bill.billId}(${bill.reason})`).join(', ');
          setSubmitMessage(t('messages.failedSubmit', { successCount, failedCount, failedInfo }));
          setSubmitMessageType('error');
        } else {
          setSubmitMessage(t('messages.successSubmit', { count: successCount }));
          setSubmitMessageType('success');
        }

        // Clear selections and refresh data
        setSelectedIds([]);
        loadAuditedRequests();
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage(error instanceof Error ? error.message : t('messages.submitError'));
      setSubmitMessageType('error');
    } finally {
      setIsSubmitting(false);

      // Clear message after 5 seconds
      setTimeout(() => setSubmitMessage(null), 5000);
    }
  };

  // Batch submit handler
  const handleBatchSubmit = () => {
    handleSubmitBills(selectedIds);
  };

  // Single submit handler
  const handleSingleSubmit = (id: number) => {
    handleSubmitBills([id]);
  };

  // Handle DataTable filter changes and save to localStorage
  const handleTableFilter = (filters: Record<string, any>) => {
    // Extract filter values with fallbacks
    const newStatus = filters.status || 'all';
    const newRange = filters.dateRange || 'month';
    const newSearchTerm = filters.search || '';

    // Update all state variables
    setSelectedStatus(newStatus);
    setDateRange(newRange);
    setBillNoSearch(newSearchTerm);

    // Reset to first page when searching or filtering
    if (newSearchTerm !== billNoSearch || newStatus !== selectedStatus || newRange !== dateRange) {
      setCurrentPage(1);
    }

    // Update localStorage
    if (typeof window !== 'undefined') {
      if (newStatus === 'all') {
        localStorage.removeItem('auditedRequests_status');
      } else {
        localStorage.setItem('auditedRequests_status', newStatus);
      }

      if (newRange === 'month') {
        localStorage.removeItem('auditedRequests_dateRange');
      } else {
        localStorage.setItem('auditedRequests_dateRange', newRange);
      }
    }
  };


  // Handle Rule Groups click navigation
  const handleRuleGroupsClick = async (bill: Bill) => {
    if (!bill.fauditRuleGroupCodes) return;

    try {
      // Extract first rule group code (comma-separated)
      const firstRuleGroupCode = bill.fauditRuleGroupCodes.split(',')[0].trim();

      // Fetch rules in the group to get the first rule ID
      const rulesInGroup = await fetchRulesInGroup(firstRuleGroupCode);

      if (rulesInGroup.length > 0) {
        const firstRuleId = rulesInGroup[0].id;

        // Build URL parameters
        const params = new URLSearchParams();
        if (bill.country) {
          params.append('country', bill.country);
        }
        params.append('ruleCodes', bill.fauditRuleGroupCodes);

        // Navigate to audited-rules/{firstRuleId}
        router.push(`/audited-rules/${firstRuleId}?${params.toString()}`);
      } else {
        console.warn('No rules found in group:', firstRuleGroupCode);
      }
    } catch (error) {
      console.error('Error navigating to rule group details:', error);
    }
  };



  const statusOptions = [
    { value: 'all', label: t('statusOptions.allStatus') },
    { value: '1', label: t('statusOptions.pending') },
    { value: '2', label: t('statusOptions.inProgress') },
    { value: '3', label: t('statusOptions.approved') },
    { value: '4', label: t('statusOptions.rejected') }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
    <Header />

    <main className="px-6 py-8">
    {/* Page Header */}
    <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('pageSubtitle')}</p>

        </div>
        <div className="flex space-x-2">
            <button
            onClick={loadData}
            disabled={loading}
            title={t('tooltips.refreshStats')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer text-sm"
            >
            <i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`}></i>
            <span className="hidden sm:inline">{t('buttons.refreshStats')}</span>
            </button>
            <button
            title={t('tooltips.exportReport')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-download-line mr-2"></i>
            <span className="hidden sm:inline">{t('buttons.exportReport')}</span>
            </button>
        </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
            title={t('stats.pending')}
            value={loading ? "-" : (statusStats?.PENDING?.count ?? 0).toLocaleString()}
            icon="ri-time-line"
            color="orange"
        />
        <StatCard
            title={t('stats.inProgress')}
            value={loading ? "-" : (statusStats?.IN_PROGRESS?.count ?? 0).toLocaleString()}
            icon="ri-loader-4-line"
            color="blue"
        />
        <StatCard
            title={t('stats.approved')}
            value={loading ? "-" : (statusStats?.APPROVED?.count ?? 0).toLocaleString()}
            icon="ri-check-line"
            color="green"
        />
        <StatCard
            title={t('stats.rejected')}
            value={loading ? "-" : (statusStats?.REJECTED?.count ?? 0).toLocaleString()}
            icon="ri-error-warning-line"
            color="red"
        />
        </div>
    </div>


    {/* Results Table */}
    <div className="mb-6">
        <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('table.title')}</h3>
        {listError && (
            <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 text-orange-800 text-sm">
                <i className="ri-information-line"></i>
                <span>{listError}</span>
            </div>
            </div>
        )}
        {submitMessage && (
            <div className={`mt-2 p-2 rounded-lg border ${
            submitMessageType === 'success'
                ? 'bg-green-100 border-green-200'
                : 'bg-red-100 border-red-200'
            }`}>
            <div className={`flex items-center space-x-2 text-sm ${
                submitMessageType === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
                <i className={`${submitMessageType === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}`}></i>
                <span>{submitMessage}</span>
            </div>
            </div>
        )}
        </div>

        <DataTable
        // key={`${selectedStatus}-${dateRange}`} // Removed: this was causing filter state to reset
        dataSource={bills}
        columns={createAuditedRequestTableColumns(t, handleRuleGroupsClick, handleSingleSubmit, isSubmitting)}
        rowKey="id"
        loading={{
            loading: listLoading,
            tip: t('messages.loading')
        }}
        toolbar={{
            showSearch: true,
            showFilter: true,
            showColumnToggle: true,
            showExport: true,
            showRefresh: true,
            searchPlaceholder: t('filters.searchPlaceholder'),
            searchFields: ['billNo'],
            initialFilters: isHydrated ? {
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                dateRange: dateRange !== 'month' ? dateRange : undefined,
                search: billNoSearch || undefined
            } : {},
            filterFields: [
            {
                key: 'status',
                label: commonT('filters.statusFilter'),
                type: 'select',
                options: statusOptions.map(option => ({
                label: option.label,
                value: option.value
                })),
                placeholder: selectedStatus === 'all' ? t('statusOptions.allStatus') : statusOptions.find(opt => opt.value === selectedStatus)?.label
            },
            {
                key: 'dateRange',
                label: commonT('filters.timeRange'),
                type: 'select',
                options: [
                { label: t('timeOptions.today'), value: 'today' },
                { label: t('timeOptions.week'), value: 'week' },
                { label: t('timeOptions.month'), value: 'month' },
                { label: t('timeOptions.quarter'), value: 'quarter' }
                ],
                placeholder: dateRange === 'month' ? t('timeOptions.month') :
                  dateRange === 'today' ? t('timeOptions.today') :
                  dateRange === 'week' ? t('timeOptions.week') :
                  dateRange === 'quarter' ? t('timeOptions.quarter') : t('timeOptions.month')
            }
            ],
            customActions: [
            <button
                key="batch-submit"
                onClick={handleBatchSubmit}
                disabled={selectedIds.length === 0 || isSubmitting}
                title={t('tooltips.submitForAudit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedIds.length > 0 && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                <i className={`${isSubmitting ? 'ri-loader-4-line animate-spin' : 'ri-file-paper-line'} mr-2`}></i>
                <span className="hidden sm:inline">
                    {isSubmitting ? t('buttons.submitting') : t('buttons.submitForAudit')}
                </span>
                <span className="sm:hidden">
                    ({selectedIds.length})
                </span>
                <span className="hidden sm:inline">
                    {!isSubmitting && ` (${selectedIds.length})`}
                </span>
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
            setSelectedIds([]); // Clear selections when changing pages
            },
            pageSizeOptions: ['10', '20', '50', '100', '200', '500']
        }}
        rowSelection={{
            enabled: true,
            type: 'checkbox',
            selectedRowKeys: selectedIds,
            onChange: (selectedKeys) => {
            setSelectedIds(selectedKeys.map(key => Number(key)));
            },
            getCheckboxProps: (record: Bill) => ({
            disabled: record.status === 3 // Disable selection for approved items
            })
        }}
        onRefresh={loadAuditedRequests}
        onFilter={handleTableFilter}
        disableClientSideFiltering={true}
        size="middle"
        bordered={false}
        striped={true}
        t={t}
        />
    </div>

    </main>
    </div>
  );
}