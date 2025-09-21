'use client';

import { Handle, Position } from 'reactflow';
import { useState } from 'react';

interface DocumentField {
  label: string;
  value: string;
  highlighted: boolean;
}

interface DocumentNodeProps {
  data: {
    title: string;
    type: string;
    fields: DocumentField[];
    onFieldClick?: (fieldIndex: number) => void;
    onPreviewClick?: () => void;
  };
  id: string;
}

export default function DocumentNode({ data, id }: DocumentNodeProps) {
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

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl shadow-lg min-w-96 max-w-lg overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white cursor-pointer relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <i className="ri-file-text-fill w-5 h-5 flex items-center justify-center"></i>
            <h3 className="font-semibold text-lg">{data.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-white/20 text-white">
              {data.type}
            </div>
            <div className="flex gap-1 ml-2">
              <button 
                className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={handlePreviewClick}
                title="预览文档"
              >
                <i className="ri-eye-line w-4 h-4 flex items-center justify-center"></i>
              </button>
              <button 
                className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <i className={`ri-${isExpanded ? 'subtract' : 'add'}-line w-4 h-4 flex items-center justify-center`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 字段内容 */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          {data.fields?.map((field, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                field.highlighted
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-gray-50/50 hover:border-blue-300'
              }`}
              onClick={() => handleFieldClick(index)}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">{field.label}</span>
                {field.highlighted && (
                  <i className="ri-links-line w-4 h-4 flex items-center justify-center text-blue-500"></i>
                )}
              </div>
              <div className="mt-1 text-base font-semibold text-gray-900">{field.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* 连接点 */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full"
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full"
      />
    </div>
  );
}