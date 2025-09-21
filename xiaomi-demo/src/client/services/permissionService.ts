'use client';

// Permission check request interface
export interface PermissionCheckRequest {
    domain: string;
    buttonType: string;
    email?: string;
    mobile?: string;
    name?: string;
    userName: string;
    workNumber?: string;
    pageTag: string;
}

// Permission check result interface
export interface PermissionCheckResult {
    hasPermission: boolean;
    buttonType: string;
    errorCode?: string;
    errorMessage?: string;
    status: boolean;
}

// API response interface
export interface PermissionCheckResponse {
    errcode: string;
    message: string;
    data: PermissionCheckResult | null;
}

/**
 * Convert URL pathname to pageTag format
 * Examples:
 * "/" -> "dashboard"
 * "/invoice-requests" -> "invoiceRequests"
 * "/invoice-requests/123" -> "invoiceRequests_detail"
 * "/tax-rules" -> "taxRules"
 * "/tax-rules/456" -> "taxRules_detail"
 * "/audited-requests/789/documents" -> "auditedRequests_detail_documents"
 * "/audited-requests/789/documents/abc123" -> "auditedRequests_detail_documents_abc123"
 */
export function pathToPageTag(pathname: string): string {
    // Handle root path
    if (pathname === '/' || pathname === '') {
        return 'dashboard';
    }

    // Remove leading slash and split into segments
    const segments = pathname.slice(1).split('/').filter(s => s);

    // Convert each segment
    const convertedSegments = segments.map(segment => {
        // Check if segment is purely numeric (dynamic route parameter)
        if (/^\d+$/.test(segment)) {
            return 'detail';
        }

        // Convert kebab-case to camelCase for normal segments
        return segment.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    });

    // Join segments with underscore
    return convertedSegments.join('_');
}

/**
 * Check user permission for a specific page
 * @param pathname - Current page pathname
 * @returns Promise<boolean> - Whether user has permission
 * @throws Error with specific error message for different failure cases
 */
export async function checkUserPermission(pathname: string): Promise<boolean> {
    try {
        // Convert pathname to pageTag
        const pageTag = pathToPageTag(pathname);

        // Call permission check API (using different frontend path)
        const response = await fetch('/api/sso/permission/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                buttonType: 'view', // Always 'view' for page access
                pageTag: pageTag
                // Other parameters will be extracted from session on server side
            }),
        });

        const result: PermissionCheckResponse = await response.json();

        // Check if request was successful
        if (!response.ok) {
            console.error('Permission check HTTP error:', response.status, result);
            // Create error object with error type for localization
            const error = new Error('HTTP_ERROR');
            (error as any).httpStatus = response.status;
            (error as any).result = result;
            throw error;
        }

        // Check backend response error code
        if (result.errcode !== '0000') {
            // Create error object with error type and backend message for localization
            const error = new Error('API_ERROR');
            (error as any).errcode = result.errcode;
            (error as any).backendMessage = result.message;
            (error as any).result = result;
            throw error;
        }

        // Return permission status - explicitly check for true
        return result.data?.hasPermission === true;

    } catch (error) {
        // If it's already our custom error, re-throw it
        if (error instanceof Error && (error.message === 'HTTP_ERROR' || error.message === 'API_ERROR')) {
            throw error;
        }
        // For other errors (network, parsing, etc.), create a generic error
        const genericError = new Error('NETWORK_ERROR');
        (genericError as any).originalError = error;
        throw genericError;
    }
}

/**
 * Get permission error message from API response
 * @param result - Permission check API response
 * @returns Error message or null
 */
export function getPermissionErrorMessage(result: PermissionCheckResponse): string | null {
    if (result.data?.errorMessage) {
        return result.data.errorMessage;
    }
    return null;
}