import { getApiBasePath } from '@/client/lib/paths';

// Rule Group API Interfaces
export interface InvoiceRuleGroup {
  id: number;
  companyId: string;
  groupCode: string;
  groupName: string;
  groupDesc?: string;
  createTime: string;
  updateTime: string;
  status: number; // 1=enabled, 2=disabled
}

export interface RuleGroupsResponse {
  errcode: string;
  message: string;
  data: InvoiceRuleGroup[];
  traceId?: string;
  errorMsgArray?: string[];
}

// Transform rule group data for display
const transformRuleGroupData = (groups: InvoiceRuleGroup[]): InvoiceRuleGroup[] => {
  return groups.map(group => ({
    ...group,
    // Add any necessary transformations here
    createTime: group.createTime,
    updateTime: group.updateTime,
  }));
};

// Fetch rule groups by company ID
export const fetchRuleGroupsByCompanyId = async (
  country?: string,
  searchValue?: string,
  orgId?: string,
  lang: 'en' | 'zh' = 'en'
): Promise<InvoiceRuleGroup[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang);

    if (country) {
      queryParams.append('country', country);
    }

    if (searchValue) {
      queryParams.append('searchValue', searchValue);
    }

    const response = await fetch(
      getApiBasePath(`/rule-groups/by-company/${orgId}?${queryParams.toString()}`),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RuleGroupsResponse = await response.json();

    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return transformRuleGroupData(result.data);
  } catch (error) {
    console.error('Failed to fetch rule groups:', error);
    throw error;
  }
};

// Status mapping for display
export const getStatusDisplayName = (status: number): string => {
  const statusMapping: Record<number, string> = {
    1: 'Enabled',
    2: 'Disabled'
  };
  return statusMapping[status] || 'Unknown';
};

// Status color mapping
export const getStatusColor = (status: number): string => {
  const colorMapping: Record<number, string> = {
    1: 'green', // enabled
    2: 'red'    // disabled
  };
  return colorMapping[status] || 'gray';
};

// Available Rule interfaces
export interface AvailableRule {
  id: number;
  ruleCode: string;
  ruleName: string;
  ruleType: string;
  ruleVersion: string;
  status: number;
  publishTime: string;
  invoiceType: string;
  subInvoiceType: string;
  description: string;
  country: string;
  priority?: number; // Optional priority field
}

export interface AvailableRulesResponse {
  errcode: string;
  message?: string;
  data: AvailableRule[];
  totalPage: number;
  currentPage: number;
  totalElement: number;
  pageSize: number;
  success: boolean;
  error: boolean;
}

// Fetch available rules for rule groups
export const fetchAvailableRules = async (
  country: string,
  ruleName?: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<AvailableRulesResponse> => {
  try {
    const requestBody: any = {
      pageNum,
      pageSize,
      country,
      status: '4', // Only query rules with status = '4'
      engineType: 3 // Add engineType parameter for rule groups
    };

    if (ruleName && ruleName.trim()) {
      requestBody.ruleName = ruleName;
    }

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

    const data: AvailableRulesResponse = await response.json();

    // Check for API-level errors
    if (data.errcode !== '0000' && data.errcode !== '0') {
      throw new Error(`API Error (${data.errcode}): ${data.message || 'Unknown error'}`);
    }

    // Check if API indicates failure
    if (data.error === true || data.success === false) {
      throw new Error(`Request Failed: ${data.message || 'API request failed'}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch available rules:', error);
    throw error;
  }
};

// Rule in group interface
export interface RuleInGroup {
  id: number;
  country: string;
  invoiceType: string;
  subInvoiceType: string;
  invoiceTypeCode: string;
  subInvoiceTypeCode: string;
  ruleCode: string;
  ruleName: string;
  ruleType: number;
  active: boolean;
  status: number;
  applyTo: string;
  errorMessage: string;
  fieldPath: string;
  priority: number;
  ruleExpression: string;
  description: string;
  startTime: string;
  endTime: string;
  createTime: string;
  updateTime: string;
  engineType: number;
  aiPrompt: string;
}

export interface RulesInGroupResponse {
  errcode: string;
  message: string;
  data: RuleInGroup[];
  traceId?: string;
  errorMsgArray?: string[];
}

// Fetch rules in a specific group
export const fetchRulesInGroup = async (
  groupCode: string,
  lang: 'en' | 'zh' = 'en'
): Promise<RuleInGroup[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang);

    const response = await fetch(
      getApiBasePath(`/rule-groups/${groupCode}/rules?${queryParams.toString()}`),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RulesInGroupResponse = await response.json();

    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch rules in group:', error);
    throw error;
  }
};

// Create rule group interfaces
export interface RuleGroupCreateRequest {
  groupCode?: string;
  groupName: string;
  groupDesc?: string;
  country?: string;
}

export interface RuleGroupCreateResponse {
  errcode: string;
  message: string;
  data: InvoiceRuleGroup;
  traceId?: string;
  errorMsgArray?: string[];
}

// Update rule group interfaces
export interface RuleGroupUpdateRequest {
  groupName: string;
  groupDesc?: string;
  ruleCodes: string[];
}

export interface RuleGroupUpdateResponse {
  errcode: string;
  message: string;
  data: number; // Number of affected rows
  traceId?: string;
  errorMsgArray?: string[];
}

// Create a new rule group
export const createRuleGroup = async (
  request: RuleGroupCreateRequest,
  lang: 'en' | 'zh' = 'en'
): Promise<InvoiceRuleGroup> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang);

    const response = await fetch(
      getApiBasePath(`/rule-groups?${queryParams.toString()}`),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RuleGroupCreateResponse = await response.json();

    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to create rule group:', error);
    throw error;
  }
};

// Update an existing rule group
export const updateRuleGroup = async (
  groupId: number,
  request: RuleGroupUpdateRequest,
  lang: 'en' | 'zh' = 'en'
): Promise<number> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang);

    const response = await fetch(
      getApiBasePath(`/rule-groups/${groupId}?${queryParams.toString()}`),
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: RuleGroupUpdateResponse = await response.json();

    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API returned error');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to update rule group:', error);
    throw error;
  }
};

// Format display time
export const formatDisplayTime = (backendTime?: string): string => {
  if (!backendTime) return 'N/A';

  try {
    const date = new Date(backendTime);

    if (isNaN(date.getTime())) {
      return backendTime;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return backendTime;
  }
};