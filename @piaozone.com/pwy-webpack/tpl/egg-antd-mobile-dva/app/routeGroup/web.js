const { PAGE_PRE_PATH, PUBLIC_PAGE_PRE_PATH } = require('../constants');

module.exports = (app) => {
    const { router, controller, middleware } = app;
    const topErrCatch = app.middleware.apiOnError();
    const webAuth = middleware.webLoginAuth();
    router.get(PAGE_PRE_PATH + '/*', topErrCatch, webAuth, controller.home.index);
    router.get(PUBLIC_PAGE_PRE_PATH + '/*', topErrCatch, controller.home.index);
};