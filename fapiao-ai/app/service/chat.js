'use strict';

const Service = require('egg').Service;
const marked = require('marked');
class ChatService extends Service {

    /**
     * 处理聊天消息
     * @param {String} message - 用户消息
     * @param {Array} fileList - 上传的文件列表
     * @param {Array} history - 对话历史
     * @param {String} userId - 用户ID
     * @param {Boolean} stream - 是否流式返回
     */
    async processMessage(message, fileList = [], history = [], userId = 'guest', stream = false, requestTaskId = '') {
        const { ctx } = this;
        try {
            // // 首先检查是否是语言切换请求
            // const languageSwitchIntent = ctx.service.languageSwitch.analyzeLanguageSwitchIntent(message);

            // if (languageSwitchIntent.confidence > 0.5) {
            //     return await this.handleLanguageSwitch(message, languageSwitchIntent, userId, history);
            // }

            // 分析任务类型
            const taskAnalysis = await ctx.service.deepseek.analyzeTask(message, fileList);

            ctx.logger.info('任务分析结果:', taskAnalysis);
            ctx.logger.info('用户消息:', message);
            ctx.logger.info('文件列表:', fileList);

            // 如果是普通对话，直接返回AI响应
            if (taskAnalysis.taskType === 'general_chat') {
                return await this.handleGeneralChat(message, history, stream);
            }

            // 如果是语言切换任务，直接处理
            if (taskAnalysis.taskType === 'language_switch') {
                return await this.handleLanguageSwitch(message, taskAnalysis, userId, history, requestTaskId);
            }

            if (taskAnalysis.taskType === 'expense_report_wait_upload') {
                return {
                    type: 'file_upload_required',
                    taskId: null,
                    taskType: taskAnalysis.taskType,
                    message: `<h2>请上传需要报销的发票文件: </h2>
                    <span>1. 支持以下格式：JPG/JPEG/PNG/PDF/XML/OFD</span><br/>
                    <span>2. 确保发票图片清晰完整，四角可见</span><br/>
                    <span>3. 发票信息齐全（发票代码、号码、金额、税额等）</span><br/>
                    <span>4. 发票抬头必须为本公司名称</span><br/>
                    <span>5. 支持批量上传，建议单次不超过10张</span><br/>
                    <span>6. 文件大小不超过10MB</span><br/>`,
                    nextStep: '上传发票文件后，系统将自动执行智能报销流程'
                };
            }

            // 如果是其他特定任务，创建任务并返回任务信息
            const taskId = await ctx.service.taskManager.createTask(
                taskAnalysis.taskType,
                {
                    ...taskAnalysis.parameters,
                    message,
                    fileList,
                    userId
                },
                userId
            );

            if (taskAnalysis.taskType === 'expense_report') {
                return {
                    type: 'task_created',
                    taskId,
                    taskType: taskAnalysis.taskType,
                    description: taskAnalysis.description,
                    confidence: taskAnalysis.confidence,
                    message: `<h2>根据您的要求，我们正在考虑规划按照下列步骤进行处理，形成合规的费用报销单，帮助您提升报销效率：</h2>
                    <p>步骤1：发票结构化数据提取</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）OCR 纸质发票</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）解析电子发票</p>
                    <p>步骤2：发票校验</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）连接税局查验发票数据</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）校验与您提供的发票结构化数据是否一致 </p>
                    <p>步骤3：发票合规检查</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）发票类型是否符合公司报销要求（如增值税专用发票、增值税普通发票、电子发票等）。</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）发票抬头是否为公司名称，避免因抬头错误而报销失败。</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）税号是否正确无误</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（4）开票日期是否在可报销的时间范围内</p>
                    <p>步骤4：确定报销单类型</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（1）是否与你自己的历史报销匹配。</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（2）确定报销单类型</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（3）汇总填写报销单</p>`
                };
            }

            // 等待任务执行完成以获取结果
            await new Promise(resolve => setTimeout(resolve, 100));

            return {
                type: 'task_created',
                taskId,
                taskType: taskAnalysis.taskType,
                description: taskAnalysis.description,
                confidence: taskAnalysis.confidence,
                message: `我理解您想要${taskAnalysis.description}。我已经开始处理这个任务，您可以通过任务ID ${taskId} 查询进度。`
            };

        } catch (error) {
            ctx.logger.error('处理消息失败:', error);
            throw error;
        }
    }

