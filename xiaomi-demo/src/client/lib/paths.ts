// utils/paths.ts
import { getApiLanguageCode } from './i18n/config';

export const getAssetPath = (path: string) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return `${basePath}${path}`;
};

// Generate a random request ID
const generateReqId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get current language from context (client-side safe)
const getCurrentLanguage = (): string => {
    if (typeof window === 'undefined') return 'en-US';

    // Try to get from localStorage first
    const storedLang = localStorage.getItem('preferred-language');
    if (storedLang) return storedLang;

    // Fallback to browser language
    const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';

    // Map to supported languages
    const supportedLangCodes = ['en-US', 'zh-CN', 'ja-JP', 'de-DE', 'fr-FR', 'es-ES'];
    const directMatch = supportedLangCodes.find(code => code === browserLang);
    if (directMatch) return directMatch;

    const langPrefix = browserLang.split('-')[0];
    const prefixMatch = supportedLangCodes.find(code => code.startsWith(langPrefix));
    return prefixMatch || 'en-US';
};

interface ApiOptions {
    lang?: string;
    skipLangParam?: boolean;
}

export const getApiBasePath = (path: string, options?: ApiOptions) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const path2 = path.startsWith('/') ? path : `/${path}`;
    const basePath2 = basePath.startsWith('/') ? basePath : `/${basePath}`;
    const basePath3 = basePath2.endsWith('/') ? basePath2 : `${basePath2}/`;
    const baseUrl = `${basePath3}api/taxflow${path2}`;

    // Parse existing query parameters from the path
    const [pathPart, queryPart] = path2.split('?');
    const searchParams = new URLSearchParams(queryPart || '');

    // Add language parameter if not already present and not skipped
    if (!options?.skipLangParam && !searchParams.has('lang')) {
        const currentLang = options?.lang || getCurrentLanguage();
        const apiLangCode = getApiLanguageCode(currentLang);
        searchParams.append('lang', apiLangCode);
    }

    // Add reqid parameter if not already present
    if (!searchParams.has('reqid')) {
        searchParams.append('reqid', generateReqId());
    }

    // Reconstruct the final URL
    const finalPath = `${basePath3}api/taxflow${pathPart}`;
    const queryString = searchParams.toString();

    return queryString ? `${finalPath}?${queryString}` : finalPath;
};

// Backward compatibility function - automatically adds language parameter
export const getApiBasePathWithLang = (path: string, lang?: string) => {
    return getApiBasePath(path, { lang });
};

// Function for APIs that already have language parameter - skips auto-injection
export const getApiBasePathNoLang = (path: string) => {
    return getApiBasePath(path, { skipLangParam: true });
};