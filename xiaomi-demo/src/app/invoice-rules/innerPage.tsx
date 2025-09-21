'use client';

import Header from '@/client/components/Header';
import JEXLEditor from '@/client/components/ui/JEXLEditor';
import CountryRegionSelector from '@/client/components/ui/CountryRegionSelector';
import DateTimePicker from '@/client/components/ui/DateTimePicker';
import InvoiceTypeSelector, { invoiceTypeOptions, ApiInvoiceType } from '@/client/components/ui/InvoiceTypeSelector';
import SubInvoiceTypeSelector from '@/client/components/ui/SubInvoiceTypeSelector';
import JsonDataModal from '@/client/components/ui/JsonDataModal';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useCountry } from '@/client/contexts/CountryContext';
import { useToast } from '@/client/components/ui/ToastContainer';
import { getApiBasePath } from '@/client/lib/paths';
import { useInvoiceRulesTranslation } from '@/client/hooks/useTranslation';

// 定义API相关的接口
interface ApiRule {
  id: number;
  companyId: string;
  country: string;
  tradeArea?: string;
  province?: string;
  city?: string;
  tags?: string;
  invoiceType: string;
  subInvoiceType?: string;
  ruleCode: string;
  ruleName: string;
  ruleType: number;
  active: boolean;
  status: number;
  applyTo?: string;
  errorMessage?: string;
  fieldPath?: string;
  priority: number;
  ruleExpression?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  createTime?: string;
  updateTime?: string;
  fapplyToPrompt?: string;
  fruleExpressionPrompt?: string;
}

interface ApiResponse {
  errcode: string;
  message: string;
  data: ApiRule[];
  traceId?: string;
  errorMsgArray?: string[];
  noise?: string;
  sign?: string;
}

interface RuleCategory {
  label: string;
  value: string;
  icon: string;
  count: number;
  rules: ApiRule[];
  expanded: boolean;
}

