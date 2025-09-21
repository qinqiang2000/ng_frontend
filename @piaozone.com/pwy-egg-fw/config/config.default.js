// config/config.default.js
const path = require('path');
const isInnerIp = (ip) => {    
    return ip === '127.0.0.1';
}


module.exports = appInfo => {
    const config = exports = {};
    
    config.keys = 'kingdee$2018.%';
    config.httpclient = {
    	enableDNSCache: true,
    	dnsCacheLookupInterval: 10000,
    	dnsCacheMaxLength: 1000,
    	request: {
			timeout: 30000
		},
		httpAgent: {
			timeout: 30000
		}
    };
    
    
    config.logger = {
    	level: 'DEBUG',
    	consoleLevel: 'DEBUG'
    }
    
    
    config.multipart = {
    	fileExtensions: [
			'.tif',
			'.TIF',
    		'.png',
    		'.PNG',
    		'.jpg',
    		'.JPG',
    		'.jpeg',
    		'.JPEG',
    		'.bmp',
    		'.BMP',
    		'.pdf',
		    '.xlsx',
		    '.xls',
		    '.zip',
		    '.rar'
		]
    }
    
	
	config.uploadDir = path.join(appInfo.baseDir, 'uploadDir');
	
    config.view = {
        root: path.join(appInfo.baseDir, 'app/assets'),        
        mapping: {
          '.js': 'assets'
        }
    };
    
    config.redis = {
    	client: {
		    port: 6379,          // Redis port
		    host: '172.18.1.117',   // Redis host
		    password: 'kingdee',
		    db: 0
		}
    };
    
    config.session = {
    	renew: true,
		key: 'PWY_SESS',
		maxAge: 45 * 60 * 1000, // 45分
		httpOnly: true,
		encrypt: true
	};
    
    config.assets = {
        templatePath: path.join(appInfo.baseDir, 'app/view/template.html'),
        templateViewEngine: 'nunjucks',
        publicPath: '/public/'
    };
    
    config.security = {
    	domainWhiteList: ['http://www.piaozone.com', 'https://www.piaozone.com', 'http://img.piaozone.com', 'https://api.piaozone.com'],
    	csrf: {
		  enable: false
	    },
	    xframe: {
	    	enable: false
	    }
    };
    
    config.logger = {
        dir: path.join(appInfo.baseDir, 'logs')
    };
    
    return config;
};

