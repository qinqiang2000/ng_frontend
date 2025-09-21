import { getApiBasePath } from '@/client/lib/paths';

export interface RuleStatusStatistics {
  statusKey: string;
  statusName: string;
  count: number;
}

export interface RuleMonthlyPublishStatistics {
  ruleType: number;
  ruleTypeName: string;
  monthlyData: Array<{
    publishMonth: string;
    count: number;
  }>;
}

interface ApiResponse<T> {
  errcode?: string;
  code?: string;
  message: string;
  success?: boolean;
  error?: boolean;
  data: T;
}

export async function getRuleStatusStatistics(): Promise<RuleStatusStatistics[]> {
  try {
    const response = await fetch(getApiBasePath('/invoice-rules/status-statistics'));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<RuleStatusStatistics[]> = await response.json();
    
    // Check for API-level errors (errcode not 0000)
    if (result.errcode && result.errcode !== '0000' && result.errcode !== '0') {
      const errorMsg = result.message || 'Unknown API error';
      throw new Error(`API Error (${result.errcode}): ${errorMsg}`);
    }
    
    // Check if API indicates failure
    if (result.error === true || result.success === false) {
      const errorMsg = result.message || 'API request failed';
      throw new Error(`Request Failed: ${errorMsg}`);
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching rule status statistics:', error);
    
    // Re-throw with more context if it's a basic fetch error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    throw error; // Re-throw instead of returning empty array
  }
}

export async function getRuleMonthlyPublishStatistics(): Promise<RuleMonthlyPublishStatistics[]> {
  try {
    const response = await fetch(getApiBasePath('/invoice-rules/monthly-publish-statistics'));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<RuleMonthlyPublishStatistics[]> = await response.json();
    
    // Check for API-level errors (errcode not 0000)
    if (result.errcode && result.errcode !== '0000' && result.errcode !== '0') {
      const errorMsg = result.message || 'Unknown API error';
      throw new Error(`API Error (${result.errcode}): ${errorMsg}`);
    }
    
    // Check if API indicates failure
    if (result.error === true || result.success === false) {
      const errorMsg = result.message || 'API request failed';
      throw new Error(`Request Failed: ${errorMsg}`);
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching monthly publish statistics:', error);
    
    // Re-throw with more context if it's a basic fetch error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    
    throw error; // Re-throw instead of returning empty array
  }
}