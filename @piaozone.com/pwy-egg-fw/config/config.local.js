// config/config.local.js
const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    config.logger = {
    	level: 'DEBUG',
    	consoleLevel: 'DEBUG'
    }
    
    config.apiUrl = {
    	baseUrl: 'http://172.18.5.39:9104'
    }
    
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
    
    config.redis = {
    	client: {
		    port: 6379,          // Redis port
		    host: '172.18.1.117',   // Redis host
		    password: 'kingdee',
		    db: 0
		}
    };
    
    config.assets = {
        templatePath: path.join(appInfo.baseDir, 'app/view/template.html'),
        templateViewEngine: 'nunjucks',
        publicPath: '/public/',
        devServer: {
            debug: true,
            command: 'roadhog dev --host 0.0.0.0',            
            historyApiFallback: true,            
            port: 8000,            
            env: {
                BROWSER: 'none',
                ESLINT: 'none',
                SOCKET_SERVER: 'http://localhost:8000',
                PUBLIC_PATH: 'http://localhost:8000'
            }
        }
    };
    return config;
};

