import { getApiBasePath } from '@/client/lib/paths';

interface HourlyStatusResponse {
  errcode: string;
  message?: string;
  data: HourlyStatusData[];
}

interface HourlyStatusData {
  hour: string;
  statuses: {
    FullyInvoiced: number;
    Draft: number;
    Validated: number;
    PartInvoiced: number;
    ValidFailed: number;
    Enriching: number;
    InvoiceIssueing: number;
    DebitApply: number;
    ReIssued: number;
    Pending: number;
  };
}

interface ChartData {
  hour: string;
  total: number;
  successful: number;
  pending: number;
}

interface StatusTotals {
  Draft: number;
  Enriching: number;
  Validated: number;
  ValidFailed: number;
  Pending: number;
  InvoiceIssueing: number;
  PartInvoiced: number;
  FullyInvoiced: number;
  DebitApply: number;
  ReIssued: number;
}

interface StatusStatisticsResponse {
  errcode: string;
  message: string;
  traceId?: string;
  data: StatusTotals;
  errorMsgArray?: string[];
  success?: boolean;
  error?: boolean;
}

// Invoice Request Pagination API Interfaces
export interface InvoiceRequestQuery {
  pageNum: number;
  pageSize: number;
  tenantId?: string;
  status?: number;
  invoiceNo?: string;
  startTime?: string;
  endTime?: string;
}

export interface InvoiceRequestItem {
  id: string;
  invoiceNo?: string;
  company?: string;
  companyName?: string;
  receiverCompanyName?: string;
  country?: string;
  amount?: string;
  taxAmount?: string | number;
  currency?: string;
  totalAmount?: number;
  status: number;
  statusName?: string;
  submittedAt?: string;
  lastUpdate?: string;
  taxType?: string;
  taxRate?: string;
  invoiceType?: string;
  invoiceSubType?: string;
  createdTime?: string;
  updatedTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface PaginatedResponse<T> {
  errcode: string;
  message?: string;
  data: T[];
  totalPage: number;
  pageSize: number;
  currentPage: number;
  totalElement: number;
}

export type InvoiceRequestListResponse = PaginatedResponse<InvoiceRequestItem>;

// Invoice Request Detail API Interfaces
export interface InvoiceRequestDetail {
  id: number;
  requestId: string;
  tenantId: string;
  companyId: string;
  invoiceType: string;
  invoiceSubType: string;
  submissionType: string;
  sellBilled: string;
  invoiceNo: string;
  issueDate: string;
  sendCompanyId: string;
  receiveCompanyId: string;
  sendCompanyName: string;
  country: string;
  receiverCompanyName: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  orderRefid: string;
  billingRefid: string;
  extField: string; // JSON string
  sourceDocumentType: string;
  sourceDocumentId: string;
  targetDocumentId: string;
  status: number;
  errorMessage: string;
  createTime: string;
  updateTime: string;
}

export interface InvoiceRequestDetailResponse {
  errcode: string;
  message?: string;
  traceId?: string;
  data: InvoiceRequestDetail;
  errorMsgArray?: string[];
}

// Rule Log Detail API Interfaces
export interface RuleLogDetailDto {
  id: number;
  billNo: string;
  invoiceNo: string;
  ruleCode: string;
  executionResult: number; // 1-成功, 2-失败
  errorMessage?: string;
  inputData?: string;
  outputData?: string;
  companyId: string;
  requestId: string;
  executionTime: number;
  createTime: string;
  updateTime: string;
  ruleId?: number; // 规则ID，规则表的主键
  ruleName: string;
  ruleType: number; // 1-校验规则, 2-补全规则
  fieldPath: string;
  ruleExpression?: string;
  description?: string;
  applyTo?: string;
  priority?: number;
  active?: boolean;
  status?: number;
  country?: string;
  invoiceType?: string;
}

export interface Statistics {
  totalCount: number;
  validationRuleCount: number;
  completionRuleCount: number;
  validationSuccessCount: number;
  validationFailureCount: number;
  completionSuccessCount: number;
  completionFailureCount: number;
  totalSuccessCount: number;
  totalFailureCount: number;
}

export interface RuleLogGroupedResponseDto {
  groupedByRuleType: {
    [key: string]: RuleLogDetailDto[]; // key为规则类型(1-校验, 2-补全)
  };
  statistics: Statistics;
}

export interface RuleLogDetailsResponse {
  errcode: string;
  message?: string;
  data: RuleLogGroupedResponseDto;
  traceId?: string;
  errorMsgArray?: string[];
  noise?: string;
  sign?: string;
}

// Currency symbol mapping function
export const getCurrencySymbol = (currencyCode?: string): string => {
  if (!currencyCode) return '¥'; // Default to CNY symbol
  
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CNY': '¥',
    'RMB': '¥',
    'JPY': '¥',
    'KRW': '₩',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'SGD': 'S$',
    'HKD': 'HK$',
    'TWD': 'NT$',
    'THB': '฿',
    'MYR': 'RM',
    'PHP': '₱',
    'VND': '₫',
    'IDR': 'Rp',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'BRL': 'R$',
    'MXN': 'MX$',
    'ARS': 'AR$',
    'CLP': 'CL$',
    'COP': 'CO$',
    'PEN': 'S/',
    'ZAR': 'R',
    'EGP': 'E£',
    'TRY': '₺',
    'SAR': 'SR',
    'AED': 'د.إ',
    'QAR': 'QR',
    'KWD': 'KD',
    'BHD': 'BD',
    'OMR': 'ر.ع.',
    'JOD': 'JD',
    'LBP': 'L£',
    'ILS': '₪'
  };
  
