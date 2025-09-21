// i18n configuration extracted from JEXLExplanation.tsx and extended
export interface SupportedLanguage {
  code: string;
  name: string;
  apiCode: string; // Code used for API calls
}

// Supported languages list - extracted from JEXLExplanation.tsx
export const supportedLanguages: SupportedLanguage[] = [
  { code: 'en-US', name: 'English', apiCode: 'en' },
  { code: 'zh-CN', name: '中文', apiCode: 'zh' },
];

// Default language configuration
export const defaultLanguage = 'en-US';

// Map browser language to supported language
export const mapBrowserLanguageToSupported = (browserLang: string): string => {
  // Direct match first
  const directMatch = supportedLanguages.find(lang => lang.code === browserLang);
  if (directMatch) return directMatch.code;

  // Try to match by language prefix (e.g., 'en' for 'en-US')
  const langPrefix = browserLang.split('-')[0];
  const prefixMatch = supportedLanguages.find(lang => 
    lang.code.split('-')[0] === langPrefix
  );
  
  return prefixMatch?.code || defaultLanguage;
};

// Get browser's preferred language
export const getBrowserLanguage = (): string => {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const browserLang = navigator.language || navigator.languages?.[0] || defaultLanguage;
  return mapBrowserLanguageToSupported(browserLang);
};

// Convert UI language code to API language code
export const getApiLanguageCode = (uiLangCode: string): string => {
  const language = supportedLanguages.find(lang => lang.code === uiLangCode);
  return language?.apiCode || 'en';
};

// Convert API language code to UI language code
export const getUILanguageCode = (apiLangCode: string): string => {
  const language = supportedLanguages.find(lang => lang.apiCode === apiLangCode);
  return language?.code || defaultLanguage;
};

// Get language name for display
export const getLanguageName = (langCode: string): string => {
  const language = supportedLanguages.find(lang => lang.code === langCode);
  return language?.name || langCode;
};

// Validate if language is supported
export const isLanguageSupported = (langCode: string): boolean => {
  return supportedLanguages.some(lang => lang.code === langCode);
};

// Get language from URL parameter
export const getLanguageFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  if (langParam) {
    // Check if it's an API code, convert to UI code
    const uiLangCode = getUILanguageCode(langParam);
    if (isLanguageSupported(uiLangCode)) {
      return uiLangCode;
    }
    // Check if it's already a UI code
    if (isLanguageSupported(langParam)) {
      return langParam;
    }
  }
  
  return null;
};