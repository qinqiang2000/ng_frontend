// config/config.test.js

const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    
    config.logger = {
    	level: 'DEBUG',
    	consoleLevel: 'DEBUG'
    }
    
    config.apiUrl = {
    	baseUrl: 'http://172.18.5.40:8808'
    }
    
    config.assets = {
    	templatePath: path.join(appInfo.baseDir, 'app/view/template.html'),
        templateViewEngine: 'nunjucks',
        publicPath: '/public/',
        url: 'http://imgshow-master.piaozone.com'
    }
    
    return config;
}


