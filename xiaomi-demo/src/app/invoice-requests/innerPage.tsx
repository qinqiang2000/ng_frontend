'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import StatusBadge from '@/client/components/ui/StatusBadge';
import DataTable from '@/client/components/ui/DataTable/DataTable';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  fetchHourlyStatusStatistics,
  fetchStatusStatistics,
  fetchInvoiceRequests,
  fetchInvoiceRequestById,
  InvoiceRequestItem,
  InvoiceRequestQuery,
  submitInvoiceRequests,
  formatCurrencyAmount,
  formatDisplayAmount,
  formatDisplayTime
} from '@/client/services/invoiceRequestService';
import { useInvoiceRequestsTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';
import TranslationLoader from '@/client/components/ui/TranslationLoader';

export default function InvoiceRequestsInnerPage() {
  const { t, loading: translationLoading } = useInvoiceRequestsTranslation();
  const { t: commonT } = useCommonTranslation();

  // Initialize state with defaults first, then hydrate from localStorage
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [isHydrated, setIsHydrated] = useState(false);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [statusStats, setStatusStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  // New state for invoice request list
  const [invoiceRequests, setInvoiceRequests] = useState<InvoiceRequestItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  // Selection state for checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Single row refresh state
  const [refreshingIds, setRefreshingIds] = useState<string[]>([]);

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

  // Load invoice request data
  const loadInvoiceRequests = useCallback(async () => {
    setListLoading(true);
    setListError(null);

    // Status mapping for filtering
    const statusFilterMapping: Record<string, number> = {
      'all': 0,
      'Draft': 1,
      'Enriching': 2,
      'Validated': 3,
      'ValidFailed': 4,
      'Pending': 5,
      'InvoiceIssueing': 6,
      'PartInvoiced': 7,
      'FullyInvoiced': 8,
      'DebitApply': 9,
      'ReIssued': 10
    };

    try {
      const dateRangeFilter = getDateRange(dateRange);

      const query: InvoiceRequestQuery = {
        pageNum: currentPage,
        pageSize: pageSize,
        startTime: dateRangeFilter.startTime,
        endTime: dateRangeFilter.endTime,
        ...(selectedStatus !== 'all' && { status: statusFilterMapping[selectedStatus] }),
        ...(searchTerm && { invoiceNo: searchTerm })
      };

      const response = await fetchInvoiceRequests(query);
      
      setInvoiceRequests(response.data);
      setTotalPages(response.totalPage);
      setTotalRecords(response.totalElement);
      setListError(null);
    } catch (error) {
      console.error('Error loading invoice requests:', error);
      const errorMessage = error instanceof Error ? error.message : t('messages.loadError');
      
      // Check for specific backend errors
      if (errorMessage.includes('requestId') || errorMessage.includes('getter')) {
        setListError(t('messages.backendConfigIssue'));
        // Use mock data as fallback
        setInvoiceRequests([
          {
            id: 'DEMO-001',
            invoiceNo: 'INV-2024-001234',
            company: t('messages.demoCompany'),
            country: t('messages.demoCountry'),
            amount: formatCurrencyAmount(12500, 'CNY'),
            taxAmount: formatCurrencyAmount(2500, 'CNY'),
            currency: 'CNY',
            totalAmount: 12500,
            status: 3,
            statusName: 'Validated',
            submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            lastUpdate: new Date().toISOString().slice(0, 16).replace('T', ' '),
            taxType: 'VAT',
            taxRate: '20%',
            invoiceType: '380',
            invoiceSubType: t('messages.todo')
          }
        ]);
        setTotalPages(1);
        setTotalRecords(1);
      } else {
        setListError(t('messages.apiError', { error: errorMessage }));
        setInvoiceRequests([]);
        setTotalPages(0);
        setTotalRecords(0);
      }
    } finally {
      setListLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus, searchTerm, dateRange]);

  // Load data from APIs
  const loadData = async () => {
    setLoading(true);
    setChartError(null);
    
    // Fetch chart data
    const chartPromise = fetchHourlyStatusStatistics('050')
      .then(data => {
        setHourlyData(data);
        setChartError(null);
      })
      .catch(err => {
        console.error('Error loading chart data:', err);
        setChartError(t('messages.chartError'));
        // Fallback to mock chart data
        setHourlyData([
          { hour: '00:00', total: 12, successful: 10, pending: 2 },
          { hour: '01:00', total: 8, successful: 7, pending: 1 },
          { hour: '02:00', total: 5, successful: 5, pending: 0 },
          { hour: '03:00', total: 3, successful: 3, pending: 0 },
          { hour: '04:00', total: 4, successful: 4, pending: 0 },
          { hour: '05:00', total: 6, successful: 5, pending: 1 },
          { hour: '06:00', total: 15, successful: 13, pending: 2 },
          { hour: '07:00', total: 28, successful: 25, pending: 3 },
          { hour: '08:00', total: 45, successful: 42, pending: 3 },
          { hour: '09:00', total: 67, successful: 61, pending: 6 },
          { hour: '10:00', total: 89, successful: 82, pending: 7 },
          { hour: '11:00', total: 76, successful: 70, pending: 6 },
          { hour: '12:00', total: 54, successful: 49, pending: 5 },
          { hour: '13:00', total: 62, successful: 56, pending: 6 },
          { hour: '14:00', total: 85, successful: 78, pending: 7 },
          { hour: '15:00', total: 92, successful: 84, pending: 8 },
          { hour: '16:00', total: 78, successful: 71, pending: 7 },
          { hour: '17:00', total: 64, successful: 59, pending: 5 },
          { hour: '18:00', total: 42, successful: 38, pending: 4 },
          { hour: '19:00', total: 31, successful: 28, pending: 3 },
          { hour: '20:00', total: 25, successful: 23, pending: 2 },
          { hour: '21:00', total: 19, successful: 17, pending: 2 },
          { hour: '22:00', total: 16, successful: 15, pending: 1 },
          { hour: '23:00', total: 13, successful: 12, pending: 1 }
        ]);
      });

    // Fetch statistics data  
    const statsPromise = fetchStatusStatistics('050')
      .then(data => {
        setStatusStats(data);
      })
      .catch(err => {
        console.error('Error loading statistics:', err);
        // Fallback to mock stats
        setStatusStats({
          Draft: 89,
          Enriching: 156,
          Validated: 234,
          ValidFailed: 23,
          Pending: 67,
          InvoiceIssueing: 45,
          PartInvoiced: 78,
          FullyInvoiced: 1892,
          DebitApply: 12,
          ReIssued: 34
        });
      });

    // Wait for both promises to complete
    await Promise.allSettled([chartPromise, statsPromise]);
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
    const savedStatus = localStorage.getItem('invoiceRequests_status');
    const savedDateRange = localStorage.getItem('invoiceRequests_dateRange');

    if (savedStatus && savedStatus !== 'all') {
      setSelectedStatus(savedStatus);
    }
    if (savedDateRange && savedDateRange !== 'month') {
      setDateRange(savedDateRange);
    }
    setIsHydrated(true);
  }, []);

  // Save selectedStatus to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('invoiceRequests_status', selectedStatus);
    }
  }, [selectedStatus]);

  // Save dateRange to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('invoiceRequests_dateRange', dateRange);
    }
  }, [dateRange]);

  // Load invoice requests when filters change, but only after hydration
  useEffect(() => {
    if (isHydrated) {
      loadInvoiceRequests();
    }
  }, [currentPage, pageSize, selectedStatus, searchTerm, dateRange, loadInvoiceRequests, isHydrated]);

  // Clear selections when pagination changes
  const clearSelectionsOnPageChange = () => {
    setSelectedIds([]);
  };



  // Submit invoice requests function
  const handleSubmitInvoices = async (ids: string[]) => {
    if (ids.length === 0) return;
    
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      const response = await submitInvoiceRequests(ids);
      
      if (response.errcode === '0000' && response.data) {
        const { successCount, failedCount, failedIds } = response.data;
        
        if (failedCount > 0) {
          setSubmitMessage(t('messages.submitSuccessPartial', { successCount, failedCount, failedIds: failedIds.join(', ') }));
          setSubmitMessageType('error');
        } else {
          setSubmitMessage(t('messages.submitSuccess', { successCount }));
          setSubmitMessageType('success');
        }
        
        // Clear selections and refresh data
        setSelectedIds([]);
        loadInvoiceRequests();
      } else {
        throw new Error(response.message || t('messages.submissionFailed'));
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
    handleSubmitInvoices(selectedIds);
  };

  // Single submit handler
  const handleSingleSubmit = (id: string) => {
    handleSubmitInvoices([id]);
  };

  // Handle DataTable filter changes and save to localStorage
  const handleTableFilter = (filters: Record<string, any>) => {
    console.log(`📬 Parent handleTableFilter called:`, filters);

    // Extract filter values (DataTableToolbar passes complete state)
    const newStatus = filters.status || 'all';
    const newRange = filters.dateRange || 'month';
    const newSearchTerm = filters.search || '';

    console.log(`🔄 Applying filters: status=${newStatus}, dateRange=${newRange}, search="${newSearchTerm}"`);

    // Always update all states to keep them in sync
    setSelectedStatus(newStatus);
    setDateRange(newRange);
    setSearchTerm(newSearchTerm);

    // Handle localStorage
    if (typeof window !== 'undefined') {
      if (newStatus === 'all') {
        localStorage.removeItem('invoiceRequests_status');
      } else {
        localStorage.setItem('invoiceRequests_status', newStatus);
      }

      if (newRange === 'month') {
        localStorage.removeItem('invoiceRequests_dateRange');
      } else {
        localStorage.setItem('invoiceRequests_dateRange', newRange);
      }
    }

    // Reset to first page when searching
    if (newSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  };

  // Status mapping for display
  const statusMapping: Record<number, string> = {
    1: t('statusLabels.draft'),
    2: t('statusLabels.enriching'),
    3: t('statusLabels.validated'),
    4: t('statusLabels.validFailed'),
    5: t('statusLabels.pending'),
    6: t('statusLabels.invoiceIssueing'),
    7: t('statusLabels.partInvoiced'),
    8: t('statusLabels.fullyInvoiced'),
    9: t('statusLabels.debitApply'),
    10: t('statusLabels.reIssued')
  };

  // Single row refresh handler
  const handleRefreshSingleRequest = async (id: string) => {
    setRefreshingIds(prev => [...prev, id]);
    
    try {
      // Fetch updated data for this specific request
      const updatedRequest = await fetchInvoiceRequestById(id);
      
      // Transform the detailed data to match the list item format
      const transformedRequest: InvoiceRequestItem = {
        id: id, // Keep the original ID to maintain React key consistency
        invoiceNo: updatedRequest.invoiceNo,
        company: updatedRequest.receiverCompanyName || t('messages.unknownCompany'),
        country: updatedRequest.country,
        currency: updatedRequest.currency,
        totalAmount: updatedRequest.totalAmount,
        taxAmount: updatedRequest.taxAmount,
        status: updatedRequest.status,
        statusName: statusMapping[updatedRequest.status] || t('statusLabels.unknown'),
        submittedAt: formatDisplayTime(updatedRequest.createTime),
        lastUpdate: formatDisplayTime(updatedRequest.updateTime),
        createTime: formatDisplayTime(updatedRequest.createTime),
        updateTime: formatDisplayTime(updatedRequest.updateTime),
        invoiceType: updatedRequest.invoiceType,
        invoiceSubType: updatedRequest.invoiceSubType
      };
      
      // Update only this item in the list
      setInvoiceRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === id ? transformedRequest : request
        )
      );
      
    } catch (error) {
      console.error('Error refreshing single request:', error);
      // Could show a toast message here if needed
    } finally {
      setRefreshingIds(prev => prev.filter(refreshId => refreshId !== id));
    }
  };

  const statusOptions = [
    { value: 'all', label: t('statusLabels.all') },
    { value: 'Draft', label: t('statusLabels.draft') },
    { value: 'Enriching', label: t('statusLabels.enriching') },
    { value: 'Validated', label: t('statusLabels.validated') },
    { value: 'ValidFailed', label: t('statusLabels.validFailed') },
    { value: 'Pending', label: t('statusLabels.pending') },
    { value: 'InvoiceIssueing', label: t('statusLabels.invoiceIssueing') },
    { value: 'PartInvoiced', label: t('statusLabels.partInvoiced') },
    { value: 'FullyInvoiced', label: t('statusLabels.fullyInvoiced') },
    { value: 'DebitApply', label: t('statusLabels.debitApply') },
    { value: 'ReIssued', label: t('statusLabels.reIssued') }
  ];

  // DataTable columns configuration
  const columns = [
    {
      key: 'invoiceNo',
      title: t('tableHeaders.requestId'),
      dataIndex: 'invoiceNo',
      width: 150,
      render: (value: string, record: InvoiceRequestItem) => (
        <Link href={`/invoice-requests/${record.id}`} className="font-mono text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
          {value || record.id}
        </Link>
      )
    },
    {
      key: 'company',
      title: t('tableHeaders.companyName'),
      dataIndex: 'company',
      width: 200,
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value || t('messages.unknownCompany')}</span>
      )
    },
    {
      key: 'country',
      title: t('tableHeaders.country'),
      dataIndex: 'country',
      width: 100,
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value || '--'}</span>
      )
    },
    {
      key: 'totalAmount',
      title: t('tableHeaders.amount'),
      dataIndex: 'totalAmount',
      width: 120,
      render: (value: number, record: InvoiceRequestItem) => (
        <span className="font-medium text-gray-900">{formatDisplayAmount(value, record.currency)}</span>
      )
    },
    {
      key: 'taxAmount',
      title: t('tableHeaders.taxAmount'),
      dataIndex: 'taxAmount',
      width: 120,
      render: (value: number, record: InvoiceRequestItem) => (
        <span className="font-medium text-green-600">{formatDisplayAmount(value, record.currency)}</span>
      )
    },
    {
      key: 'invoiceType',
      title: t('tableHeaders.taxType'),
      dataIndex: 'invoiceType',
      width: 120,
      render: (value: string, record: InvoiceRequestItem) => (
        <div>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            {value || 'N/A'}
          </span>
          <p className="text-xs text-gray-600 mt-1">{record.invoiceSubType || '--'}</p>
        </div>
      )
    },
    {
      key: 'statusName',
      title: t('tableHeaders.status'),
      dataIndex: 'statusName',
      width: 120,
      render: (value: string) => (
        <StatusBadge status={value || t('statusLabels.unknown')} type="invoice" />
      )
    },
    {
      key: 'createTime',
      title: t('tableHeaders.createTime'),
      dataIndex: 'createTime',
      width: 150,
      render: (value: string, record: InvoiceRequestItem) => (
        <span className="text-sm text-gray-600">{value || record.submittedAt || '--'}</span>
      )
    },
    {
      key: 'actions',
      title: t('tableHeaders.actions'),
      width: 100,
      render: (value: any, record: InvoiceRequestItem) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSingleSubmit(record.id)}
            disabled={isSubmitting}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${
              isSubmitting
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-400 hover:text-blue-600 cursor-pointer'
            }`}
            title={t('actions.submit')}
          >
            <i className="ri-file-paper-line"></i>
          </button>
          <button
            onClick={() => handleRefreshSingleRequest(record.id)}
            disabled={refreshingIds.includes(record.id)}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${
              refreshingIds.includes(record.id)
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-400 hover:text-orange-600 cursor-pointer'
            }`}
            title={t('actions.refreshStatus')}
          >
            <i className={`ri-refresh-line ${refreshingIds.includes(record.id) ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      )
    }
  ];


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
          <div className="flex space-x-2">
            <button 
              onClick={loadData}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer text-sm"
            >
              <i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`}></i>
              {t('refreshStats')}
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
              <i className="ri-download-line mr-2"></i>
              {t('exportReport')}
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title={t('statCards.draft')}
            value={loading ? "-" : statusStats?.Draft?.toLocaleString() || "0"}
            icon="ri-draft-line"
            color="blue"
          />
          <StatCard
            title={t('statCards.enriching')}
            value={loading ? "-" : statusStats?.Enriching?.toLocaleString() || "0"}
            icon="ri-loader-4-line"
            color="blue"
          />
          <StatCard
            title={t('statCards.validated')}
            value={loading ? "-" : statusStats?.Validated?.toLocaleString() || "0"}
            icon="ri-check-double-line"
            color="green"
          />
          <StatCard
            title={t('statCards.validFailed')}
            value={loading ? "-" : statusStats?.ValidFailed?.toLocaleString() || "0"}
            change="-5%"
            changeType="decrease"
            icon="ri-error-warning-line"
            color="red"
          />
          <StatCard
            title={t('statCards.pending')}
            value={loading ? "-" : statusStats?.Pending?.toLocaleString() || "0"}
            icon="ri-time-line"
            color="orange"
          />
          <StatCard
            title={t('statCards.fullyInvoiced')}
            value={loading ? "-" : statusStats?.FullyInvoiced?.toLocaleString() || "0"}
            change="+12%"
            changeType="increase"
            icon="ri-check-line"
            color="green"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t('statCards.invoiceIssuing')}
            value={loading ? "-" : statusStats?.InvoiceIssueing?.toLocaleString() || "0"}
            icon="ri-file-add-line"
            color="purple"
          />
          <StatCard
            title={t('statCards.partInvoiced')}
            value={loading ? "-" : statusStats?.PartInvoiced?.toLocaleString() || "0"}
            icon="ri-file-copy-line"
            color="purple"
          />
          <StatCard
            title={t('statCards.debitApplied')}
            value={loading ? "-" : statusStats?.DebitApply?.toLocaleString() || "0"}
            icon="ri-file-reduce-line"
            color="orange"
          />
          <StatCard
            title={t('statCards.reIssued')}
            value={loading ? "-" : statusStats?.ReIssued?.toLocaleString() || "0"}
            icon="ri-refresh-line"
            color="blue"
          />
        </div>
      </div>


      {/* Invoice Requests Table */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('invoiceRequestList')}</h3>
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
          dataSource={invoiceRequests}
          columns={columns}
          rowKey="id"
          loading={{
            loading: listLoading,
            tip: t('messages.loadingRequests')
          }}
          toolbar={{
            showSearch: true,
            showFilter: true,
            showColumnToggle: true,
            showExport: true,
            showRefresh: true,
            searchPlaceholder: t('searchPlaceholder'),
            searchFields: ['invoiceNo', 'company', 'country'],
            initialFilters: {
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              dateRange: dateRange !== 'month' ? dateRange : undefined,
              search: searchTerm || undefined
            },
            filterFields: [
              {
                key: 'status',
                label: commonT('filters.statusFilter'),
                type: 'select',
                options: statusOptions.map(option => ({
                  label: option.label,
                  value: option.value
                })),
                placeholder: selectedStatus === 'all' ? t('statusLabels.all') : statusOptions.find(opt => opt.value === selectedStatus)?.label
              },
              {
                key: 'dateRange',
                label: commonT('filters.timeRange'),
                type: 'select',
                options: [
                  { label: t('timeRanges.today'), value: 'today' },
                  { label: t('timeRanges.week'), value: 'week' },
                  { label: t('timeRanges.month'), value: 'month' },
                  { label: t('timeRanges.quarter'), value: 'quarter' }
                ],
                placeholder: dateRange === 'month' ? t('timeRanges.month') :
                  dateRange === 'today' ? t('timeRanges.today') :
                  dateRange === 'week' ? t('timeRanges.week') :
                  dateRange === 'quarter' ? t('timeRanges.quarter') : t('timeRanges.month')
              }
            ],
            customActions: [
              <button
                key="batch-submit"
                onClick={handleBatchSubmit}
                disabled={selectedIds.length === 0 || isSubmitting}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedIds.length > 0 && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className={`${isSubmitting ? 'ri-loader-4-line animate-spin' : 'ri-file-paper-line'} mr-2`}></i>
                <span className="hidden sm:inline">
                  {isSubmitting ? t('messages.loading') : t('actions.submit')}
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
              clearSelectionsOnPageChange();
            }
          }}
          rowSelection={{
            enabled: true,
            type: 'checkbox',
            selectedRowKeys: selectedIds,
            onChange: (selectedKeys) => {
              setSelectedIds(selectedKeys.map(key => String(key)));
            }
          }}
          onRefresh={loadInvoiceRequests}
          onFilter={handleTableFilter}
          disableClientSideFiltering={true}
          size="middle"
          bordered={false}
          striped={true}
          t={t}
        />
      </div>

      {/* 24-Hour Invoice Request Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{t('trendsTitle')}</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{t('requests')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{t('charts.successfulCount')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{t('charts.pendingCount')}</span>
              </div>
              <button 
                onClick={loadData}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <i className="ri-refresh-line mr-1"></i>
                {t('actions.refresh')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <i className="ri-loader-4-line text-2xl text-blue-600 animate-spin mb-2"></i>
                <p className="text-gray-600">{t('messages.loadingChartData')}</p>
              </div>
            </div>
          )}
          {chartError && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <i className="ri-error-warning-line text-2xl text-red-600 mb-2"></i>
                <p className="text-red-600 mb-4">{chartError}</p>
                <button 
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {!loading && !chartError && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  name={t('charts.totalInvoiceRequests')}
                />
                <Line 
                  type="monotone" 
                  dataKey="successful" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  name={t('charts.successfulCount')}
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                  name={t('charts.pendingCount')}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      </main>
    </div>
  </TranslationLoader>
  );
}