module.exports = options => {
    return async function webAuth(ctx, next) {
        if (ctx.session.access_token) {
            await next();
        } else {
            await ctx.render('errorPage.html', {
                errcode: '1301',
                description: '授权auth_code不能为空'
            });
        }
    };
};