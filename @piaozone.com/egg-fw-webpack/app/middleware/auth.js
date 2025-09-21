module.exports = options => {
	return async function auth(ctx, next) {
	    if(ctx.request.url === '/'){
    		await next();
    	}else{
    		if(ctx.session.access_token && ctx.session.currentOrgId && ctx.session.belongOrgId){
    			//用户操作时，界面不会失效
    			ctx.session.belongOrgId = ctx.session.belongOrgId;
  				ctx.session.currentOrgId = ctx.session.currentOrgId;
  				ctx.session.access_token = ctx.session.access_token;

    			await next();
    		}else{
    			await ctx.redirect('/');
    		}
    	}
	}
}