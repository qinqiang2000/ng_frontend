// config/config.local.js
const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    config.staticUrl = 'http://localhost';
    config.__webpack_public_path__ = 'http://localhost:9000';

    config.pwyWebpack = {
        buildConfig: path.join(appInfo.baseDir, 'config/buildConfig.js')
    };

    config.logger = {
        dir: path.join(appInfo.baseDir, 'logs'),
        appLogName: 'info.log',
        coreLogName: 'info.log',
        agentLogName: 'info.log',
        errorLogName: 'error.log',
        disableConsoleAfterReady: false
    };

    return config;
};

