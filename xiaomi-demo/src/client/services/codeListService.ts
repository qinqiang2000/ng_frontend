import { getApiBasePath } from '@/client/lib/paths';

// Code List 数据类型定义
export type CodeListType = 'UOM' | 'PRODUCT' | 'COMPANY' | 'PAYMENT_MEANS' | 'CURRENCY' | 'COUNTRY' | 'ALLOWANCE_REASON' | 'CHARGE_REASON' | 'TAX_EXEMPTION_REASON';

export interface StandardRow {
    id: string;
    scope: string;
    code: string;
    name: string;
    description?: string;
    symbol?: string;
    source?: string;
    status: 'ENABLED' | 'DISABLED';
    updatedBy?: string;
    taxId?: string;
    minorUnit?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface MappingRow {
    id: string;
    scope: string;
    givenCode: string;
    givenName?: string;
    standardCode: string;
    confidence: number;
    source: 'MANUAL' | 'AI' | 'IMPORT';
    status: 'ACTIVE' | 'INACTIVE';
    lastUpdatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuItem {
    type: CodeListType;
    zh: string;
    en: string;
    icon: string;
    supportsMapping: boolean;
    hasCountry: boolean;
}

// Backend API interfaces
export interface CodeInfo {
    id: number;
    country?: string;
    codeType: string;
    code: string;
    name: string;
    desc?: string;
    system: number;
    active: number;
    delete: number;
    tenantId: string;
    createTime: string;
    updateTime: string;
}

export interface CodeInfoQuery {
    pageNum: number;
    pageSize: number;
    codeType: string;
    country?: string;
    code?: string;
    name?: string;
    active?: number;
}

export interface CodeInfoPageResult {
    errcode: string;
    message: string;
    data: CodeInfo[];
    totalElement: number;
    currentPage: number;
    pageSize: number;
    totalPage: number;
    success: boolean;
    error: boolean;
    traceId: string;
    errorMsgArray: any[];
}

// Backend API interfaces for mappings
export interface CodeMapping {
    id: number;
    codeId?: number;
    givenCode: string;
    givenName: string;
    desc?: string;
    tenantId: string;
    confidence: number;
    source: number;
    createTime: string;
    updateTime: string;
    code: string;
    country?: string;
}

export interface CodeMappingQueryRequest {
    pageNum: number;
    pageSize: number;
    codeType: string;
    givenCode?: string;
    givenName?: string;
    codeId?: number;
    country?: string;
    minConfidence?: number;
    maxConfidence?: number;
    active?: number;
}

export interface CodeMappingPageResult {
    errcode: string;
    message: string;
    data: CodeMapping[];
    totalElement: number;
    currentPage: number;
    pageSize: number;
    totalPage: number;
    success: boolean;
    error: boolean;
    traceId: string;
    errorMsgArray: any[];
}

// 种子数据
export const seedStandards: Record<CodeListType, StandardRow[]> = {
    UOM: [
        { id: 'SG-EA', scope: 'SG', code: 'EA', name: 'Each', description: 'Single unit', symbol: 'ea', source: 'UNECE Rec20', status: 'ENABLED', updatedBy: 'ops1' },
        { id: 'SG-BOX', scope: 'SG', code: 'BOX', name: 'Box', description: 'Box unit', symbol: 'box', source: 'UNECE Rec20', status: 'ENABLED', updatedBy: 'ops2' },
        { id: 'DF-EA', scope: 'DEFAULT', code: 'EA', name: 'Each (Default)', description: 'Default unit', symbol: 'ea', source: 'ISO80000', status: 'DISABLED', updatedBy: 'ops1' },
        { id: 'MY-PCS', scope: 'MY', code: 'PCS', name: 'Pieces', description: 'Individual pieces', symbol: 'pcs', source: 'UNECE Rec20', status: 'ENABLED', updatedBy: 'ops3' },
    ],
    PRODUCT: [
        { id: 'SG-UNSPSC-43211503', scope: 'SG', code: '43211503', name: 'Laptop', description: 'Computing device', source: 'UNSPSC', status: 'ENABLED', updatedBy: 'pm1' },
        { id: 'SG-UNSPSC-43211504', scope: 'SG', code: '43211504', name: 'Desktop Computer', description: 'Desktop computing device', source: 'UNSPSC', status: 'ENABLED', updatedBy: 'pm1' },
    ],
    COMPANY: [
        { id: 'SG-KD-SG', scope: 'SG', code: 'KDSG', name: 'Kingdee SG', description: 'Internal company code', source: 'Internal', status: 'ENABLED', taxId: '20191234X', updatedBy: 'ops' },
        { id: 'MY-KD-MY', scope: 'MY', code: 'KDMY', name: 'Kingdee MY', description: 'Malaysia subsidiary', source: 'Internal', status: 'ENABLED', taxId: 'MY123456', updatedBy: 'ops' },
    ],
    PAYMENT_MEANS: [
        { id: 'PM-30', scope: 'GLOBAL', code: '30', name: 'Bank transfer', description: 'UN/ECE 4461 code', source: 'UN/ECE 4461', status: 'ENABLED' },
        { id: 'PM-42', scope: 'GLOBAL', code: '42', name: 'Payment to bank account', description: 'UN/ECE 4461 code', source: 'UN/ECE 4461', status: 'ENABLED' },
        { id: 'PM-48', scope: 'GLOBAL', code: '48', name: 'Bank card', description: 'UN/ECE 4461 code', source: 'UN/ECE 4461', status: 'ENABLED' },
    ],
    CURRENCY: [
        { id: 'CUR-USD', scope: 'GLOBAL', code: 'USD', name: 'US Dollar', description: 'ISO 4217', minorUnit: 2, symbol: '$', status: 'ENABLED' },
        { id: 'CUR-JPY', scope: 'GLOBAL', code: 'JPY', name: 'Japanese Yen', description: 'ISO 4217', minorUnit: 0, symbol: '¥', status: 'ENABLED' },
        { id: 'CUR-EUR', scope: 'GLOBAL', code: 'EUR', name: 'Euro', description: 'ISO 4217', minorUnit: 2, symbol: '€', status: 'ENABLED' },
        { id: 'CUR-SGD', scope: 'GLOBAL', code: 'SGD', name: 'Singapore Dollar', description: 'ISO 4217', minorUnit: 2, symbol: 'S$', status: 'ENABLED' },
    ],
    COUNTRY: [
        { id: 'CT-SG', scope: 'GLOBAL', code: 'SG', name: 'Singapore', description: 'ISO 3166-1 alpha-2', status: 'ENABLED' },
        { id: 'CT-MY', scope: 'GLOBAL', code: 'MY', name: 'Malaysia', description: 'ISO 3166-1 alpha-2', status: 'ENABLED' },
        { id: 'CT-DE', scope: 'GLOBAL', code: 'DE', name: 'Germany', description: 'ISO 3166-1 alpha-2', status: 'ENABLED' },
        { id: 'CT-US', scope: 'GLOBAL', code: 'US', name: 'United States', description: 'ISO 3166-1 alpha-2', status: 'ENABLED' },
    ],
    ALLOWANCE_REASON: [
        { id: 'AR-DISC', scope: 'GLOBAL', code: 'DISC', name: 'Discount', description: 'Allowance reason', source: 'Local', status: 'ENABLED' },
        { id: 'AR-PROMO', scope: 'GLOBAL', code: 'PROMO', name: 'Promotion', description: 'Promotional discount', source: 'Local', status: 'ENABLED' },
    ],
    CHARGE_REASON: [
        { id: 'CR-FRT', scope: 'GLOBAL', code: 'FREIGHT', name: 'Freight charge', description: 'Charge reason', source: 'Local', status: 'ENABLED' },
        { id: 'CR-INS', scope: 'GLOBAL', code: 'INSURANCE', name: 'Insurance', description: 'Insurance charge', source: 'Local', status: 'ENABLED' },
    ],
    TAX_EXEMPTION_REASON: [
        { id: 'TX-EX1', scope: 'GLOBAL', code: 'EXEMPT_01', name: 'Tax exempt - statutory', description: 'Exemption reason', source: 'Local', status: 'ENABLED' },
        { id: 'TX-EX2', scope: 'GLOBAL', code: 'EXEMPT_02', name: 'Tax exempt - export', description: 'Export exemption', source: 'Local', status: 'ENABLED' },
    ],
};

export const seedMappings: Record<CodeListType, MappingRow[]> = {
    UOM: [
        { id: 'SG-PCS', scope: 'SG', givenCode: 'PCS', givenName: 'Pieces', standardCode: 'EA', confidence: 0.95, source: 'MANUAL', status: 'ACTIVE', lastUpdatedBy: 'ops1' },
        { id: 'SG-PC', scope: 'SG', givenCode: 'PC', givenName: 'Piece', standardCode: 'EA', confidence: 0.62, source: 'AI', status: 'ACTIVE', lastUpdatedBy: 'ops3' },
        { id: 'SG-BOX-MAP', scope: 'SG', givenCode: 'BX', givenName: 'Box', standardCode: 'BOX', confidence: 0.88, source: 'IMPORT', status: 'ACTIVE', lastUpdatedBy: 'ops2' },
        { id: 'MY-UNIT', scope: 'MY', givenCode: 'UNIT', givenName: 'Unit', standardCode: 'EA', confidence: 0.75, source: 'AI', status: 'ACTIVE', lastUpdatedBy: 'ops4' },
    ],
    PRODUCT: [
        { id: 'PR-A1', scope: 'SG', givenCode: 'Laptop-13', givenName: 'Laptop 13 inch', standardCode: '43211503', confidence: 0.82, source: 'AI', status: 'ACTIVE' },
        { id: 'PR-A2', scope: 'SG', givenCode: 'Desktop-Win', givenName: 'Windows Desktop', standardCode: '43211504', confidence: 0.89, source: 'MANUAL', status: 'ACTIVE' },
    ],
    COMPANY: [
        { id: 'CP-A1', scope: 'SG', givenCode: 'KDSG-OLD', givenName: 'Kingdee SG (legacy)', standardCode: 'KDSG', confidence: 0.9, source: 'IMPORT', status: 'ACTIVE' },
        { id: 'CP-A2', scope: 'MY', givenCode: 'KD-MY-OLD', givenName: 'Kingdee Malaysia (old)', standardCode: 'KDMY', confidence: 0.85, source: 'IMPORT', status: 'ACTIVE' },
    ],
    PAYMENT_MEANS: [
        { id: 'PM-A1', scope: 'GLOBAL', givenCode: 'BT', givenName: 'Bank Transfer', standardCode: '30', confidence: 0.9, source: 'MANUAL', status: 'ACTIVE' },
        { id: 'PM-A2', scope: 'GLOBAL', givenCode: 'CARD', givenName: 'Credit Card', standardCode: '48', confidence: 0.87, source: 'AI', status: 'ACTIVE' },
    ],
    CURRENCY: [
        { id: 'CU-A1', scope: 'GLOBAL', givenCode: 'US$', givenName: 'US Dollar', standardCode: 'USD', confidence: 0.96, source: 'MANUAL', status: 'ACTIVE' },
        { id: 'CU-A2', scope: 'GLOBAL', givenCode: 'YEN', givenName: 'Japanese Yen', standardCode: 'JPY', confidence: 0.91, source: 'AI', status: 'ACTIVE' },
    ],
    COUNTRY: [
        { id: 'CO-A1', scope: 'GLOBAL', givenCode: 'SGP', givenName: 'Singapore', standardCode: 'SG', confidence: 0.88, source: 'AI', status: 'ACTIVE' },
        { id: 'CO-A2', scope: 'GLOBAL', givenCode: 'MALAY', givenName: 'Malaysia', standardCode: 'MY', confidence: 0.83, source: 'AI', status: 'ACTIVE' },
    ],
    ALLOWANCE_REASON: [
        { id: 'AR-A1', scope: 'GLOBAL', givenCode: 'PROMO-DISC', givenName: 'Promotion Discount', standardCode: 'DISC', confidence: 0.9, source: 'MANUAL', status: 'ACTIVE' },
    ],
    CHARGE_REASON: [
        { id: 'CR-A1', scope: 'GLOBAL', givenCode: 'SHIPPING', givenName: 'Shipping', standardCode: 'FREIGHT', confidence: 0.9, source: 'MANUAL', status: 'ACTIVE' },
    ],
    TAX_EXEMPTION_REASON: [
        { id: 'TX-A1', scope: 'GLOBAL', givenCode: 'EX-1', givenName: 'Exempt type 1', standardCode: 'EXEMPT_01', confidence: 0.8, source: 'AI', status: 'ACTIVE' },
    ],
};

// 菜单项配置
export const menuItems: MenuItem[] = [
    { type: 'UOM', zh: '计量单位', en: 'UOM', icon: 'ri-ruler-line', supportsMapping: true, hasCountry: true },
    { type: 'PRODUCT', zh: '产品编码', en: 'Product Codes', icon: 'ri-product-hunt-line', supportsMapping: true, hasCountry: true },
    { type: 'COMPANY', zh: '公司编码', en: 'Company Codes', icon: 'ri-building-line', supportsMapping: true, hasCountry: true },
    { type: 'PAYMENT_MEANS', zh: '支付方式', en: 'Payment Means', icon: 'ri-bank-card-line', supportsMapping: true, hasCountry: false },
    { type: 'CURRENCY', zh: '货币', en: 'Currency', icon: 'ri-coin-line', supportsMapping: true, hasCountry: false },
    { type: 'COUNTRY', zh: '国家', en: 'Country', icon: 'ri-flag-line', supportsMapping: true, hasCountry: false },
    { type: 'ALLOWANCE_REASON', zh: '折扣原因', en: 'Allowance Reasons', icon: 'ri-discount-percent-line', supportsMapping: true, hasCountry: false },
    { type: 'CHARGE_REASON', zh: '收费原因', en: 'Charge Reasons', icon: 'ri-money-dollar-circle-line', supportsMapping: true, hasCountry: false },
    { type: 'TAX_EXEMPTION_REASON', zh: '税收豁免原因', en: 'Tax Exemption Reasons', icon: 'ri-shield-check-line', supportsMapping: true, hasCountry: false },
];

// Transform backend CodeInfo to frontend StandardRow format
const transformCodeInfoToStandardRow = (codeInfo: CodeInfo): StandardRow => {
    return {
        id: codeInfo.id.toString(),
        scope: codeInfo.country || 'GLOBAL',
        code: codeInfo.code,
        name: codeInfo.name,
        description: codeInfo.desc,
        status: codeInfo.active === 1 ? 'ENABLED' : 'DISABLED',
        source: codeInfo.system === 1 ? 'System' : 'User',
        createdAt: codeInfo.createTime,
        updatedAt: codeInfo.updateTime,
    };
};

// Fetch standard codes from backend API
export const fetchStandardCodes = async (query: CodeInfoQuery): Promise<{
    data: StandardRow[];
    total: number;
    pageNum: number;
    pageSize: number;
    pages: number;
}> => {
    try {
        const response = await fetch(getApiBasePath('/api/codes/search'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CodeInfoPageResult = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' || !result.success) {
            throw new Error(result.message || 'API returned error');
        }

        // Transform backend data to frontend format
        const transformedData = result.data.map(transformCodeInfoToStandardRow);

        return {
            data: transformedData,
            total: result.totalElement,
            pageNum: result.currentPage,
            pageSize: result.pageSize,
            pages: result.totalPage,
        };
    } catch (error) {
        console.error('Error fetching standard codes:', error);
        throw error;
    }
};

// Search field type for parallel search
export type StandardSearchField = 'code' | 'name';
export type MappingSearchField = 'givenCode' | 'givenName';

// Result interface for parallel search
export interface ParallelSearchResult {
    field: StandardSearchField;
    data: StandardRow[];
    total: number;
    error?: string;
}

// Result interface for mapping parallel search
export interface MappingParallelSearchResult {
    field: MappingSearchField;
    data: MappingRow[];
    total: number;
    error?: string;
}

// Progress tracking for search operations
export interface SearchProgress {
    code: 'pending' | 'success' | 'error';
    name: 'pending' | 'success' | 'error';
}

// Progress tracking for mapping search operations
export interface MappingSearchProgress {
    givenCode: 'pending' | 'success' | 'error';
    givenName: 'pending' | 'success' | 'error';
}

// Parallel search function for standard codes (code and name fields)
export const fetchStandardCodesParallel = async (
    baseQuery: Omit<CodeInfoQuery, 'code' | 'name'>,
    searchTerm: string,
    onProgress?: (results: ParallelSearchResult[], progress: SearchProgress) => void
): Promise<{
    results: ParallelSearchResult[];
    mergedData: StandardRow[];
    totalResults: { code: number; name: number; merged: number };
}> => {
    if (!searchTerm?.trim()) {
        // If no search term, fallback to original function
        const result = await fetchStandardCodes(baseQuery);
        return {
            results: [],
            mergedData: result.data,
            totalResults: { code: result.total, name: result.total, merged: result.total }
        };
    }

    const searchFields: StandardSearchField[] = ['code', 'name'];
    const progress: SearchProgress = { code: 'pending', name: 'pending' };
    const results: ParallelSearchResult[] = [];

    // Create search queries for each field
    const searchPromises = searchFields.map(async (field): Promise<ParallelSearchResult> => {
        try {
            const fieldQuery: CodeInfoQuery = {
                ...baseQuery,
                [field]: searchTerm.trim()
            };

            const result = await fetchStandardCodes(fieldQuery);

            const searchResult: ParallelSearchResult = {
                field,
                data: result.data,
                total: result.total
            };

            // Update progress and notify
            progress[field] = 'success';
            results.push(searchResult);

            if (onProgress) {
                onProgress([...results], { ...progress });
            }

            return searchResult;
        } catch (error) {
            const errorResult: ParallelSearchResult = {
                field,
                data: [],
                total: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            // Update progress and notify
            progress[field] = 'error';
            results.push(errorResult);

            if (onProgress) {
                onProgress([...results], { ...progress });
            }

            return errorResult;
        }
    });

    // Wait for all searches to complete
    const allResults = await Promise.allSettled(searchPromises);

    // Extract successful results
    const successfulResults = allResults
        .filter((result): result is PromiseFulfilledResult<ParallelSearchResult> =>
            result.status === 'fulfilled')
        .map(result => result.value);

    // Merge and deduplicate results by ID
    const mergedMap = new Map<string, StandardRow>();
    const totalByField = { code: 0, name: 0 };

    successfulResults.forEach(result => {
        if (result.field === 'code') totalByField.code = result.total;
        if (result.field === 'name') totalByField.name = result.total;

        result.data.forEach(item => {
            mergedMap.set(item.id, item);
        });
    });

    const mergedData = Array.from(mergedMap.values());

    return {
        results: successfulResults,
        mergedData,
        totalResults: {
            ...totalByField,
            merged: mergedData.length
        }
    };
};

// Parallel search function for mapping codes (givenCode and givenName fields)
export const fetchMappingCodesParallel = async (
    baseQuery: Omit<CodeMappingQueryRequest, 'givenCode' | 'givenName'>,
    searchTerm: string,
    onProgress?: (results: MappingParallelSearchResult[], progress: MappingSearchProgress) => void
): Promise<{
    results: MappingParallelSearchResult[];
    mergedData: MappingRow[];
    totalResults: { givenCode: number; givenName: number; merged: number };
}> => {
    if (!searchTerm?.trim()) {
        // If no search term, fallback to original function
        const result = await fetchMappingCodes(baseQuery);
        return {
            results: [],
            mergedData: result.data,
            totalResults: { givenCode: result.total, givenName: result.total, merged: result.total }
        };
    }

    const searchFields: MappingSearchField[] = ['givenCode', 'givenName'];
    const progress: MappingSearchProgress = { givenCode: 'pending', givenName: 'pending' };
    const results: MappingParallelSearchResult[] = [];

    // Create search queries for each field
    const searchPromises = searchFields.map(async (field): Promise<MappingParallelSearchResult> => {
        try {
            const fieldQuery: CodeMappingQueryRequest = {
                ...baseQuery,
                [field]: searchTerm.trim()
            };

            const result = await fetchMappingCodes(fieldQuery);

            const searchResult: MappingParallelSearchResult = {
                field,
                data: result.data,
                total: result.total
            };

            // Update progress and notify
            progress[field] = 'success';
            results.push(searchResult);

            if (onProgress) {
                onProgress([...results], { ...progress });
            }

            return searchResult;
        } catch (error) {
            const errorResult: MappingParallelSearchResult = {
                field,
                data: [],
                total: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            // Update progress and notify
            progress[field] = 'error';
            results.push(errorResult);

            if (onProgress) {
                onProgress([...results], { ...progress });
            }

            return errorResult;
        }
    });

    // Wait for all searches to complete
    const allResults = await Promise.allSettled(searchPromises);

    // Extract successful results
    const successfulResults = allResults
        .filter((result): result is PromiseFulfilledResult<MappingParallelSearchResult> =>
            result.status === 'fulfilled')
        .map(result => result.value);

    // Merge and deduplicate results by ID
    const mergedMap = new Map<string, MappingRow>();
    const totalByField = { givenCode: 0, givenName: 0 };

    successfulResults.forEach(result => {
        if (result.field === 'givenCode') totalByField.givenCode = result.total;
        if (result.field === 'givenName') totalByField.givenName = result.total;

        result.data.forEach(item => {
            mergedMap.set(item.id, item);
        });
    });

    const mergedData = Array.from(mergedMap.values());

    return {
        results: successfulResults,
        mergedData,
        totalResults: {
            ...totalByField,
            merged: mergedData.length
        }
    };
};

// Transform backend CodeMapping/CodeInfo to frontend MappingRow format
// Note: The mapping API actually returns CodeInfo format data, so we need to handle both
const transformCodeMappingToMappingRow = (codeMapping: CodeMapping | any): MappingRow => {
    // Handle the actual response format which appears to be CodeInfo-like
    const isCodeInfo = !codeMapping.givenCode; // CodeInfo doesn't have givenCode

    if (isCodeInfo) {
        // For CodeInfo format (actual response), create a mapping-like structure
        return {
            id: codeMapping.id.toString(),
            scope: codeMapping.country || 'GLOBAL',
            givenCode: codeMapping.code, // Use the code as given code for display
            givenName: codeMapping.name, // Use the name as given name
            standardCode: codeMapping.code, // Use the same code as standard code
            confidence: 1.0, // Default to 100% confidence
            source: codeMapping.system === 1 ? 'MANUAL' : 'AI',
            status: codeMapping.active === 1 ? 'ACTIVE' : 'INACTIVE',
            createdAt: codeMapping.createTime,
            updatedAt: codeMapping.updateTime,
        };
    } else {
        // For actual CodeMapping format (if API changes in future)
        return {
            id: codeMapping.id.toString(),
            scope: codeMapping.country || 'GLOBAL',
            givenCode: codeMapping.givenCode,
            givenName: codeMapping.givenName,
            standardCode: codeMapping.code,
            confidence: codeMapping.confidence / 100, // Convert from 0-100 to 0-1
            source: codeMapping.source === 1 ? 'MANUAL' : codeMapping.source === 2 ? 'AI' : 'IMPORT',
            status: 'ACTIVE', // Default to ACTIVE as backend doesn't return this field
            createdAt: codeMapping.createTime,
            updatedAt: codeMapping.updateTime,
        };
    }
};

// Fetch mapping codes from backend API
export const fetchMappingCodes = async (query: CodeMappingQueryRequest): Promise<{
    data: MappingRow[];
    total: number;
    pageNum: number;
    pageSize: number;
    pages: number;
}> => {
    try {
        const response = await fetch(getApiBasePath('/api/code-mappings/query'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CodeMappingPageResult = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' || !result.success) {
            throw new Error(result.message || 'API returned error');
        }

        // Transform backend data to frontend format
        const transformedData = result.data.map(transformCodeMappingToMappingRow);

        return {
            data: transformedData,
            total: result.totalElement,
            pageNum: result.currentPage,
            pageSize: result.pageSize,
            pages: result.totalPage,
        };
    } catch (error) {
        console.error('Error fetching mapping codes:', error);
        throw error;
    }
};

// 验证错误数据
export const mockValidationErrors = [
    { id: '1', severity: 'ERROR' as const, message: 'Duplicate code found: EA', type: 'UOM', affected: 2 },
    { id: '2', severity: 'WARNING' as const, message: 'Missing description for code BOX', type: 'UOM', affected: 1 },
    { id: '3', severity: 'ERROR' as const, message: 'Invalid mapping confidence < 0.5', type: 'PRODUCT', affected: 3 },
];

// 服务类
export class CodeListService {
    // 获取标准数据
    static async getStandards(type: CodeListType): Promise<StandardRow[]> {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 100));
        return seedStandards[type] || [];
    }

    // 获取映射数据
    static async getMappings(type: CodeListType): Promise<MappingRow[]> {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 100));
        return seedMappings[type] || [];
    }

    // 创建标准条目
    static async createStandard(type: CodeListType, data: Partial<StandardRow>): Promise<StandardRow> {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 200));
        const newStandard: StandardRow = {
            id: `STD-${Date.now()}`,
            ...data,
            status: 'ENABLED',
            source: 'MANUAL',
            createdAt: new Date().toISOString(),
        } as StandardRow;
        return newStandard;
    }

