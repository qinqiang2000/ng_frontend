'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { getLatestAuditRuleLogs, transformToComplianceItems, ComplianceItem, getBillById, Bill, getAuditStatusText, getAuditStatusStyle, batchSubmitAudit } from '../services/auditRuleService';
import { useToast } from '@/client/hooks/useToast';
import Toast from '@/client/components/ui/Toast';
import { useAuditedRequestsTranslation } from '@/client/hooks/useTranslation';

interface InfoPanelProps {
  selectedField: string | null;
  onFieldClick: (nodeId: string, fieldIndex: number) => void;
  billId: string;
  onRefresh?: () => void;
}

function InfoPanel({ selectedField, onFieldClick, billId, onRefresh }: InfoPanelProps) {
  const { t } = useAuditedRequestsTranslation();
  const [expandedItem, setExpandedItem] = useState<string>('');
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [billInfo, setBillInfo] = useState<Bill | null>(null);
  const [billLoading, setBillLoading] = useState<boolean>(true);
  const [submittingAudit, setSubmittingAudit] = useState<boolean>(false);
  const isLoadingRef = useRef<boolean>(false); // 防止重复调用的标记
  const { toasts, success, error: showError, warning, removeToast } = useToast();


  useEffect(() => {
    const loadData = async () => {
      if (!billId || isLoadingRef.current) return;
      
      isLoadingRef.current = true;
      try {
        // 先获取账单状态
        setBillLoading(true);
        const bill = await getBillById(billId);
        setBillInfo(bill);
        
        // 然后获取审核规则，使用刚获取的账单信息
        setLoading(true);
        setError(null);
        const ruleLogData = await getLatestAuditRuleLogs(billId);
        const transformedItems = transformToComplianceItems(ruleLogData, bill.status);
        setComplianceItems(transformedItems);
        
        // 如果有数据，默认展开第一项
        if (transformedItems.length > 0) {
          setExpandedItem(transformedItems[0].id);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setBillLoading(false);
        setLoading(false);
        isLoadingRef.current = false;
      }
    };
    
    loadData();
  }, [billId]); // 只依赖billId

  const handleRefresh = async () => {
    if (!billId || isLoadingRef.current) return; // 防止重复调用
    
    isLoadingRef.current = true;
    try {
      setBillLoading(true);
      setLoading(true);
      setError(null);
      
      // 获取账单状态
      const bill = await getBillById(billId);
      setBillInfo(bill);
      
      // 获取审核规则
      const ruleLogData = await getLatestAuditRuleLogs(billId);
      const transformedItems = transformToComplianceItems(ruleLogData, bill.status);
      setComplianceItems(transformedItems);
      
      // 如果有数据，默认展开第一项
      if (transformedItems.length > 0) {
        setExpandedItem(transformedItems[0].id);
      }
      
      // 触发依赖图数据刷新
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('刷新数据失败:', err);
      setError(err instanceof Error ? err.message : '刷新数据失败');
    } finally {
      setBillLoading(false);
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // 重新提交审核
  const handleResubmitAudit = async () => {
    if (!billId) {
      showError('Submit Failed', 'Invalid bill ID');
      return;
    }

    setSubmittingAudit(true);
    try {
      const billIdNum = parseInt(billId, 10);
      if (isNaN(billIdNum)) {
        throw new Error('Invalid bill ID format');
      }

      const result = await batchSubmitAudit([billIdNum]);
      
      if (result.successCount > 0) {
        success('Submit Successful', `Successfully submitted ${result.successCount} bill for audit`);
        // 触发数据刷新
        await handleRefresh();
      } else if (result.failedBills.length > 0) {
        const failureReason = result.failedBills[0]?.reason || 'Unknown error';
        showError('Submit Failed', failureReason);
      } else {
        showError('Submit Failed', 'No bills were processed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit audit';
      showError('Submit Failed', errorMessage);
    } finally {
      setSubmittingAudit(false);
    }
  };

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'passed':
        return 'ri-checkbox-circle-fill text-green-500';
      case 'warning':
        return 'ri-error-warning-fill text-yellow-500';
      case 'failed':
        return 'ri-close-circle-fill text-red-500';
      default:
        return 'ri-information-fill text-gray-500';
    }
  }, []);

  const getStatusBg = useCallback((status: string) => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  }, []);

  return (
    <div className="bg-white border-l border-gray-200 overflow-y-auto w-1/5 min-w-80">
      <div className="p-4 space-y-4">
        {/* 标题区域 */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{t('components.informationAnalysis.title')}</h2>
              {(() => {
                if (billLoading) {
                  return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
                }
                if (billInfo) {
                  return (
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${getAuditStatusStyle(billInfo.status)}`}
                      title={`Audit Status: ${getAuditStatusText(billInfo.status)}`}
                    >
                      {getAuditStatusText(billInfo.status)}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || billLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('components.informationAnalysis.refreshData')}
            >
              <i className={`ri-refresh-line text-base ${loading || billLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
          <p className="text-sm text-gray-600">{t('components.informationAnalysis.subtitle')}</p>
        </div>

        {/* 选中字段信息 */}
        {selectedField && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-medium text-blue-900 mb-2">{t('components.informationAnalysis.selectedField')}</h3>
            <p className="text-sm text-blue-700">
              {t('components.informationAnalysis.fieldId', { fieldId: selectedField })}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {t('components.informationAnalysis.relatedFields')}
            </p>
          </div>
        )}

        {/* 合规审核清单 */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">{t('components.informationAnalysis.expenseAuditChecklist')}</h3>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">{t('components.informationAnalysis.loading')}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-red-800">
                <i className="ri-error-warning-line"></i>
                <span>{t('components.informationAnalysis.loadingFailed', { error })}</span>
              </div>
            </div>
          )}
          
          {!loading && !error && complianceItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="ri-file-list-line text-4xl mb-2 block"></i>
              <span>{t('components.informationAnalysis.noAuditRecords')}</span>
            </div>
          )}
          
          {!loading && !error && (
            <div className="space-y-2">
              {complianceItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className={`rounded-lg border text-card-foreground shadow-sm transition-all duration-200 ${getStatusBg(item.status)}`}>
                  <button
                    className="w-full p-3 flex items-center justify-between hover:bg-transparent"
                    onClick={() => setExpandedItem(expandedItem === item.id ? '' : item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`${getStatusIcon(item.status)} w-4 h-4 flex items-center justify-center`}></i>
                      <div className="text-left">
                        <div className="font-medium text-sm text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    <i className={`ri-arrow-${expandedItem === item.id ? 'up' : 'down'}-s-line w-4 h-4 flex items-center justify-center text-gray-500`}></i>
                  </button>
                  
                  {expandedItem === item.id && (
                    <div className="px-3 pb-3">
                      <div className="h-px w-full bg-gray-300 mb-3"></div>
                      {item.details && (
                        <p className={`text-xs text-gray-700 ${item.evidence && item.evidence.length > 0 ? 'mb-3' : ''}`}>{item.details}</p>
                      )}
                      {item.evidence && item.evidence.length > 0 && (
                        <div className="space-y-1">
                          {item.evidence.map((evidence, index) => (
                            <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{evidence}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="rounded-lg border text-card-foreground shadow-sm bg-gray-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{t('components.informationAnalysis.quickActions')}</h3>
            <div className="space-y-2">
              <button 
                onClick={handleResubmitAudit}
                disabled={submittingAudit}
                className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orange-600 border border-orange-600 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className={`ri-refresh-line w-4 h-4 flex items-center justify-center ${submittingAudit ? 'animate-spin' : ''}`}></i>
                {submittingAudit ? t('components.informationAnalysis.submitting') : t('components.informationAnalysis.resubmitAudit')}
              </button>
              <button className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                {t('components.informationAnalysis.exportReport')}
              </button>
              <button className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <i className="ri-file-text-line w-4 h-4 flex items-center justify-center"></i>
                {t('components.informationAnalysis.generateReview')}
              </button>
              <button className="w-full justify-start flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                <i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
                {t('components.informationAnalysis.markAsReviewed')}
              </button>
            </div>
          </div>
        </div>

        {/* 关联分析详情 */}
        {selectedField && (
          <div className="rounded-lg border text-card-foreground shadow-sm bg-white">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('components.informationAnalysis.evidenceAnalysisDetails')}</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-1">{t('components.informationAnalysis.relationshipType')}</div>
                  <div className="text-gray-600">{t('components.informationAnalysis.amountMatchingVerification')}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-1">{t('components.informationAnalysis.confidenceLevel')}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                    </div>
                    <span className="text-gray-600">95%</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-1">{t('components.informationAnalysis.evidenceStrength')}</div>
                  <div className="text-green-600">{t('components.informationAnalysis.strongEvidenceChain')}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

export default memo(InfoPanel);