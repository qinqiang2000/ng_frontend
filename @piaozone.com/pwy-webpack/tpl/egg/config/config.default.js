/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
    /**
     * built-in config
     * @type {Egg.EggAppConfig}
     **/
    const config = exports = {};
    // use for cookie sign key, should change to your own and keep security
    config.__webpack_public_path__ = '/static/' + appInfo.name;
    return config;
};