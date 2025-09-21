import { getApiBasePath } from '@/client/lib/paths';

// Backend API interfaces
export interface CodeEnum {
    id: number;
    codeType: string;
    codeTypeName: string;
    desc?: string;
    createTime: string;
    updateTime: string;
}

export interface CodeEnumListResult {
    errcode: string;
    message: string;
    data: CodeEnum[];
    success: boolean;
    error: boolean;
    traceId: string;
    errorMsgArray: any[];
}

// Frontend menu item interface (enhanced from existing)
export interface MenuItem {
    type: string;
    zh: string;
    en: string;
    icon: string;
    supportsMapping: boolean;
    hasCountry: boolean;
    desc?: string;
}

// Default icon mapping for common code types
const iconMapping: Record<string, string> = {
    'UOM': 'ri-ruler-line',
    'PRODUCT': 'ri-product-hunt-line',
    'COMPANY': 'ri-building-line',
    'PAYMENT_MEANS': 'ri-bank-card-line',
    'CURRENCY': 'ri-coin-line',
    'COUNTRY': 'ri-flag-line',
    'ALLOWANCE_REASON': 'ri-discount-percent-line',
    'CHARGE_REASON': 'ri-money-dollar-circle-line',
    'TAX_EXEMPTION_REASON': 'ri-shield-check-line',
    'STATUS': 'ri-status-line',
    'TYPE': 'ri-list-check-2',
    'CATEGORY': 'ri-folder-line'
};

// Transform backend CodeEnum to frontend MenuItem format
const transformCodeEnumToMenuItem = (codeEnum: CodeEnum): MenuItem => {
    const codeType = codeEnum.codeType;

    // Determine if this type supports mapping (most do)
    const supportsMapping = !['STATUS', 'TYPE'].includes(codeType);

    // Determine if this type has country scope
    // COUNTRY itself should not have country scope since it IS the country list
    // Backend uses numeric codes, so we check both string and common numeric codes
    const hasCountryTypes = [
        'UOM', 'PRODUCT', 'COMPANY',  // String formats
        '0001', '0002', '0003', '0004', '0005'  // Common numeric codes that may support country scope
    ];
    const hasCountry = hasCountryTypes.includes(codeType);

    return {
        type: codeType,
        zh: codeEnum.codeTypeName,
        en: codeEnum.codeTypeName, // Use same name for now, can be enhanced with i18n
        icon: iconMapping[codeType] || 'ri-list-line',
        supportsMapping,
        hasCountry,
        desc: codeEnum.desc
    };
};

// Fetch all code enums from backend
export const fetchCodeEnums = async (): Promise<MenuItem[]> => {
    try {
        const response = await fetch(getApiBasePath('/api/code-enum'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CodeEnumListResult = await response.json();

        // Backend returns errcode: '0000' and success: true for successful responses
        if (result.errcode !== '0000' || !result.success) {
            throw new Error(result.message || 'API returned error');
        }

        // Transform backend data to frontend format
        return result.data.map(transformCodeEnumToMenuItem);
    } catch (error) {
        console.error('Error fetching code enums:', error);
        throw error;
    }
};