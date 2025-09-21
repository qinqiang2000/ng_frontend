'use strict';

const Service = require('egg').Service;

class DeepSeekService extends Service {
    constructor(ctx) {
        super(ctx);
        this.apiKey = this.config.deepseek?.apiKey || process.env.DEEPSEEK_API_KEY;
        this.baseURL = this.config.deepseek?.baseURL || 'https://api.deepseek.com';
    }

    /**
     * 调用DeepSeek API进行对话
     * @param {Array} messages - 消息历史
     * @param {Boolean} stream - 是否流式返回
     * @param {String} model - 模型名称
     */
    async chat(messages, stream = false, model = 'deepseek-chat') {
        const { ctx } = this;

        try {
            const payload = {
                model,
                messages,
                stream,
                temperature: 0.7,
                max_tokens: 2048,
            };

            const response = await ctx.curl(`${this.baseURL}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                data: payload,
                timeout: 60000,
                streaming: stream,
            });

            if (stream) {
                return response;
            }

            if (response.status !== 200) {
                throw new Error(`DeepSeek API error: ${response.status}`);
            }
            return JSON.parse(response.data);
        } catch (error) {
            ctx.logger.error('DeepSeek API调用失败:', error);
            throw error;
        }
    }

    /**
     * 分析用户消息，识别任务类型
     * @param {String} message - 用户消息
     * @param {Array} fileList - 上传的文件列表
     */
    async analyzeTask(message, fileList = []) {
        const { ctx } = this;

        try {
            const systemPrompt = `你是一个智能任务分析助手，请分析用户的消息和上传的文件，判断用户想要执行的任务类型。

可能的任务类型包括：
1. invoice_recognition - 发票识别和信息提取
2. expense_report - 费用报销流程（包含发票提取、校验、合规检查）
3. expense_report_wait_upload - 费用报销流程（等待上传发票文件）
4. language_switch - 切换报销单语言版本
5. document_analysis - 文档分析
6. data_extraction - 数据提取
7. general_chat - 普通对话

任务识别规则：
- 如果用户提到"我要报销"、"费用报销"、"报销流程"等关键词并且上传了发票文件，应该识别为expense_report类型；
- 如果用户提到"我要报销"、"费用报销"、"报销流程"等关键词但是没有上传文件，应该识别为expense_report_wait_upload类型
- 如果用户提到"切换英文版"、"改成阿拉伯语"、"换成中文版"、"switch to english"、"change language"等语言切换关键词，应该识别为language_switch类型
- 如果用户提到"发票识别"、"发票提取"、"发票校验"等关键词，应该识别为invoice_recognition类型，如果没有上传文件则提示用户上传发票文件

返回规则：
- 请以JSON字符串返回分析结果，其中字段description使用html格式，参考如下格式：
{
    "taskType": "任务类型",
    "confidence": 0.95,
    "parameters": {
        "key": "value"
    },
    "description": "<h2>标题</h2><p>内容</p>"
}

`;


            const messages = [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `用户消息: ${message}\n上传文件数量: ${fileList.length}\n文件信息: ${JSON.stringify(fileList.map(f => ({ name: f.filename, type: f.mimeType })))}`
                }
            ];

            const response = await this.chat(messages, false);

            if (response.choices && response.choices[0]) {
                const content0 = response.choices[0].message.content;
                const content = content0.replace(/^```json/, '').replace(/```$/, '');
                ctx.logger.info('DeepSeek API 原始响应:', content0);

                try {
                    const result = JSON.parse(content);
                    ctx.logger.info('DeepSeek API 解析结果:', result);
                    return result;
                } catch (e) {
                    ctx.logger.warn('DeepSeek API 响应无法解析为JSON，使用本地分析:', e.message);
                    // 如果无法解析JSON，使用本地分析
                    return this.analyzeTaskLocally(message, fileList);
                }
            }

            throw new Error('无法获取有效响应');
        } catch (error) {
            ctx.logger.error('任务分析失败，使用本地关键词匹配:', error);

            // 使用本地关键词匹配作为备用方案
            return this.analyzeTaskLocally(message, fileList);
        }
    }

    /**
     * 本地任务分析（不依赖API）
     * @param {String} message - 用户消息
     * @param {Array} fileList - 文件列表
     */
    analyzeTaskLocally(message, fileList = []) {
        const { ctx } = this;

        const lowerMessage = message.toLowerCase();

        // 报销相关关键词
        const reimbursementKeywords = ['我要报销', '费用报销', '报销流程', '报销单', '报销'];
        if (reimbursementKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                taskType: 'expense_report',
                confidence: 0.9,
                parameters: { fileList, hasFiles: fileList.length > 0 },
                description: '费用报销流程'
            };
        }

        // 语言切换关键词
        const languageSwitchKeywords = ['切换英文', '切换中文', '切换阿拉伯', '改成英文', '改成中文', '改成阿拉伯', 'switch', 'change language'];
        if (languageSwitchKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                taskType: 'language_switch',
                confidence: 0.9,
                parameters: {},
                description: '切换报销单语言版本'
            };
        }

        // 发票识别关键词
        const invoiceKeywords = ['发票识别', '发票提取', '发票校验', 'ocr', '识别发票'];
        if (invoiceKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                taskType: 'invoice_recognition',
                confidence: 0.8,
                parameters: { fileList, hasFiles: fileList.length > 0 },
                description: '发票识别和信息提取'
            };
        }

        // 默认为普通对话
        return {
            taskType: 'general_chat',
            confidence: 0.5,
            parameters: {},
            description: '普通对话'
        };
    }

    /**
     * 处理流式响应
     * @param {String} message - 用户消息
     * @param {Array} history - 对话历史
     */
    async *streamChat(message, history = []) {
        const { ctx } = this;

        try {
            const messages = [
                ...history,
                { role: 'user', content: message }
            ];

            const response = await this.chat(messages, true);

            let buffer = '';

            for await (const chunk of response.res) {
                buffer += chunk.toString();

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                                const delta = parsed.choices[0].delta;
                                if (delta.content) {
                                    yield {
                                        type: 'content',
                                        data: delta.content
                                    };
                                }
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (error) {
            ctx.logger.error('流式对话失败:', error);
            yield {
                type: 'error',
                data: '对话服务暂时不可用'
            };
        }
    }
}

module.exports = DeepSeekService;