    /**
     * 处理普通对话
     * @param {String} message - 用户消息
     * @param {Array} history - 对话历史
     * @param {Boolean} stream - 是否流式返回
     */
    async handleGeneralChat(message, history = [], stream = false) {
        const { ctx } = this;

        if (stream) {
            return this.handleStreamChat(message, history);
        }

        try {
            const messages = [
                {
                    role: 'system',
                    content: `
                        你是Fapiao.AI，一个专门处理发票、报销和财务相关任务的智能助手。请用友好、专业的语气回答用户问题。使用markdown格式返回
                    `
                },
                ...history,
                { role: 'user', content: message }
            ];

            const response = await ctx.service.deepseek.chat(messages, false);
            if (response.choices && response.choices[0]) {
                const content = marked.parse(response.choices[0].message.content);
                return {
                    type: 'chat_response',
                    content: content,
                    usage: response.usage
                };
            }

            throw new Error('无法获取有效响应');

        } catch (error) {
            ctx.logger.error('普通对话处理失败:', error);
            return {
                type: 'error',
                content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
                error: error.message
            };
        }
    }

    /**
     * 处理流式对话
     * @param {String} message - 用户消息
     * @param {Array} history - 对话历史
     */
    async *handleStreamChat(message, history = []) {
        const { ctx } = this;

        try {
            const systemMessage = {
                role: 'system',
                content: '你是Fapiao.AI，一个专门处理发票、报销和财务相关任务的智能助手。请用友好、专业的语气回答用户问题。'
            };

            const fullHistory = [systemMessage, ...history];

            for await (const chunk of ctx.service.deepseek.streamChat(message, fullHistory)) {
                yield chunk;
            }

        } catch (error) {
            ctx.logger.error('流式对话处理失败:', error);
            yield {
                type: 'error',
                data: '抱歉，对话服务暂时不可用，请稍后再试。'
            };
        }
    }

    /**
     * 获取任务状态
     * @param {String} taskId - 任务ID
     */
    async getTaskStatus(taskId) {
        return await this.ctx.service.taskManager.getTaskStatus(taskId);
    }

