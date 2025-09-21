/* eslint-disable no-multi-spaces */
import { marked } from 'marked';

// 配置marked选项
marked.setOptions({
    gfm: true, // 启用GitHub风格的Markdown
    breaks: true, // 将单个换行符转换为<br>
    sanitize: false, // 允许HTML（注意安全性）
    smartLists: true,
    smartypants: false
});

/**
 * 智能检测内容是否包含Markdown格式
 * @param {String} content - 待检测的内容
 * @returns {Boolean} 是否包含Markdown格式
 */
export const detectMarkdown = (content) => {
    if (!content || typeof content !== 'string') {
        return false;
    }

    // Markdown语法特征正则表达式
    const markdownPatterns = [
        /^#{1,6}\s+.+/m,           // 标题 # ## ### 等
        /\*\*[^*\n]+\*\*/,         // 粗体 **text**（不跨行）
        /\*[^*\n]+\*/,             // 斜体 *text*（不跨行）
        /__[^_\n]+__/,             // 粗体 __text__（不跨行）
        /_[^_\n]+_/,               // 斜体 _text_（不跨行）
        /`[^`\n]+`/,               // 行内代码 `code`（不跨行）
        /```[\s\S]*?```/,          // 代码块 ```code```
        /^\s*[*\-+]\s+/m,          // 无序列表 * - +
        /^\s*\d+\.\s+/m,           // 有序列表 1. 2. 3.
        /\[([^\]]+)\]\(([^)]+)\)/, // 链接 [text](url)
        /!\[([^\]]*)\]\(([^)]+)\)/, // 图片 ![alt](url)
        /^\s*>\s+/m,               // 引用 > text
        /^\s*\|.+\|/m,             // 表格 | col1 | col2 |
        /^---+$/m,                 // 分割线 ---
        /~~[^~\n]+~~/,             // 删除线 ~~text~~（不跨行）
        /^\d+\)\s+/m               // 编号列表 1) 2) 3)
    ];

    // 检查是否匹配任何Markdown模式
    return markdownPatterns.some((pattern) => pattern.test(content));
};

/**
 * 将Markdown内容转换为HTML
 * @param {String} markdownContent - Markdown内容
 * @returns {String} 转换后的HTML内容
 */
export const convertMarkdownToHtml = (markdownContent) => {
    try {
        if (!markdownContent || typeof markdownContent !== 'string') {
            return markdownContent;
        }

        // 如果不包含Markdown语法，直接返回原内容
        if (!detectMarkdown(markdownContent)) {
            return markdownContent;
        }

        // 转换Markdown为HTML
        const htmlContent = marked.parse(markdownContent);

        return htmlContent;

    } catch (error) {
        console.error('前端Markdown转换失败:', error);
        // 转换失败时返回原内容
        return markdownContent;
    }
};

/**
 * 处理流式内容的Markdown转换 - 优先尝试完整转换
 * @param {String} content - 流式内容
 * @param {Boolean} isComplete - 是否是完整内容
 * @returns {String} 处理后的内容
 */
export const processStreamingContent = (content, isComplete = false) => {
    if (!content) {
        return content;
    }

    // 如果是完整内容，进行完整的Markdown转换
    if (isComplete) {
        return convertMarkdownToHtml(content);
    }

    try {
        // 优先策略：直接尝试使用marked.parse进行完整转换
        if (detectMarkdown(content)) {
            try {
                const htmlContent = marked.parse(content);
                // 如果转换成功且有意义的内容，直接返回
                if (htmlContent && htmlContent.trim() !== content.trim()) {
                    return htmlContent.trim();
                }
            } catch (e) {
                // marked.parse失败，继续后续处理
                console.log('marked.parse失败，降级处理:', e.message);
            }
        }

        // 检测是否包含Markdown
        if (!detectMarkdown(content)) {
            // 纯文本内容，简单处理换行
            return content.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
        }

        // 降级策略：分段处理
        const paragraphs = content.split('\n\n');
        const processedParagraphs = [];

        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i].trim();

            if (!paragraph) {
                // 空段落
                processedParagraphs.push('<br>');
                continue;
            }

            // 检测段落是否包含Markdown
            if (detectMarkdown(paragraph)) {
                let converted = false;

                // 1. 尝试完整段落转换
                try {
                    const htmlContent = marked.parse(paragraph);
                    if (htmlContent && htmlContent.trim()) {
                        processedParagraphs.push(htmlContent.trim());
                        converted = true;
                    }
                } catch (e) {
                    // 段落级转换失败，继续行级处理
                }

                // 2. 如果段落转换失败，尝试行内格式处理
                if (!converted) {
                    try {
                        // 按行处理行内格式
                        const lines = paragraph.split('\n');
                        const processedLines = lines.map((line) => {
                            const trimmed = line.trim();
                            if (detectMarkdown(trimmed)) {
                                try {
                                    return marked.parseInline(trimmed);
                                } catch (e) {
                                    return line;
                                }
                            }
                            return line;
                        });
                        processedParagraphs.push(processedLines.join('<br>'));
                        converted = true;
                    } catch (e) {
                        // 行内处理也失败
                    }
                }

                // 3. 最后的降级处理
                if (!converted) {
                    processedParagraphs.push(paragraph.replace(/\n/g, '<br>'));
                }
            } else {
                // 普通文本段落，处理换行
                processedParagraphs.push(paragraph.replace(/\n/g, '<br>'));
            }
        }

        return processedParagraphs.join('<br><br>');

    } catch (error) {
        console.error('流式Markdown处理失败:', error);
        // 最终降级处理：至少保证换行正确
        return content.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    }
};