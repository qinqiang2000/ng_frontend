
// config/config.test.js

const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    
    config.logger = {
    	level: 'DEBUG',
    	consoleLevel: 'DEBUG'
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
        publicPath: '/tax-public/',
        url: 'http://imgdev-master.piaozone.com'
    }
    
    return config;
}