    // 创建映射
    static async createMapping(type: CodeListType, data: Partial<MappingRow>): Promise<MappingRow> {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 200));
        const newMapping: MappingRow = {
            id: `MAP-${Date.now()}`,
            scope: 'DEFAULT',
            givenCode: '',
            standardCode: '',
            confidence: 0.8,
            source: 'MANUAL',
            status: 'ACTIVE',
            ...data,
            createdAt: new Date().toISOString(),
        } as MappingRow;
        return newMapping;
    }

    // 导入数据
    static async importData(
        type: CodeListType,
        target: 'standard' | 'mapping',
        file: File,
        options: { format: 'xlsx' | 'xml' | 'json', allowPartial?: boolean }
    ): Promise<{ added: number, updated: number, skipped: number, errors?: any[] }> {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模拟导入结果
        return {
            added: Math.floor(Math.random() * 10) + 5,
            updated: Math.floor(Math.random() * 5) + 2,
            skipped: Math.floor(Math.random() * 3),
        };
    }
}

// Country option interface for scope selector
export interface CountryOption {
    code: string;
    name: string;
}

// Backend API interface for creating new code
export interface CodeInfoRequest {
    country?: string;
    codeType: string;
    code: string;
    name: string;
    desc?: string;
}

export interface CodeInfoResult {
    errcode: string;
    message: string;
    data: CodeInfo;
    success: boolean;
}

