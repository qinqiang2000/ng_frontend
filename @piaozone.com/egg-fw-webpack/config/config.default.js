// config/config.default.js
const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    config.keys = 'kingdee$2018.%';
    config.httpclient = {
        enableDNSCache: true,
        dnsCacheLookupInterval: 10000,
        dnsCacheMaxLength: 1000,
        request: {
            timeout: 65000
        },
        httpAgent: {
            keepAlive: true,
            timeout: 63000
        },
        httpsAgent: {
            keepAlive: true,
            timeout: 63000
        }
    };

    config.bodyParser = {
        enable: true,
        encoding: 'utf8',
        formLimit: '51200kb',
        jsonLimit: '51200kb'
    }

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
            '.PDF',
		    '.xlsx',
		    '.xls',
		    '.zip',
		    '.rar'
		]
    }

	config.uploadDir = path.join(appInfo.baseDir, 'uploadDir');
    config.view = {
        cache: false,
        root: path.join(appInfo.baseDir, 'app/view'),
        mapping: {
            '.html': 'nunjucks'
        }
    };

    config.session = {
    	renew: true,
		key: 'PWY_SESS',
		maxAge: 45 * 60 * 1000, // 45分
		httpOnly: true,
		encrypt: true
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

    config.customLogger = {
        scheduleLogger: {
          consoleLevel: 'NONE',
          file: path.join(appInfo.baseDir, 'logs', 'info.log'),
        }
    };

    config.logger = {
        dir: path.join(appInfo.baseDir, 'logs'),
        appLogName: 'info.log',
        coreLogName: 'info.log',
        agentLogName: 'info.log',
        errorLogName: 'error.log',
        disableConsoleAfterReady: true
    };

    return config;
};

