/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
    const config = exports = {};
    config.redis = {
        client: {
            port: 6379,          // Redis port
            host: '172.18.64.40',   // Redis host
            password: 'K@#2020fpy',
            db: 3
        },
    };
    return config;
}