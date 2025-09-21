// config/config.prod.js
const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    
    
    config.mysql = {
        client: {
            host: '127.0.0.1',
            port: '3306',
            user: 'root',
            password: '123456',
            database: 'taxmanage'
        },
        app: true, // 是否加载到 app 上，默认开启
        agent: false, // 是否加载到 agent 上，默认关闭
    }
    
    config.assets = {
    	templatePath: path.join(appInfo.baseDir, 'app/view/template.html'),
        templateViewEngine: 'nunjucks',
        publicPath: '/public/',
        url: 'http://img.piaozone.com'
    }
    
    config.logger = {
    	level: 'ERROR',
    	consoleLevel: 'NONE'
    }
    
    return config;
}