  return currencySymbols[currencyCode.toUpperCase()] || currencyCode;
};

// Format amount with currency symbol
export const formatCurrencyAmount = (amount: number | string, currencyCode?: string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${numAmount.toLocaleString()}`;
};

// Format amount with proper null/zero handling: shows 0 for zero values, -- for null/undefined values
export const formatDisplayAmount = (amount: number | string | null | undefined, currencyCode?: string): string => {
  // If amount is null or undefined, show --
  if (amount === null || amount === undefined) {
    return '--';
  }
  
  // Convert to number for further processing
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // If amount is NaN (invalid string) or falsy but not 0, show --
  if (isNaN(numAmount) && numAmount !== 0) {
    return '--';
  }
  
  // For valid numbers (including 0), format with currency
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${numAmount.toLocaleString()}`;
};

// Format backend datetime to local display format: YYYY-MM-DD 时:分:秒
export const formatDisplayTime = (backendTime?: string): string => {
  if (!backendTime) return 'N/A';
  
  try {
    // Parse the backend format: 2025-07-23T16:00:00.000+00:00
    const date = new Date(backendTime);
    
    if (isNaN(date.getTime())) {
      return backendTime; // Return original if parsing fails
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return backendTime; // Return original if formatting fails
  }
};

// Format backend datetime to date only format: YYYY-MM-DD
export const formatDateOnly = (backendTime?: string): string => {
  if (!backendTime) return 'N/A';
  
  try {
    // Parse the backend format: 2025-07-23T16:00:00.000+00:00
    const date = new Date(backendTime);
    
    if (isNaN(date.getTime())) {
      return backendTime; // Return original if parsing fails
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return backendTime; // Return original if formatting fails
  }
};

const transformHourlyData = (apiData: HourlyStatusData[]): ChartData[] => {
  return apiData.map(item => {
    const statusValues = Object.values(item.statuses);
    const total = statusValues.reduce((sum, count) => sum + count, 0);
    const successful = item.statuses.FullyInvoiced;
    const pending = total - successful;
    
    // Extract time from "2025-08-13 12:00:00" format to "12:00"
    const timeMatch = item.hour.match(/(\d{2}:\d{2}):\d{2}$/);
    const hour = timeMatch ? timeMatch[1] : item.hour;
    
    return {
      hour,
      total,
      successful,
      pending
    };
  });
};


export const fetchHourlyStatusStatistics = async (companyId: string): Promise<ChartData[]> => {
  try {
    const response = await fetch(getApiBasePath(`/api/invoice-request/hourly-status-statistics?companyId=${companyId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: HourlyStatusResponse = await response.json();
    
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return transformHourlyData(result.data);
  } catch (error) {
    throw error;
  }
};

export const fetchStatusStatistics = async (companyId: string): Promise<StatusTotals> => {
  try {
    const response = await fetch(getApiBasePath(`/api/invoice-request/status-statistics?companyId=${companyId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: StatusStatisticsResponse = await response.json();
    
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Status mapping for display
const statusMapping: Record<number, string> = {
  1: 'Draft',
  2: 'Enriching', 
  3: 'Validated',
  4: 'ValidFailed',
  5: 'Pending',
  6: 'InvoiceIssueing',
  7: 'PartInvoiced',
  8: 'FullyInvoiced',
  9: 'DebitApply',
  10: 'ReIssued'
};

// Transform API response to display format
const transformInvoiceRequestData = (items: InvoiceRequestItem[]): InvoiceRequestItem[] => {
  return items.map(item => ({
    ...item,
    statusName: statusMapping[item.status] || 'Unknown',
    company: item.receiverCompanyName || item.companyName || item.company || 'Unknown Company',
    submittedAt: formatDisplayTime(item.createTime || item.createdTime || item.submittedAt),
    lastUpdate: formatDisplayTime(item.updateTime || item.updatedTime || item.lastUpdate),
    createTime: formatDisplayTime(item.createTime),
    updateTime: formatDisplayTime(item.updateTime),
    // Keep totalAmount and taxAmount as numbers for consistent formatting in UI
    totalAmount: item.totalAmount,
    taxAmount: typeof item.taxAmount === 'string' ? parseFloat(item.taxAmount) || undefined : item.taxAmount,
  }));
};

export const fetchInvoiceRequests = async (query: InvoiceRequestQuery): Promise<InvoiceRequestListResponse> => {
  try {
    // Clean the query object to remove undefined fields and ensure backend compatibility
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );


    const response = await fetch(getApiBasePath(`/api/invoice-request/page-filter`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: InvoiceRequestListResponse = await response.json();


    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    // Transform the data for display
    return {
      ...result,
      data: transformInvoiceRequestData(result.data),
    };
  } catch (error) {
    throw error;
  }
};

// Fetch invoice request detail by ID
export const fetchInvoiceRequestById = async (id: string | number): Promise<InvoiceRequestDetail> => {
  try {
    const response = await fetch(getApiBasePath(`/api/invoice-request/${id}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: InvoiceRequestDetailResponse = await response.json();
    
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Mock data for rule log details (for testing when requestId is "123456")
const getMockRuleLogData = (): RuleLogGroupedResponseDto => {
  return {
    groupedByRuleType: {
      "1": [ // 校验规则
        {
          id: 1,
          billNo: "BILL123456",
          invoiceNo: "INV123456",
          ruleCode: "VALIDATE_EMAIL",
          executionResult: 1, // 成功
          errorMessage: undefined,
          inputData: "test@example.com",
          outputData: "test@example.com",
          companyId: "COMP001",
          requestId: "123456",
          executionTime: 150,
          createTime: "2025-01-14T10:25:44.000Z",
          updateTime: "2025-01-14T10:25:44.000Z",
          ruleName: "Email Validation Rule",
          ruleType: 1,
          fieldPath: "invoice.TaxTotal.TaxAmount.currencyID",
          ruleExpression: "email != null && email.matches('.*@.*')",
          description: "Validates email format",
          applyTo: "Customer Contact",
          priority: 1,
          active: true,
          status: 1,
          country: "CN",
          invoiceType: "Standard"
        },
        {
          id: 3,
          billNo: "BILL123456",
          invoiceNo: "INV123456",
          ruleCode: "VALIDATE_TAX_ID",
          executionResult: 2, // 失败
          errorMessage: "Invalid tax ID format",
          inputData: "12345",
          outputData: undefined,
          companyId: "COMP001",
          requestId: "123456",
          executionTime: 100,
          createTime: "2025-01-14T10:25:44.000Z",
          updateTime: "2025-01-14T10:25:44.000Z",
          ruleName: "Tax ID Validation",
          ruleType: 1,
          fieldPath: "invoice.TaxTotal.TaxSubtotal[0].TaxableAmount.currencyID",
          ruleExpression: "validateTaxId(taxId)",
          description: "Validates tax ID format",
          applyTo: "Supplier Tax Scheme",
          priority: 3,
          active: true,
          status: 1,
          country: "CN",
          invoiceType: "Standard"
        }
      ],
      "2": [ // 补全规则
        {
          id: 2,
          billNo: "BILL123456",
          invoiceNo: "INV123456",
          ruleCode: "ENRICH_SUPPLIER_NAME",
          executionResult: 1, // 成功
          errorMessage: undefined,
          inputData: "Supplier A",
          outputData: "Supplier A Company Ltd.",
          companyId: "COMP001",
          requestId: "123456",
          executionTime: 200,
          createTime: "2025-01-14T10:25:44.000Z",
          updateTime: "2025-01-14T10:25:44.000Z",
          ruleName: "Supplier Name Enrichment",
          ruleType: 2,
          fieldPath: "invoice.TaxTotal.TaxAmount.value",
          ruleExpression: "enrichSupplierName(supplierName)",
          description: "Enriches supplier name with full legal name",
          applyTo: "Supplier Party",
          priority: 2,
          active: true,
          status: 1,
          country: "CN",
          invoiceType: "Standard"
        }
      ]
    },
    statistics: {
      totalCount: 3,
      validationRuleCount: 1,
      completionRuleCount: 2,
      validationSuccessCount: 1,
      validationFailureCount: 0,
      completionSuccessCount: 1,
      completionFailureCount: 1,
      totalSuccessCount: 2,
      totalFailureCount: 1
    }
  };
};

// Magic modify real backend data with mock field paths and additional samples
const magicModifyBackendData = (_backendData: RuleLogGroupedResponseDto): RuleLogGroupedResponseDto => {
  const mockData = getMockRuleLogData();
  return mockData;
};

// Fetch rule log details by request ID
export const fetchRuleLogDetails = async (requestId: string, billNo?: string): Promise<RuleLogGroupedResponseDto> => {
    // Use "123456" as fallback if requestId is empty or null, otherwise use the actual requestId
    const backendRequestId = (!requestId || requestId.trim() === '') ? "123456" : requestId;
    const shouldUseMockData = (!requestId || requestId.trim() === '');
    
    const params = new URLSearchParams();
    params.append('requestId', backendRequestId);
    if (billNo) {
      params.append('billNo', billNo);
    }


    const response = await fetch(getApiBasePath(`/rule-log/details?${params.toString()}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RuleLogDetailsResponse = await response.json();
    
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    // Only magic modify the backend data when using fallback requestId
    if (shouldUseMockData) {
      const modifiedData = magicModifyBackendData(result.data);
      return modifiedData;
    } else {
      return result.data;
    }
};

// Submit invoice requests API (virtual implementation)
export interface SubmitInvoiceResponse {
  errcode: string;
  message?: string;
  data?: {
    successCount: number;
    failedCount: number;
    successIds: string[];
    failedIds: string[];
  };
}

export const submitInvoiceRequests = async (ids: string[]): Promise<SubmitInvoiceResponse> => {
  try {
    // Convert string IDs to integers as expected by the API
    const integerIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    
    if (integerIds.length === 0) {
      throw new Error('No valid invoice request IDs provided');
    }

    const response = await fetch(getApiBasePath('/api/invoice-request/submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(integerIds),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Debug: Log the actual response to understand the format
    console.log('Submit API Response:', result);
    
    // Check for API errors using the same pattern as other APIs
    if (result.errcode && result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }
    
    // Also check for the 'code' field from OpenAPI spec
    if (result.code && result.code !== '200') {
      throw new Error(result.message || 'API returned error');
    }

    // Map the API response to our expected format
    const apiData = result.data || {};
    
    return {
      errcode: '0000',
      message: result.message || 'Invoice requests submitted successfully',
      data: {
        successCount: apiData.successCount || 0,
        failedCount: apiData.failedCount || 0,
        successIds: (apiData.successIds || []).map((id: number) => id.toString()),
        failedIds: (apiData.failedIds || []).map((id: number) => id.toString())
      }
    };
  } catch (error) {
    throw error;
  }
};

// Invoice Status Count Interfaces for invoice-results page
export interface InvoiceStatusCountResponse {
  errcode: string;
  message: string;
  success: boolean;
  error: boolean;
  traceId?: string;
  data: {
    [key: string]: {
      value: number;
    };
  };
  errorMsgArray?: string[];
}

export interface InvoiceStatusCount {
  InvoiceReady: number;
  Reporting: number;
  Reported: number;
  ReportFailed: number;
  Delivering: number;
  Delivered: number;
  DeliverFailed: number;
}

// Status key mapping for display
const invoiceStatusDisplayMapping: Record<string, string> = {
  'InvoiceReady': 'Invoice Ready',
  'Reporting': 'Reporting',
  'Reported': 'Reported',
  'ReportFailed': 'Report Failed',
  'Delivering': 'Delivering',
  'Delivered': 'Delivered',
  'DeliverFailed': 'Deliver Failed'
};

// Status color mapping for charts
const invoiceStatusColorMapping: Record<string, string> = {
  'InvoiceReady': '#f59e0b', // orange
  'Reporting': '#8b5cf6', // purple
  'Reported': '#10b981', // green
  'ReportFailed': '#ef4444', // red
  'Delivering': '#06b6d4', // cyan
  'Delivered': '#3b82f6', // blue
  'DeliverFailed': '#f97316' // orange-500
};

// Icon mapping for status cards
const invoiceStatusIconMapping: Record<string, string> = {
  'InvoiceReady': 'ri-file-check-line',
  'Reporting': 'ri-upload-line',
  'Reported': 'ri-send-plane-line',
  'ReportFailed': 'ri-error-warning-line',
  'Delivering': 'ri-truck-line',
  'Delivered': 'ri-check-line',
  'DeliverFailed': 'ri-close-circle-line'
};

// Transform API response to usable format
const transformInvoiceStatusCount = (apiData: InvoiceStatusCountResponse['data']): InvoiceStatusCount => {
  const result: InvoiceStatusCount = {
    InvoiceReady: 0,
    Reporting: 0,
    Reported: 0,
    ReportFailed: 0,
    Delivering: 0,
    Delivered: 0,
    DeliverFailed: 0
  };

  Object.keys(result).forEach(key => {
    if (apiData[key] && typeof apiData[key].value === 'number') {
      result[key as keyof InvoiceStatusCount] = apiData[key].value;
    }
  });

  return result;
};

// Fetch invoice status count statistics
export const fetchInvoiceStatusCount = async (): Promise<InvoiceStatusCount> => {
  try {
    const response = await fetch(getApiBasePath('/api/invoice/status-count'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: InvoiceStatusCountResponse = await response.json();
    
    // Check for API-level errors (errcode not 0000)
    if (result.errcode !== '0000' && result.errcode !== '0') {
      const errorMsg = result.message || 'Unknown API error';
      throw new Error(`API Error (${result.errcode}): ${errorMsg}`);
    }

    // Check if API indicates failure
    if (result.error === true || result.success === false) {
      const errorMsg = result.message || 'API request failed';
      throw new Error(`Request Failed: ${errorMsg}`);
    }

    return transformInvoiceStatusCount(result.data);
  } catch (error) {
    
    // Re-throw with more context if it's a basic fetch error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Helper functions for UI components
export const getStatusDisplayName = (statusKey: string): string => {
  return invoiceStatusDisplayMapping[statusKey] || statusKey;
};

export const getStatusColor = (statusKey: string): string => {
  return invoiceStatusColorMapping[statusKey] || '#6b7280';
};

export const getStatusIcon = (statusKey: string): string => {
  return invoiceStatusIconMapping[statusKey] || 'ri-file-line';
};

// Prepare data for pie chart
export const prepareStatusChartData = (statusCount: InvoiceStatusCount) => {
  return Object.keys(statusCount).map(key => ({
    name: getStatusDisplayName(key),
    value: statusCount[key as keyof InvoiceStatusCount],
    color: getStatusColor(key)
  })).filter(item => item.value > 0); // Only include non-zero values
};

// Invoice Results API Interfaces
export interface InvoiceResultQuery {
  pageNum: number;
  pageSize: number;
  invoiceType?: string;
  invoiceSubType?: string;
  submissionType?: string;
  invoiceNo?: string;
  sendCompanyId?: string;
  receiveCompanyId?: string;
  sendCompanyName?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}

export interface InvoiceResultItem {
  id: string;
  invoiceNo?: string;
  invoiceType?: string;
  invoiceSubType?: string;
  sendCompanyName?: string;
  company?: string;
  country?: string;
  totalAmount?: number;
  taxAmount?: number;
  currency?: string;
  status?: number;
  issueDate?: string;
  createTime?: string;
  updateTime?: string;
  pdfurl?: string;
}

export interface InvoiceResultResponse {
  errcode: string;
  message: string;
  data: InvoiceResultItem[];
  totalElement: number;
  currentPage: number;
  pageSize: number;
  totalPage: number;
  success?: boolean;
  error?: boolean;
  traceId?: string;
  errorMsgArray?: string[];
}

// Transform invoice result data for display
const transformInvoiceResultData = (items: InvoiceResultItem[]): InvoiceResultItem[] => {
  return items.map(item => ({
    ...item,
    // Format amounts with currency symbol
    totalAmountFormatted: item.totalAmount && item.currency ? 
      formatCurrencyAmount(item.totalAmount, item.currency) : 'N/A',
    taxAmountFormatted: item.taxAmount && item.currency ? 
      formatCurrencyAmount(item.taxAmount, item.currency) : 'N/A',
    // Format dates to local timezone
    issueDateFormatted: formatDateOnly(item.issueDate),
    createTimeFormatted: formatDisplayTime(item.createTime),
    updateTimeFormatted: formatDisplayTime(item.updateTime),
  }));
};

// Fetch invoice results with pagination
export const fetchInvoiceResults = async (query: InvoiceResultQuery): Promise<InvoiceResultResponse> => {
  try {
    // Clean the query object to remove undefined fields
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );


    const response = await fetch(getApiBasePath('/api/invoice/page'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: InvoiceResultResponse = await response.json();
    
    
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    // Transform the data for display
    return {
      ...result,
      data: transformInvoiceResultData(result.data),
    };
  } catch (error) {
    throw error;
  }
};

// Tax Authority Filing Performance API Interfaces
export interface HourlyStatusStatsData {
  status: number;
  statusName: string;
  hourlyData: Record<string, number>;
}

export interface HourlyStatusStatsResponse {
  errcode: string;
  message: string;
  data: HourlyStatusStatsData[];
  traceId?: string;
}

export interface FilingPerformanceData {
  time: string;
  firstSuccess: number;
  retrySuccess: number;
  failed: number;
}

// Map backend status to frontend categories
const mapStatusToCategory = (status: number, _statusName: string): 'firstSuccess' | 'retrySuccess' | 'failed' | null => {
  // According to API doc:
  // 1: InvoiceReady, 2: Reporting, 3: Reported, 4: ReportFailed, 5: Delivering, 6: Delivered, 7: DeliverFailed
  switch (status) {
    case 3: // Reported - successful first submission
    case 6: // Delivered - successful delivery
      return 'firstSuccess';
    case 2: // Reporting - retry/corrected resubmission
    case 5: // Delivering - retry delivery
      return 'retrySuccess';
    case 4: // ReportFailed
    case 7: // DeliverFailed
      return 'failed';
    default:
      return null; // Ignore other statuses
  }
};

// Transform API data for the line chart
const transformFilingPerformanceData = (apiData: HourlyStatusStatsData[]): FilingPerformanceData[] => {
  if (!apiData || apiData.length === 0) {
    return [];
  }

  // Get all unique time points from all status data
  const allTimePoints = new Set<string>();
  apiData.forEach(statusData => {
    Object.keys(statusData.hourlyData).forEach(time => allTimePoints.add(time));
  });

  // Sort time points chronologically
  const sortedTimePoints = Array.from(allTimePoints).sort();

  return sortedTimePoints.map(timePoint => {
    // Extract hour from datetime string (e.g., "2024-01-15 08:00:00" -> "08:00")
    const hourMatch = timePoint.match(/(\d{2}:\d{2}):\d{2}$/);
    const hour = hourMatch ? hourMatch[1] : timePoint;

    // Initialize counters for each category
    let firstSuccess = 0;
    let retrySuccess = 0;
    let failed = 0;

    // Process each status data and accumulate counts by category
    apiData.forEach(statusData => {
      const category = mapStatusToCategory(statusData.status, statusData.statusName);
      const count = statusData.hourlyData[timePoint] || 0;
      
      switch (category) {
        case 'firstSuccess':
          firstSuccess += count;
          break;
        case 'retrySuccess':
          retrySuccess += count;
          break;
        case 'failed':
          failed += count;
          break;
      }
    });

    return {
      time: hour,
      firstSuccess,
      retrySuccess,
      failed
    };
  });
};

// Fetch hourly invoice filing statistics
export const fetchHourlyFilingStats = async (): Promise<FilingPerformanceData[]> => {
  try {
    const response = await fetch(getApiBasePath('/api/invoice/hourly-stats'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: HourlyStatusStatsResponse = await response.json();
    
    if (result.errcode !== '0000') {
      throw new Error(result.message || 'API returned error');
    }

    return transformFilingPerformanceData(result.data);
  } catch (error) {
    throw error;
  }
};

// Format large amounts with K, M, B suffixes
export const formatLargeAmount = (amount: number): string => {
  if (amount == null || amount === undefined) {
    return '0.00';
  }
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  // For amounts less than 1000, show 2 decimal places
  return amount.toFixed(2);
};

// USD Total Amount API Interfaces
export interface USDTotalData {
  totalUSDAmount: number;
  totalUSDTaxAmount: number;
}

export interface USDTotalResponse {
  errcode: string;
  message: string;
  data: USDTotalData;
}

// Fetch USD total amounts for a company
export const fetchUSDTotalAmounts = async (): Promise<USDTotalData> => {
  try {
    const response = await fetch(getApiBasePath('/api/invoice/currency-stats/usd-total'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: USDTotalResponse = await response.json();
    
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Bill Audit Status Statistics API Interfaces  
export interface BillAuditStatusStats {
  PENDING: {
    count: number;
  };
  IN_PROGRESS: {
    count: number;
  };
  APPROVED: {
    count: number;
  };
  REJECTED: {
    count: number;
  };
}

export interface BillAuditStatusResponse {
  success?: boolean;
  message: string;
  code?: string;
  errcode?: string;
  data: BillAuditStatusStats;
}

// Fetch bill audit status statistics by company
export const fetchBillAuditStatusStats = async (companyId: string): Promise<BillAuditStatusStats> => {
  try {
    const response = await fetch(getApiBasePath(`/api/bills/stats/status?companyId=${companyId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BillAuditStatusResponse = await response.json();
    
    // Check for errcode field (backend returns errcode: '0000' for success)
    if ('errcode' in result && result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }
    
    // Fallback check for code field
    if ('code' in result && result.code !== '200') {
      throw new Error(result.message || 'API returned error');
    }

    // Handle empty data object - this is normal and should show 0 counts, not error
    const data = result.data || {};
    return {
      PENDING: data.PENDING || { count: 0 },
      IN_PROGRESS: data.IN_PROGRESS || { count: 0 },
      APPROVED: data.APPROVED || { count: 0 },
      REJECTED: data.REJECTED || { count: 0 }
    };
  } catch (error) {
    throw error;
  }
};

// Bill Files API Interfaces
export interface BillFile {
  id: number;
  billId: number;
  fileType: number; // 1-主文件, 2-附件
  fileName: string;
  filePath: string;
  fileSize: number;
  fileFormat: string;
  ocrResult: string; // JSON string
  ocrStatus: number; // 1-待处理, 2-处理中, 3-已完成, 4-失败
  documentType?: string; // Document type at the same level as ocrResult
  createTime: string;
  updateTime: string;
}

export interface BillFileResponse {
  success: boolean;
  message: string;
  code: string;
  data: BillFile[];
}

// Cache for bill files to prevent duplicate API calls
const billFilesCache = new Map<number, Promise<BillFile[]>>();

// Fetch bill files by bill ID
export const fetchBillFiles = async (billId: number, forceRefresh = false): Promise<BillFile[]> => {
  // If force refresh is true, clear the cache for this billId
  if (forceRefresh) {
    billFilesCache.delete(billId);
  }
  
  // Check if we already have a pending request for this billId
  if (billFilesCache.has(billId)) {
    return billFilesCache.get(billId)!;
  }

  // Create new request
  const requestPromise = (async (): Promise<BillFile[]> => {
    try {
      const response = await fetch(getApiBasePath(`/api/bill-files/bills/${billId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BillFileResponse = await response.json();
      
      if (result.code !== '200' && !result.success) {
        throw new Error(result.message || 'API returned error');
      }

      return result.data || [];
    } catch (error) {
      // Remove from cache on error so we can retry
      billFilesCache.delete(billId);
      throw error;
    }
  })();

  // Cache the promise
  billFilesCache.set(billId, requestPromise);

  // Clean up cache after 5 minutes
  setTimeout(() => {
    billFilesCache.delete(billId);
  }, 5 * 60 * 1000);

  return requestPromise;
};

// Convert date range to backend timezone format
export const getInvoiceResultDateRange = (range: string): { startTime: string; endTime: string } => {
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

// Bills API Interfaces for audited-requests page
export interface BillQuery {
  pageNum: number;
  pageSize: number;
  companyName?: string;
  requestId?: string;
  dataSource?: number;
  billType?: string;
  billName?: string;
  billNo?: string;
  status?: number;
  country?: string;
  auditRuleGroupCodes?: string;
  startTime?: string;
  endTime?: string;
  auditStartTime?: string;
  auditEndTime?: string;
  logBatchNo?: string;
}

export interface Bill {
  id: number;
  companyId: string;
  companyName: string;
  requestId: string;
  dataSource: number;
  billType: string;
  billName: string;
  billNo: string;
  auditTime: string;
  status: number;
  country: string;
  createTime: string;
  updateTime: string;
  fauditRuleGroupCodes: string;
  billData: string;
  logBatchNo: string;
}

export interface BillResponse {
  success: boolean;
  message: string;
  code: string;
  data: Bill[];
  totalPage: number;
  pageSize: number;
  currentPage: number;
  totalElement: number;
}

// Transform bill data for display
const transformBillData = (items: Bill[]): Bill[] => {
  return items.map(item => ({
    ...item,
    auditTime: formatDisplayTime(item.auditTime),
    createTime: formatDisplayTime(item.createTime),
    updateTime: formatDisplayTime(item.updateTime),
    // Format rule group codes to space separated
    fauditRuleGroupCodes: item.fauditRuleGroupCodes ? 
      item.fauditRuleGroupCodes.split(',').join(' ') : ''
  }));
};

// Search bills interface for /api/bills/search
export interface BillSearchQuery {
  pageNum: number;
  pageSize: number;
  billNo?: string; // 票据号码搜索
  status?: number;
  startTime?: string;
  endTime?: string;
  country?: string;
}

// Search bills with search API
export const fetchBillsSearch = async (query: BillSearchQuery): Promise<BillResponse> => {
  try {
    // Clean the query object to remove undefined fields
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const response = await fetch(getApiBasePath('/api/bills/search'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BillResponse = await response.json();

    if (result.code !== '200' && !result.success) {
      throw new Error(result.message || 'API returned error');
    }

    // Transform the data for display
    return {
      code: result.code,
      message: result.message,
      data: result.data,
      success: result.success,
      totalElement: result.totalElement,
      totalPage: result.totalPage,
      currentPage: result.currentPage,
      pageSize: result.pageSize
    };
  } catch (error) {
    console.error('Error fetching bills with search:', error);
    throw error;
  }
};

// Fetch bills with pagination
export const fetchBills = async (query: BillQuery): Promise<BillResponse> => {
  try {
    // Clean the query object to remove undefined fields
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const response = await fetch(getApiBasePath('/api/bills/page'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BillResponse = await response.json();
    
    if (result.code !== '200' && !result.success) {
      throw new Error(result.message || 'API returned error');
    }

    // Transform the data for display
    return {
      ...result,
      data: transformBillData(result.data),
    };
  } catch (error) {
    throw error;
  }
};

// Submit bills for audit API
export interface SubmitBillsResponse {
  success: boolean;
  message: string;
  code: string;
  data?: {
    successCount: number;
    failedBills: Array<{
      billId: number;
      reason: string;
    }>;
  };
}

export const submitBillsForAudit = async (ids: number[]): Promise<SubmitBillsResponse> => {
  try {
    if (ids.length === 0) {
      throw new Error('No bill IDs provided');
    }

    const response = await fetch(getApiBasePath('/api/bills/batch-submit-audit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SubmitBillsResponse = await response.json();
    
    if (result.code !== '200' && !result.success) {
      throw new Error(result.message || 'API returned error');
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Upload file response interface
interface UploadFileResponse {
  code?: string;
  message: string;
  data?: {
    id: number;
    billId: number;
    fileType: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileFormat: string;
    ocrResult?: string;
    ocrStatus: number;
    createTime: string;
    updateTime: string;
  };
  errcode?: string;
}

// Upload multipart file
export const uploadMultipartFile = async (billId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(getApiBasePath(`/api/bill-files/bills/${billId}/upload-multipart`), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: UploadFileResponse = await response.json();
  
  // Debug: log the actual response to understand the structure
  console.log('Upload API Response:', result);
  
  // Check for API error - follow project pattern using errcode
  // Some APIs might return code, some errcode, so check both
  const errorCode = result.errcode || result.code;
  if (errorCode && errorCode !== '0000' && errorCode !== '0') {
    throw new Error(result.message || 'Upload failed');
  }

  return result.data;
};

// Delete bill file response interface
interface DeleteBillFileResponse {
  code?: string;
  message: string;
  data?: string;
  errcode?: string;
}

// Delete bill file by ID
export const deleteBillFile = async (fileId: number): Promise<string> => {
  try {
    const response = await fetch(getApiBasePath(`/api/bill-files/${fileId}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: DeleteBillFileResponse = await response.json();
    
    // Check for API error - follow project pattern using errcode
    // Some APIs might return code, some errcode, so check both
    const errorCode = result.errcode || result.code;
    if (errorCode && errorCode !== '0000' && errorCode !== '0') {
      throw new Error(result.message || 'Delete failed');
    }

    return result.data || '删除单据文件成功';
  } catch (error) {
    throw error;
  }
};