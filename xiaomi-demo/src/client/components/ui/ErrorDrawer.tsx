'use client';

import React from 'react';

interface ValidationError {
    id: string;
    severity: 'ERROR' | 'WARNING';
    message: string;
    type: string;
    affected: number;
}

interface ErrorDrawerProps {
    open: boolean;
    onClose: () => void;
    errors: ValidationError[];
}

export default function ErrorDrawer({ open, onClose, errors }: ErrorDrawerProps) {
    if (!open) return null;

    const errorCount = errors.filter(e => e.severity === 'ERROR').length;
    const warningCount = errors.filter(e => e.severity === 'WARNING').length;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-[600px] bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Validation Issues
                        </h2>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-red-600">
                                <i className="ri-error-warning-line mr-1"></i>
                                {errorCount} Errors
                            </span>
                            <span className="text-sm text-orange-600">
                                <i className="ri-alert-line mr-1"></i>
                                {warningCount} Warnings
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {errors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <i className="ri-checkbox-circle-line text-4xl text-green-500 mb-2"></i>
                            <p className="text-lg font-medium">No Issues Found</p>
                            <p className="text-sm">All validations passed successfully</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {errors.map((error) => (
                                    <div
                                        key={error.id}
                                        className={`p-4 rounded-lg border ${
                                            error.severity === 'ERROR'
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-orange-50 border-orange-200'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <i className={`text-lg ${
                                                    error.severity === 'ERROR'
                                                        ? 'ri-error-warning-line text-red-500'
                                                        : 'ri-alert-line text-orange-500'
                                                }`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                        error.severity === 'ERROR'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {error.severity}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {error.type}
                                                    </span>
                                                </div>
                                                <p className={`text-sm ${
                                                    error.severity === 'ERROR'
                                                        ? 'text-red-700'
                                                        : 'text-orange-700'
                                                }`}>
                                                    {error.message}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Affects {error.affected} {error.affected === 1 ? 'entry' : 'entries'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                    <i className="ri-magic-line"></i>
                                    Auto Fix Issues
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                                    <i className="ri-download-line"></i>
                                    Export Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-600">
                        Last checked: {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}