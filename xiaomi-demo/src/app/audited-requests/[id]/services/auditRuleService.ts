import { getApiBasePath } from '@/client/lib/paths';

// API响应数据类型定义
export interface RuleLogDetailDto {
  id: number;
  ruleId: string;
  ruleName: string;
  description?: string;
  ruleGroupCode?: string;
  ruleGroupName?: string;
  executionResult: number; // 1=成功, 2=失败
  executeMessage?: string;
  errorMessage?: string;
  executeTime?: string;
  executionTime?: number; // 执行时间，单位ms
  executeDuration?: number;
  billId: number;
  requestId?: string;
  batchNo?: string;
  ruleExpression?: string;
  inputData?: string;
  outputData?: string;
  errorDetails?: string;
  createTime?: string;
  updateTime?: string;
}

export interface ApiResponse {
  errcode: string;
  message: string;
  data: RuleLogDetailDto[];
}

// 查询最新审核规则执行记录
export async function getLatestAuditRuleLogs(billId: string | number): Promise<RuleLogDetailDto[]> {
  try {
    const response = await fetch(getApiBasePath(`/api/bills/${billId}/latest-audit-rules`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    
    // 检查API返回的错误码
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || 'API调用失败');
    }

    return result.data || [];
  } catch (error) {
    console.error('获取审核规则执行记录失败:', error);
    throw error;
  }
}

// 将API数据转换为UI所需的格式
export function transformToComplianceItems(ruleLogData: RuleLogDetailDto[], billStatus?: number): ComplianceItem[] {
  
  return ruleLogData.map((rule) => {
    
    // 检查账单状态是否为审批通过(3)或审批失败(4)
    const isApproved = billStatus === 3;
    const isRejected = billStatus === 4;
    const showFullDetails = isApproved || isRejected;

    // 根据是否显示完整详情来确定状态
    let status: 'passed' | 'warning' | 'failed';
    let details = '';
    let evidence: string[] = [];

    if (!showFullDetails) {
      // 当状态不是审批通过或审批失败时，根据账单状态设置显示状态
      switch (billStatus) {
        case 1: // Pending Review
          status = 'warning';
          break;
        case 2: // Under Review  
          status = 'warning';
          break;
        default:
          status = 'warning';
      }
      
      // 显示整个账单的审核状态
      const billStatusText = getAuditStatusText(billStatus || 0);
      details = `Status: ${billStatusText}`;
      evidence = [];
    } else {
      // 当状态是审批通过或审批失败时，根据规则执行结果确定状态并显示完整信息
      const executionResult = rule.executionResult;
      
      switch (executionResult) {
        case 1:
          status = 'passed';
          break;
        case 2:
          status = 'failed';
          break;
        default:
          console.warn('未知的执行结果:', executionResult);
          status = 'failed';
      }
      
      if (rule.executionResult === 1) {
        // 执行结果为1(成功)时显示outputData里面的信息
        if (rule.outputData) {
          // 如果outputData是字符串"true"，不显示内容
          if (rule.outputData.trim().toLowerCase() === 'true') {
            details = '';
          } else {
            details = rule.outputData;
            // 如果outputData是JSON格式，尝试格式化显示
            try {
              const outputObj = JSON.parse(rule.outputData);
              if (typeof outputObj === 'object' && outputObj !== null) {
                details = JSON.stringify(outputObj, null, 2);
              }
            } catch {
              // 如果不是JSON格式，直接显示原始字符串
              details = rule.outputData;
            }
          }
        } else {
          details = '';
        }
        
        evidence = [`Status: Execution successful`];
        if (rule.executionTime) {
          evidence.push(`Execution time: ${rule.executionTime}ms`);
        }
        if (rule.executeDuration) {
          evidence.push(`Duration: ${rule.executeDuration}ms`);
        }
        
      } else if (rule.executionResult === 2) {
        // 执行结果为2(失败)时显示errorMessage的信息
        details = rule.errorMessage || '';
        
        evidence = [`Status: Execution failed`];
        if (rule.executionTime) {
          evidence.push(`Execution time: ${rule.executionTime}ms`);
        }
        if (rule.executeDuration) {
          evidence.push(`Duration: ${rule.executeDuration}ms`);
        }
        if (rule.executeMessage) {
          evidence.push(`Execution message: ${rule.executeMessage}`);
        }
        
      } else {
        details = 'Unknown execution status';
        evidence = [];
        if (rule.executionTime) {
          evidence.push(`Execution time: ${rule.executionTime}ms`);
        }
      }
    }

    const item = {
      id: rule.ruleId || `rule-${rule.id}`,
      title: rule.ruleName || '未命名规则',
      description: rule.description || '暂无描述',
      status,
      details,
      evidence,
      rawData: rule, // 保留原始数据供调试使用
    };
    
    return item;
  });
}

// 账单状态接口定义
export interface Bill {
  id: number;
  companyId: string;
  companyName: string;
  requestId: string;
  dataSource: number;
  billType: string;
  billName: string;
  billNo: string;
  auditTime?: string;
  status: number; // 1-待审核，2-审核中，3-已通过，4-审核失败
  country: string;
  createTime: string;
  updateTime?: string;
  fauditRuleGroupCodes?: string;
  billData?: string;
  logBatchNo?: string;
}

export interface BillApiResponse {
  errcode: string;
  message: string;
  data: Bill;
}

// 获取账单状态
export async function getBillById(billId: string | number): Promise<Bill> {
  try {
    const response = await fetch(getApiBasePath(`/api/bills/${billId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BillApiResponse = await response.json();
    
    // 检查API返回的错误码
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || '获取账单状态失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取账单状态失败:', error);
    throw error;
  }
}

// 获取审核状态文本显示
export function getAuditStatusText(status: number): string {
  switch (status) {
    case 1:
      return 'Pending Review';
    case 2:
      return 'Under Review';
    case 3:
      return 'Approved';
    case 4:
      return 'Rejected';
    default:
      return 'Unknown Status';
  }
}

// 获取审核状态样式
export function getAuditStatusStyle(status: number): string {
  switch (status) {
    case 1:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 2:
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 3:
      return 'bg-green-100 text-green-800 border border-green-200';
    case 4:
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
}

// 批量提交审核接口定义
export interface BatchSubmitAuditRequest {
  billIds: number[];
}

export interface FailedBill {
  billId: number;
  reason: string;
}

export interface BatchSubmitAuditResponse {
  successCount: number;
  failedBills: FailedBill[];
}

export interface BatchSubmitAuditApiResponse {
  errcode: string;
  message: string;
  data: BatchSubmitAuditResponse;
}

// 批量提交审核
export async function batchSubmitAudit(billIds: number[]): Promise<BatchSubmitAuditResponse> {
  try {
    const response = await fetch(getApiBasePath('/api/bills/batch-submit-audit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billIds),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: BatchSubmitAuditApiResponse = await response.json();
    
    // 检查API返回的错误码 (后端返回errcode为"0000"表示成功)
    if (result.errcode !== '0000' && result.errcode !== '0') {
      throw new Error(result.message || '批量提交审核失败');
    }

    return result.data;
  } catch (error) {
    console.error('批量提交审核失败:', error);
    throw error;
  }
}

// UI组件所需的接口定义
export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  evidence?: string[];
  rawData?: RuleLogDetailDto;
}