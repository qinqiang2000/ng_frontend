const path = require('path');
const  fs = require('fs');

module.exports = {
	schedule: {
    	interval: '30m', // 30 分钟间隔
    	type: 'worker' // 指定 worker执行
  	},
  	async task(ctx) {    	
    	const uploadDir = ctx.app.config.uploadDir;
    	const files = fs.readdirSync(uploadDir);
    	
    	files.forEach((filename,index) => {
    		const filepath = path.join(uploadDir, filename);
    		if(fs.statSync(filepath).isFile()){
    			const fileStamp = parseInt(filename.split('-')[0]);
	    		const curDateStamp = +new Date();
	    		const maxStamp = 30 * 60 * 1000;
	    		if(!isNaN(fileStamp)){
	    			const exsitStamp =  curDateStamp - fileStamp;
		    		if(exsitStamp > maxStamp){
		    			ctx.logger.info('清理文件：'+ filename + '-------------->' + parseFloat(exsitStamp/(1000*60)) + 'm');		    			
		    			fs.unlinkSync(filepath);
		    		}
	    		}else{
	    			ctx.logger.info('文件格式不正确，直接清理：' + filename);	    			
	    			fs.unlinkSync(filepath);
	    		}
    		}    		
    	});
  	}
};