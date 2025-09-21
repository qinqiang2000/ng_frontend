'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app;

    router.get('/', controller.home.index);

    // 中文报销单页面
    router.get('/fapiao-ai/template/bxd-cn', controller.home.bxdCn);
    // 英文报销单页面
    router.get('/fapiao-ai/template/bxd-en', controller.home.bxdEn);
    // 阿拉伯语报销单页面
    router.get('/fapiao-ai/template/bxd-alb', controller.home.bxdAlb);

    // 聊天API接口
    router.post('/api/chat/process', controller.api.chat.process);
    router.get('/api/chat/task/:taskId', controller.api.chat.getTaskStatus);
    router.get('/api/chat/tasks', controller.api.chat.getUserTasks);
    router.post('/api/chat/task/:taskId/cancel', controller.api.chat.cancelTask);
    router.post('/api/chat/task/:taskId/retry', controller.api.chat.retryTask);
    router.get('/api/chat/task-types', controller.api.chat.getTaskTypes);
    router.get('/api/chat/health', controller.api.chat.health);
    router.post('/api/chat/tasks/batch-status', controller.api.chat.batchGetTaskStatus);
    router.post('/api/chat/tasks/cleanup', controller.api.chat.cleanupTasks);
    router.get('/api/chat/tasks/debug', controller.api.chat.debugTasks);
};