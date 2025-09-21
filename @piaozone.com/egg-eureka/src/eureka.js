// app/service/eureka.js
const Eureka = require('eureka-js-client').Eureka;

class NodeEureka {
    constructor(app) {
        this.app = app;
        this.eurekaConfigs = this.app.config.eureka;
        this.logger = this.app.logger;
    }

    // 监听到apollo灰度发布时更新eureka
    async updateEurekaOnGrayPublish(configRes, grayUpdateCallback) {
        const eurekaConfigs = this.eurekaConfigs;

        // 系统指定当前服务的ip
        const NODE_SERVER_IP = process.env.NODE_SERVER_IP || '';

        // eureka
        const eurekaHost = eurekaConfigs.eureka.host;
        const eurekaPort = eurekaConfigs.eureka.port;
        const appId = eurekaConfigs.app.name;

        // app
        const host = NODE_SERVER_IP || eurekaConfigs.app.host;
        const port = this.app.config.cluster.listen.port;

        const instanceId = decodeURIComponent(host + ':' + port);
        const auth = eurekaConfigs.eureka.user + ':' + eurekaConfigs.eureka.password;
        const ctx = await this.app.createAnonymousContext();
        configRes.map(async(configItem) => {
            // 灰度版本变量
            const version = configItem.configurations['eureka.instance.metadata-map.version'];
            // 监听灰度版本变化，灰度变化只会是application的命名空间
            if (configItem.namespaceName === 'application' && version) {
                const changeMetaUrl = `http://${eurekaHost}:${eurekaPort}/eureka/apps/${appId}/${instanceId}/metadata?version=${version}`;
                const resMeta = await ctx.curl(changeMetaUrl, {
                    dataType: 'json',
                    auth,
                    method: 'PUT'
                });
                if (resMeta && resMeta.status === 200) {
                    this.logger.info('灰度策略更新成功', 'eureka.instance.metadata-map.version', version);
                    typeof grayUpdateCallback === 'function' && grayUpdateCallback(configItem.configurations);
                } else {
                    this.logger.info('changeMetaUrl', changeMetaUrl);
                    this.logger.info('eureka.instance.metadata-map.version', version);
                    this.logger.info('灰度策略更新失败', resMeta.status, resMeta.data);
                }
            }
        })
    }

    async initEureka(callback) {
        // 系统指定当前服务的ip
        const NODE_SERVER_IP = process.env.NODE_SERVER_IP || '';
        const eurekaConfigs = this.eurekaConfigs;
        const eurekaHost = eurekaConfigs.eureka.host;
        const eurekaPort = eurekaConfigs.eureka.port;
        const eurekaPathPre = eurekaConfigs.eureka.pathPre || '';
        const { vipAddress, name } = eurekaConfigs.app;
        const host = NODE_SERVER_IP || eurekaConfigs.app.host;
        const ip = NODE_SERVER_IP || eurekaConfigs.app.ip;

        // 从运行环境中获取服务的端口
        const port = this.app.config.cluster.listen.port;
        const client = new Eureka({
            requestMiddleware: (requestOpts, done) => {
                requestOpts.auth = {
                    user: eurekaConfigs.eureka.user,
                    password: eurekaConfigs.eureka.password
                };
                done(requestOpts);
            },
            instance: {
                app: name,
                hostName: host, // host + ':' + port,
                ipAddr: ip,
                statusPageUrl: `http://${host}:${port}`,
                port: {
                    '$': port,
                    '@enabled': true
                },
                vipAddress: vipAddress || name,
                dataCenterInfo: {
                    '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                    name: 'MyOwn',
                }
            },
            eureka: {
                preferIpAddress: true,
                requestRetryDelay: 10000,
                heartbeatInterval: 80000,
                host: eurekaHost,
                port: eurekaPort,
                servicePath: eurekaPathPre + '/eureka/apps'
            }
        });

        client.start(async(err) => {
            if (err) {
                this.logger.error(err);
                return;
            }
            this.logger.info('注册中心连接成功');
            if (typeof callback === 'function') {
                this.client = client;
                callback();
            }
        });
    }
}

module.exports = NodeEureka;