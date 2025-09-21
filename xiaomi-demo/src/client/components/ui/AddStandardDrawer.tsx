'use client';

import React, { useState, useEffect } from 'react';
import { type StandardRow, type CodeListType, type CountryOption, fetchCountryOptions, createStandardCode, transformStandardRowToCodeInfoRequest } from '@/client/services/codeListService';
import { Select } from 'antd';
import { useApiLanguage } from '@/client/contexts/LanguageContext';
import { useToast } from '@/client/components/ui/ToastContainer';

interface AddStandardDrawerProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: StandardRow) => void;
    currentType: CodeListType;
    hasCountry: boolean;
    scopeOptions: string[];
}

export default function AddStandardDrawer({
    open,
    onClose,
    onConfirm,
    currentType,
    hasCountry,
    scopeOptions
}: AddStandardDrawerProps) {
    const apiLanguage = useApiLanguage();
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        scope: hasCountry ? '' : 'GLOBAL',
        code: '',
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    // Scope options state for API-based loading
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
    const [scopeLoading, setScopeLoading] = useState(false);
    const [scopeError, setScopeError] = useState<string | null>(null);

    // Load country options when drawer opens and hasCountry is true
    useEffect(() => {
        if (open) {
            setFormData({
                scope: hasCountry ? '' : 'GLOBAL',
                code: '',
                name: '',
                description: ''
            });

            // Load country options from API if hasCountry is true
            if (hasCountry) {
                loadCountryOptions();
            }
        }
    }, [open, hasCountry, apiLanguage]);

    // Load country options from API
    const loadCountryOptions = async () => {
        setScopeLoading(true);
        setScopeError(null);

        try {
            console.log('AddStandardDrawer: Loading country options with language:', apiLanguage);
            const options = await fetchCountryOptions(apiLanguage);
            console.log('AddStandardDrawer: Fetched country options:', options);
            setCountryOptions(options);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch country options';
            setScopeError(errorMessage);
            console.warn('AddStandardDrawer: Failed to load country options:', errorMessage);
            // Fallback to the passed scopeOptions if API fails
            setCountryOptions([]);
        } finally {
            setScopeLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Client-side validation
        if (!formData.code.trim() || !formData.name.trim()) {
            showError('Validation Error', 'Code and Name are required');
            return;
        }

        if (hasCountry && !formData.scope.trim()) {
            showError('Validation Error', 'Scope is required');
            return;
        }

        try {
            setLoading(true);

            // Prepare data for API
            const standardData: Partial<StandardRow> = {
                scope: formData.scope,
                code: formData.code.trim(),
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
            };

            // Transform to API request format
            const apiRequestData = transformStandardRowToCodeInfoRequest(standardData, currentType);

            // Call API to create the standard code
            const createdCodeInfo = await createStandardCode(apiRequestData);

            // Transform API response back to StandardRow format for local usage
            const newStandard: StandardRow = {
                id: createdCodeInfo.id.toString(),
                scope: createdCodeInfo.country || 'GLOBAL',
                code: createdCodeInfo.code,
                name: createdCodeInfo.name,
                description: createdCodeInfo.desc,
                status: createdCodeInfo.active === 1 ? 'ENABLED' : 'DISABLED',
                source: createdCodeInfo.system === 1 ? 'System' : 'User',
                createdAt: createdCodeInfo.createTime,
                updatedAt: createdCodeInfo.updateTime,
            };

            // Notify parent component of successful creation
            onConfirm(newStandard);

            // Show success message
            showSuccess('Success', 'Standard entry created successfully');

            // Close drawer
            onClose();
        } catch (error) {
            console.error('Error creating standard:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create standard entry';
            showError('Creation Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                        Add Standard Entry
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
                                    Scope <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    placeholder="Select scope"
                                    value={formData.scope || undefined}
                                    onChange={(value) => handleChange('scope', value || '')}
                                    loading={scopeLoading}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                                        (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    style={{ width: '100%' }}
                                    size="middle"
                                    options={
                                        countryOptions.length > 0
                                            ? (console.log('AddStandardDrawer: Using API country options:', countryOptions),
                                               countryOptions.map(country => ({
                                                label: `${country.code} - ${country.name}`,
                                                value: country.code
                                            })))
                                            : (console.log('AddStandardDrawer: Using fallback scope options:', scopeOptions),
                                               scopeOptions.map(scope => ({
                                                label: scope,
                                                value: scope
                                            })))
                                    }
                                    notFoundContent={
                                        scopeLoading
                                            ? <div className="p-2 text-center text-gray-500">Loading...</div>
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

                        {/* Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value)}
                                placeholder="Enter code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.description.length}/200
                            </div>
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
                        disabled={loading}
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