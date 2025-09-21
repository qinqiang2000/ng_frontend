'use strict';

const Controller = require('egg').Controller;

class HealthController extends Controller {
    async check() {
        const { ctx, app } = this;
        
        try {
            const health = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: app.config.pkg.version || '1.0.0',
                environment: app.config.env,
                memory: process.memoryUsage(),
                services: {},
            };

            // 检查数据库连接（如果配置了）
            try {
                if (app.mysql) {
                    await app.mysql.query('SELECT 1');
                    health.services.mysql = 'ok';
                }
            } catch (error) {
                health.services.mysql = 'error';
                health.status = 'warning';
            }

            // 检查 Redis 连接（如果配置了）
            try {
                if (app.redis) {
                    await app.redis.ping();
                    health.services.redis = 'ok';
                }
            } catch (error) {
                health.services.redis = 'error';
                health.status = 'warning';
            }

            ctx.body = health;
        } catch (error) {
            ctx.logger.error('健康检查失败:', error);
            ctx.status = 500;
            ctx.body = {
                status: 'error',
                timestamp: new Date().toISOString(),
                message: '健康检查失败',
            };
        }
    }
}

module.exports = HealthController; 