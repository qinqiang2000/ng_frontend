'use client';

import { useState, useEffect, useRef } from 'react';
import { explainJEXLExpression } from '@/client/services/jexlExplanationService';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expression: string;
  onApply: (explanation: string) => void;
  theme?: 'light' | 'dark';
}

interface ExplanationResult {
  expression: string;
  valid: boolean;
  explanation: string;
}


const supportedLanguages = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' }
];

// 获取浏览器语言环境并匹配支持的语言
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';
  
  // 精确匹配
  const exactMatch = supportedLanguages.find(lang => lang.code === browserLang);
  if (exactMatch) return exactMatch.code;
  
  // 语言代码匹配（如 zh-CN 匹配 zh-*）
  const langPrefix = browserLang.split('-')[0];
  const langMatch = supportedLanguages.find(lang => lang.code.startsWith(langPrefix));
  if (langMatch) return langMatch.code;
  
  // 默认英文
  return 'en-US';
};

export default function ExplanationModal({
  isOpen,
  onClose,
  expression,
  onApply,
  theme = 'light'
}: ExplanationModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(getBrowserLanguage());
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<ExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-explain when modal opens with expression
  useEffect(() => {
    if (isOpen && expression.trim()) {
      handleExplain();
    }
  }, [isOpen, expression]); // eslint-disable-line react-hooks/exhaustive-deps

  // Automatically re-explain when language changes (only if modal is open)
  useEffect(() => {
    if (isOpen && expression.trim()) {
      // Clear previous results immediately
      setExplanationResult(null);
      setError(null);
      // Auto-explain with new language
      handleExplain();
    }
  }, [selectedLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        overlay: 'bg-black bg-opacity-50',
        modal: 'bg-gray-900 border-gray-700',
        header: 'bg-gray-800 border-gray-700 text-gray-100',
        content: 'bg-gray-900 text-gray-100',
        input: 'bg-gray-800 border-gray-600 text-white',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondaryButton: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
        validBadge: 'bg-green-900 text-green-300',
        invalidBadge: 'bg-red-900 text-red-300',
        expression: 'bg-gray-800 text-gray-300',
        explanation: 'bg-gray-800 text-gray-200',
        dropdown: 'bg-gray-800 border-gray-600 text-white',
        dropdownButton: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600',
        dropdownMenu: 'bg-gray-800 border-gray-600'
      };
    } else {
      return {
        overlay: 'bg-black bg-opacity-50',
        modal: 'bg-white border-gray-300',
        header: 'bg-gray-50 border-gray-200 text-gray-900',
        content: 'bg-white text-gray-900',
        input: 'bg-white border-gray-300 text-gray-900',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondaryButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
        validBadge: 'bg-green-100 text-green-800',
        invalidBadge: 'bg-red-100 text-red-800',
        expression: 'bg-gray-100 text-gray-700',
        explanation: 'bg-gray-50 text-gray-800',
        dropdown: 'bg-white border-gray-300 text-gray-900',
        dropdownButton: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
        dropdownMenu: 'bg-white border-gray-300'
      };
    }
  };

  const styles = getThemeStyles();

  const handleExplain = async () => {
    if (!expression.trim()) {
      setError('No expression to explain');
      return;
    }

    setIsExplaining(true);
    setError(null);
    setShowLanguageDropdown(false); // Close dropdown when starting explanation
    try {
      const result = await explainJEXLExpression({
        expression: expression.trim(),
        language: selectedLanguage
      });

      setExplanationResult(result);
    } catch (error) {
      console.error('Explanation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to explain expression');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleApply = () => {
    if (explanationResult && explanationResult.explanation) {
      onApply(explanationResult.explanation);
      onClose();
    }
  };


  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${styles.overlay}`}>
      <div className={`relative w-full max-w-2xl mx-4 rounded-lg shadow-xl border ${styles.modal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${styles.header}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="ri-magic-line text-xl text-purple-600"></i>
              <h3 className="text-lg font-semibold">Expression Explanation</h3>
            </div>
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => !isExplaining && setShowLanguageDropdown(!showLanguageDropdown)}
                  disabled={isExplaining}
                  className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${styles.dropdownButton}`}
                >
                  <span className="mr-2">
                    {supportedLanguages.find(lang => lang.code === selectedLanguage)?.flag || '🌐'}
                  </span>
                  {supportedLanguages.find(lang => lang.code === selectedLanguage)?.name || 'Language'}
                  <i className={`ml-2 ${showLanguageDropdown ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i>
                </button>
                
                {showLanguageDropdown && (
                  <div className={`absolute top-full right-0 mt-1 min-w-[160px] border rounded-lg shadow-lg z-50 ${styles.dropdownMenu}`}>
                    {supportedLanguages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setSelectedLanguage(language.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedLanguage === language.code 
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                            : theme === 'dark' 
                              ? 'text-gray-200 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span className="mr-3">{language.flag}</span>
                        {language.name}
                        {selectedLanguage === language.code && (
                          <i className="ri-check-line float-right text-blue-600 dark:text-blue-300"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 ${styles.content}`}>
          {/* Original Expression */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Expression:</label>
            <code className={`block px-3 py-2 rounded border text-sm font-mono break-all ${styles.expression}`}>
              {expression}
            </code>
          </div>

          {/* Loading State */}
          {isExplaining && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm">
                  Generating explanation in {supportedLanguages.find(lang => lang.code === selectedLanguage)?.name}...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isExplaining && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <i className="ri-error-warning-line text-red-500 mt-0.5 mr-2"></i>
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={handleExplain}
                    className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explanation Result */}
          {explanationResult && !isExplaining && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-medium">Business Logic Explanation:</label>
                  <span className="text-xs text-gray-500">
                    ({supportedLanguages.find(lang => lang.code === selectedLanguage)?.flag} {supportedLanguages.find(lang => lang.code === selectedLanguage)?.name})
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  explanationResult.valid ? styles.validBadge : styles.invalidBadge
                }`}>
                  {explanationResult.valid ? 'Valid' : 'Invalid'}
                </span>
              </div>
              
              <div className={`p-4 rounded border text-sm leading-relaxed ${styles.explanation}`}>
                {explanationResult.explanation}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end space-x-3 ${styles.header}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-gray-500 ${styles.secondaryButton}`}
          >
            Cancel
          </button>
          {explanationResult && explanationResult.valid && (
            <button
              onClick={handleApply}
              className={`px-4 py-2 text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles.button}`}
            >
              <i className="ri-check-line mr-1"></i>
              Apply to Description
            </button>
          )}
        </div>
      </div>
    </div>
  );
}