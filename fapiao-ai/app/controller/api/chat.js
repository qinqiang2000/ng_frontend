'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {

    /**
     * 处理聊天消息
     * POST /api/chat/process
     */
    async process() {
        const { ctx } = this;

        try {
            // 检查是否是FormData格式（有文件上传）
            const isFormData = ctx.is('multipart');
            let message, fileList = [], history = [], userId = 'guest', stream = false, taskId = '';

            if (isFormData) {
                // 处理FormData格式
                const fields = ctx.request.body;
                const files = ctx.request.files || [];

                message = fields.message;
                history = fields.history ? JSON.parse(fields.history) : [];
                userId = fields.userId || 'guest';
                stream = fields.stream === 'true' || fields.stream === true;
                taskId = fields.taskId || '';

                // 处理上传的文件
                if (files && files.length > 0) {
                    fileList = files.map((file) => {
                        return {
                            name: file.filename,
                            type: file.mimeType,
                            filepath: file.filepath,
                            mimeType: file.mimeType,
                            file: file
                        };
                    });
                }

                // 基本验证
                if (!message || typeof message !== 'string') {
                    ctx.body = {
                        code: 400,
                        message: '缺少必要参数：message',
                        data: null
                    };
                    return;
                }
            } else {
                // 处理JSON格式（向后兼容）
                ctx.validate({
                    message: { type: 'string', required: true },
                    fileList: { type: 'array', required: false, default: [] },
                    history: { type: 'array', required: false, default: [] },
                    userId: { type: 'string', required: false, default: 'guest' },
                    stream: { type: 'boolean', required: false, default: false }
                });

                const requestData = ctx.request.body;
                message = requestData.message;
                fileList = requestData.fileList || [];
                history = requestData.history || [];
                userId = requestData.userId || 'guest';
                stream = requestData.stream || false;
                taskId = requestData.taskId || '';
            }

            if (stream) {
                // 处理流式响应
                return await this.handleStreamResponse(message, fileList, history, userId, taskId);
            }

            // 处理普通响应
            const result = await ctx.service.chat.processMessage(message, fileList, history, userId, false, taskId);

            ctx.body = {
                code: 200,
                message: 'success',
                data: result
            };

        } catch (error) {
            ctx.logger.error('处理聊天消息失败:', error);
            ctx.body = {
                code: 500,
                message: error.message || '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 处理流式响应
     */
    async handleStreamResponse(message, fileList, history, userId) {
        const { ctx } = this;

        try {
            // 设置响应头
            ctx.set({
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });

            ctx.respond = false; // 绕过Koa的内置响应处理

            // 发送初始连接确认
            ctx.res.write('data: {"type":"connected","message":"连接已建立"}\n\n');

            // 处理流式聊天
            const chatStream = ctx.service.chat.handleStreamChat(message, history);

            for await (const chunk of chatStream) {
                const data = JSON.stringify(chunk);
                ctx.res.write(`data: ${data}\n\n`);
            }

            // 发送结束信号
            ctx.res.write('data: {"type":"done","message":"响应完成"}\n\n');
            ctx.res.end();

        } catch (error) {
            ctx.logger.error('流式响应处理失败:', error);
            const errorData = JSON.stringify({
                type: 'error',
                message: error.message || '流式响应失败'
            });
            ctx.res.write(`data: ${errorData}\n\n`);
            ctx.res.end();
        }
    }

    /**
     * 获取任务状态
     * GET /api/chat/task/:taskId
     */
    async getTaskStatus() {
        const { ctx } = this;

        try {
            const { taskId } = ctx.params;
            console.log('taskId', taskId);
            if (!taskId) {
                ctx.body = {
                    code: 400,
                    message: '缺少任务ID',
                    data: null
                };
                return;
            }

            const taskStatus = await ctx.service.chat.getTaskStatus(taskId);

            if (!taskStatus) {
                ctx.body = {
                    code: 404,
                    message: '任务不存在',
                    data: null
                };
                return;
            }

            ctx.body = {
                code: 200,
                message: 'success',
                data: taskStatus
            };

        } catch (error) {
            ctx.logger.error('获取任务状态失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 获取用户任务列表
     * GET /api/chat/tasks
     */
    async getUserTasks() {
        const { ctx } = this;

        try {
            ctx.validate({
                userId: { type: 'string', required: false, default: 'guest' },
                limit: { type: 'int', required: false, default: 10, min: 1, max: 50 }
            }, ctx.query);

            const { userId, limit } = ctx.query;

            const tasks = await ctx.service.chat.getUserTasks(userId, parseInt(limit));

            ctx.body = {
                code: 200,
                message: 'success',
                data: {
                    tasks,
                    total: tasks.length
                }
            };

        } catch (error) {
            ctx.logger.error('获取用户任务列表失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 取消任务
     * POST /api/chat/task/:taskId/cancel
     */
    async cancelTask() {
        const { ctx } = this;

        try {
            const { taskId } = ctx.params;
            ctx.validate({
                userId: { type: 'string', required: false, default: 'guest' }
            });

            const { userId } = ctx.request.body;

            const result = await ctx.service.chat.cancelTask(taskId, userId);

            ctx.body = {
                code: result.success ? 200 : 400,
                message: result.message,
                data: null
            };

        } catch (error) {
            ctx.logger.error('取消任务失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 重试任务
     * POST /api/chat/task/:taskId/retry
     */
    async retryTask() {
        const { ctx } = this;

        try {
            const { taskId } = ctx.params;
            ctx.validate({
                userId: { type: 'string', required: false, default: 'guest' }
            });

            const { userId } = ctx.request.body;

            const result = await ctx.service.chat.retryTask(taskId, userId);

            ctx.body = {
                code: result.success ? 200 : 400,
                message: result.message,
                data: null
            };

        } catch (error) {
            ctx.logger.error('重试任务失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 获取支持的任务类型
     * GET /api/chat/task-types
     */
    async getTaskTypes() {
        const { ctx } = this;

        try {
            const taskTypes = ctx.service.chat.getSupportedTaskTypes();

            ctx.body = {
                code: 200,
                message: 'success',
                data: taskTypes
            };

        } catch (error) {
            ctx.logger.error('获取任务类型失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 健康检查
     * GET /api/chat/health
     */
    async health() {
        const { ctx } = this;

        try {
            // 检查各个服务是否正常
            const health = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    deepseek: 'unknown',
                    taskManager: 'healthy',
                    chat: 'healthy'
                }
            };

            // 简单检查DeepSeek服务
            try {
                if (ctx.service.deepseek.apiKey) {
                    health.services.deepseek = 'configured';
                } else {
                    health.services.deepseek = 'not_configured';
                }
            } catch (error) {
                health.services.deepseek = 'error';
            }

            ctx.body = {
                code: 200,
                message: 'success',
                data: health
            };

        } catch (error) {
            ctx.logger.error('健康检查失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: {
                    status: 'unhealthy',
                    error: error.message
                }
            };
        }
    }

    /**
     * 批量查询任务状态
     * POST /api/chat/tasks/batch-status
     */
    async batchGetTaskStatus() {
        const { ctx } = this;

        try {
            ctx.validate({
                taskIds: { type: 'array', required: true, itemType: 'string' },
                userId: { type: 'string', required: false, default: 'guest' }
            });

            const { taskIds, userId } = ctx.request.body;

            if (taskIds.length > 20) {
                ctx.body = {
                    code: 400,
                    message: '一次最多查询20个任务',
                    data: null
                };
                return;
            }

            const results = [];
            for (const taskId of taskIds) {
                const status = await ctx.service.chat.getTaskStatus(taskId);
                if (status && status.userId === userId) {
                    results.push(status);
                }
            }

            ctx.body = {
                code: 200,
                message: 'success',
                data: results
            };

        } catch (error) {
            ctx.logger.error('批量查询任务状态失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 清理过期任务
     * POST /api/chat/tasks/cleanup
     */
    async cleanupTasks() {
        const { ctx } = this;

        try {
            ctx.validate({
                maxAge: { type: 'int', required: false, default: 24 * 60 * 60 * 1000 } // 默认24小时
            });

            const { maxAge } = ctx.request.body;

            ctx.service.taskManager.cleanupExpiredTasks(maxAge);

            ctx.body = {
                code: 200,
                message: '过期任务清理完成',
                data: null
            };

        } catch (error) {
            ctx.logger.error('清理过期任务失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }

    /**
     * 获取所有任务列表（调试用）
     * GET /api/chat/tasks/debug
     */
    async debugTasks() {
        const { ctx } = this;

        try {
            const taskIds = await ctx.service.taskManager.getAllTaskIds();
            const allTasks = [];

            for (const taskId of taskIds) {
                const task = await ctx.service.taskManager.getTaskStatus(taskId);
                if (task) {
                    allTasks.push({
                        id: task.id,
                        type: task.type,
                        status: task.status,
                        progress: task.progress,
                        userId: task.userId,
                        createdAt: task.createdAt,
                        updatedAt: task.updatedAt
                    });
                }
            }

            ctx.body = {
                code: 200,
                message: 'success',
                data: {
                    totalTasks: allTasks.length,
                    tasks: allTasks
                }
            };

        } catch (error) {
            ctx.logger.error('获取调试任务列表失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                data: null
            };
        }
    }
}

module.exports = ChatController;