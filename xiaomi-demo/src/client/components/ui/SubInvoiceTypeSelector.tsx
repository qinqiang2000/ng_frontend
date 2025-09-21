'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useInvoiceRulesTranslation } from '@/client/hooks/useTranslation';

interface InvoiceTypeOption {
  id: number;
  invoiceCode: string;
  descriptionEn: string;
  level: number;
  parentCode?: string | null;
}

interface SubInvoiceTypeSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  parentInvoiceType?: string;
  parentInvoiceTypeDescription?: string; // 父类型的英文描述，用于与 level=2 的 parentCode 匹配（兼容后端）
  invoiceTypes?: InvoiceTypeOption[];
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function SubInvoiceTypeSelector({
  value = '',
  onChange,
  parentInvoiceType = '',
  parentInvoiceTypeDescription = '',
  invoiceTypes = [],
  disabled = false,
  label,
  className = ""
}: SubInvoiceTypeSelectorProps) {
  const { t } = useInvoiceRulesTranslation();
  const defaultLabel = label || t('ruleDetails.subInvoiceType');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 基于父类型筛选子类型：
  // - 优先按父类型的 code 匹配
  // - 同时兼容后端将 parentCode 填为父类型 descriptionEn 的情况
  const parentCandidates = [parentInvoiceType, parentInvoiceTypeDescription].filter(Boolean);
  const subInvoiceTypes = parentCandidates.length > 0 ?
    invoiceTypes.filter(type =>
      type.level === 2 && parentCandidates.includes(type.parentCode || '')
    ) : [];

  // Add "General" option for sub-types
  const availableOptions = [
    {
      id: 0,
      invoiceCode: '',
      descriptionEn: 'General',
      level: 2,
      parentCode: null
    },
    ...subInvoiceTypes
  ];

  // 移除调试日志，避免污染控制台

  const handleSubInvoiceTypeSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Reset value when parent changes
  useEffect(() => {
    if (value && !availableOptions.some(opt => opt.invoiceCode === value)) {
      if (onChange) {
        onChange(''); // Reset to General
      }
    }
  }, [parentInvoiceType, value, availableOptions, onChange]);

  const selectedOption = availableOptions.find(option => option.invoiceCode === value);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{defaultLabel}</label>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !disabled && setShowDropdown(!showDropdown)}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
              : 'hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-left truncate">
                {selectedOption?.descriptionEn || 'General'}
              </span>
            </div>
            {!disabled && (
              <div className="flex items-center justify-center">
                <i className={`${showDropdown ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-gray-500`}></i>
              </div>
            )}
          </div>
        </button>

        {showDropdown && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {availableOptions.map((option) => (
              <button
                key={option.invoiceCode}
                onClick={() => handleSubInvoiceTypeSelect(option.invoiceCode)}
                className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                  value === option.invoiceCode ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 leading-tight">{option.descriptionEn}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}