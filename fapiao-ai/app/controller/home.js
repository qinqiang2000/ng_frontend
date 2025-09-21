'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
    async bxdCn() {
        const { ctx } = this;
        const taskId = ctx.query.taskId;
        // 准备模板数据
        const data = {
            title: '费用报销单',
            taskId,
            env: ctx.app.config.env
        };

        await ctx.render('bxd-cn.html', data);
    }

    async bxdEn() {
        const { ctx } = this;
        const taskId = ctx.query.taskId;
        const data = {
            title: '费用报销单',
            taskId,
            env: ctx.app.config.env
        };
        await ctx.render('bxd-en.html', data);
    }

    async bxdAlb() {
        const { ctx } = this;
        const taskId = ctx.query.taskId;
        const data = {
            title: '费用报销单',
            taskId,
            env: ctx.app.config.env
        };
        await ctx.render('bxd-alb.html', data);
    }

    async index() {
        const { ctx } = this;
        const data = {
            env: ctx.app.config.env
        };
        await ctx.render('index.html', data);
    }
}

module.exports = HomeController;