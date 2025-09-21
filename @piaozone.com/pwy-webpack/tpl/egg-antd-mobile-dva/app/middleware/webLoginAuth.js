module.exports = options => {
    return async function webAuth(ctx, next) {
        if (ctx.session.access_token) {
            await next();
        } else { // 登录失效
            await ctx.redirect('/');
        }
    };
};