export default function InvoiceRulesInnerPage() {
  const { selectedCountry } = useCountry();
  const { showSuccess, showError } = useToast();
  const { t } = useInvoiceRulesTranslation();
  const [activeRule, setActiveRule] = useState('');
  // 移除未使用的状态变量
  const [showRuleTypeDropdown, setShowRuleTypeDropdown] = useState(false);
  const [selectedRuleType, setSelectedRuleType] = useState('Information Completion Rules'); // 默认第一个选项
  const [selectedInvoiceType, setSelectedInvoiceType] = useState(''); // 默认第一个选项（公共类型）
  const [selectedSubInvoiceType, setSelectedSubInvoiceType] = useState(''); // 子发票类型
  const [ruleName, setRuleName] = useState('');
  const [priority, setPriority] = useState('');
  const [fieldPath, setFieldPath] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [isActiveStatus, setIsActiveStatus] = useState(false);
  const ruleTypeDropdownRef = useRef<HTMLDivElement>(null);

  // 发票类型相关状态
  const [apiInvoiceTypes, setApiInvoiceTypes] = useState<ApiInvoiceType[]>([]);
  const [rulesData, setRulesData] = useState<ApiRule[]>([]);

  // API相关状态
  const [loading, setLoading] = useState(true);
  const [rightPanelLoading, setRightPanelLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ruleCategories, setRuleCategories] = useState<RuleCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentRuleDetail, setCurrentRuleDetail] = useState<ApiRule | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [jexlExpression, setJexlExpression] = useState('');
  const [ruleExpression, setRuleExpression] = useState('');
  const [applyToPrompt, setApplyToPrompt] = useState('');
  const [ruleExpressionPrompt, setRuleExpressionPrompt] = useState('');

  // 测试功能相关状态
  const [testLoading, setTestLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isNewRule, setIsNewRule] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonModalData, setJsonModalData] = useState<{title: string, data: any} | null>(null);

  // 日期时间格式转换
  const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const toInputDateTime = (value?: string) => {
    if (!value) return '';

    try {
      // 处理UTC格式：2025-08-13T12:34:00.000+00:00 或 2025-08-13T12:34:00.000Z
      if (value.includes('+') || value.includes('Z') || value.includes('T')) {
        const utcDate = new Date(value);
        if (isNaN(utcDate.getTime())) return '';

        // 转换为本地时间并格式化为 YYYY-MM-DD HH:mm:ss
        const yyyy = utcDate.getFullYear();
        const MM = pad2(utcDate.getMonth() + 1);
        const DD = pad2(utcDate.getDate());
        const hh = pad2(utcDate.getHours());
        const mm = pad2(utcDate.getMinutes());
        const ss = pad2(utcDate.getSeconds());
        return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`;
      }

      // 处理标准格式 "YYYY-MM-DD HH:mm:ss" 直接返回
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        return value;
      }

      // 兜底：使用 Date 解析
      const d = new Date(value);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const MM = pad2(d.getMonth() + 1);
      const DD = pad2(d.getDate());
      const hh = pad2(d.getHours());
      const mm = pad2(d.getMinutes());
      const ss = pad2(d.getSeconds());
      return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`;
    } catch {
      return '';
    }
  };

  const fromInputToServer = (value?: string) => {
    if (!value) return '';

    try {
      // 处理 YYYY-MM-DD HH:mm:ss 格式
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        // 解析本地时间
        const [datePart, timePart] = value.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);

        // 创建本地时间
        const localDate = new Date(year, month - 1, day, hour, minute, second);
        if (isNaN(localDate.getTime())) return '';

        // 转换为UTC格式：YYYY-MM-DDTHH:mm:ss.000+00:00
        const yyyy = localDate.getUTCFullYear();
        const MM = pad2(localDate.getUTCMonth() + 1);
        const DD = pad2(localDate.getUTCDate());
        const hh = pad2(localDate.getUTCHours());
        const mm = pad2(localDate.getUTCMinutes());
        const ss = pad2(localDate.getUTCSeconds());

        return `${yyyy}-${MM}-${DD}T${hh}:${mm}:${ss}.000+00:00`;
      }

      // 兜底处理
      const localDate = new Date(value);
      if (isNaN(localDate.getTime())) return '';

      const yyyy = localDate.getUTCFullYear();
      const MM = pad2(localDate.getUTCMonth() + 1);
      const DD = pad2(localDate.getUTCDate());
      const hh = pad2(localDate.getUTCHours());
      const mm = pad2(localDate.getUTCMinutes());
      const ss = pad2(localDate.getUTCSeconds());

      return `${yyyy}-${MM}-${DD}T${hh}:${mm}:${ss}.000+00:00`;
    } catch {
      return '';
    }
  };

  // 通用接口错误信息处理：优先 message，其次 description，最后英文通用文案
  const genericErrorEn = 'An unexpected error occurred. Please try again.';
  const pickErrorMessage = (data: any, fallback: string = genericErrorEn) => {
    if (data && typeof data === 'object') {
      return (data.message || data.description || fallback) as string;
    }
    return fallback;
  };
  const parseErrorResponse = async (response: Response, fallback: string = genericErrorEn) => {
    try {
      const data = await response.json();
      return pickErrorMessage(data, fallback);
    } catch {
      return fallback;
    }
  };

  // 获取分类图标
  const getCategoryIcon = (invoiceType: string) => {
    switch (invoiceType) {
      case '': return 'ri-file-text-line';
      case '1':
      case '3': return 'ri-file-list-line';
      case '2':
      case '4':
      case '27': return 'ri-file-shield-line';
      case '5': return 'ri-file-line';
      case '12':
      case '83': return 'ri-car-line';
      case '13':
      case '84': return 'ri-roadster-line';
      case '15': return 'ri-road-line';
      case '26': return 'ri-file-2-line';
      case '380':
      case '381': return 'ri-global-line';
      default: return 'ri-file-text-line';
    }
  };

  // 生成规则分类结构 - 基于invoiceType和subInvoiceType组合分组
  const generateRuleCategories = useCallback((rules: ApiRule[]) => {
    // 创建基于发票类型和子类型组合的动态分类Map
    const categoryMap = new Map<string, RuleCategory>();

    // 将规则分配到对应的分类中
    rules.forEach(rule => {
      const invoiceType = rule.invoiceType || '';
      const subInvoiceType = rule.subInvoiceType || '';

      // 创建组合键：invoiceType_subInvoiceType
      const combinedKey = `${invoiceType}_${subInvoiceType}`;

      // 从API数据中获取描述，或使用默认描述
       let categoryLabel = 'General';

      if (apiInvoiceTypes.length > 0) {
        // 获取主类型描述
         const mainType = apiInvoiceTypes.find(t => t.invoiceCode === invoiceType && t.level === 1);
         const subType = apiInvoiceTypes.find(t => t.invoiceCode === subInvoiceType && t.level === 2);

        if (mainType && subType) {
           categoryLabel = `${mainType.descriptionEn}_${subType.descriptionEn}`;
        } else if (mainType) {
          categoryLabel = subInvoiceType ? `${mainType.descriptionEn}_General` : mainType.descriptionEn;
        } else {
          // Fallback to static options if API data not available
          const staticOption = invoiceTypeOptions.find(opt => opt.value === invoiceType);
          categoryLabel = staticOption ? staticOption.label : 'General';
          if (subInvoiceType) {
            categoryLabel += '_General';
          }
        }
      } else {
        // Fallback when no API data
        const staticOption = invoiceTypeOptions.find(opt => opt.value === invoiceType);
        categoryLabel = staticOption ? staticOption.label : 'General';
        if (subInvoiceType) {
          categoryLabel += '_General';
        }
      }

      // 获取或创建分类
       let targetCategory = categoryMap.get(combinedKey);
      if (!targetCategory) {
        targetCategory = {
          label: categoryLabel,
          value: combinedKey,
          icon: getCategoryIcon(invoiceType),
          count: 0,
          rules: [],
          expanded: false
        };
        categoryMap.set(combinedKey, targetCategory);
      }

      targetCategory.rules.push(rule);
      targetCategory.count = targetCategory.rules.length;
    });

    // 将Map转换为数组并排序
    const categories: RuleCategory[] = Array.from(categoryMap.values())
      .sort((a, b) => {
        // 优先显示General类别，然后按字母排序
        if (a.label === 'General') return -1;
        if (b.label === 'General') return 1;
        return a.label.localeCompare(b.label);
      });

    // 保留已有分组的展开状态；若当前选中规则存在于某个分组，则将该分组置为展开
    setRuleCategories(prevCategories => {
      const prevExpandedMap = new Map(prevCategories.map(c => [c.value, c.expanded]));
      const categoriesWithExpanded = categories.map(c => {
        const containsActive = c.rules.some(r => r.ruleCode === activeRule);
        const prevExpanded = prevExpandedMap.get(c.value) ?? false;
        return { ...c, expanded: containsActive ? true : prevExpanded };
      });
      return categoriesWithExpanded;
    });
  }, [apiInvoiceTypes, activeRule]);

  // 展开包含指定规则的分类
  const expandCategoryForRule = useCallback((ruleKey: { id?: number; ruleCode?: string }) => {
    setRuleCategories(prevCategories => {
      return prevCategories.map(category => {
        // 检查当前分类是否包含该规则
        const containsRule = category.rules.some(r =>
          (ruleKey.ruleCode && r.ruleCode === ruleKey.ruleCode) || (ruleKey.id && r.id === ruleKey.id)
        );

        if (containsRule) {
          return { ...category, expanded: true };
        }

        return category;
      });
    });
  }, []);

  // 重新加载规则列表和当前选中的规则
  const reloadData = useCallback(async () => {
    try {
      // 重新加载规则列表
      const response = await fetch(getApiBasePath('/invoice-rules/subscribed-rules'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry || 'CN',
          engineType: 1
        })
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();
        if (result.errcode === '0000' && result.data) {
          setRulesData(result.data);
          generateRuleCategories(result.data);

          // 保存成功后确保展开包含当前规则的分类
          if (currentRuleDetail) {
            const matched = result.data.find(r => r.id === currentRuleDetail.id || r.ruleCode === currentRuleDetail.ruleCode);
            if (matched) {
              // 更新activeRule确保选中状态正确
              setActiveRule(matched.ruleCode || matched.id.toString());
              setTimeout(() => {
                expandCategoryForRule(matched);
              }, 0);
            }
          }

          // 如果有当前选中的规则，重新查询其详情
          if (currentRuleDetail && currentRuleDetail.id) {
            // 直接调用详情查询接口，避免循环依赖
            try {
              setRightPanelLoading(true);
              const detailResponse = await fetch(getApiBasePath(`/invoice-rules/${currentRuleDetail.id}`), {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (detailResponse.ok) {
                const detailResult: { errcode: string; message: string; data: ApiRule } = await detailResponse.json();
                if (detailResult.errcode === '0000' && detailResult.data) {
                  const ruleDetail = detailResult.data;
                  setCurrentRuleDetail(ruleDetail);

                  // 填充右侧表单数据
                  setRuleName(ruleDetail.ruleName || '');
                  setSelectedRuleType(ruleDetail.ruleType === 1 ? 'Validation Rules' : 'Information Completion Rules');
                  setSelectedInvoiceType(ruleDetail.invoiceType || '');
                   setSelectedSubInvoiceType(ruleDetail.subInvoiceType || '');
                  setPriority(ruleDetail.priority?.toString() || '');
                  setRuleDescription(ruleDetail.description || '');
                  setJexlExpression(ruleDetail.applyTo || '');
                  setFieldPath(ruleDetail.fieldPath || '');
                  setErrorMessage(ruleDetail.errorMessage || '');
                  setIsActiveStatus(ruleDetail.status === 4); // 只有Activated状态才为true
                  setRuleExpression(ruleDetail.ruleExpression || '');
                  setStartTimeInput(toInputDateTime(ruleDetail.startTime));
                  setEndTimeInput(toInputDateTime(ruleDetail.endTime));
                  setApplyToPrompt(ruleDetail.fapplyToPrompt || '');
                  setRuleExpressionPrompt(ruleDetail.fruleExpressionPrompt || '');
                }
              }
            } catch (error) {
              console.error('Error fetching rule detail in reloadData:', error);
            } finally {
              setRightPanelLoading(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reloading data:', error);
    }
  }, [selectedCountry, generateRuleCategories, currentRuleDetail, expandCategoryForRule, toInputDateTime]);

  // 根据ID查询规则详情
  const fetchRuleDetail = useCallback(async (ruleId: number) => {
    try {
      setRightPanelLoading(true);

      const response = await fetch(getApiBasePath(`/invoice-rules/${ruleId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const msg = await parseErrorResponse(response, genericErrorEn);
        throw new Error(msg);
      }

      const result: { errcode: string; message: string; data: ApiRule } = await response.json();

      if (result.errcode === '0000' && result.data) {
        const ruleDetail = result.data;
        setCurrentRuleDetail(ruleDetail);
        setIsNewRule(false);

        // 清空Test and Debug部分的状态
        setTestData(null);
        setTestResult(null);
        setTestError(null);

        // 填充右侧表单数据
        setRuleName(ruleDetail.ruleName || '');
        setSelectedRuleType(ruleDetail.ruleType === 1 ? 'Validation Rules' : 'Information Completion Rules');
        setSelectedInvoiceType(ruleDetail.invoiceType || '');
         setSelectedSubInvoiceType(ruleDetail.subInvoiceType || '');
        setPriority(ruleDetail.priority?.toString() || '');
        setRuleDescription(ruleDetail.description || '');
        setJexlExpression(ruleDetail.applyTo || '');
        setFieldPath(ruleDetail.fieldPath || '');
        setErrorMessage(ruleDetail.errorMessage || '');
        setIsActiveStatus(ruleDetail.status === 4); // 只有Activated状态才为true
        setRuleExpression(ruleDetail.ruleExpression || '');
        setStartTimeInput(toInputDateTime(ruleDetail.startTime));
        setEndTimeInput(toInputDateTime(ruleDetail.endTime));
        setApplyToPrompt(ruleDetail.fapplyToPrompt || '');
        setRuleExpressionPrompt(ruleDetail.fruleExpressionPrompt || '');
      } else {
        throw new Error(pickErrorMessage(result, 'Failed to fetch rule detail'));
      }
    } catch (error) {
      console.error('Error fetching rule detail:', error);
      // 出错时保持当前数据不变，只显示错误信息
    } finally {
      setRightPanelLoading(false);
    }
  }, []);

  // 新增规则 - 调用获取编码接口并设置默认值
  const addNewRule = useCallback(async () => {
    try {
      setRightPanelLoading(true);

      // 调用获取编码接口
      const response = await fetch(getApiBasePath('/invoice-rules/generate-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry || 'CN',
          invoiceType: selectedInvoiceType || '',
          engineType: 1
        })
      });

      if (!response.ok) {
        const msg = await parseErrorResponse(response, genericErrorEn);
        throw new Error(msg);
      }

      const result: { errcode: string; message: string; data: string } = await response.json();

      if (result.errcode === '0000' && result.data) {
        // 设置新生成的规则编码
        const newRuleCode = result.data;
        setActiveRule(newRuleCode);

        // 生成默认时间：当前时间和一年后
        const now = new Date();
        const oneYearLater = new Date();
        oneYearLater.setFullYear(now.getFullYear() + 1);

        const formatDateTime = (date: Date) => {
          const yyyy = date.getFullYear();
          const MM = pad2(date.getMonth() + 1);
          const DD = pad2(date.getDate());
          const hh = pad2(date.getHours());
          const mm = pad2(date.getMinutes());
          const ss = pad2(date.getSeconds());
          return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`;
        };

        const defaultStartTime = formatDateTime(now);
        const defaultEndTime = formatDateTime(oneYearLater);

        // 清空当前规则详情并初始化右侧表单，但不触发左侧分组折叠状态变化
        setCurrentRuleDetail(null);
        setIsNewRule(true);

        // 清空Test and Debug部分的状态
        setTestData(null);
        setTestResult(null);
        setTestError(null);

        setRuleName('');
        setSelectedRuleType('Information Completion Rules');
        setSelectedInvoiceType('');
        setSelectedSubInvoiceType('');
        setPriority('1');
        setRuleDescription('');
        setFieldPath('');
        setErrorMessage('');
        setIsActiveStatus(false);
        // 新增规则时，JEXL 相关默认空
        setJexlExpression('');
        setRuleExpression('');
        setStartTimeInput(defaultStartTime);
        setEndTimeInput(defaultEndTime);
        setApplyToPrompt('');
        setRuleExpressionPrompt('');

        // 新增规则获取编码成功时，不提示，不影响左侧折叠状态
      } else {
        throw new Error(pickErrorMessage(result, 'Failed to generate rule code'));
      }
    } catch (error) {
      console.error('Error generating rule code:', error);
      showError(
        'Code Generation Failed',
        error instanceof Error ? error.message : 'Unknown error, please try again'
      );
    } finally {
      setRightPanelLoading(false);
    }
  }, [selectedCountry, selectedInvoiceType, showSuccess, showError, parseErrorResponse, toInputDateTime]);

  // 保存规则
  const saveRule = useCallback(async (showSuccessMessage = true) => {
    try {
      setSaving(true);

      // 构建请求数据
      const ruleData = {
        ...(currentRuleDetail?.id && { id: currentRuleDetail.id }), // 如果是更新，包含ID
        country: selectedCountry || 'CN',
        invoiceType: selectedInvoiceType,
        subInvoiceType: selectedSubInvoiceType,
        ruleCode: activeRule,
        ruleName: ruleName,
        ruleType: selectedRuleType === 'Validation Rules' ? 1 : 2,
        active: isActiveStatus,
        // 新增规则默认为草稿(1)，其他情况下根据开关决定 3/4
        status: (isNewRule ? 1 : (isActiveStatus ? 4 : 3)),
        applyTo: jexlExpression,
        errorMessage: errorMessage,
        fieldPath: fieldPath,
        priority: parseInt(priority) || 1,
        ruleExpression: ruleExpression,
        description: ruleDescription,
        startTime: startTimeInput ? fromInputToServer(startTimeInput) : '2024-01-01T00:00:00.000+00:00',
        endTime: endTimeInput ? fromInputToServer(endTimeInput) : '2025-12-31T23:59:59.000+00:00',
        fapplyToPrompt: applyToPrompt,
        fruleExpressionPrompt: ruleExpressionPrompt,
        engineType: 1
      };

      // 根据是否有ID决定调用插入还是更新接口
      const isUpdate = currentRuleDetail && currentRuleDetail.id;
      const method = isUpdate ? 'PUT' : 'POST';
      const url = getApiBasePath('/invoice-rules');

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData)
      });

      if (!response.ok) {
        const msg = await parseErrorResponse(response, genericErrorEn);
        throw new Error(msg);
      }

      const result: { errcode: string; message: string; data: { id: number } } = await response.json();

      if (result.errcode === '0000') {
        // 保存成功 - 只有当showSuccessMessage为true时才显示成功消息
        if (showSuccessMessage) {
          showSuccess(
            isUpdate ? t('messages.ruleUpdated') : t('messages.ruleCreated'),
            isUpdate ? t('messages.ruleUpdated') : t('messages.ruleCreated')
          );
        }

        // 如果使用了默认时间值，需要更新界面显示为本地时间
        if (!startTimeInput) {
          setStartTimeInput('2024-01-01 00:00:00');
        }
        if (!endTimeInput) {
          setEndTimeInput('2025-12-31 23:59:59');
        }

        // 如果是新增规则，设置临时规则ID，但让reloadData来获取完整的规则详情
        if (!isUpdate && result.data) {
          // 设置临时的currentRuleDetail以保持界面状态，但依赖reloadData获取准确数据
          setCurrentRuleDetail({
            ...currentRuleDetail,
            id: result.data.id
          } as ApiRule);
        }

        // 重新加载数据并确保展开包含当前规则的分类
        await reloadData();
      } else {
        throw new Error(pickErrorMessage(result, 'Failed to save rule'));
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      showError(
        t('buttons.save') + ' Failed',
        error instanceof Error ? error.message : 'Unknown error, please try again'
      );
    } finally {
      setSaving(false);
    }
  }, [
    currentRuleDetail,
    selectedCountry,
    selectedInvoiceType,
    selectedSubInvoiceType,
    activeRule,
    ruleName,
    selectedRuleType,
    isActiveStatus,
    jexlExpression,
    errorMessage,
    fieldPath,
    priority,
    ruleExpression,
    ruleDescription,
    startTimeInput,
    endTimeInput,
    isNewRule,
    showSuccess,
    showError,
    reloadData,
    applyToPrompt,
    ruleExpressionPrompt,
    fromInputToServer,
    parseErrorResponse
  ]);

  // 执行测试流程
  const executeTest = useCallback(async () => {
    if (!activeRule) {
      showError(t('actions.test') + ' Failed', 'No rule selected for testing');
      return;
    }

    try {
      setTestLoading(true);
      setTestError(null);
      setTestResult(null);

      // 步骤1: 首先保存规则 (不显示成功消息)
      await saveRule(false);

      // 步骤2: 获取测试用的发票数据模板
      const templateResponse = await fetch(getApiBasePath('/api/ai/rules/jexl/generate-test-data'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleExpression: ruleExpression || '',
          applyTo: jexlExpression || '',
          ruleType: selectedRuleType === 'Validation Rules' ? 1 : 2,
          country: selectedCountry || 'CN',
          invoiceType: selectedInvoiceType || '',
          ruleDescription: ruleDescription || '',
          fieldPath: fieldPath || '',
          testCaseCount: 1,
          focusScenarios: ['positive']
        })
      });

      if (!templateResponse.ok) {
        const msg = await parseErrorResponse(templateResponse, genericErrorEn);
        throw new Error(msg);
      }

      const templateResult = await templateResponse.json();
      if (templateResult.errcode !== '000000' && templateResult.errcode !== '0000' && templateResult.errcode !== '200') {
        throw new Error(pickErrorMessage(templateResult, 'Failed to generate test data'));
      }

      // Extract invoice data from the first test case
      const testCases = templateResult.data?.testCases || [];
      if (testCases.length === 0) {
        throw new Error('No test cases generated');
      }

      const invoiceData = testCases[0].invoiceData.Invoice;
      setTestData(invoiceData);

      // 步骤3: 使用获取到的数据进行规则验证
      const validateResponse = await fetch(getApiBasePath('/jexl/api/validateInvoice'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleCode: activeRule,
          invoice: invoiceData
        })
      });

      if (!validateResponse.ok) {
        const msg = await parseErrorResponse(validateResponse, genericErrorEn);
        throw new Error(msg);
      }

      const validateResult = await validateResponse.json();

      // 检查errcode是否为0000，如果不是则显示errorMsgArray的错误信息
      if (validateResult.errcode !== '0000') {
        let errorMessage = 'Rule validation failed';

        // 如果有errorMsgArray，显示其中的错误信息
        if (validateResult.errorMsgArray && Array.isArray(validateResult.errorMsgArray) && validateResult.errorMsgArray.length > 0) {
          errorMessage = validateResult.errorMsgArray.join('; ');
        } else {
          // 如果没有errorMsgArray，使用通用的错误信息处理
          errorMessage = pickErrorMessage(validateResult, 'Rule validation failed');
        }

        throw new Error(errorMessage);
      }

      setTestResult(validateResult); // 保存完整的响应结果，包含data字段
      showSuccess(t('messages.validationPassed'), t('messages.validationPassed'));

    } catch (error) {
      console.error('Test execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during testing';
      setTestError(errorMessage);
      showError(t('actions.test') + ' Failed', errorMessage);
    } finally {
      setTestLoading(false);
    }
  }, [activeRule, selectedInvoiceType, selectedCountry, saveRule, showSuccess, showError]);

  // 查看完整JSON数据
  const viewJsonData = useCallback((title: string, data: any) => {
    setJsonModalData({ title, data });
    setShowJsonModal(true);
  }, []);

  // 从后台获取规则数据
  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setRightPanelLoading(true);
      setError(null);

      const response = await fetch(getApiBasePath('/invoice-rules/subscribed-rules'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: selectedCountry || 'CN',
          engineType: 1
        })
      });

      if (!response.ok) {
        const msg = await parseErrorResponse(response, genericErrorEn);
        throw new Error(msg);
      }

      const result: ApiResponse = await response.json();

      if (result.errcode === '0000' && result.data) {
        setRulesData(result.data);
        // 自动选中第一条规则
        if (result.data.length > 0) {
          const firstRule = result.data[0];
          setActiveRule(firstRule.ruleCode || firstRule.id.toString());
          // 先设置 activeRule，再生成分组，这样 generateRuleCategories 能根据 activeRule 默认展开
          setTimeout(() => {
            generateRuleCategories(result.data);
            fetchRuleDetail(firstRule.id);
          }, 0);
        } else {
          generateRuleCategories(result.data);
          // 无数据时清空右侧详情和当前选中规则
          setActiveRule('');
          setCurrentRuleDetail(null);

          // 清空Test and Debug部分的状态
          setTestData(null);
          setTestResult(null);
          setTestError(null);

          setRuleName('');
          setSelectedRuleType('Information Completion Rules');
          setSelectedInvoiceType('');
          setPriority('');
          setRuleDescription('');
          setJexlExpression('');
          setFieldPath('');
          setErrorMessage('');
          setIsActiveStatus(false);
          setRuleExpression('');
          setApplyToPrompt('');
          setRuleExpressionPrompt('');
          setRightPanelLoading(false);
        }
      } else {
        throw new Error(pickErrorMessage(result, 'Failed to fetch rules'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : genericErrorEn);

      // 使用静态数据作为后备
      generateRuleCategories([]);
      setRightPanelLoading(false);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, generateRuleCategories]);

  // 首次进入/国家变化时先加载发票类型
  const loadInvoiceTypes = useCallback(async () => {
    if (!selectedCountry) return;
    try {
      const resp = await fetch(getApiBasePath(`/api/invoice-type/search?country=${encodeURIComponent(selectedCountry)}`));
      if (resp.ok) {
        const result = await resp.json();
        if (result.errcode === '0000' && result.data) {
          setApiInvoiceTypes(result.data);
        }
      }
    } catch (e) {
      console.error('Error loading invoice types:', e);
    }
  }, [selectedCountry]);

  // 搜索处理函数
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (term.trim()) {
        let firstMatchFound = false;
        const updatedCategories = ruleCategories.map(category => {
          const hasMatchingRule = category.rules.some(rule =>
            rule.ruleName.toLowerCase().includes(term.toLowerCase()) ||
            rule.ruleCode.toLowerCase().includes(term.toLowerCase())
          );

          // 只展开第一个匹配的分类
          if (hasMatchingRule && !firstMatchFound) {
            firstMatchFound = true;
            return { ...category, expanded: true };
          }

          return { ...category, expanded: false };
        });

        setRuleCategories(updatedCategories);
      } else {
        // 清空搜索时，展开当前选中规则所在的分类
        const updatedCategories = ruleCategories.map(category => {
          const containsActiveRule = category.rules.some(r => r.ruleCode === activeRule);
          return {
            ...category,
            expanded: containsActiveRule
          };
        });
        setRuleCategories(updatedCategories);
      }
    }, 300);
  }, [ruleCategories, activeRule]);

  // 切换分类展开状态
  const toggleCategory = useCallback((index: number) => {
    const updatedCategories = [...ruleCategories];
    updatedCategories[index].expanded = !updatedCategories[index].expanded;
    setRuleCategories(updatedCategories);
  }, [ruleCategories]);

  const ruleTypeOptions = [
    { value: 'completion', label: 'Information Completion Rules', description: 'Auto-complete missing invoice information fields' },
    { value: 'validation', label: 'Validation Rules', description: 'Verify invoice information completeness and accuracy' }
  ];

  // 获取规则类型的简短显示文本
  const getRuleTypeDisplayText = (ruleType: string) => {
    switch (ruleType) {
      case 'Validation Rules':
        return t('ruleTypes.validation');
      case 'Information Completion Rules':
        return t('ruleTypes.completion');
      default:
        return t('ruleTypes.completion');
    }
  };

  // 获取规则状态的显示文本
  const getStatusDisplayText = (status: number) => {
    switch (status) {
      case 1:
        return t('status.draft');
      case 2:
        return t('status.testing');
      case 3:
        return t('status.published');
      case 4:
        return t('status.active');
      default:
        return t('status.draft');
    }
  };

  // 获取规则状态对应的样式
  const getStatusStyles = (status: number) => {
    switch (status) {
      case 1:
        return 'bg-gray-500'; // 草稿 - 灰色
      case 2:
        return 'bg-blue-500'; // 测试通过 - 蓝色
      case 3:
        return 'bg-orange-500'; // 已发布 - 橙色
      case 4:
        return 'bg-green-500'; // 已激活 - 绿色
      default:
        return 'bg-gray-500';
    }
  };

  // 判断是否可以切换Active Status（在Published和Activated状态之间可以双向切换）
  const canToggleActiveStatus = () => {
    const status = isNewRule ? 1 : (currentRuleDetail?.status || 3);
    // 允许在Published(3)和Activated(4)状态之间双向切换
    return status === 3 || status === 4;
  };

  // 获取当前Active Status的状态（基于status而非active字段）
  const getCurrentActiveStatus = () => {
    if (isNewRule) return false; // 新建规则默认草稿，非激活
    const status = currentRuleDetail?.status || 3;
    return status === 4; // 只有status=4(Activated)时才为true
  };

  // 处理Active Status切换
  const handleActiveStatusToggle = () => {
    if (!canToggleActiveStatus()) return;

    // 在Published(3)和Activated(4)之间双向切换
    const currentStatus = getCurrentActiveStatus();
    const newActiveStatus = !currentStatus;
    setIsActiveStatus(newActiveStatus);

    // 同时更新currentRuleDetail的status，确保状态同步
    if (currentRuleDetail) {
      setCurrentRuleDetail({
        ...currentRuleDetail,
        status: newActiveStatus ? 4 : 3, // 激活状态为4，发布状态为3
        active: newActiveStatus
      });
    }
  };

  // Close rule type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ruleTypeDropdownRef.current && !ruleTypeDropdownRef.current.contains(event.target as Node)) {
        setShowRuleTypeDropdown(false);
      }
    };

    if (showRuleTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRuleTypeDropdown]);

  const handleRuleTypeSelect = (option: typeof ruleTypeOptions[0]) => {
    setSelectedRuleType(option.label);
    setShowRuleTypeDropdown(false);
  };

  // 初始化数据获取和国家变更时重新获取数据
  useEffect(() => {
    loadInvoiceTypes();
    fetchRules();
  }, [selectedCountry]); // eslint-disable-line react-hooks/exhaustive-deps

  // 发票类型加载后或 activeRule 变化时，基于最新规则数据重新生成分组标签
  useEffect(() => {
    if (rulesData && Array.isArray(rulesData)) {
      generateRuleCategories(rulesData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiInvoiceTypes, activeRule]);

  const hasRules = ruleCategories.some(c => c.rules.length > 0) || activeRule; // 有规则或者有选中的规则编码（新增状态）

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header />

    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${leftSidebarCollapsed ? 'w-12' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}>
        {!leftSidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
              <button
                onClick={addNewRule}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <i className="ri-add-line"></i>
              </button>
            </div>
            {/* Country Filter */}
            <CountryRegionSelector className="mb-4" />

            <div className="relative">
              <input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={loading}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
          </div>
        )}

        {!leftSidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 mt-3 text-sm">{t('loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <i className="ri-error-warning-line text-red-500 mt-0.5 mr-2"></i>
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={() => fetchRules()}
                    className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                  >
                    重试
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rules List */}
          {!loading && (
          <div className="space-y-2">
              {ruleCategories.map((category, index) => {
                const term = searchTerm.trim().toLowerCase();
                const matches = term
                  ? category.rules.filter(rule =>
                      (rule.ruleName || '').toLowerCase().includes(term) ||
                      (rule.ruleCode || '').toLowerCase().includes(term)
                    )
                  : category.rules;
                const matchCount = matches.length;
                if (term && matchCount === 0) return null;
                return (
                  <div key={category.value} className="space-y-1">
                <button
                      onClick={() => toggleCategory(index)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${category.expanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} text-gray-500`}></i>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${category.icon} text-blue-500`}></i>
                  </div>
                      <span className="text-sm font-medium text-gray-900">{category.label}</span>
                      <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">{term ? matchCount : category.count}</span>
                </button>

                    {category.expanded && (
                  <div className="ml-6 space-y-1">
                        {matches.map((rule) => (
                      <button
                            key={rule.ruleCode}
                            onClick={() => {
                              setActiveRule(rule.ruleCode);
                              fetchRuleDetail(rule.id);
                            }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left cursor-pointer ${
                              activeRule === rule.ruleCode ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                              <i className={`ri-file-add-line ${activeRule === rule.ruleCode ? 'text-blue-600' : 'text-gray-500'}`}></i>
                        </div>
                        <div className="flex-1">
                              <div className={`text-sm font-medium ${activeRule === rule.ruleCode ? 'text-blue-600' : 'text-gray-900'}`}>{rule.ruleCode}</div>
                              <div className="text-xs text-gray-500">{rule.ruleName}</div>
                        </div>
                            <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      </button>
                    ))}
                        {matches.length === 0 && (
                          <div className="text-xs text-gray-500 px-3 py-2">无匹配规则</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty State */}
              {ruleCategories.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i className="ri-file-list-3-line text-2xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-500 text-sm">{t('noRuleData')}</p>
                  </div>
                )}
              </div>
          )}
          </div>
        )}

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer z-20 flex items-center justify-center ${
            leftSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : '-right-4'
          }`}
          title={leftSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`text-gray-600 text-sm ${leftSidebarCollapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'}`}></i>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        {hasRules && (
          <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">{activeRule}</h1>
                <span className={`px-3 py-1 text-white text-sm rounded-full ${
                  getStatusStyles(isNewRule ? 1 : (currentRuleDetail?.status || 3))
                }`}>
                  {getStatusDisplayText(isNewRule ? 1 : (currentRuleDetail?.status || 3))}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{getRuleTypeDisplayText(selectedRuleType)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => saveRule()}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-4 h-4 flex items-center justify-center inline-block mr-2">
                    <i className={saving ? "ri-loader-4-line animate-spin" : "ri-save-line"}></i>
                  </div>
                  {saving ? t('buttons.loading') : t('ruleEditor.saveRule')}
                </button>
              </div>
            </div>
            <div className="text-lg font-medium text-gray-900 mb-2">{ruleName}</div>
            {(currentRuleDetail || isNewRule) && (
              <div className="text-sm text-gray-600 mb-1">
                {(() => {
                  const invoiceType = (currentRuleDetail?.invoiceType || selectedInvoiceType || '');
                  const subInvoiceType = (currentRuleDetail?.subInvoiceType || selectedSubInvoiceType || '');
                  const mainType = apiInvoiceTypes.find(t => t.invoiceCode === invoiceType && t.level === 1);
                  const subType = apiInvoiceTypes.find(t => t.invoiceCode === subInvoiceType && t.level === 2);
                  const mainLabel = mainType ? mainType.descriptionEn : (invoiceType || 'General');
                  const subLabel = subType ? subType.descriptionEn : (subInvoiceType ? 'General' : '');
                  return subLabel ? `${mainLabel} _ ${subLabel}` : mainLabel;
                })()}
              </div>
            )}
            <p className="text-gray-600">
              {ruleDescription}
            </p>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Rule Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col relative">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">{t('ruleEditor.ruleConfiguration')}</h3>
              </div>
              <div className="flex flex-col">
                {/* Loading Overlay */}
                {rightPanelLoading && hasRules && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                      </div>
                      <p className="text-gray-600 mt-3 text-sm">{t('loading')}</p>
                    </div>
                  </div>
                )}
                {/* 表单内容区域 / 空状态 */}
                <div className="p-4 space-y-4">
                  {hasRules ? (
                    <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleDetails.ruleName')}</label>
                      <input
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('ruleDetails.ruleName')}
                      />
                    </div>

                  <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.ruleType')}</label>
                      <div className="relative" ref={ruleTypeDropdownRef}>
                        <button
                          onClick={() => setShowRuleTypeDropdown(!showRuleTypeDropdown)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        >
                          {selectedRuleType}
                          <div className="w-4 h-4 flex items-center justify-center float-right">
                            <i className={`${showRuleTypeDropdown ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-gray-500`}></i>
                          </div>
                        </button>

                        {showRuleTypeDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            {ruleTypeOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleRuleTypeSelect(option)}
                                className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-4 h-4 flex items-center justify-center mt-0.5">
                                    <i
                                      className={`${
                                        option.value === 'completion'
                                          ? 'ri-file-add-line text-blue-500'
                                          : option.value === 'validation'
                                          ? 'ri-shield-check-line text-green-500'
                                          : option.value === 'format'
                                          ? 'ri-code-line text-purple-500'
                                          : option.value === 'tax'
                                          ? 'ri-calculator-line text-orange-500'
                                          : option.value === 'delivery'
                                          ? 'ri-send-plane-line text-indigo-500'
                                          : 'ri-settings-line text-gray-500'
                                      }`}
                                    ></i>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                                    <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                      <div className="col-span-4">
                      <InvoiceTypeSelector
                        value={selectedInvoiceType}
                        onChange={setSelectedInvoiceType}
                        disabled={false}
                        invoiceTypes={apiInvoiceTypes}
                      />
                    </div>
                      <div className="col-span-4">
                        <SubInvoiceTypeSelector
                          value={selectedSubInvoiceType}
                          onChange={setSelectedSubInvoiceType}
                          parentInvoiceType={selectedInvoiceType}
                          parentInvoiceTypeDescription={(apiInvoiceTypes.find(t => t.level === 1 && t.invoiceCode === selectedInvoiceType)?.descriptionEn) || ''}
                          invoiceTypes={apiInvoiceTypes}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4 order-1 md:order-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleDetails.effectiveDate')}</label>
                        <DateTimePicker
                          value={startTimeInput}
                          onChange={(v) => setStartTimeInput(v)}
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4 order-2 md:order-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleDetails.expiryDate')}</label>
                        <DateTimePicker
                          value={endTimeInput}
                          onChange={(v) => setEndTimeInput(v)}
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4 order-3 md:order-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleDetails.priority')}</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0-100"
                        />
                      </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleDetails.description')}</label>
                    <textarea
                      rows={2}
                      value={ruleDescription}
                      onChange={(e) => setRuleDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('ruleDetails.description')}
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleDetails.fieldPath')}</label>
                    <input
                      value={fieldPath}
                      onChange={(e) => setFieldPath(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. invoice.vat_details"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleDetails.errorMessage')}</label>
                    <textarea
                      rows={2}
                      value={errorMessage}
                      onChange={(e) => setErrorMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('ruleDetails.errorMessage')}
                    />
                  </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">
                      {t('noRuleData')}
                    </div>
                  )}
                </div>

                {/* 底部状态区域 */}
                {hasRules && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">{t('status.active')}</label>
                      <div className="relative">
                        <button
                          onClick={handleActiveStatusToggle}
                          disabled={!canToggleActiveStatus()}
                          className={`w-11 h-6 rounded-full shadow-inner relative transition-colors duration-200 ${
                            canToggleActiveStatus() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                          } ${
                            getCurrentActiveStatus() ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title={canToggleActiveStatus() ?
                            (getCurrentActiveStatus() ? 'Click to set as Published' : 'Click to activate rule') :
                            'Active status can only be toggled for Published or Activated rules'}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-transform duration-200 ${
                            getCurrentActiveStatus() ? 'translate-x-5' : 'translate-x-1'
                          }`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rule Expression */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col relative">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{t('ruleEditor.ruleExpression')}</h3>
              </div>
              <div className="p-4 flex flex-col h-full" style={{ minHeight: '700px' }}>
                {/* Loading Overlay */}
                {rightPanelLoading && hasRules && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                      </div>
                      <p className="text-gray-600 mt-3 text-sm">加载规则表达式...</p>
                    </div>
                  </div>
                )}
                {hasRules ? (
                <div className="flex flex-col h-full gap-6">
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('ruleEditor.conditions')}</label>
                    <div className="h-75 border border-gray-200 rounded-lg overflow-hidden">
                      <JEXLEditor
                        key={`applyTo-${activeRule || 'new'}`}
                        value={jexlExpression}
                        onChange={setJexlExpression}
                        placeholder={t('ruleEditor.conditionsPlaceholder')}
                        mode="applyTo"
                        initialPrompt={applyToPrompt}
                        className="h-full w-full"
                        theme="dark"
                        ruleType={selectedRuleType}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-shrink-0">{t('ruleEditor.execute')}</label>
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                      <JEXLEditor
                        key={`ruleExpression-${activeRule || 'new'}`}
                        value={ruleExpression}
                        onChange={setRuleExpression}
                        onFieldPathChange={setFieldPath}
                        placeholder={t('ruleEditor.ruleExpressionPlaceholder')}
                        theme="dark"
                        className="h-full w-full"
                        mode="ruleExpression"
                        initialPrompt={ruleExpressionPrompt}
                        ruleType={selectedRuleType}
                      />
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    No rule data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test and Debug Section */}
          {hasRules && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{t('ruleEditor.testAndDebug')}</h3>
                  <button
                    onClick={executeTest}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || rightPanelLoading || testLoading || !activeRule}
                  >
                    <div className="w-4 h-4 flex items-center justify-center inline-block mr-2">
                      <i className={testLoading ? "ri-loader-4-line animate-spin" : "ri-play-line"}></i>
                    </div>
                    {testLoading ? t('buttons.loading') : t('ruleEditor.testRun')}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-6 items-stretch">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">{t('ruleEditor.testData')}</h4>
                      {testData && (
                        <button
                          onClick={() => viewJsonData('Complete Test Data', testData)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          View Complete Data
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm flex-1 overflow-y-auto">
                      {testData ? (
                        <>
                          <div className="text-gray-600 mb-2">Invoice data template:</div>
                          <div className="font-mono text-xs break-all whitespace-pre-wrap">
                            {(() => {
                              // 只显示JSON数据的前8个key
                              const allKeys = Object.keys(testData || {});
                              const displayFields = allKeys.slice(0, 8).map(key => {
                                const value = testData[key];
                                let displayValue;

                                if (value === null || value === undefined) {
                                  displayValue = 'N/A';
                                } else if (Array.isArray(value)) {
                                  displayValue = `Array(${value.length})`;
                                } else if (typeof value === 'object') {
                                  // 对于对象，显示简化的信息
                                  if (value.name && value.value) {
                                    displayValue = `${value.name} (${value.value})`;
                                  } else if (value.Party?.PartyName?.[0]?.Name) {
                                    displayValue = value.Party.PartyName[0].Name;
                                  } else {
                                    displayValue = JSON.stringify(value).slice(0, 40) + '...';
                                  }
                                } else {
                                  displayValue = String(value);
                                }

                                return { key, value: displayValue };
                              });

                              return displayFields.map(({ key, value }, index) => (
                                <div key={`${key}-${index}`} className="break-all">
                                  {key}: {String(value || 'N/A')}
                                </div>
                              ));
                            })()}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          {testLoading ? t('loading') : t('ruleEditor.clickTestRun')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">{t('ruleEditor.executionResult')}</h4>
                      {testResult && (
                        <button
                          onClick={() => viewJsonData('Complete Execution Result', testResult)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          View Complete Data
                        </button>
                      )}
                    </div>
                    <div className={`rounded-lg p-3 text-sm flex-1 overflow-y-auto ${
                      testError
                        ? 'bg-red-50'
                        : testResult
                          ? 'bg-green-50'
                          : 'bg-gray-50'
                    }`}>
                      {testError ? (
                        <>
                          <div className="text-red-700 mb-2">
                            <div className="w-4 h-4 flex items-center justify-center inline-block mr-1">
                              <i className="ri-close-line"></i>
                            </div>
                            Test Failed
                          </div>
                          <div className="font-mono text-xs text-red-600 break-all whitespace-pre-wrap">
                            {testError}
                          </div>
                        </>
                      ) : testResult ? (
                        <>
                          <div className="text-green-700 mb-2">
                            <div className="w-4 h-4 flex items-center justify-center inline-block mr-1">
                              <i className="ri-check-line"></i>
                            </div>
                            {selectedRuleType === 'Information Completion Rules' ? 'Completion Successful' : 'Validation Successful'}
                          </div>
                          <div className="font-mono text-xs break-all whitespace-pre-wrap">
                            {selectedRuleType === 'Information Completion Rules' && fieldPath ? (
                              // 对于信息补全规则，显示Field Path对应的值
                              <>
                                <div className="text-blue-600 mb-1 break-all">{t('ruleDetails.fieldPath')}: {fieldPath}</div>
                                {(() => {
                                  // 获取Field Path对应的值
                                  const getFieldPathValue = (obj: any, path: string) => {
                                    try {
                                      // 尝试多种路径解析方式
                                      const tryPaths = [
                                        path, // 原始路径
                                        path.startsWith('invoice.') ? path.substring(8) : path, // 移除invoice.前缀
                                        path.startsWith('Invoice.') ? path.substring(8) : path, // 移除Invoice.前缀（大写）
                                      ];

                                      for (const tryPath of tryPaths) {
                                        const keys = tryPath.split('.');
                                        let value = obj;
                                        let pathValid = true;

                                        for (const key of keys) {
                                          if (value && typeof value === 'object' && key in value) {
                                            value = value[key];
                                          } else {
                                            pathValid = false;
                                            break;
                                          }
                                        }

                                        if (pathValid && value !== undefined && value !== null) {
                                          return value;
                                        }
                                      }

                                      // 如果所有路径都失败，尝试在整个对象中搜索最终的键名
                                      const finalKey = path.split('.').pop();
                                      if (finalKey) {
                                        const searchValue = (searchObj: any, targetKey: string): any => {
                                          if (!searchObj || typeof searchObj !== 'object') return undefined;

                                          if (targetKey in searchObj) {
                                            return searchObj[targetKey];
                                          }

                                          for (const key in searchObj) {
                                            if (typeof searchObj[key] === 'object') {
                                              const found = searchValue(searchObj[key], targetKey);
                                              if (found !== undefined) return found;
                                            }
                                          }
                                          return undefined;
                                        };

                                        const foundValue = searchValue(obj, finalKey);
                                        if (foundValue !== undefined && foundValue !== null) {
                                          return foundValue;
                                        }
                                      }

                                      return 'N/A';
                                    } catch {
                                      return 'N/A';
                                    }
                                  };

                                  // 从testResult.data中获取字段值
                                  const fieldValue = getFieldPathValue(testResult?.data || testResult, fieldPath);
                                  const displayValue = typeof fieldValue === 'object'
                                    ? JSON.stringify(fieldValue, null, 2)
                                    : String(fieldValue);

                                  return (
                                    <>
                                      <div className="text-green-600">Completed Value:</div>
                                      <div className="bg-white p-2 rounded border mt-1 max-h-16 overflow-y-auto break-all whitespace-pre-wrap">
                                        {displayValue.length > 100 ? displayValue.slice(0, 100) + '...' : displayValue}
                                      </div>
                                    </>
                                  );
                                })()}
                                {typeof testResult?.data === 'object' && (
                                  <div className="mt-2 text-gray-600">
                                    Total fields: {Object.keys(testResult.data).length}
                                  </div>
                                )}
                              </>
                            ) : (
                              // 对于验证规则或其他类型，显示常规结果
                              (() => {
                                const dataToShow = testResult?.data || testResult;
                                return typeof dataToShow === 'object' ? (
                                  Object.entries(dataToShow).slice(0, 4).map(([key, value]) => (
                                    <div key={key} className="break-all">{key}: {typeof value === 'object' ? JSON.stringify(value).slice(0, 40) + '...' : String(value)}</div>
                                  ))
                                ) : (
                                  <div className="break-all">Result: {String(dataToShow)}</div>
                                );
                              })()
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          {testLoading ? t('ruleEditor.testRun') : t('ruleEditor.clickTestExecute')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col h-full">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t('ruleEditor.debugLog')}</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm flex-1 overflow-y-auto">
                      <div className="font-mono text-xs space-y-1 break-all whitespace-pre-wrap">
                        {testLoading ? (
                          <>
                            <div className="text-blue-600 break-all">[INFO] Starting test execution...</div>
                            <div className="text-yellow-600 break-all">[DEBUG] Saving rule...</div>
                            {testData && <div className="text-blue-600 break-all">[INFO] Test data loaded</div>}
                            <div className="text-yellow-600 break-all">[DEBUG] Running validation...</div>
                          </>
                        ) : testResult ? (
                          <>
                            <div className="text-blue-600 break-all">[INFO] Rule saved successfully</div>
                            <div className="text-green-600 break-all">[DEBUG] Invoice template loaded</div>
                            {selectedRuleType === 'Information Completion Rules' ? (
                              <>
                                <div className="text-green-600 break-all">[DEBUG] Information completion executed</div>
                                {fieldPath && <div className="text-green-600 break-all">[DEBUG] Field {fieldPath} completed</div>}
                                <div className="text-blue-600 break-all">[INFO] Information completion completed</div>
                              </>
                            ) : (
                              <>
                                <div className="text-green-600 break-all">[DEBUG] Validation completed</div>
                                <div className="text-blue-600 break-all">[INFO] Rule validation completed</div>
                              </>
                            )}
                          </>
                        ) : testError ? (
                          <>
                            <div className="text-red-600 break-all">[ERROR] Test execution failed</div>
                            <div className="text-red-600 break-all">[ERROR] {testError}</div>
                          </>
                        ) : (
                          <div className="text-gray-500 text-center py-4">
                            {t('ruleEditor.debugLogsWillAppear')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>

    {/* JSON Data Modal */}
    <JsonDataModal
      isOpen={showJsonModal}
      onClose={() => setShowJsonModal(false)}
      title={jsonModalData?.title || ''}
      data={jsonModalData?.data}
    />
    </div>
  );
}