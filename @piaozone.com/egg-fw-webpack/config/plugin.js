'use strict';
module.exports = {
    nunjucks: {
        enable: true,
        package: 'egg-view-nunjucks'
    },
    redis: {
        enable: true,
        package: 'egg-redis',
    },
    sessionRedis: {
        enable: true,
        package: 'egg-session-redis'
    }
};