'use client';

import { Handle, Position } from 'reactflow';
import { useState } from 'react';

interface AttachmentField {
  label: string;
  value: string;
  highlighted: boolean;
}

interface AttachmentNodeProps {
  data: {
    title: string;
    type: string;
    fields: AttachmentField[];
    onFieldClick?: (fieldIndex: number) => void;
    onPreviewClick?: () => void;
    onExpandChange?: (isExpanded: boolean) => void;
    onDeleteClick?: () => void;
    isDeleting?: boolean;
  };
  id: string;
}

export default function AttachmentNode({ data, id }: AttachmentNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldClick = (fieldIndex: number) => {
    if (data.onFieldClick) {
      data.onFieldClick(fieldIndex);
    }
  };

  const handlePreviewClick = () => {
    if (data.onPreviewClick) {
      data.onPreviewClick();
    }
  };

  const handleDeleteClick = () => {
    if (data.onDeleteClick) {
      data.onDeleteClick();
    }
  };

  const handleExpandToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (data.onExpandChange) {
      data.onExpandChange(newExpandedState);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '酒店水单':
        return 'bg-purple-500 text-white';
      case '出库单':
        return 'bg-green-600 text-white';
      case '物流单':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="bg-green-50 border-2 border-green-300 rounded-lg shadow-lg min-w-72 max-w-80 overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 text-white cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="ri-attachment-2 w-4 h-4 flex items-center justify-center"></i>
            <h3 className="font-semibold text-sm">{data.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent ${getTypeColor(data.type)}`}>
              {data.type}
            </div>
            <div className="flex gap-1 ml-2">
              <button
                className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={handlePreviewClick}
                title="Preview Attachment"
              >
                <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
              </button>
              {data.onDeleteClick && (
                <button
                  className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
                  onClick={handleDeleteClick}
                  disabled={data.isDeleting}
                  title="Delete Attachment"
                >
                  {data.isDeleting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                  ) : (
                    <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
                  )}
                </button>
              )}
              <button
                className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={handleExpandToggle}
              >
                <i className={`ri-${isExpanded ? 'subtract' : 'add'}-line w-4 h-4 flex items-center justify-center`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 字段内容 */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-green-50">
          {data.fields?.map((field, index) => (
            <div
              key={index}
              className={`p-2 rounded-md border transition-all duration-200 cursor-pointer ${
                field.highlighted
                  ? 'border-green-500 bg-green-100 shadow-sm'
                  : 'border-green-300 bg-green-100/80 hover:border-green-400'
              }`}
              onClick={() => handleFieldClick(index)}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-700">{field.label}</span>
                {field.highlighted && (
                  <i className="ri-links-line w-3 h-3 flex items-center justify-center text-green-600"></i>
                )}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{field.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* 连接点 - 完全按照参考项目的方式 */}
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-green-600 rounded-full"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 border-green-600 rounded-full"
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white border-2 border-green-600 rounded-full"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-white border-2 border-green-600 rounded-full"
      />
    </div>
  );
}