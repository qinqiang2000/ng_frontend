const Service = require('egg').Service;
//通用的转发请求
class forwardService extends Service {
	async forward({method='POST', data={}, path='', url=this.config.apiUrl.baseUrl}) {
		const { ctx } = this;
		
    	const result = await ctx.helper.authCurl(url + path, {
	  		data,
	  		method
  		}, ctx);
    	
    	return result;
  	}
}

module.exports = forwardService;