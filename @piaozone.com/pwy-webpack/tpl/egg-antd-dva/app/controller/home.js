'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
    async index() {
        const ctx = this.ctx;
        const env = ctx.app.config.env;
        const debug = ctx.request.query.debug;
        let webpackPublicPath = ctx.app.config.staticUrl + ctx.app.config.__webpack_public_path__;
        if (env === 'local') {
            webpackPublicPath = ctx.app.config.__webpack_public_path__;
        } else if (env !== 'prod' && !!debug) {
            webpackPublicPath += '/debug';
        }

        const initialData = {
            pageDirName: ctx.app.config.pageDirName || '',
            webpackPublicPath
        };

        await ctx.render('template.html', initialData);
    }
}

module.exports = HomeController;
