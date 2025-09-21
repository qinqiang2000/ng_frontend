// app/middleware/publicController.js

module.exports = options => {
	//通用转发
	return async function taxForward(ctx, next) {
	    await next();
	    
  		let data = {};
  		const method = ctx.request.method; 
  		
  		if(method === 'POST'){
  			data = ctx.request.body;
  		}
  		const { filterPrePath='',  validate=''} = options;
  		
  		if(typeof validate === 'function'){  			
	    	const validateRes = await options.validate(data);	    	
	    	if(validateRes.errcode !== '0000'){
	    		ctx.body = validateRes;
	    		return false;
	    	}
	    }
  		let newUrl = ctx.request.url;
  		if(filterPrePath !== ''){
  			const regFilter = new RegExp('^' + filterPrePath);
  			newUrl = newUrl.replace(regFilter, '');	
  		}
  		
  		const result = await ctx.helper.authCurl(ctx.app.config.apiUrl.baseUrl + newUrl, {
	  		data,
	  		method
  		}, ctx);
    	
  		ctx.body = result;
    	
  	};
}