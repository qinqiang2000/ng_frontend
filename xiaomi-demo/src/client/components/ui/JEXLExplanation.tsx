'use client';

import { useState } from 'react';
import { explainJEXLExpression } from '@/client/services/jexlExplanationService';
import { useToast } from './ToastContainer';

interface JEXLExplanationProps {
  initialExpression?: string;
  className?: string;
  theme?: 'light' | 'dark';
  onExpressionChange?: (expression: string) => void;
}

interface ExplanationResult {
  expression: string;
  valid: boolean;
  explanation: string;
  language: string;
}

const languages = [
  { code: 'en-US', name: 'English' },
  { code: 'zh-CN', name: '中文' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'es-ES', name: 'Español' },
];

export default function JEXLExplanation({
  initialExpression = '',
  className = '',
  theme = 'light',
  onExpressionChange
}: JEXLExplanationProps) {
  const [expression, setExpression] = useState(initialExpression);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<ExplanationResult | null>(null);
  const { showSuccess, showError } = useToast();

  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        container: 'bg-gray-900 border-gray-600',
        header: 'bg-gray-800 border-gray-600 text-gray-200',
        input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        select: 'bg-gray-800 border-gray-600 text-white focus:ring-blue-400 focus:border-blue-400',
        result: 'bg-gray-800 border-gray-600',
        resultText: 'text-gray-200',
        validBadge: 'bg-green-900 text-green-300',
        invalidBadge: 'bg-red-900 text-red-300',
        expression: 'text-gray-300 bg-gray-700'
      };
    } else {
      return {
        container: 'bg-white border-gray-300',
        header: 'bg-gray-50 border-gray-200 text-gray-700',
        input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        select: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500',
        result: 'bg-gray-50 border-gray-200',
        resultText: 'text-gray-700',
        validBadge: 'bg-green-100 text-green-800',
        invalidBadge: 'bg-red-100 text-red-800',
        expression: 'text-gray-600 bg-gray-100'
      };
    }
  };

  const styles = getThemeStyles();

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    onExpressionChange?.(value);
    
    if (explanationResult && explanationResult.expression !== value) {
      setExplanationResult(null);
    }
  };

  const handleExplain = async () => {
    if (!expression.trim()) {
      showError('Input Error', 'Please enter a JEXL expression to explain');
      return;
    }

    setIsExplaining(true);
    try {
      const result = await explainJEXLExpression({
        expression: expression.trim(),
        language: selectedLanguage
      });

      setExplanationResult({
        ...result,
        language: selectedLanguage
      });

      if (result.valid) {
        showSuccess('Explanation Generated', 'Expression explained successfully');
      } else {
        showError('Invalid Expression', 'Expression contains syntax errors');
      }
    } catch (error) {
      console.error('Explanation failed:', error);
      showError('Explanation Failed', error instanceof Error ? error.message : 'Failed to explain expression');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExplain();
    }
  };

  return (
    <div className={`border rounded-lg ${styles.container} ${className}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${styles.header}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="ri-question-line text-blue-600"></i>
            <span className="text-sm font-medium">JEXL Expression Explanation</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs">Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`text-xs px-2 py-1 rounded border focus:outline-none focus:ring-2 ${styles.select}`}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Expression to Explain
          </label>
          <textarea
            value={expression}
            onChange={(e) => handleExpressionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your JEXL expression here..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none font-mono text-sm ${styles.input}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Press Ctrl+Enter to explain
          </p>
        </div>

        <button
          onClick={handleExplain}
          disabled={!expression.trim() || isExplaining}
          className={`px-4 py-2 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles.button}`}
        >
          {isExplaining ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Explaining...
            </>
          ) : (
            <>
              <i className="ri-magic-line mr-2"></i>
              Explain Expression
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {explanationResult && (
        <div className={`border-t p-4 ${styles.result}`}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-medium">Explanation Result</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              explanationResult.valid ? styles.validBadge : styles.invalidBadge
            }`}>
              {explanationResult.valid ? 'Valid' : 'Invalid'}
            </span>
          </div>

          {/* Original Expression */}
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">Original Expression:</label>
            <code className={`block px-3 py-2 rounded border text-sm font-mono break-all ${styles.expression}`}>
              {explanationResult.expression}
            </code>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Business Logic Explanation:
            </label>
            <div className={`p-3 rounded border text-sm leading-relaxed ${styles.resultText}`}>
              {explanationResult.explanation}
            </div>
          </div>

          {/* Language Info */}
          <div className="mt-2 text-xs text-gray-500">
            Explained in: {languages.find(l => l.code === explanationResult.language)?.name || explanationResult.language}
          </div>
        </div>
      )}
    </div>
  );
}