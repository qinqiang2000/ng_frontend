'use client';

import Header from '@/client/components/Header';
import StatCard from '@/client/components/ui/StatCard';
import StatusBadge from '@/client/components/ui/StatusBadge';
import PdfViewer from '@/client/components/ui/PdfViewer';
import DataTable from '@/client/components/ui/DataTable/DataTable';
import { createInvoiceResultTableColumns, getInvoiceResultTableConfig } from '@/client/components/ui/DataTable/InvoiceResultTableConfig';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  fetchInvoiceStatusCount,
  InvoiceStatusCount,
  getStatusColor,
  getStatusIcon,
  fetchInvoiceResults,
  InvoiceResultQuery,
  InvoiceResultItem,
  // InvoiceResultResponse,
  getInvoiceResultDateRange,
  formatCurrencyAmount,
  formatDisplayAmount,
  // formatDisplayTime,
  formatDateOnly,
  fetchHourlyFilingStats,
  FilingPerformanceData,
  fetchUSDTotalAmounts,
  USDTotalData,
  formatLargeAmount
} from '@/client/services/invoiceRequestService';
import { useToast } from '@/client/components/ui/ToastContainer';
import { useInvoiceResultsTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';
import TranslationLoader from '@/client/components/ui/TranslationLoader';

export default function InvoiceResultsInnerPage() {
  const { t, loading: translationLoading } = useInvoiceResultsTranslation();
  const { t: commonT } = useCommonTranslation();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('quarter');
  const [searchTerm, setSearchTerm] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [statusCounts, setStatusCounts] = useState<InvoiceStatusCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();
  
  // Invoice results state
  const [invoiceResults, setInvoiceResults] = useState<InvoiceResultItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  // PDF viewer state
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const [currentInvoiceNo, setCurrentInvoiceNo] = useState<string>('');
  
  // Filing performance state
  const [filingPerformanceData, setFilingPerformanceData] = useState<FilingPerformanceData[]>([]);
  const [filingDataLoading, setFilingDataLoading] = useState(true);
  const [filingDataError, setFilingDataError] = useState<string | null>(null);
  
  // USD total amounts state
  const [usdTotalData, setUsdTotalData] = useState<USDTotalData | null>(null);
  const [usdDataLoading, setUsdDataLoading] = useState(true);
  const [usdDataError, setUsdDataError] = useState<string | null>(null);
  

  // Load invoice results data
  const loadInvoiceResults = async () => {
    setListLoading(true);
    setListError(null);

    try {
      const dateRangeFilter = getInvoiceResultDateRange(dateRange);

      const query: InvoiceResultQuery = {
        pageNum: currentPage,
        pageSize: pageSize,
        startTime: dateRangeFilter.startTime,
        endTime: dateRangeFilter.endTime,
        ...(selectedStatus !== 'all' && { status: getStatusNumber(selectedStatus) }),
        ...(searchTerm && { invoiceNo: searchTerm }),
      };

      const response = await fetchInvoiceResults(query);
      
      
      setInvoiceResults(response.data);
      setTotalPages(response.totalPage || 1);
      setTotalRecords(response.totalElement || 0);
      setListError(null);
    } catch (error) {
      console.error('Error loading invoice results:', error);
      const errorMessage = error instanceof Error ? error.message : t('messages.loadError');

      // Check for specific backend errors
      if (errorMessage.includes('requestId') || errorMessage.includes('getter')) {
        setListError(t('messages.backendConfigIssue'));
        // Use mock data as fallback
      setInvoiceResults([
        {
          id: 'DEMO-001',
          invoiceNo: 'INV-2024-001234',
          invoiceType: '380',
          invoiceSubType: 'Standard',
          sendCompanyName: 'TechCorp Limited',
          company: 'TechCorp Limited',
          country: 'United Kingdom',
          totalAmount: 12500,
          taxAmount: 2500,
          currency: 'GBP',
          status: 1,
          issueDate: new Date().toISOString(),
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          pdfurl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
      ]);
      setTotalPages(1);
      setTotalRecords(1);
      } else {
        setListError(t('messages.apiError', { error: errorMessage }));
        setInvoiceResults([]);
        setTotalPages(0);
        setTotalRecords(0);
      }
    } finally {
      setListLoading(false);
    }
  };

  // Get status number from status string
  const getStatusNumber = (status: string): number => {
    const statusMap: Record<string, number> = {
      'InvoiceReady': 1,
      'Reporting': 2,
      'Reported': 3,
      'ReportFailed': 4,
      'Delivering': 5,
      'Delivered': 6,
      'DeliverFailed': 7
    };
    return statusMap[status] || 0;
  };

  // Get status display name from number
  const getStatusDisplayFromNumber = (statusNum?: number): string => {
    const statusMap: Record<number, string> = {
      1: t('statusLabels.invoiceReady'),
      2: t('statusLabels.reporting'),
      3: t('statusLabels.reported'),
      4: t('statusLabels.reportFailed'),
      5: t('statusLabels.delivering'),
      6: t('statusLabels.delivered'),
      7: t('statusLabels.deliverFailed')
    };
    return statusMap[statusNum || 0] || t('statusLabels.unknown');
  };

  // Load filing performance data
  const loadFilingPerformanceData = async () => {
    try {
      setFilingDataLoading(true);
      setFilingDataError(null);
      const data = await fetchHourlyFilingStats();
      setFilingPerformanceData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('messages.filingPerformanceError');
      setFilingDataError(errorMessage);
      
      // Fallback to mock data
      setFilingPerformanceData([
        { time: '08:00', firstSuccess: 145, retrySuccess: 23, failed: 8 },
        { time: '09:00', firstSuccess: 167, retrySuccess: 18, failed: 12 },
        { time: '10:00', firstSuccess: 189, retrySuccess: 25, failed: 6 },
        { time: '11:00', firstSuccess: 203, retrySuccess: 31, failed: 9 },
        { time: '12:00', firstSuccess: 178, retrySuccess: 27, failed: 11 },
        { time: '13:00', firstSuccess: 156, retrySuccess: 22, failed: 7 },
        { time: '14:00', firstSuccess: 198, retrySuccess: 29, failed: 5 },
        { time: '15:00', firstSuccess: 221, retrySuccess: 35, failed: 13 },
        { time: '16:00', firstSuccess: 234, retrySuccess: 28, failed: 8 },
        { time: '17:00', firstSuccess: 189, retrySuccess: 33, failed: 10 },
        { time: '18:00', firstSuccess: 167, retrySuccess: 26, failed: 14 },
        { time: '19:00', firstSuccess: 145, retrySuccess: 19, failed: 6 }
      ]);
    } finally {
      setFilingDataLoading(false);
    }
  };

  // Load USD total amounts data
  const loadUSDTotalData = async () => {
    try {
      setUsdDataLoading(true);
      setUsdDataError(null);
      const data = await fetchUSDTotalAmounts(); // Company ID will be added by proxy
      setUsdTotalData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('messages.usdTotalError');
      setUsdDataError(errorMessage);
      
      // Fallback to mock data
      setUsdTotalData({
        totalUSDAmount: 15750.5,
        totalUSDTaxAmount: 2362.58
      });
    } finally {
      setUsdDataLoading(false);
    }
  };

  // Load status data from API
  useEffect(() => {
    const loadStatusData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInvoiceStatusCount();
        setStatusCounts(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('messages.statusDataError');
        setError(errorMessage);
        
        // Show toast error notification
        showError(
          t('messages.dataLoadingFailed'),
          `Unable to load invoice status statistics: ${errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      await Promise.all([
        loadStatusData(),
        loadFilingPerformanceData(),
        loadUSDTotalData()
      ]);
    };

    loadData();
  }, [showError]);

  // Hydrate from localStorage on client side only
  useEffect(() => {
    const savedStatus = localStorage.getItem('invoiceResults_status');
    const savedDateRange = localStorage.getItem('invoiceResults_dateRange');

    if (savedStatus && savedStatus !== 'all') {
      setSelectedStatus(savedStatus);
    }
    if (savedDateRange && savedDateRange !== 'quarter') {
      setDateRange(savedDateRange);
    }
    setIsHydrated(true);
  }, []);

  // Save selectedStatus to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('invoiceResults_status', selectedStatus);
    }
  }, [selectedStatus]);

  // Save dateRange to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('invoiceResults_dateRange', dateRange);
    }
  }, [dateRange]);

  // Load invoice results when filters change, but only after hydration
  useEffect(() => {
    if (isHydrated) {
      loadInvoiceResults();
    }
  }, [currentPage, pageSize, selectedStatus, dateRange, searchTerm, isHydrated]);

  // Prepare chart data with translations
  const prepareLocalStatusChartData = (statusCount: InvoiceStatusCount) => {
    const statusMapping: Record<string, string> = {
      'InvoiceReady': t('statCards.invoiceReady'),
      'Reporting': t('statCards.reporting'),
      'Reported': t('statCards.reported'),
      'ReportFailed': t('statCards.reportFailed'),
      'Delivering': t('statCards.delivering'),
      'Delivered': t('statCards.delivered'),
      'DeliverFailed': t('statCards.deliverFailed')
    };
    
    return Object.keys(statusCount).map(key => ({
      name: statusMapping[key] || key,
      value: statusCount[key as keyof InvoiceStatusCount],
      color: getStatusColor(key)
    })).filter(item => item.value > 0);
  };
  
  const statusData = statusCounts ? prepareLocalStatusChartData(statusCounts) : [];

  const statusOptions = [
    { value: 'all', label: t('statusLabels.all') },
    { value: 'InvoiceReady', label: t('statusLabels.invoiceReady') },
    { value: 'Reporting', label: t('statusLabels.reporting') },
    { value: 'Reported', label: t('statusLabels.reported') },
    { value: 'ReportFailed', label: t('statusLabels.reportFailed') },
    { value: 'Delivering', label: t('statusLabels.delivering') },
    { value: 'Delivered', label: t('statusLabels.delivered') },
    { value: 'DeliverFailed', label: t('statusLabels.deliverFailed') }
  ];


  // View and download handlers
  const handleViewInvoice = (result: InvoiceResultItem) => {
    if (result.pdfurl) {
      setCurrentPdfUrl(result.pdfurl);
      setCurrentInvoiceNo(result.invoiceNo || result.id);
      setShowPdfViewer(true);
    } else {
      showError('PDF Not Available', 'No PDF file available for this invoice');
    }
  };

  const handleDownloadInvoice = async (result: InvoiceResultItem) => {
    if (result.pdfurl) {
      try {
        // Fetch the PDF file as blob
        const response = await fetch(result.pdfurl);
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${result.invoiceNo || result.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        // Fallback: open in new tab if direct download fails
        window.open(result.pdfurl, '_blank');
      }
    } else {
      showError('PDF Not Available', 'No PDF file available for this invoice');
    }
  };

  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
    setCurrentPdfUrl('');
    setCurrentInvoiceNo('');
  };

  // Handle DataTable filter changes
  const handleTableFilter = (filters: Record<string, any>) => {
    // Extract filter values with fallbacks
    const newStatus = filters.status || 'all';
    const newRange = filters.dateRange || 'quarter';
    const newSearchTerm = filters.search || '';

    // Update all state variables
    setSelectedStatus(newStatus);
    setDateRange(newRange);
    setSearchTerm(newSearchTerm);

    // Handle localStorage persistence
    if (typeof window !== 'undefined') {
      if (newStatus === 'all') {
        localStorage.removeItem('invoiceResults_status');
      } else {
        localStorage.setItem('invoiceResults_status', newStatus);
      }

      if (newRange === 'quarter') {
        localStorage.removeItem('invoiceResults_dateRange');
      } else {
        localStorage.setItem('invoiceResults_dateRange', newRange);
      }
    }

    // Reset to first page when searching
    if (newSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
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

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              Error loading data: {error}
            </div>
          ) : statusCounts ? (
            <>
              {Object.keys(statusCounts).map((statusKey) => {
                const count = statusCounts[statusKey as keyof InvoiceStatusCount];
                // Use translation keys instead of getStatusDisplayName
                const statusMapping: Record<string, string> = {
                  'InvoiceReady': t('statCards.invoiceReady'),
                  'Reporting': t('statCards.reporting'),
                  'Reported': t('statCards.reported'),
                  'ReportFailed': t('statCards.reportFailed'),
                  'Delivering': t('statCards.delivering'),
                  'Delivered': t('statCards.delivered'),
                  'DeliverFailed': t('statCards.deliverFailed')
                };
                const displayName = statusMapping[statusKey] || statusKey;
                const icon = getStatusIcon(statusKey);
                const color = getStatusColor(statusKey);
                
                // Map hex colors to Tailwind color names
                const colorMap: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'purple'> = {
                  '#f59e0b': 'orange',
                  '#8b5cf6': 'purple', 
                  '#10b981': 'green',
                  '#ef4444': 'red',
                  '#06b6d4': 'blue',
                  '#3b82f6': 'blue',
                  '#f97316': 'orange'
                };
                
                return (
                  <StatCard
                    key={statusKey}
                    title={displayName}
                    value={count.toString()}
                    icon={icon}
                    color={colorMap[color] || 'blue'}
                  />
                );
              })}
              {/* Total Tax Amount - Real USD data */}
              {usdDataLoading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : usdTotalData ? (
                <StatCard
                  title={t('statCards.totalTaxAmount')}
                  value={`$${formatLargeAmount(usdTotalData.totalUSDTaxAmount)}`}
                  icon="ri-money-dollar-circle-line"
                  color="green"
                />
              ) : (
                <StatCard
                  title={t('statCards.totalTaxAmount')}
                  value="$0"
                  icon="ri-money-dollar-circle-line"
                  color="green"
                />
              )}
            </>
          ) : null}
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('statusDistribution')}</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="w-full h-64 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              Error loading chart data: {error}
            </div>
          ) : statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Filing Status Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('filingPerformance')}</h3>
          {filingDataLoading ? (
            <div className="animate-pulse">
              <div className="w-full h-64 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filingDataError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="flex items-center space-x-2 mb-2">
                <i className="ri-error-warning-line"></i>
                <span className="font-medium">{t('messages.errorLoadingFilingData')}</span>
              </div>
              <p className="text-sm">{filingDataError}</p>
              <p className="text-sm mt-1 text-gray-600">{t('messages.displayingFallbackData')}</p>
            </div>
          ) : filingPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filingPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="firstSuccess" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name={t('charts.firstSubmissionSuccess')} 
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="retrySuccess" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name={t('charts.correctedResubmissionSuccess')} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="failed" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name={t('charts.filingFailed')} 
                  dot={{ fill: '#ef4444', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <i className="ri-line-chart-line text-3xl mb-2"></i>
              <p>{t('messages.noFilingData')}</p>
            </div>
          )}
        </div>
      </div>


      {/* Results Table */}
      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('invoiceResultsList')}</h3>
          {listError && (
            <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 text-orange-800 text-sm">
                <i className="ri-information-line"></i>
                <span>{listError}</span>
              </div>
            </div>
          )}
        </div>

        <DataTable
          dataSource={invoiceResults}
          columns={createInvoiceResultTableColumns(t, handleViewInvoice, handleDownloadInvoice)}
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
            searchPlaceholder: t('searchPlaceholder'),
            searchFields: ['invoiceNo', 'sendCompanyName', 'company', 'country'],
            initialFilters: {
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              dateRange: dateRange !== 'quarter' ? dateRange : undefined,
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
                placeholder: t('statusLabels.all')
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
                placeholder: t('timeRanges.quarter')
              }
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
            }
          }}
          onRefresh={loadInvoiceResults}
          onFilter={handleTableFilter}
          disableClientSideFiltering={true}
          size="middle"
          bordered={false}
          striped={true}
          t={t}
        />
      </div>
    </main>

    {/* PDF Viewer Modal */}
    <PdfViewer
      isOpen={showPdfViewer}
      onClose={handleClosePdfViewer}
      pdfUrl={currentPdfUrl}
      invoiceNo={currentInvoiceNo}
    />
      </div>
    </TranslationLoader>
  );
}