    /**
     * 获取用户的任务历史
     * @param {String} userId - 用户ID
     * @param {Number} limit - 限制数量
     */
    async getUserTasks(userId, limit = 10) {
        const { ctx } = this;

        // 获取所有任务ID
        const taskIds = await ctx.service.taskManager.getAllTaskIds();
        const userTasks = [];

        // 逐个获取任务详情并筛选
        for (const taskId of taskIds) {
            const task = await ctx.service.taskManager.getTaskStatus(taskId);
            if (task && task.userId === userId) {
                userTasks.push(task);
            }
        }

        return userTasks
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit)
            .map(task => ({
                id: task.id,
                type: task.type,
                status: task.status,
                progress: task.progress,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                error: task.error
            }));
    }

    /**
     * 取消任务
     * @param {String} taskId - 任务ID
     * @param {String} userId - 用户ID
     */
    async cancelTask(taskId, userId) {
        const { ctx } = this;
        const task = await ctx.service.taskManager.getTaskStatus(taskId);

        if (!task) {
            return { success: false, message: '任务不存在' };
        }

        if (task.userId !== userId) {
            return { success: false, message: '无权限操作此任务' };
        }

        if (task.status === 'completed' || task.status === 'failed') {
            return { success: false, message: '任务已完成，无法取消' };
        }

        await ctx.service.taskManager.updateTaskStatus(taskId, 'cancelled', task.progress);

        return { success: true, message: '任务已取消' };
    }

    /**
     * 重试失败的任务
     * @param {String} taskId - 任务ID
     * @param {String} userId - 用户ID
     */
    async retryTask(taskId, userId) {
        const { ctx } = this;
        const task = await ctx.service.taskManager.getTaskStatus(taskId);

        if (!task) {
            return { success: false, message: '任务不存在' };
        }

        if (task.userId !== userId) {
            return { success: false, message: '无权限操作此任务' };
        }

        if (task.status !== 'failed') {
            return { success: false, message: '只能重试失败的任务' };
        }

        // 重置任务状态
        await ctx.service.taskManager.updateTaskStatus(taskId, 'pending', 0, null, null);

        // 重新执行任务
        ctx.service.taskManager.executeTask(taskId).catch(async error => {
            ctx.logger.error(`任务重试失败: ${taskId}`, error);
            await ctx.service.taskManager.updateTaskStatus(taskId, 'failed', 100, null, error.message);
        });

        return { success: true, message: '任务已重新开始' };
    }

    /**
     * 处理语言切换请求
     * @param {String} message - 用户消息
     * @param {Object} languageSwitchIntent - 语言切换意图或AI分析结果
     * @param {String} userId - 用户ID
     * @param {Array} history - 对话历史
     */
    async handleLanguageSwitch(message, languageSwitchIntent, userId, history, taskId) {
        const { ctx } = this;

        try {
            // 如果是AI分析结果，从parameters中获取语言信息
            let targetLanguage = null;
            if (languageSwitchIntent.taskType === 'language_switch') {
                // 重新分析语言切换意图
                const intent = ctx.service.languageSwitch.analyzeLanguageSwitchIntent(message);
                targetLanguage = intent.language;

                if (intent.needsSpecification || !targetLanguage) {
                    const supportedLanguages = ctx.service.languageSwitch.getSupportedLanguages();
                    const languageOptions = supportedLanguages.map(lang =>
                        `${lang.name} (${lang.nativeName})`
                    ).join('、');

                    return {
                        type: 'language_selection',
                        content: `请选择您要切换的语言版本：${languageOptions}。请告诉我您想要哪种语言版本？`,
                        supportedLanguages
                    };
                }
            } else {
                // 如果没有指定具体语言，询问用户
                if (languageSwitchIntent.needsSpecification) {
                    const supportedLanguages = ctx.service.languageSwitch.getSupportedLanguages();
                    const languageOptions = supportedLanguages.map(lang =>
                        `${lang.name} (${lang.nativeName})`
                    ).join('、');

                    return {
                        type: 'language_selection',
                        content: `请选择您要切换的语言版本：${languageOptions}。请告诉我您想要哪种语言版本？`,
                        supportedLanguages
                    };
                }
                targetLanguage = languageSwitchIntent.language;
            }

            // 获取用户最近的报销任务
            const userTasks = await this.getUserTasks(userId, 5);
            const reimbursementTasks = userTasks.filter(task =>
                task.type === 'expense_report' && task.status === 'completed'
            );
            console.log('taskId---------', taskId);
            if (reimbursementTasks.length === 0 && taskId === '') {
                return {
                    type: 'no_reimbursement_found',
                    content: '抱歉，我没有找到您已完成的报销任务。请先完成费用报销流程，然后再切换语言版本。'
                };
            }

            // 使用最新的报销任务
            const switchResult = await ctx.service.languageSwitch.switchReimbursementLanguage(
                taskId,
                targetLanguage,
                userId
            );

            if (switchResult.success) {
                return {
                    type: 'language_switched',
                    content: '已成功切换到' + switchResult.targetLanguage + '版本！',
                    taskId: taskId,
                    language: targetLanguage,
                    formUrl: switchResult.formUrl
                };
            } else {
                return {
                    type: 'language_switch_failed',
                    content: `语言切换失败：${switchResult.error}`,
                    error: switchResult.error
                };
            }

        } catch (error) {
            ctx.logger.error('处理语言切换失败:', error);
            return {
                type: 'error',
                content: '抱歉，语言切换功能暂时不可用，请稍后再试。',
                error: error.message
            };
        }
    }

    /**
     * 获取支持的任务类型
     */
    getSupportedTaskTypes() {
        return [
            {
                type: 'invoice_recognition',
                name: '发票识别',
                description: '识别发票图片中的信息，提取发票号码、金额、日期等关键数据',
                supportedFiles: ['jpg', 'jpeg', 'png', 'pdf']
            },
            {
                type: 'expense_report',
                name: '费用报销流程',
                description: '完整的费用报销流程：发票数据提取 → 税局校验 → 合规检查 → 生成报销单页面',
                supportedFiles: ['jpg', 'jpeg', 'png', 'pdf', 'xml', 'ofd'],
                steps: [
                    '步骤1：发票结构化数据提取（OCR纸质发票/解析电子发票）',
                    '步骤2：发票校验（税局查验/数据一致性校验）',
                    '步骤3：发票合规检查（类型/抬头/税号/日期检查）',
                    '步骤4：确定报销单类型并生成报销单页面'
                ]
            },
            {
                type: 'language_switch',
                name: '切换报销单语言版本',
                description: '将已生成的报销单页面切换为不同语言版本（中文/英文/阿拉伯语）',
                supportedFiles: [],
                supportedLanguages: ['cn', 'en', 'alb'],
                examples: ['切换英文版', '改成阿拉伯语', '换成中文版', 'switch to english']
            },
            {
                type: 'document_analysis',
                name: '文档分析',
                description: '分析财务文档，提取关键信息和数据洞察',
                supportedFiles: ['pdf', 'doc', 'docx', 'xlsx', 'csv']
            },
            {
                type: 'data_extraction',
                name: '数据提取',
                description: '从各种文档中提取结构化数据',
                supportedFiles: ['pdf', 'doc', 'docx', 'xlsx', 'csv', 'txt']
            }
        ];
    }
}

module.exports = ChatService;