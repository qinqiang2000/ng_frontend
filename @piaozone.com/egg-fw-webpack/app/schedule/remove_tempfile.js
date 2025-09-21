const path = require('path');
const  fs = require('fs');

module.exports = {
	schedule: {
    	interval: '30m', // 30 分钟间隔
    	type: 'worker' // 指定 worker执行
  	},
  	async task(ctx) {
    	// 清理上传的临时文件
        ctx.helper.deleteFiles(ctx.app.config.uploadDir, 30 * 60 * 1000);
  	}
};