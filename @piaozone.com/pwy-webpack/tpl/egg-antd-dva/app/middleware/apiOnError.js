const errcodeInfo = require('../errcodeInfo');

module.exports = options => {
    return async function onerror(ctx, next) {
        try {
            await next();
        } catch (err) {
            ctx.logger.error(err);
            ctx.body = { ...errcodeInfo.fpyInnerErr };
        }
    };
};