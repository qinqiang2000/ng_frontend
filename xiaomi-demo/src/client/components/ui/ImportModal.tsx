'use client';

import React, { useState } from 'react';
import { CodeListService, type CodeListType } from '@/client/services/codeListService';

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (result: { added: number; updated: number; skipped: number }) => void;
    target: 'standard' | 'mapping';
    currentType: CodeListType;
}

export default function ImportModal({
    open,
    onClose,
    onConfirm,
    target,
    currentType
}: ImportModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [format, setFormat] = useState<'xlsx' | 'xml' | 'json'>('xlsx');
    const [allowPartial, setAllowPartial] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            alert('Please select a file to import');
            return;
        }

        try {
            setLoading(true);
            const result = await CodeListService.importData(
                currentType,
                target,
                selectedFile,
                { format, allowPartial }
            );

            onConfirm(result);
            onClose();
            setSelectedFile(null);
        } catch (error) {
            console.error('Import error:', error);
            alert('Import failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Import {target === 'standard' ? 'Standard Entries' : 'Mappings'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                    {/* File Format Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Format
                        </label>
                        <div className="flex gap-4">
                            {(['xlsx', 'xml', 'json'] as const).map((fmt) => (
                                <label key={fmt} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="format"
                                        value={fmt}
                                        checked={format === fmt}
                                        onChange={(e) => setFormat(e.target.value as typeof fmt)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700 uppercase">
                                        {fmt}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Partial Import Option */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={allowPartial}
                                onChange={(e) => setAllowPartial(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">
                                Allow partial import (continue on errors)
                            </span>
                        </label>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept={format === 'xlsx' ? '.xlsx,.xls' : format === 'xml' ? '.xml' : '.json'}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <i className="ri-upload-cloud-line text-3xl text-gray-400 mb-2"></i>
                                <span className="text-sm text-gray-600">
                                    Click to upload or drag and drop
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    {format.toUpperCase()} files only
                                </span>
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                <i className="ri-file-line mr-2"></i>
                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </div>
                        )}
                    </div>

                    {/* Template Field Instructions */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">
                            Template Fields:
                        </h4>
                        <div className="text-xs text-blue-700">
                            {target === 'standard' ? (
                                <>
                                    <code className="bg-white px-1 rounded">Code*</code>,
                                    <code className="bg-white px-1 rounded mx-1">Name*</code>,
                                    <code className="bg-white px-1 rounded">Description</code>,
                                    <code className="bg-white px-1 rounded mx-1">Scope</code>
                                </>
                            ) : (
                                <>
                                    <code className="bg-white px-1 rounded">GivenCode*</code>,
                                    <code className="bg-white px-1 rounded mx-1">GivenName</code>,
                                    <code className="bg-white px-1 rounded">StandardCode*</code>,
                                    <code className="bg-white px-1 rounded mx-1">Scope</code>
                                </>
                            )}
                            <div className="mt-1">
                                * Required fields
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={loading || !selectedFile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <i className="ri-loader-4-line animate-spin"></i>}
                        Import
                    </button>
                </div>
            </div>
        </div>
    );
}