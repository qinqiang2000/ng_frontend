'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  supportedLanguages, 
  defaultLanguage, 
  getBrowserLanguage, 
  getLanguageFromUrl,
  isLanguageSupported,
  getApiLanguageCode,
  getLanguageName
} from '../lib/i18n/config';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  getApiLangCode: () => string;
  getDisplayName: (langCode?: string) => string;
  supportedLanguages: typeof supportedLanguages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  // Always start with default language to avoid hydration mismatch
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLanguage || defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      // Priority: URL param > localStorage > initialLanguage > browser language > default
      const urlLang = getLanguageFromUrl();
      if (urlLang && urlLang !== currentLanguage) {
        setCurrentLanguage(urlLang);
      } else {
        const storedLang = localStorage.getItem('preferred-language');
        if (storedLang && isLanguageSupported(storedLang) && storedLang !== currentLanguage) {
          setCurrentLanguage(storedLang);
        } else if (initialLanguage && isLanguageSupported(initialLanguage) && initialLanguage !== currentLanguage) {
          setCurrentLanguage(initialLanguage);
        } else if (!localStorage.getItem('preferred-language')) {
          // Only use browser language if no preference was ever stored
          const browserLang = getBrowserLanguage();
          if (browserLang !== currentLanguage) {
            setCurrentLanguage(browserLang);
          }
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized, initialLanguage, currentLanguage]);

  // Update localStorage when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', currentLanguage);
    }
  }, [currentLanguage]);

  // Listen for URL changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUrlChange = () => {
      const urlLang = getLanguageFromUrl();
      if (urlLang && urlLang !== currentLanguage) {
        setCurrentLanguage(urlLang);
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [currentLanguage]);

  const setLanguage = (language: string) => {
    if (!isLanguageSupported(language)) {
      console.warn(`Language ${language} is not supported. Falling back to ${defaultLanguage}`);
      language = defaultLanguage;
    }
    setCurrentLanguage(language);
  };

  const getApiLangCode = () => {
    return getApiLanguageCode(currentLanguage);
  };

  const getDisplayName = (langCode?: string) => {
    return getLanguageName(langCode || currentLanguage);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    getApiLangCode,
    getDisplayName,
    supportedLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Convenience hook to get current API language code
export function useApiLanguage(): string {
  const { getApiLangCode } = useLanguage();
  return getApiLangCode();
}

// Convenience hook for language switching
export function useLanguageSwitcher() {
  const { currentLanguage, setLanguage, supportedLanguages, getDisplayName } = useLanguage();

  const switchToNext = () => {
    const currentIndex = supportedLanguages.findIndex(lang => lang.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
    setLanguage(supportedLanguages[nextIndex].code);
  };

  const switchToPrevious = () => {
    const currentIndex = supportedLanguages.findIndex(lang => lang.code === currentLanguage);
    const prevIndex = currentIndex === 0 ? supportedLanguages.length - 1 : currentIndex - 1;
    setLanguage(supportedLanguages[prevIndex].code);
  };

  return {
    currentLanguage,
    setLanguage,
    switchToNext,
    switchToPrevious,
    getDisplayName,
    supportedLanguages,
  };
}