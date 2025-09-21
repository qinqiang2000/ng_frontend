'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { type MappingRow, type CodeListType, type StandardRow, type CountryOption, fetchCountryOptions, createMappingCode, transformMappingFormToRequest, fetchStandardCodes, type CodeInfoQuery } from '@/client/services/codeListService';
import { Select } from 'antd';
import { useApiLanguage } from '@/client/contexts/LanguageContext';
import { useToast } from '@/client/components/ui/ToastContainer';
import { useCodeListsTranslation } from '@/client/hooks/useTranslation';

interface AddMappingDrawerProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data?: MappingRow) => void; // Made optional since we handle success internally
    currentType: CodeListType;
    hasCountry: boolean;
    standards: StandardRow[];
    scopeOptions: string[]; // Keep for backward compatibility, but won't be used for API-based scope loading
}

export default function AddMappingDrawer({
    open,
    onClose,
    onConfirm,
    currentType,
    hasCountry,
    standards,
    scopeOptions
}: AddMappingDrawerProps) {
    const apiLanguage = useApiLanguage();
    const { showSuccess, showError } = useToast();
    const { t } = useCodeListsTranslation();
    const [formData, setFormData] = useState({
        scope: hasCountry ? '' : 'GLOBAL',
        givenCode: '',
        givenName: '',
        standardCode: '',
        description: '' // Added description field
    });
    const [loading, setLoading] = useState(false);

    // Scope options state for API-based loading
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
    const [scopeLoading, setScopeLoading] = useState(false);
    const [scopeError, setScopeError] = useState<string | null>(null);

    // Independent standard codes state for dynamic loading based on scope
    const [filteredStandards, setFilteredStandards] = useState<StandardRow[]>([]);
    const [standardsLoading, setStandardsLoading] = useState(false);
    const [standardsError, setStandardsError] = useState<string | null>(null);

    // Load country options when drawer opens and hasCountry is true
    useEffect(() => {
        if (open) {
            setFormData({
                scope: '', // Always start with empty scope (optional)
                givenCode: '',
                givenName: '',
                standardCode: '',
                description: '' // Reset description field
            });

            // Reset filtered standards
            setFilteredStandards([]);
            setStandardsError(null);

            // Load country options from API if hasCountry is true
            if (hasCountry) {
                loadCountryOptions();
            }

            // Always load all standards initially (no scope filter)
            loadFilteredStandards('');
        }
    }, [open, hasCountry, apiLanguage]);

    // Load standards when scope changes
    useEffect(() => {
        if (open) {
            // Always load standards when scope changes, including empty scope
            loadFilteredStandards(formData.scope);
        }
    }, [formData.scope, open, currentType]);

    // Load country options from API
    const loadCountryOptions = async () => {
        setScopeLoading(true);
        setScopeError(null);

        try {
            const options = await fetchCountryOptions(apiLanguage);
            setCountryOptions(options);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch country options';
            setScopeError(errorMessage);
            console.warn('Failed to load country options:', errorMessage);
            // Fallback to the passed scopeOptions if API fails
            setCountryOptions([]);
        } finally {
            setScopeLoading(false);
        }
    };

    // Load filtered standard codes based on selected scope
    const loadFilteredStandards = async (selectedScope: string) => {
        setStandardsLoading(true);
        setStandardsError(null);

        try {
            const query: CodeInfoQuery = {
                pageNum: 1,
                pageSize: 500, // Get enough standard codes for selection
                codeType: currentType,
                // If scope is empty, don't set country filter to get all standards
                country: selectedScope && selectedScope !== 'GLOBAL' ? selectedScope : undefined
            };

            const result = await fetchStandardCodes(query);
            setFilteredStandards(result.data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load standard codes';
            setStandardsError(errorMessage);
            console.warn('Failed to load filtered standards:', errorMessage);
            // Fallback to the passed standards if API fails
            setFilteredStandards(standards);
        } finally {
            setStandardsLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Validation - only validate required fields
        if (!formData.givenCode.trim()) {
            showError(t('messages.validationFailed'), t('messages.givenCodeRequired'));
            return;
        }

        if (formData.givenCode.trim().length > 64) {
            showError(t('messages.validationFailed'), t('messages.givenCodeTooLong'));
            return;
        }

        if (!formData.givenName.trim()) {
            showError(t('messages.validationFailed'), t('messages.givenNameRequired'));
            return;
        }

        if (formData.givenName.trim().length > 100) {
            showError(t('messages.validationFailed'), t('messages.givenNameTooLong'));
            return;
        }

        // Scope and Standard Code are now optional
        // No validation needed for these fields

        if (formData.description && formData.description.trim().length > 255) {
            showError(t('messages.validationFailed'), t('messages.descriptionTooLong'));
            return;
        }

        try {
            setLoading(true);

            // Transform form data to API request format
            const requestData = transformMappingFormToRequest(
                {
                    givenCode: formData.givenCode,
                    givenName: formData.givenName,
                    standardCode: formData.standardCode,
                    description: formData.description || undefined
                },
                filteredStandards.length > 0 ? filteredStandards : standards
            );

            // Call the backend API
            await createMappingCode(requestData, currentType);

            // Show success message
            showSuccess('创建成功', '映射关系已成功创建');

            // Notify parent component (for data refresh)
            onConfirm();

            // Close the drawer
            onClose();
        } catch (error) {
            console.error('Error creating mapping:', error);
            const errorMessage = error instanceof Error ? error.message : '创建映射失败';
            showError('创建失败', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // If scope is changed, reset the standard code selection
            if (field === 'scope') {
                newData.standardCode = '';
            }

            return newData;
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-[500px] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Add Mapping
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-6 overflow-y-auto">
                    <div className="space-y-4">
                        {/* Scope */}
                        {hasCountry && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('mapping.scopeOptional')}
                                </label>
                                <Select
                                    placeholder={t('mapping.selectScopeToFilter')}
                                    value={formData.scope || undefined}
                                    onChange={(value) => handleChange('scope', value || '')}
                                    loading={scopeLoading}
                                    showSearch
                                    allowClear
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                                        (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    style={{ width: '100%' }}
                                    size="middle"
                                    options={
                                        countryOptions.length > 0
                                            ? countryOptions.map(country => ({
                                                label: `${country.code} - ${country.name}`,
                                                value: country.code
                                            }))
                                            : scopeOptions.map(scope => ({
                                                label: scope,
                                                value: scope
                                            }))
                                    }
                                    notFoundContent={
                                        scopeLoading
                                            ? <div className="p-2 text-center text-gray-500">{t('messages.loading')}</div>
                                            : scopeError
                                                ? <div className="p-2 text-center text-red-500">Failed to load options</div>
                                                : <div className="p-2 text-center text-gray-500">No options available</div>
                                    }
                                />
                                {scopeError && (
                                    <div className="text-sm text-red-500 mt-1">
                                        Failed to load country options. Using fallback data.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Given Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Given Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.givenCode}
                                onChange={(e) => handleChange('givenCode', e.target.value)}
                                placeholder="Enter given code"
                                maxLength={64}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.givenCode.length}/64 字符
                            </div>
                        </div>

                        {/* Given Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Given Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.givenName}
                                onChange={(e) => handleChange('givenName', e.target.value)}
                                placeholder="Enter given name"
                                maxLength={100}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.givenName.length}/100 字符
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Enter description (optional)"
                                maxLength={255}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.description.length}/255 字符
                            </div>
                        </div>

                        {/* Standard Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('mapping.standardCodeOptional')}
                            </label>
                            <select
                                value={formData.standardCode}
                                onChange={(e) => handleChange('standardCode', e.target.value)}
                                disabled={standardsLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {standardsLoading
                                        ? t('mapping.loadingAllStandards')
                                        : t('forms.selectStandardCode')
                                    }
                                </option>
                                {filteredStandards.map(std => (
                                    <option key={std.id} value={std.code}>
                                        {std.code} - {std.name}
                                    </option>
                                ))}
                            </select>

                            {/* Loading indicator */}
                            {standardsLoading && (
                                <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                    <i className="ri-loader-4-line animate-spin"></i>
                                    {t('mapping.loadingAllStandards')}
                                </div>
                            )}

                            {/* Error message */}
                            {standardsError && (
                                <div className="text-sm text-red-500 mt-1">
                                    {standardsError}
                                </div>
                            )}

                            {/* AI mapping hint */}
                            {!formData.standardCode && (
                                <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                    <i className="ri-magic-line"></i>
                                    {t('mapping.aiMappingHint')}
                                </div>
                            )}

                            {/* No data message */}
                            {!standardsLoading && !standardsError && filteredStandards.length === 0 && (
                                <div className="text-sm text-gray-500 mt-1">
                                    {t('messages.noStandardsAvailable')}
                                </div>
                            )}

                            {/* Scope hint */}
                            {hasCountry && !standardsLoading && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {formData.scope
                                        ? `Showing codes for scope: ${formData.scope}`
                                        : t('mapping.showingAllStandards')
                                    }
                                </div>
                            )}

                            {/* AI auto match hint */}
                            {!formData.standardCode && !standardsLoading && (
                                <div className="text-xs text-gray-500 mt-1">
                                    💡 {t('mapping.aiAutoMatch')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || standardsLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <i className="ri-loader-4-line animate-spin"></i>}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}