'use client';

import { useEffect, useState } from 'react';

interface JsonDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
}

// JSON节点组件，支持折叠展开
function JsonNode({
  keyName,
  value,
  isLast,
  level = 0,
  forceExpand = false
}: {
  keyName?: string;
  value: any;
  isLast?: boolean;
  level?: number;
  forceExpand?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false); // 默认全部展开

  // 响应全局展开/折叠状态
  useEffect(() => {
    if (forceExpand !== undefined) {
      setIsCollapsed(!forceExpand);
    }
  }, [forceExpand]);

  const isObject = value && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isPrimitive = !isObject && !isArray;

  if (isPrimitive) {
    return (
      <div className="font-mono text-sm leading-relaxed">
        {keyName && <span className="text-blue-600 font-medium">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-gray-500">: </span>}
        <span className={`${
          typeof value === 'string' ? 'text-green-600' :
          typeof value === 'number' ? 'text-purple-600' :
          typeof value === 'boolean' ? 'text-orange-600' :
          value === null ? 'text-gray-500' : 'text-gray-800'
        }`}>
          {JSON.stringify(value)}
        </span>
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  const entries = isObject ? Object.entries(value) : value.map((v: any, i: number) => [i, v]);
  const hasEntries = entries.length > 0;
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="font-mono text-sm leading-relaxed">
      {/* 开始行 */}
      <div className="flex items-center">
        {keyName && <span className="text-blue-600 font-medium">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-gray-500">: </span>}
        {hasEntries && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mr-1 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded focus:outline-none transition-colors"
          >
            <i className={`text-xs ${isCollapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-down-s-line'}`}></i>
          </button>
        )}
        <span className="text-gray-600 font-medium">{openBracket}</span>
        {isCollapsed && hasEntries && (
          <span className="text-gray-400 italic ml-2 text-xs">
            {entries.length} {isArray ? 'items' : 'properties'}...
          </span>
        )}
        {isCollapsed && <span className="text-gray-600 font-medium ml-1">{closeBracket}</span>}
        {!isLast && isCollapsed && <span className="text-gray-500">,</span>}
      </div>

      {/* 展开的内容 */}
      {!isCollapsed && hasEntries && (
        <div className="relative border-l border-gray-200 ml-0 pl-6">
          {entries.map(([key, val]: [string | number, any], index: number) => (
            <JsonNode
              key={`${key}-${index}`}
              keyName={isArray ? undefined : String(key)}
              value={val}
              isLast={index === entries.length - 1}
              level={level + 1}
              forceExpand={forceExpand}
            />
          ))}
        </div>
      )}

      {/* 闭合括号 */}
      {!isCollapsed && hasEntries && (
        <div className="text-gray-600 font-medium">
          {closeBracket}
          {!isLast && <span className="text-gray-500">,</span>}
        </div>
      )}

      {/* 空对象/数组的闭合 */}
      {!isCollapsed && !hasEntries && (
        <>
          <span className="text-gray-600 font-medium">{closeBracket}</span>
          {!isLast && <span className="text-gray-500">,</span>}
        </>
      )}
    </div>
  );
}

export default function JsonDataModal({
  isOpen,
  onClose,
  title,
  data,
}: JsonDataModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandAll, setExpandAll] = useState(true); // 默认展开状态

  // Handle copy to clipboard
  const handleCopyJson = async () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(data, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
    }
  };

  // Handle expand/collapse all
  const handleToggleAll = () => {
    setExpandAll(!expandAll);
  };
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="bg-gray-50 rounded-lg p-4 h-full">
            <div className="overflow-auto h-full">
              <JsonNode value={data} isLast={true} forceExpand={expandAll} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleAll}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <i className={`${expandAll ? 'ri-subtract-line' : 'ri-add-line'} text-sm`}></i>
              <span>{expandAll ? 'Collapse All' : 'Expand All'}</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
            >
              <i className={`${copySuccess ? 'ri-check-line text-green-600' : 'ri-file-copy-line'} text-sm`}></i>
              <span>{copySuccess ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}