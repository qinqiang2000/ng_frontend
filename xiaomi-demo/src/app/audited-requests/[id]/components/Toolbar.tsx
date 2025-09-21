'use client';

import { useState } from 'react';

type ToolType = 'select' | 'pan' | 'connect' | 'rectangle' | 'circle';

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  const tools = [
    { id: 'select' as ToolType, icon: 'ri-cursor-line', title: '选择工具' },
    { id: 'pan' as ToolType, icon: 'ri-drag-move-line', title: '移动工具' },
    { id: 'connect' as ToolType, icon: 'ri-links-line', title: '连线工具' },
    { id: 'rectangle' as ToolType, icon: 'ri-rectangle-line', title: '矩形选择' },
    { id: 'circle' as ToolType, icon: 'ri-circle-line', title: '圆形选择' },
  ];

  const zoomTools = [
    { id: 'zoom-in', icon: 'ri-zoom-in-line', title: '放大' },
    { id: 'zoom-out', icon: 'ri-zoom-out-line', title: '缩小' },
    { id: 'fit-view', icon: 'ri-fit-screen-line', title: '适配屏幕' },
    { id: 'center', icon: 'ri-focus-3-line', title: '居中对齐' },
  ];

  const actionTools = [
    { id: 'reset', icon: 'ri-refresh-line', title: '重置视图' },
    { id: 'save', icon: 'ri-save-line', title: '保存状态' },
  ];

  const annotationTools = [
    { id: 'comment', icon: 'ri-chat-3-line', title: '批注工具' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden">
      <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          {/* 基础工具 */}
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`w-10 h-10 p-0 rounded-lg transition-all duration-200 flex items-center justify-center group ${
                activeTool === tool.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:shadow-sm hover:text-gray-900'
              }`}
              title={tool.title}
              onClick={() => setActiveTool(tool.id)}
            >
              <i className={`${tool.icon} w-4 h-4 flex items-center justify-center`}></i>
            </button>
          ))}

          <div className="h-px w-full bg-gray-200 my-1"></div>

          {/* 缩放工具 */}
          {zoomTools.map((tool) => (
            <button
              key={tool.id}
              className="w-10 h-10 p-0 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:shadow-sm hover:text-gray-900 flex items-center justify-center group"
              title={tool.title}
            >
              <i className={`${tool.icon} w-4 h-4 flex items-center justify-center`}></i>
            </button>
          ))}

          <div className="h-px w-full bg-gray-200 my-1"></div>

          {/* 操作工具 */}
          {actionTools.map((tool) => (
            <button
              key={tool.id}
              className="w-10 h-10 p-0 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:shadow-sm hover:text-gray-900 flex items-center justify-center group"
              title={tool.title}
            >
              <i className={`${tool.icon} w-4 h-4 flex items-center justify-center`}></i>
            </button>
          ))}

          <div className="h-px w-full bg-gray-200 my-1"></div>

          {/* 批注工具 */}
          {annotationTools.map((tool) => (
            <button
              key={tool.id}
              className="w-10 h-10 p-0 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:shadow-sm hover:text-gray-900 flex items-center justify-center group"
              title={tool.title}
            >
              <i className={`${tool.icon} w-4 h-4 flex items-center justify-center`}></i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}