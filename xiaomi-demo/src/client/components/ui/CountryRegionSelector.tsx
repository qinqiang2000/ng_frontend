'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCountry } from '@/client/contexts/CountryContext';
import { useInvoiceRulesTranslation } from '@/client/hooks/useTranslation';

interface CountryRegionSelectorProps {
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function CountryRegionSelector({
  disabled = false,
  label,
  className = ""
}: CountryRegionSelectorProps) {
  const { t } = useInvoiceRulesTranslation();
  const defaultLabel = label || t('countryRegion');
  const { setSelectedCountry, countryOptions, getSelectedCountryOption } = useCountry();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 使用国家代码渲染彩色徽标，确保不同国家图标外观不同且不依赖系统 Emoji 支持
  const getBadgeColor = (code: string) => {
    const upper = (code || 'XX').toUpperCase();
    let hash = 0;
    for (let i = 0; i < upper.length; i++) {
      hash = upper.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 45%)`;
  };

  const renderCodeBadge = (code: string) => (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-[10px] font-semibold mr-1"
      style={{ backgroundColor: getBadgeColor(code) }}
      aria-hidden="true"
    >
      {code?.toUpperCase() || 'XX'}
    </span>
  );

  const handleCountrySelect = (countryValue: string) => {
    setSelectedCountry(countryValue);
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

  const selectedOption = getSelectedCountryOption();

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
            <div className="flex items-center space-x-2">
              {selectedOption ? (
                renderCodeBadge(selectedOption.value)
              ) : (
                <i className="ri-earth-line text-gray-600 mr-1" aria-hidden="true"></i>
              )}
              <span>{selectedOption?.label}</span>
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
            {countryOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleCountrySelect(option.value)}
                className="w-full px-3 py-2.5 text-left hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {renderCodeBadge(option.value)}
                  <span className="text-sm text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}