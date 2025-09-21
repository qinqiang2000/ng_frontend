// app/middleware/publicController.js

const fs = require('fs');

const path = require('path');
const pump = require('mz-modules/pump');
const FormStream = require('formstream');

module.exports = options => {
	//税务转发
	return async function uploadForward(ctx, next) {
	    await next();	    
	    if(!ctx.session.access_token){
			ctx.body = {errcode: '1300', description: '用户登录信息失效，请重新登录'};
		}else{
			//如果用户登录信息未失效，则延长
			ctx.session.belongOrgId = ctx.session.belongOrgId;
			ctx.session.currentOrgId = ctx.session.currentOrgId;
			ctx.session.access_token = ctx.session.access_token;
		}
		
  		const parts = ctx.multipart({ autoFields: true });
		const files = [];
		const form = new FormStream();
		
		let stream;
		//获取流并逐个添加到formData里面
		
		while ((stream = await parts()) != null) {			
			const fileAttr = stream.fieldname || 'file';
			const filenameArr = stream.filename.split('.');
			const fileExt = filenameArr[filenameArr.length-1];
			
	      	const filename = (+new Date()) + '-' +Math.random() + '.' + fileExt;
	      	
	      	const target = path.join(ctx.app.config.uploadDir, filename);
	      	try{
	      		const writeStream = fs.createWriteStream(target);
	      		await pump(stream, writeStream);	      		
				files.push(filename);				  
	      		form.file(fileAttr, target);
	      	}catch(e){
	      		console.log(e);	
	      	}	      	
		}
		
		Object.keys(parts.field).map((k) => {
			form.field(k, parts.field[k]);
		});
		
		const belongOrgId = ctx.session.belongOrgId || 0;
		const currentOrgId = ctx.session.currentOrgId || 0;
		
  		if(files.length !== 0){
			let fullUrl = ctx.app.config.apiUrl.baseUrl + ctx.request.url;
			fullUrl = fullUrl.replace(/\?$/, '');	  		
	  		fullUrl +='?belongOrgId=' + belongOrgId + '&currentOrgId=' + currentOrgId;
	  		fullUrl +='&access_token=' + ctx.session.access_token;
			  
			
	  		const result = await ctx.curl(fullUrl, {
	  			method: 'POST',
	  			stream: form,
					headers: form.headers(),
					dataType: 'json',  	  			
	  			timeout: 120000
			}, ctx);
			
			
			if(ctx.app.config.env !== 'prod'){
				console.log(fullUrl);
				console.log(result.headers);
				console.log(result.data);				
			}

			ctx.set(result.headers);
	  		ctx.body = result.data;
  		}else{
  			ctx.body = {'errcode': 'empty', 'description':'数据为空或文件获取出错'};
  		}
  	};
}