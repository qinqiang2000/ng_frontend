'use strict';

/** @type Egg.EggPlugin */
module.exports = {
    // had enabled by egg
    // static: {
    //   enable: true,
    // }

    // 模板引擎插件
    nunjucks: {
        enable: true,
        package: 'egg-view-nunjucks',
    },

    // 静态资源插件
    static: {
        enable: true,
        package: 'egg-static',
    },

    // CORS 插件
    cors: {
        enable: true,
        package: 'egg-cors',
    },

    // 参数验证插件
    validate: {
        enable: true,
        package: 'egg-validate',
    },

    // // Redis 插件
    redis: {
        enable: true,
        package: 'egg-redis',
    },

    // // MySQL 插件
    // mysql: {
    //     enable: true,
    //     package: 'egg-mysql',
    // },

    // Session 插件
    session: {
        enable: true,
        package: 'egg-session',
    },

    // 安全插件
    security: {
        enable: true,
        package: 'egg-security',
    },

    // 文件上传插件
    multipart: {
        enable: true,
        package: 'egg-multipart',
    },
};