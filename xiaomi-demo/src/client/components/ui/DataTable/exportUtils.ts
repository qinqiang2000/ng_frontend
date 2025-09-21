'use client';

import { ExportFormat, DataTableColumn } from './types';

// CSV 导出函数
export const exportToCsv = (
    data: any[],
    columns: DataTableColumn[],
    filename: string = 'export.csv'
): void => {
    if (!data.length) return;

    // 过滤可见列
    const visibleColumns = columns.filter(col => !col.hidden);

    // 创建 CSV 头部
    const headers = visibleColumns.map(col => col.title).join(',');

    // 创建 CSV 数据行
    const rows = data.map(record => {
        return visibleColumns.map(col => {
            let value = record[col.dataIndex || col.key];

            // 处理渲染函数
            if (col.render && typeof col.render === 'function') {
                const rendered = col.render(value, record, 0);
                // 如果是 React 元素，尝试提取文本内容
                if (typeof rendered === 'object' && rendered !== null) {
                    value = extractTextFromReactElement(rendered);
                } else {
                    value = rendered;
                }
            }

            // 处理特殊字符和换行
            if (typeof value === 'string') {
                value = value.replace(/"/g, '""'); // 转义双引号
                if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                    value = `"${value}"`; // 包裹在双引号中
                }
            }

            return value || '';
        }).join(',');
    });

    // 组合完整的 CSV 内容
    const csvContent = [headers, ...rows].join('\n');

    // 创建并下载文件
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

// JSON 导出函数
export const exportToJson = (
    data: any[],
    columns: DataTableColumn[],
    filename: string = 'export.json'
): void => {
    if (!data.length) return;

    // 过滤可见列
    const visibleColumns = columns.filter(col => !col.hidden);

    // 创建清理后的数据
    const cleanedData = data.map(record => {
        const cleanedRecord: any = {};
        visibleColumns.forEach(col => {
            const key = col.dataIndex || col.key;
            let value = record[key];

            // 处理渲染函数
            if (col.render && typeof col.render === 'function') {
                const rendered = col.render(value, record, 0);
                if (typeof rendered === 'object' && rendered !== null) {
                    value = extractTextFromReactElement(rendered);
                } else {
                    value = rendered;
                }
            }

            cleanedRecord[key] = value;
        });
        return cleanedRecord;
    });

    const jsonContent = JSON.stringify(cleanedData, null, 2);
    downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};

// Excel 导出函数（简化版，使用 CSV 格式但扩展名为 .xlsx）
export const exportToExcel = (
    data: any[],
    columns: DataTableColumn[],
    filename: string = 'export.xlsx'
): void => {
    // 这里使用简化的方法，实际项目中可以集成 xlsx 库
    const csvFilename = filename.replace('.xlsx', '.csv');
    exportToCsv(data, columns, csvFilename);

    // 提示用户可以用 Excel 打开 CSV 文件
    console.log('文件已导出为 CSV 格式，可使用 Excel 打开');
};

// 从 React 元素中提取文本内容
const extractTextFromReactElement = (element: any): string => {
    if (typeof element === 'string' || typeof element === 'number') {
        return String(element);
    }

    if (element && element.props) {
        if (element.props.children) {
            if (Array.isArray(element.props.children)) {
                return element.props.children
                    .map((child: any) => extractTextFromReactElement(child))
                    .join('');
            } else {
                return extractTextFromReactElement(element.props.children);
            }
        }

        // 特殊处理一些常见的 props
        if (element.props.title) return element.props.title;
        if (element.props.alt) return element.props.alt;
    }

    return '';
};

// 文件下载辅助函数
const downloadFile = (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType }); // 添加 BOM 以支持中文
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理 URL 对象
    window.URL.revokeObjectURL(url);
};

// 通用导出函数
export const exportData = (
    data: any[],
    columns: DataTableColumn[],
    format: ExportFormat,
    filename?: string
): void => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const defaultFilename = `export_${timestamp}`;

    switch (format) {
        case 'csv':
            exportToCsv(data, columns, filename || `${defaultFilename}.csv`);
            break;
        case 'excel':
            exportToExcel(data, columns, filename || `${defaultFilename}.xlsx`);
            break;
        case 'json':
            exportToJson(data, columns, filename || `${defaultFilename}.json`);
            break;
        default:
            console.error('不支持的导出格式:', format);
    }
};

// 批量导出函数
export const exportMultipleFormats = (
    data: any[],
    columns: DataTableColumn[],
    formats: ExportFormat[],
    baseFilename?: string
): void => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = baseFilename || `export_${timestamp}`;

    formats.forEach(format => {
        const extension = format === 'excel' ? 'xlsx' : format;
        exportData(data, columns, format, `${filename}.${extension}`);
    });
};