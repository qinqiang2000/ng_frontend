'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuditedRequestsTranslation } from '@/client/hooks/useTranslation';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const { t } = useAuditedRequestsTranslation();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload(acceptedFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <i className="ri-upload-cloud-2-line w-6 h-6 mx-auto mb-1 text-gray-400 flex items-center justify-center"></i>
        <div className="text-xs text-gray-600 mb-0.5">
          {isDragActive ? t('components.fileDependencies.dropToUpload') : t('components.fileDependencies.uploadText')}
        </div>
        <div className="text-xs text-gray-500">
          {t('components.fileDependencies.supportedFormats')}
        </div>
      </div>
    </div>
  );
}