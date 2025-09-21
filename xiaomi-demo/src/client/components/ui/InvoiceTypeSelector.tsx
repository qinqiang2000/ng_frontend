'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useInvoiceRulesTranslation } from '@/client/hooks/useTranslation';
// import { useCountry } from '@/client/contexts/CountryContext';

interface InvoiceTypeOption {
  value: string;
  label: string;
  code: string;
}

export interface ApiInvoiceType {
  id: number;
  invoiceCode: string;
  descriptionEn: string;
  level: number;
  parentCode?: string | null;
}

interface InvoiceTypeSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  onInvoiceTypesLoad?: (invoiceTypes: ApiInvoiceType[]) => void;
  invoiceTypes?: ApiInvoiceType[]; // External invoice types data to avoid duplicate API calls
}

// Static fallback options
export const invoiceTypeOptions: InvoiceTypeOption[] = [
  { value: '', label: 'General', code: '' },
  { value: '1', label: 'VAT Electronic General', code: '1' },
  { value: '2', label: 'VAT Electronic Special', code: '2' },
  { value: '12', label: 'Motor Vehicle Sales', code: '12' }
];

export default function InvoiceTypeSelector({
  value = '',
  onChange,
  disabled = false,
  label,
  className = "",
  // onInvoiceTypesLoad,
  invoiceTypes = []
}: InvoiceTypeSelectorProps) {
  const { t } = useInvoiceRulesTranslation();
  const defaultLabel = label || t('ruleDetails.invoiceType');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use external invoice types if provided, no need for internal API calls
  const apiInvoiceTypes = invoiceTypes;

  // Get parent invoice types (level 1) from API data
  const parentInvoiceTypes = apiInvoiceTypes.filter(type => type.level === 1);

  // Create options array from API data or fallback to static
  const availableOptions: InvoiceTypeOption[] = parentInvoiceTypes.length > 0
    ? [
        { value: '', label: 'General', code: '' }, // Always add General as first option
        ...parentInvoiceTypes.map(type => ({
          value: type.invoiceCode,
          label: type.descriptionEn,
          code: type.invoiceCode
        }))
      ]
    : invoiceTypeOptions;

  const handleInvoiceTypeSelect = (optionValue: string) => {
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

  const selectedOption = availableOptions.find(option => option.value === value);

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
              <span className="text-left truncate">{selectedOption?.label || 'General'}</span>
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
                key={option.value}
                onClick={() => handleInvoiceTypeSelect(option.value)}
                className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                  value === option.value ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 leading-tight">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}