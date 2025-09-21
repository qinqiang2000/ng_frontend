'use strict';

const Service = require('egg').Service;

class TaskManagerService extends Service {
    constructor(ctx) {
        super(ctx);
        // 使用Redis存储任务，30分钟过期时间
        this.TASK_TTL = 6 * 60 * 60; // 30分钟 = 1800秒
        this.TASK_PREFIX = 'fapiao_task:';
    }

    /**
     * 创建新任务
     * @param {String} taskType - 任务类型
     * @param {Object} parameters - 任务参数
     * @param {String} userId - 用户ID
     */
    async createTask(taskType, parameters, userId) {
        const { ctx, app } = this;

        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            type: taskType,
            status: 'pending',
            progress: 0,
            parameters,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            result: null,
            error: null,
        };

        // 存储到Redis，设置30分钟过期时间
        const taskKey = this.TASK_PREFIX + taskId;
        await app.redis.setex(taskKey, this.TASK_TTL, JSON.stringify(task));

        ctx.logger.info(`创建任务: ${taskId}, 类型: ${taskType}, 用户: ${userId}`);

        // 获取当前任务总数（用于调试）
        const taskCount = await this.getTaskCount();
        ctx.logger.info(`当前任务总数: ${taskCount}`);

        // 异步执行任务
        this.executeTask(taskId).catch(error => {
            ctx.logger.error(`任务执行失败: ${taskId}`, error);
            this.updateTaskStatus(taskId, 'failed', 100, null, error.message);
        });

