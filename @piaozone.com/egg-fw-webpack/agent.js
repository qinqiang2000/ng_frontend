// agent.js

const eggApollo = require('@piaozone.com/egg-apollo');
const eggEureka = require('@piaozone.com/egg-eureka');

class AppBootHook {
    constructor(app) {
        this.app = app;
        this.apolloConfig = {};
    }

    getNewApolloConfig(updateConfig = []) {
        if (updateConfig.length > 0) {
            const tempConfig = {};
            for (let i = 0; i < updateConfig.length; i++) {
                const curItem = updateConfig[i];
                if (tempConfig[curItem.namespaceName]) {
                    tempConfig[curItem.namespaceName] = {
                        ...tempConfig[curItem.namespaceName],
                        ...curItem.configurations
                    }
                } else {
                    tempConfig[curItem.namespaceName] = curItem.configurations;
                }
            }
            this.apolloConfig = tempConfig;
        }
        return this.apolloConfig;
    }

    async startListenChange() {
        const app = this.app;
        const res = await app.pwyApollo.checkNotification();
        if (res.errcode === '0000') {
            const { configRes } = res.data;
            if (configRes.length > 0) {
                const newApolloConfig = this.getNewApolloConfig(configRes);
                // 通知appapollo配置更新
                app.messenger.sendToApp('apollo-config-update', newApolloConfig);
            }
            //configItem.configurations['eureka.instance.metadata-map.version']
            await app.pwyEureka.updateEurekaOnGrayPublish(configRes, (configurations) => {
                // 通知各个进程灰度发布
                app.messenger.sendToApp('eureka-gray-publish-success', { configurations });
            });
        }

        setTimeout(() => {
            this.startListenChange();
        }, 6000);
    }

    async serverDidReady() {
        const configs = this.app.config;
        if (configs.apollo && !configs.apollo.disabled) {
            this.app.pwyApollo = eggApollo.getInstance(this.app);
            const res = await this.app.pwyApollo.initApollo();
            const newApolloConfig = this.getNewApolloConfig(res.configRes);
            this.app.messenger.sendToApp('apollo-config-update', newApolloConfig);
        }

        if (configs.eureka && !configs.eureka.disabled) {
            this.app.pwyEureka = eggEureka.getInstance(this.app);
            this.app.pwyEureka.initEureka(async() => {
                if (this.app.pwyApollo) {
                    this.startListenChange();
                }
            });
        }
    }

    // 应用关闭前断开与注册中心的连接
    async beforeClose() {
        if (this.app.pwyEureka && this.app.pwyEureka.client) {
            this.app.pwyEureka.client.stop();
        }
    }
}

module.exports = AppBootHook;