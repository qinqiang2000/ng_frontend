'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useToast } from './ToastContainer';
import { getApiBasePath } from '@/client/lib/paths';
import ExplanationModal from './ExplanationModal';
import { useComponentsTranslation, useCommonTranslation } from '@/client/hooks/useTranslation';

interface JEXLEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onFieldPathChange?: (fieldPath: string) => void; // 新增：用于Rule Expression面板更新fieldPath
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
  mode?: 'applyTo' | 'ruleExpression'; // 新增：区分使用场景
  initialPrompt?: string; // 新增：初始化用户输入框的prompt内容
  ruleType?: string; // 新增：从Rule Configuration面板传递的rule type
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestions?: string[];
}

export default function JEXLEditor({
  value = '',
  onChange,
  onFieldPathChange,
  placeholder,
  disabled = false,
  className = '',
  theme = 'light',
  mode = 'applyTo',
  initialPrompt = '',
  ruleType = 'Information Completion Rules'
}: JEXLEditorProps) {
  const { t } = useComponentsTranslation();
  const { t: tCommon } = useCommonTranslation();
  const defaultPlaceholder = mode === 'applyTo' 
    ? t('jexlEditor.conditionsPlaceholder')
    : t('jexlEditor.expressionPlaceholder');
  
  const [aiGeneratedContent, setAiGeneratedContent] = useState(value);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isFormatted, setIsFormatted] = useState(false); // 新增：是否处于格式化显示模式
  const [rawContent, setRawContent] = useState(value); // 新增：保存原始未格式化内容
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);
  const userInputRef = useRef<HTMLTextAreaElement>(null);
  const { showSuccess, showError } = useToast();

  // 当外部 value 改变时，更新内部状态
  useEffect(() => {
    if (value !== rawContent) {
      setRawContent(value);
      setAiGeneratedContent(value);
      setIsFormatted(false);
    }
  }, [value, rawContent]);

  // 当 initialPrompt 改变时，更新用户输入框
  useEffect(() => {
    // 当 initialPrompt 改变时，总是更新用户输入框
    // 如果 initialPrompt 为空、null或undefined，则清空输入框
    setUserInput(initialPrompt || '');
  }, [initialPrompt]);

  // 获取主题样式
  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        container: 'border border-gray-600 rounded-lg bg-gray-900 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent',
        toolbar: 'bg-gray-800 border-b border-gray-600',
        toolbarText: 'text-gray-200',
        toolbarIcon: 'text-blue-400',
        button: 'border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700',
        sectionLabel: 'text-gray-400',
        aiIcon: 'text-blue-400',
        userIcon: 'text-green-400',
        textarea: 'bg-transparent text-white placeholder-gray-500',
        separator: 'border-gray-600',
        hint: 'text-gray-500',
        sendButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      };
    } else {
      return {
        container: 'border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
        toolbar: 'bg-gray-50 border-b border-gray-200',
        toolbarText: 'text-gray-700',
        toolbarIcon: 'text-blue-600',
        button: 'border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-white',
        sectionLabel: 'text-gray-600',
        aiIcon: 'text-blue-600',
        userIcon: 'text-green-600',
        textarea: 'bg-transparent text-gray-900 placeholder-gray-400',
        separator: 'border-gray-200',
        hint: 'text-gray-400',
        sendButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      };
    }
  };

  const styles = getThemeStyles();

  // AI生成接口
  const generateWithAI = async (input: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      // 根据mode决定生成类型
      const generationType = mode === 'applyTo' ? 'APPLY_TO_ONLY' : 'RULE_EXPRESSION_ONLY';
      
      // 根据Rule Configuration面板中的ruleType确定数值
      const ruleTypeValue = ruleType === 'Validation Rules' ? 1 : 2;
      
      const response = await fetch(getApiBasePath('/api/ai/rules/jexl/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ruleType: ruleTypeValue, // 使用从Rule Configuration面板传递的rule type
          businessIntent: input,
          country: 'CN',
          generationType: generationType,
          save: false,
          maxRetries: 2,
          engineType: 3
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errcode === '0000' && result.data?.generatedRule) {
        return {
          success: true,
          data: result.data.generatedRule
        };
      } else {
        throw new Error(result.message || 'Failed to generate rule');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate rule, please check network connection or retry'
      };
    }
  };

  // JEXL语法校验接口
  const validateJEXL = async (expression: string): Promise<ValidationResult> => {
    try {
      const response = await fetch(getApiBasePath('/api/ai/rules/jexl/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expression: expression
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errcode === '0000' && result.data) {
        const { valid, errors } = result.data;
        
        if (valid) {
          return {
            isValid: true,
            message: 'JEXL expression syntax is valid',
            suggestions: ['Syntax validation passed']
          };
        } else {
          const errorMessages = errors.map((error: any) => error.message).join('; ');
          return {
            isValid: false,
            message: `Syntax error: ${errorMessages}`,
            suggestions: ['Please check JEXL expression syntax', 'Ensure all operators and brackets are properly paired']
          };
        }
      } else {
        throw new Error(result.message || 'Validation request failed');
      }
    } catch (error) {
      console.error('JEXL validation failed:', error);
      return {
        isValid: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Network error'}`,
        suggestions: ['Please check network connection and retry', 'Ensure JEXL expression format is correct']
      };
    }
  };

  // 格式化JEXL表达式用于显示（更好的换行和缩进）
  const formatJEXLForDisplay = (expression: string): string => {
    if (!expression.trim()) return expression;
    
    let formatted = expression
      .replace(/\s+/g, ' ')
      .trim();
    
    // 在分号后添加换行
    formatted = formatted
      .replace(/;\s*/g, ';\n');
    
    // 在大括号前后添加换行
    formatted = formatted
      .replace(/\{\s*/g, '{\n  ')
      .replace(/\s*\}/g, '\n}');
    
    // 在逻辑操作符处添加换行
    formatted = formatted
      .replace(/\s*(&&|\|\|)\s*/g, '\n  $1 ');
    
    // 规范化基本操作符的空格
    formatted = formatted
      .replace(/([^=!<>])\s*=\s*([^=])/g, '$1 = $2')
      .replace(/\s*(==|!=|<=|>=)\s*/g, ' $1 ')
      .replace(/([^=<>])\s*([<>])\s*([^=])/g, '$1 $2 $3')
      .replace(/([^+\-*/])\s*([+*/])\s*/g, '$1 $2 ')
      .replace(/([^+\-*/])\s*(-)\s*([^+\-*/])/g, '$1 $2 $3');
    
    // 处理对象属性访问和函数调用
    formatted = formatted
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s*\[\s*/g, '[')
      .replace(/\s*\]\s*/g, ']')
      .replace(/(\w+)\s+\(/g, '$1(')
      .replace(/,\s+/g, ', ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
    
    // 处理控制结构
    formatted = formatted
      .replace(/for\s*\(\s*var\s+(\w+)\s*:\s*/g, 'for (var $1: ')
      .replace(/if\s*\(\s*/g, 'if (')
      .replace(/return\s+/g, 'return ');
    
    // 处理换行后的缩进
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indentedLines = lines.map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';
      
      // 减少缩进：遇到}
      if (trimmedLine.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = '  '.repeat(indentLevel) + trimmedLine;
      
      // 增加缩进：遇到{
      if (trimmedLine.endsWith('{')) {
        indentLevel++;
      }
      
      return indentedLine;
    });
    
    return indentedLines.join('\n').trim();
  };
  

  // 处理发送
  const handleSend = async () => {
    if (!userInput.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setValidationResult(null);
    setShowValidation(false);
    
    try {
      const result = await generateWithAI(userInput);
      
      if (result.success && result.data) {
        if (mode === 'applyTo') {
          // Rule Configuration面板：获取applyTo字段
          const applyToContent = result.data.applyTo || '';
          setRawContent(applyToContent);
          setAiGeneratedContent(applyToContent);
          setIsFormatted(false);
          onChange?.(applyToContent);
        } else if (mode === 'ruleExpression') {
          // Rule Expression面板：获取ruleExpression和fieldPath字段
          const ruleExpressionContent = result.data.ruleExpression || '';
          const fieldPath = result.data.fieldPath || '';
          
          setRawContent(ruleExpressionContent);
          setAiGeneratedContent(ruleExpressionContent);
          setIsFormatted(false);
          onChange?.(ruleExpressionContent);
          
          // 如果有fieldPath回调，调用它更新界面的Field Path输入框
          if (fieldPath && onFieldPathChange) {
            onFieldPathChange(fieldPath);
          }
        }
        setUserInput(''); // Clear user input
      } else {
        // 显示错误信息
        showError('Generation Failed', result.error || 'Please check input content and retry');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      showError('Generation Failed', 'Network error or service unavailable, please check network connection and retry');
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理校验
  const handleValidate = async () => {
    if (!rawContent.trim() || isValidating) return;
    
    setIsValidating(true);
    try {
      // 始终使用原始内容进行校验
      const result = await validateJEXL(rawContent);
      
      if (result.isValid) {
        showSuccess('Validation Passed', 'Expression syntax is valid');
      } else {
        showError('Validation Failed', result.message);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      showError('Validation Failed', 'Network error or service unavailable');
    } finally {
      setIsValidating(false);
    }
  };

  // 处理格式化显示切换
  const handleFormat = () => {
    if (isFormatted) {
      // 当前是格式化状态，切换到原始状态
      setAiGeneratedContent(rawContent);
      setIsFormatted(false);
    } else {
      // 当前是原始状态，切换到格式化状态
      const formatted = formatJEXLForDisplay(rawContent);
      setAiGeneratedContent(formatted);
      setIsFormatted(true);
    }
  };

  // 处理应用解释到用户输入框
  const handleApplyExplanation = (explanation: string) => {
    setUserInput(explanation);
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleFormat();
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 自动调整用户输入框高度（仅限用户输入区域）
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 72)}px`; // 最大高度3行
  };

  useEffect(() => {
    if (userInputRef.current) {
      adjustTextareaHeight(userInputRef.current);
    }
  }, [userInput]);

  return (
    <div className={`${className} flex flex-col h-full`}>
      {/* 整体容器 - 统一边框和背景 */}
      <div className={`${styles.container} transition-all flex-1 flex flex-col`}>
        
        {/* 顶部工具栏 */}
        <div className={`flex items-center justify-between px-3 py-2 ${styles.toolbar}`}>
          <div className="flex items-center space-x-2">
            <i className={`ri-code-s-slash-line ${styles.toolbarIcon}`}></i>
            <span className={`text-sm font-medium ${styles.toolbarText}`}>JEXL Expression Editor</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidate}
              disabled={!rawContent.trim() || isValidating}
              className={`px-2 py-1 text-xs border rounded ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {isValidating ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Validating
                </>
              ) : (
                <>
                  <i className="ri-shield-check-line mr-1"></i>
                  {t('jexlEditor.validate')}
                </>
              )}
            </button>
            <button
              onClick={handleFormat}
              disabled={!rawContent.trim()}
              className={`px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isFormatted 
                  ? theme === 'dark' 
                    ? 'bg-blue-900 text-blue-300 border-blue-700 hover:bg-blue-800' 
                    : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                  : styles.button
              }`}
            >
              <i className={`${isFormatted ? 'ri-file-text-line' : 'ri-code-line'} mr-1`}></i>
              {isFormatted ? 'Raw' : t('jexlEditor.format')}
            </button>
          </div>
        </div>

        {/* AI生成内容编辑区 */}
        <div className="flex-1 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <i className={`ri-robot-line ${styles.aiIcon} text-sm`}></i>
              <span className={`text-xs font-medium ${styles.sectionLabel}`}>{t('jexlEditor.aiGenerated')}</span>
            </div>
            <button
              onClick={() => {
                if (!rawContent.trim()) {
                  showError('No Expression', 'Please enter an expression to explain');
                  return;
                }
                setShowExplanationModal(true);
              }}
              disabled={!rawContent.trim()}
              className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                rawContent.trim() ? 'text-purple-600 hover:text-purple-700' : 'text-gray-400'
              }`}
              title="Explain expression with AI"
            >
              <i className="ri-magic-line text-sm"></i>
            </button>
          </div>
          
          <textarea
            ref={aiTextareaRef}
            value={aiGeneratedContent}
            onChange={(e) => {
              const newValue = e.target.value;
              setAiGeneratedContent(newValue);
              setRawContent(newValue);
              setIsFormatted(false); // 用户编辑时回到原始模式
              onChange?.(newValue);
            }}
            placeholder={placeholder || defaultPlaceholder}
            disabled={disabled}
            className={`w-full px-0 py-0 border-0 text-sm font-mono focus:outline-none resize-none flex-1 overflow-y-auto min-h-[120px] ${styles.textarea}`}
          />
        </div>

        {/* 分隔线 */}
        <div className={`border-t ${styles.separator}`}></div>

        {/* 用户输入区 */}
        <div className="p-3 flex-shrink-0">
          <div className="flex items-center space-x-2 mb-2">
            <i className={`ri-user-line ${styles.userIcon} text-sm`}></i>
            <span className={`text-xs font-medium ${styles.sectionLabel}`}>{t('jexlEditor.describeRequirements')}</span>
            <span className={`text-xs ${styles.hint}`}>{t('jexlEditor.keyboardHint')}</span>
          </div>
          
          <div className="flex space-x-2">
            <textarea
              ref={userInputRef}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                adjustTextareaHeight(e.target);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('jexlEditor.examplePlaceholder')}
              disabled={disabled || isGenerating}
              className={`flex-1 px-0 py-0 border-0 text-sm focus:outline-none resize-none min-h-[40px] max-h-[72px] overflow-y-auto ${styles.textarea}`}
              rows={1}
              style={{ height: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!userInput.trim() || isGenerating}
              className={`px-3 py-1.5 text-white rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start ${styles.sendButton}`}
            >
              {isGenerating ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  {tCommon('buttons.loading')}
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line mr-1"></i>
                  {t('jexlEditor.send')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Explanation Modal */}
      <ExplanationModal
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
        expression={rawContent}
        onApply={handleApplyExplanation}
        theme={theme}
      />
    </div>
  );
}