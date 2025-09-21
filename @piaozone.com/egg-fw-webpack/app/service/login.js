// app/service/login.js
const Service = require('egg').Service;
class loginService extends Service {
	async login({userName, userPassword, type}) {
		const { ctx } = this;
		const data = {
  			type,
  			userName,
  			userPassword
  		};
  		
    	const result = await ctx.helper.curl(this.config.apiUrl.baseUrl + '/base/portal/login/token', {  			
	  		data 
  		}, ctx);
    	
    	return result;
  	}
	
	async logout(){		
		return await this.ctx.helper.authCurl(this.config.apiUrl.baseUrl + '/portal/org/login/userLogout', {}, this.ctx);
	}
}

module.exports = loginService;