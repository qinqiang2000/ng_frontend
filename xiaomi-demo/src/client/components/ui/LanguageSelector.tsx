'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguageSwitcher } from '@/client/contexts/LanguageContext';
import { useCommonTranslation } from '@/client/hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function LanguageSelector({
  className = '',
  theme = 'light',
  size = 'md',
  showLabel = true,
  position = 'bottom'
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentLanguage, setLanguage, supportedLanguages, getDisplayName } = useLanguageSwitcher();
  const { t } = useCommonTranslation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Get theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        button: 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 focus:border-gray-500',
        dropdown: 'bg-gray-800 border-gray-600',
        option: 'text-gray-300 hover:bg-gray-700 hover:text-white',
        optionSelected: 'bg-blue-900 text-blue-300',
        label: 'text-gray-300'
      };
    } else {
      return {
        button: 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500',
        dropdown: 'bg-white border-gray-200 shadow-lg',
        option: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        optionSelected: 'bg-blue-50 text-blue-600',
        label: 'text-gray-700'
      };
    }
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-2 py-1 text-xs',
          dropdown: 'text-xs',
          option: 'px-3 py-1.5',
          label: 'text-xs',
          spacing: 'space-x-1'
        };
      case 'lg':
        return {
          button: 'px-4 py-3 text-base',
          dropdown: 'text-base',
          option: 'px-4 py-3',
          label: 'text-base',
          spacing: 'space-x-3'
        };
      default: // 'md'
        return {
          button: 'px-3 py-2 text-sm',
          dropdown: 'text-sm',
          option: 'px-4 py-2',
          label: 'text-sm',
          spacing: 'space-x-2'
        };
    }
  };

  // Get position-specific styles for dropdown
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'left':
        return 'right-full mr-2 top-0';
      case 'right':
        return 'left-full ml-2 top-0';
      default: // 'bottom'
        return 'top-full mt-2';
    }
  };

  const themeStyles = getThemeStyles();
  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles();

  const currentLangConfig = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`flex items-center ${sizeStyles.spacing} border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${sizeStyles.button} ${themeStyles.button}`}
        aria-label={t('language.selector')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {showLabel && (
          <span className={`${sizeStyles.label} ${themeStyles.label}`}>
            {t('language.selector')}:
          </span>
        )}
        <span className="font-medium">
          {currentLangConfig?.name || currentLanguage}
        </span>
        <i className={`ri-arrow-down-s-line transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute z-50 w-48 border rounded-md py-1 ${positionStyles} ${sizeStyles.dropdown} ${themeStyles.dropdown}`}
          role="listbox"
          aria-label={t('language.selector')}
        >
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className={`block w-full text-left ${sizeStyles.option} cursor-pointer transition-colors ${
                language.code === currentLanguage 
                  ? themeStyles.optionSelected 
                  : themeStyles.option
              }`}
              role="option"
              aria-selected={language.code === currentLanguage}
            >
              <div className="flex items-center justify-between">
                <span>{language.name}</span>
                {language.code === currentLanguage && (
                  <i className="ri-check-line ml-2"></i>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function HeaderLanguageSelector() {
  return (
    <LanguageSelector 
      theme="light"
      size="sm"
      showLabel={false}
      className="ml-4"
    />
  );
}

export function FooterLanguageSelector() {
  return (
    <LanguageSelector 
      theme="light"
      size="sm"
      showLabel={true}
      position="top"
    />
  );
}

export function SettingsLanguageSelector() {
  return (
    <LanguageSelector 
      theme="light"
      size="md"
      showLabel={true}
      className="w-full"
    />
  );
}

// Hook for programmatic language switching with keyboard shortcuts
export function useLanguageShortcuts() {
  const { switchToNext, switchToPrevious } = useLanguageSwitcher();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + L to cycle through languages
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        switchToNext();
      }
      // Ctrl/Cmd + Shift + K to cycle backwards through languages
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        switchToPrevious();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [switchToNext, switchToPrevious]);
}