// Backend API interfaces for creating code mapping
export interface CodeMappingRequest {
    givenCode: string; // required, max 64 chars
    givenName: string; // required, max 100 chars
    codeId?: number; // optional
    desc?: string; // optional, max 255 chars
}

export interface CodeMappingResult {
    errcode: string;
    message: string;
    data: {
        id: number;
        codeId?: number;
        givenCode: string;
        givenName: string;
        desc?: string;
        confidence: number;
        source: number;
        tenantId: string;
        createTime: string;
        updateTime: string;
    };
    success: boolean;
    error: boolean;
    traceId: string;
    errorMsgArray: any[];
}

// Create a new standard code entry
export const createStandardCode = async (data: CodeInfoRequest): Promise<CodeInfo> => {
    try {
        const response = await fetch(getApiBasePath('/api/codes/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CodeInfoResult = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' || !result.success) {
            throw new Error(result.message || 'Failed to create standard code');
        }

        return result.data;
    } catch (error) {
        console.error('Error creating standard code:', error);
        throw error;
    }
};

// Transform frontend StandardRow to backend CodeInfoRequest format
export const transformStandardRowToCodeInfoRequest = (
    standardRow: Partial<StandardRow>,
    currentType: CodeListType
): CodeInfoRequest => {
    return {
        country: standardRow.scope !== 'GLOBAL' ? standardRow.scope : undefined,
        codeType: currentType,
        code: standardRow.code!,
        name: standardRow.name!,
        desc: standardRow.description || undefined,
    };
};

// Fetch country options for scope selector
export const fetchCountryOptions = async (language: string = 'en'): Promise<CountryOption[]> => {
    try {
        const query: CodeInfoQuery = {
            pageNum: 1,
            pageSize: 500, // Get all countries
            codeType: '0006' // Fixed value for Country code type
        };

        const response = await fetch(getApiBasePath(`/api/codes/search?lang=${language}`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CodeInfoPageResult = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' || !result.success) {
            throw new Error(result.message || 'API returned error');
        }

        // Transform country data to simple options format
        const countryOptions: CountryOption[] = result.data.map((country: CodeInfo) => ({
            code: country.code,
            name: country.name
        }));

        return countryOptions;

    } catch (error) {
        console.error('Error fetching country options:', error);

        // Fallback to seed data if API fails
        const seedCountries = seedStandards.COUNTRY;
        return seedCountries.map(country => ({
            code: country.code,
            name: country.name
        }));
    }
};

// Delete a standard code entry
export const deleteStandardCode = async (id: string): Promise<void> => {
    try {
        const response = await fetch(getApiBasePath(`/api/codes/${id}`), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' && result.errcode !== '200') {
            throw new Error(result.message || 'Failed to delete standard code');
        }
    } catch (error) {
        console.error('Error deleting standard code:', error);
        throw error;
    }
};

// Create a new mapping code entry
export const createMappingCode = async (data: CodeMappingRequest, codeType?: string): Promise<CodeMapping> => {
    try {
        // Build URL with optional codeType parameter for AI-driven code matching
        const url = codeType
            ? getApiBasePath(`/api/code-mappings?codeType=${encodeURIComponent(codeType)}`)
            : getApiBasePath('/api/code-mappings');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CodeMappingResult = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' || !result.success) {
            throw new Error(result.message || 'Failed to create mapping code');
        }

        // Transform backend response to frontend CodeMapping format
        const mappingData: CodeMapping = {
            id: result.data.id,
            codeId: result.data.codeId,
            givenCode: result.data.givenCode,
            givenName: result.data.givenName,
            desc: result.data.desc,
            confidence: result.data.confidence,
            source: result.data.source,
            tenantId: result.data.tenantId,
            createTime: result.data.createTime,
            updateTime: result.data.updateTime,
            code: '', // Will be populated if needed
            country: undefined // Will be populated if needed
        };

        return mappingData;
    } catch (error) {
        console.error('Error creating mapping code:', error);
        throw error;
    }
};

// Transform frontend form data to backend CodeMappingRequest format
export const transformMappingFormToRequest = (
    formData: {
        givenCode: string;
        givenName: string;
        standardCode: string;
        description?: string;
    },
    standardCodes: StandardRow[]
): CodeMappingRequest => {
    // Find the codeId from the selected standard code
    const selectedStandard = standardCodes.find(std => std.code === formData.standardCode);
    const codeId = selectedStandard ? parseInt(selectedStandard.id) : undefined;

    return {
        givenCode: formData.givenCode.trim(),
        givenName: formData.givenName.trim(),
        codeId: codeId,
        desc: formData.description?.trim() || undefined,
    };
};

// Delete a mapping code entry
export const deleteMappingCode = async (id: string): Promise<void> => {
    try {
        const response = await fetch(getApiBasePath(`/api/code-mappings/${id}`), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' && result.errcode !== '200') {
            throw new Error(result.message || 'Failed to delete mapping code');
        }
    } catch (error) {
        console.error('Error deleting mapping code:', error);
        throw error;
    }
};

// Backend API interfaces for code statistics
export interface CodeStatsData {
    codeEnum: string;
    totalCodeCount: number;
    highConfidenceMappingCount: number;
    lowConfidenceMappingCount: number;
}

export interface CodeStatsResult {
    errcode: string;
    message: string;
    data: CodeStatsData;
    success: boolean;
    error: boolean;
    traceId: string;
    errorMsgArray: any[];
}

// Frontend statistics interface
export interface CodeListStatistics {
    totalStandardEntries: number;
    mappingCoverage: number;
    pendingFixes: number;
    highConfidenceCount: number;
    lowConfidenceCount: number;
}

// Fetch code statistics from backend API
export const fetchCodeStatistics = async (codeType: string): Promise<CodeListStatistics> => {
    try {
        const response = await fetch(getApiBasePath(`/api/codes/stats?codeType=${encodeURIComponent(codeType)}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: CodeStatsResult = await response.json();

        // Backend returns errcode: '0000' for successful responses
        if (result.errcode !== '0000' || !result.success) {
            throw new Error(result.message || 'API returned error');
        }

        const { data } = result;
        const totalMappings = data.highConfidenceMappingCount + data.lowConfidenceMappingCount;

        // Mapping Coverage = highConfidenceMappingCount / (highConfidenceMappingCount + lowConfidenceMappingCount)
        // 如果总数为0，则Mapping Coverage为0%
        const mappingCoverage = totalMappings > 0
            ? Math.round((data.highConfidenceMappingCount / totalMappings) * 100)
            : 0;

        return {
            totalStandardEntries: data.totalCodeCount,
            mappingCoverage: mappingCoverage,
            pendingFixes: data.lowConfidenceMappingCount,
            highConfidenceCount: data.highConfidenceMappingCount,
            lowConfidenceCount: data.lowConfidenceMappingCount,
        };
    } catch (error) {
        console.error('Error fetching code statistics:', error);
        throw error;
    }
};