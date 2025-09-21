/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');

module.exports = appInfo => {
    const config = exports = {};
    config.staticUrl = 'http://localhost:9000/';
    config.__webpack_public_path__ = 'http://localhost:9000/';
    return config;
};