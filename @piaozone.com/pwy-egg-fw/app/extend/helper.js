
const path = require('path');
const defaultTimeout = [5000, 90000];

function normalizePublicPath(publicPath) {
  if (!publicPath) return '/';
  let firstIndex = 0;
  if (publicPath[firstIndex] === '/') firstIndex++;
  let lastIndex = publicPath.length - 1;
  if (publicPath[lastIndex] === '/') lastIndex--;
  return '/' + publicPath.slice(firstIndex, lastIndex + 1) + '/';
}

function linkTpl({ url }) {
  return `<link rel="stylesheet" href="${url}"></link>`;
}

function scriptTpl({ url }) {
  return `<script src="${url}"></script>`;
}

module.exports = {
	async curl(url, opt) {		
		const ctx = this.ctx;
		const {data, method='POST', contentType = 'json', dataType='text', headers={}, timeout=defaultTimeout} = opt;
		
		const result =  await ctx.curl(url, {
			method,
	  		data,
	  		contentType,
	  		dataType,
	  		timeout,
	  		headers
		});
		
		if(result.data){
            let res;
			try {
                res = JSON.parse(result.data);
            } catch (error) {
                console.log('解析json报错, 返回值', res.data);
                console.log('error: ', error);
                return {errcode: '5000', description:  '服务端异常，请稍后重试！'};
            }
			
			const {errcode='', description='', data} = res;			
		
			if(errcode === '0000'){
	  			return res;
	  		}else if(errcode === ''){
	  			if(ctx.app.config.env !== 'prod'){
	  				console.log(result);
	  			}
	  			return {errcode: 'err', description:  res.error + '('+ res.status +')'};
	  		}else{
	  			return {errcode, description};
	  		}	
		}else{
			if(ctx.app.config.env !== 'prod'){
				console.log(result);
			}
			return {errcode: 'err', description:  res.error + '('+ res.status +')'};
		}
	},	
	async authCurl(url, opt) {		
		const ctx = this.ctx;
		if(!ctx.session.access_token){
			return {errcode: '1300', description: '用户登录信息失效，请重新登录'};
		}else{
			//如果用户登录信息未失效，则延长
			ctx.session.belongOrgId = ctx.session.belongOrgId;
			ctx.session.currentOrgId = ctx.session.currentOrgId;  			
			ctx.session.access_token = ctx.session.access_token;		
		}
		
		const urls = url.split('?');
		url = urls[0] + '?access_token=' + ctx.session.access_token;
		if(urls.length >1){
			url +='&' + urls[1];
		}
		
		
		const belongOrgId = ctx.session.belongOrgId || 0;
		const currentOrgId = ctx.session.currentOrgId || 0;
		
		const headers = {};
		const {data={}, method='POST', contentType = 'json', dataType='text', timeout=defaultTimeout} = opt;
		
		if(method === 'POST'){
			ctx.set('belongOrgId', belongOrgId);
			ctx.set('currentOrgId', currentOrgId);
			headers.belongOrgId = belongOrgId;
			headers.currentOrgId = currentOrgId;
			data.currentOrgId = currentOrgId;
		}else if(method === 'GET'){
			url += '&belongOrgId=' + belongOrgId + '&currentOrgId=' + currentOrgId;
		}
		
		if(ctx.app.config.env !== 'prod'){
			console.log(url);
			console.log(data);	
		}
				
		return await this.curl(url, {data, method, contentType, dataType, headers, timeout});			
	},
	getStyle(entry, theme='default') {		
		const appConfig = this.ctx.app.config;	
		const config = appConfig.assets;
		const url = config.url;
		const publicPath = normalizePublicPath(config.publicPath);
		
	  	const manifests = this.ctx.app.manifests;
		return linkTpl({url: url + publicPath + theme + '/' + manifests[theme][entry+'.css']});
	},
	getScript(entry, theme='default') {	
		const config = this.ctx.app.config.assets;
		const url = config.url;
		const publicPath = normalizePublicPath(config.publicPath);
		const manifests = this.ctx.app.manifests;	    
		return scriptTpl({url: url + publicPath + theme + '/' + manifests[theme][entry+'.js']});		
	}
}

