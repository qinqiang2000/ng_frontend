// agent.js

// const webpackDev = require('./build/dev');
// const getWebpackConfig = require('./build/webpack.dev');

module.exports = agent => {
    if (agent.config.pwyWebpack && !agent.config.pwyWebpack.disabled && agent.config.pwyWebpack.buildConfig) {
        // 在这里写你的初始化逻辑
        const webpackDev = require('@piaozone.com/pwy-webpack/lib/dev');
        const getWebpackConfig = require('@piaozone.com/pwy-webpack/config/webpack.dev');
        const buildConfig = require(agent.config.pwyWebpack.buildConfig);
        const webpackConfig = getWebpackConfig(buildConfig);
        // 也可以通过 messenger 对象发送消息给 App Worker
        // 但需要等待 App Worker 启动成功后才能发送，不然很可能丢失
        const compiler = webpackDev(webpackConfig, buildConfig);
        agent.messenger.on('egg-ready', () => {
            compiler.plugin('done', compilation => {
                agent.messenger.sendToApp('compile_action', {
                    compilerIsFinish: true
                });
            });
        });
    }
};