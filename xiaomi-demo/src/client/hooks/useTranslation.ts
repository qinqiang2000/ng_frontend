'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Translation cache to avoid re-loading same files
const translationCache: Record<string, Record<string, any>> = {};

// Type for interpolation variables
type InterpolationVars = Record<string, string | number>;

// Translation hook interface
interface UseTranslationResult {
  t: (key: string, vars?: InterpolationVars, fallback?: string) => string;
  loading: boolean;
  error: string | null;
}

// Utility function to get nested object value by dot notation
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Interpolation function to replace variables in translation strings
function interpolate(template: string, vars: InterpolationVars = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key]?.toString() || match;
  });
}

// Main translation hook
export function useTranslation(namespace?: string): UseTranslationResult {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load translations for current language and namespace
  useEffect(() => {
    const loadTranslations = async () => {
      const cacheKey = `${currentLanguage}${namespace ? `-${namespace}` : ''}`;
      
      // Return cached translations if available
      if (translationCache[cacheKey]) {
        setTranslations(translationCache[cacheKey]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Convert language code for file path (en-US -> en)
        const langCode = currentLanguage.split('-')[0];
        
        if (namespace) {
          // Load specific namespace file
          try {
            const moduleData = await import(`../locales/${langCode}/${namespace}.json`);
            const namespaceTranslations = moduleData.default || moduleData;
            translationCache[cacheKey] = namespaceTranslations;
            setTranslations(namespaceTranslations);
          } catch (namespaceError) {
            console.warn(`Failed to load namespace ${namespace} for ${langCode}, trying fallback`);
            // Try fallback language (English)
            if (langCode !== 'en') {
              try {
                const fallbackModule = await import(`../locales/en/${namespace}.json`);
                const fallbackTranslations = fallbackModule.default || fallbackModule;
                translationCache[cacheKey] = fallbackTranslations;
                setTranslations(fallbackTranslations);
              } catch {
                throw new Error(`Failed to load namespace ${namespace} for both ${langCode} and fallback language`);
              }
            } else {
              throw namespaceError;
            }
          }
        } else {
          // Load all translation files and merge them
          const translationModules = [
            'common',
            'header',
            'dashboard',
            'invoice',
            'invoice-requests',
            'invoice-results',
            'invoice-rules',
            'audited-rules',
            'audited-requests',
            'rules',
            'rule-groups',
            'tax-rules',
            'subscriptions',
            'glossary',
            'components',
            'errors',
            'release-center',
            'code-lists',
            'rule-engines'
          ];

          const allTranslations: Record<string, any> = {};
          
          for (const moduleName of translationModules) {
            try {
              const moduleData = await import(`../locales/${langCode}/${moduleName}.json`);
              const moduleTranslations = moduleData.default || moduleData;
              allTranslations[moduleName] = moduleTranslations;
            } catch {
              console.warn(`Failed to load ${moduleName}.json for ${langCode}`);
              // Try to load fallback
              if (langCode !== 'en') {
                try {
                  const fallbackData = await import(`../locales/en/${moduleName}.json`);
                  const fallbackTranslations = fallbackData.default || fallbackData;
                  allTranslations[moduleName] = fallbackTranslations;
                } catch {
                  console.warn(`Failed to load fallback ${moduleName}.json`);
                }
              }
            }
          }

          translationCache[cacheKey] = allTranslations;
          setTranslations(allTranslations);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load translations';
        setError(errorMessage);
        console.error('Translation loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage, namespace]);

  // Translation function
  const t = (key: string, vars?: InterpolationVars, fallback?: string): string => {
    // If still loading and no translation available, return empty string to prevent showing keys
    if (loading && Object.keys(translations).length === 0) {
      return '';
    }

    try {
      const translation = getNestedValue(translations, key);
      
      if (translation) {
        return typeof translation === 'string' 
          ? interpolate(translation, vars)
          : translation.toString();
      }

      // Return fallback or key if translation not found
      const result = fallback || key;
      
      // Log missing translation in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key} (language: ${currentLanguage})`);
      }
      
      return vars ? interpolate(result, vars) : result;
    } catch (error) {
      console.error('Translation error:', error);
      return fallback || key;
    }
  };

  return { t, loading, error };
}

// Convenience hook for specific namespaces
export function useCommonTranslation() {
  return useTranslation('common');
}

export function useHeaderTranslation() {
  return useTranslation('header');
}

export function useDashboardTranslation() {
  return useTranslation('dashboard');
}

export function useInvoiceTranslation() {
  return useTranslation('invoice');
}

export function useRulesTranslation() {
  return useTranslation('rules');
}

export function useRuleGroupsTranslation() {
  return useTranslation('rule-groups');
}

export function useTaxRulesTranslation() {
  return useTranslation('tax-rules');
}

export function useInvoiceRulesTranslation() {
  return useTranslation('invoice-rules');
}

export function useAuditedRulesTranslation() {
  return useTranslation('audited-rules');
}

export function useInvoiceRequestsTranslation() {
  return useTranslation('invoice-requests');
}

export function useInvoiceResultsTranslation() {
  return useTranslation('invoice-results');
}

export function useSubscriptionsTranslation() {
  return useTranslation('subscriptions');
}

export function useGlossaryTranslation() {
  return useTranslation('glossary');
}

export function useComponentsTranslation() {
  return useTranslation('components');
}

export function useErrorsTranslation() {
  return useTranslation('errors');
}

export function useReleaseCenterTranslation() {
  return useTranslation('release-center');
}

export function useCodeListsTranslation() {
  return useTranslation('code-lists');
}

export function useAuditedRequestsTranslation() {
  return useTranslation('audited-requests');
}

export function useRuleEnginesTranslation() {
  return useTranslation('rule-engines');
}

// Hook to preload translations (useful for performance optimization)
export function usePreloadTranslations(namespaces: string[]) {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const preloadTranslations = async () => {
      const langCode = currentLanguage.split('-')[0];
      
      for (const namespace of namespaces) {
        const cacheKey = `${currentLanguage}-${namespace}`;
        
        if (!translationCache[cacheKey]) {
          try {
            const moduleData = await import(`../locales/${langCode}/${namespace}.json`);
            translationCache[cacheKey] = moduleData.default || moduleData;
          } catch {
            console.warn(`Failed to preload ${namespace} for ${langCode}`);
          }
        }
      }
    };

    preloadTranslations();
  }, [currentLanguage, namespaces]);
}