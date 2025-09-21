class AppBootHook {
    constructor(app) {
        this.app = app;
        this.app.grayVersion = '';
    }

    async serverDidReady() {
        const app = this.app;
        const ctx = app.createAnonymousContext();
        app.messenger.on('eureka-gray-publish-success', async(configurations) => {
            ctx.logger.info('灰度发布eureka更新成功, 新配置：', configurations);
            const version = configurations['eureka.instance.metadata-map.version'];
            app.grayVersion = version;
        });
    }
}

module.exports = AppBootHook;