        return taskId;
    }

    /**
     * 获取任务状态
     * @param {String} taskId - 任务ID
     */
    async getTaskStatus(taskId) {
        const { ctx, app } = this;

        const taskCount = await this.getTaskCount();
        ctx.logger.info(`查询任务状态: ${taskId}, 当前任务总数: ${taskCount}`);

        const taskKey = this.TASK_PREFIX + taskId;
        const taskData = await app.redis.get(taskKey);

        if (!taskData) {
            ctx.logger.warn(`任务不存在: ${taskId}`);
            // 获取现有任务列表（用于调试）
            const existingTasks = await this.getAllTaskIds();
            ctx.logger.info(`现有任务列表: ${existingTasks.join(', ')}`);
            return null;
        }

        const task = JSON.parse(taskData);
        ctx.logger.info(`找到任务: ${taskId}, 状态: ${task.status}, 进度: ${task.progress}%`);

        return {
            id: task.id,
            type: task.type,
            status: task.status,
            progress: task.progress,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            result: task.result,
            error: task.error,
        };
    }

    /**
     * 更新任务状态
     * @param {String} taskId - 任务ID
     * @param {String} status - 状态
     * @param {Number} progress - 进度
     * @param {Object} result - 结果
     * @param {String} error - 错误信息
     */
    async updateTaskStatus(taskId, status, progress, result = null, error = null) {
        const { app } = this;
        const taskKey = this.TASK_PREFIX + taskId;
        const taskData = await app.redis.get(taskKey);

        if (taskData) {
            const task = JSON.parse(taskData);
            task.status = status;
            task.progress = progress;
            task.updatedAt = new Date();
            if (result !== null) task.result = result;
            if (error !== null) task.error = error;

            // 更新Redis中的任务数据，重新设置过期时间
            await app.redis.setex(taskKey, this.TASK_TTL, JSON.stringify(task));
        }
    }

    /**
     * 执行任务
     * @param {String} taskId - 任务ID
     */
    async executeTask(taskId) {
        const { ctx, app } = this;
        const taskKey = this.TASK_PREFIX + taskId;
        const taskData = await app.redis.get(taskKey);

        if (!taskData) {
            throw new Error('任务不存在');
        }

        const task = JSON.parse(taskData);
        await this.updateTaskStatus(taskId, 'running', 10);

        try {
            let result;

            switch (task.type) {
                case 'invoice_recognition':
                    result = await this.processInvoiceRecognition(task);
                    break;
                case 'expense_report':
                    result = await this.processExpenseReimbursement(task);
                    break;
                case 'language_switch':
                    result = await this.processLanguageSwitch(task);
                    break;
                case 'document_analysis':
                    result = await this.processDocumentAnalysis(task);
                    break;
                case 'data_extraction':
                    result = await this.processDataExtraction(task);
                    break;
                default:
                    throw new Error(`不支持的任务类型: ${task.type}`);
            }

            await this.updateTaskStatus(taskId, 'completed', 100, result);

        } catch (error) {
            ctx.logger.error(`任务执行失败: ${taskId}`, error);
            await this.updateTaskStatus(taskId, 'failed', 100, null, error.message);
            throw error;
        }
    }

    /**
     * 处理发票识别任务
     * @param {Object} task - 任务对象
     */
    async processInvoiceRecognition(task) {
        const { ctx } = this;

        await this.updateTaskStatus(task.id, 'running', 30);

        // 模拟发票识别处理
        await this.delay(2000);
        await this.updateTaskStatus(task.id, 'running', 60);

        // 这里应该调用实际的OCR服务
        const result = {
            invoiceNumber: 'INV2024001',
            invoiceDate: '2024-01-15',
            amount: 1500.00,
            taxAmount: 195.00,
            totalAmount: 1695.00,
            seller: '示例公司',
            buyer: '采购方公司',
            items: [
                {
                    name: '办公用品',
                    quantity: 10,
                    unitPrice: 150.00,
                    amount: 1500.00
                }
            ]
        };

        await this.updateTaskStatus(task.id, 'running', 90);
        await this.delay(1000);

        return {
            type: 'invoice_recognition',
            data: result,
            confidence: 0.95
        };
    }

            /**
     * 处理费用报销流程任务
     * @param {Object} task - 任务对象
     */
    async processExpenseReimbursement(task) {
        const { ctx } = this;

        // 获取用户信息和文件列表
        const userInfo = task.parameters.userInfo;

        const fileList = task.parameters.fileList || [];

        // 调用费用报销流程服务
        const result = await ctx.service.expenseReimbursement.processExpenseReimbursement(
            fileList,
            userInfo,
            task.id
        );

        return {
            type: 'expense_reimbursement',
            data: result
        };
    }

    /**
     * 处理语言切换任务
     * @param {Object} task - 任务对象
     */
    async processLanguageSwitch(task) {
        const { ctx } = this;

        await this.updateTaskStatus(task.id, 'running', 20);

        try {
            // 从任务参数中获取语言切换信息
            const { targetLanguage, userId, message } = task.parameters;

            // 分析用户的语言切换意图
            const languageSwitchIntent = ctx.service.languageSwitch.analyzeLanguageSwitchIntent(message);

            await this.updateTaskStatus(task.id, 'running', 50);

            // 获取用户最近的报销任务
            const userTasks = await ctx.service.chat.getUserTasks(userId, 5);
            const reimbursementTasks = userTasks.filter(task =>
                task.type === 'expense_report' && task.status === 'completed'
            );

            if (reimbursementTasks.length === 0) {
                throw new Error('没有找到已完成的报销任务，无法切换语言版本');
            }

            await this.updateTaskStatus(task.id, 'running', 80);

            // 使用最新的报销任务进行语言切换
            const latestTask = reimbursementTasks[0];
            const switchResult = await ctx.service.languageSwitch.switchReimbursementLanguage(
                latestTask.id,
                languageSwitchIntent.language || targetLanguage,
                userId
            );

            if (!switchResult.success) {
                throw new Error(switchResult.error);
            }

            return {
                type: 'language_switch',
                data: switchResult
            };

        } catch (error) {
            ctx.logger.error(`语言切换任务失败: ${task.id}`, error);
            throw error;
        }
    }

    /**
     * 处理文档分析任务
     * @param {Object} task - 任务对象
     */
    async processDocumentAnalysis(task) {
        await this.updateTaskStatus(task.id, 'running', 35);

        await this.delay(3000);
        await this.updateTaskStatus(task.id, 'running', 80);

        const result = {
            documentType: 'financial_report',
            summary: '这是一份财务报告，包含收入、支出和利润分析',
            keyFindings: [
                '总收入同比增长15%',
                '运营成本控制良好',
                '净利润率提升2个百分点'
            ],
            extractedData: {
                totalRevenue: 5000000,
                totalExpenses: 4200000,
                netProfit: 800000
            }
        };

        await this.delay(500);

        return {
            type: 'document_analysis',
            data: result
        };
    }

    /**
     * 处理数据提取任务
     * @param {Object} task - 任务对象
     */
    async processDataExtraction(task) {
        await this.updateTaskStatus(task.id, 'running', 25);

        await this.delay(2500);
        await this.updateTaskStatus(task.id, 'running', 75);

        const result = {
            extractedFields: {
                companyName: '示例科技有限公司',
                registrationNumber: '91110000123456789X',
                address: '北京市朝阳区示例街道123号',
                phone: '010-12345678',
                email: 'contact@example.com'
            },
            confidence: 0.92,
            extractedCount: 5
        };

        await this.delay(500);

        return {
            type: 'data_extraction',
            data: result
        };
    }

    /**
     * 生成任务ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 延迟函数
     * @param {Number} ms - 毫秒数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取任务总数（调试用）
     */
    async getTaskCount() {
        const { app } = this;
        const keys = await app.redis.keys(this.TASK_PREFIX + '*');
        return keys.length;
    }

    /**
     * 获取所有任务ID（调试用）
     */
    async getAllTaskIds() {
        const { app } = this;
        const keys = await app.redis.keys(this.TASK_PREFIX + '*');
        return keys.map(key => key.replace(this.TASK_PREFIX, ''));
    }

    /**
     * 清理过期任务（Redis TTL会自动处理，此方法主要用于手动清理）
     */
    async cleanupExpiredTasks() {
        // Redis的TTL机制会自动删除过期的任务
        // 这个方法保留用于手动清理或监控
        const { ctx } = this;
        const taskCount = await this.getTaskCount();
        ctx.logger.info(`当前Redis中的任务数量: ${taskCount}`);
    }
}

module.exports = TaskManagerService;