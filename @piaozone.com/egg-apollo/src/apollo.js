const paramJson = function(data) {
	if(typeof data === 'string'){
		try{
			data = JSON.parse(data);
		}catch(e){ //非json对象
			return data;
		}
	}

	let result = [];
	for(const item in data){
		if(data.hasOwnProperty(item)){
			result.push(item+'='+ encodeURIComponent(data[item]));
		}
	}
	return result.join('&');
}

class NodeApollo {
    constructor(app) {
        this.app = app;
        this.apolloConfig = app.config.apollo;
        this.logger = app.logger;
        this.notifications = [{
            namespaceName: 'application',
            notificationId: -1
        }];
        this.releaseKeys = {};
    }

    async remoteConfigServiceSkipCache(apolloConfig = this.apolloConfig, releaseKeys = this.releaseKeys) {
        const { appId, clusterName, configServerUrl, clientIp = '' } = apolloConfig;
        const namespaceNames = [].concat(apolloConfig.namespaceName);
        const resList = [];
        const ctx = this.app.createAnonymousContext();
        for (let i = 0; i < namespaceNames.length; i++) {
            const n = namespaceNames[i];
            const releaseKey = releaseKeys[n] || '';
            const url = `${configServerUrl}/configs/${appId}/${clusterName}/${n}?releaseKey=${releaseKey}&ip=${clientIp}`;
            const res = await ctx.curl(url, { dataType: 'json' });
            if (res.status === 304) {
                break;
            } else if (res.status === 200 && res.data) {
                resList.push(res.data);
            } else {
                this.logger.info('查询配置中心异常：', res);
            }
        }
        return resList;
    }


    async remoteConfigServiceCache(apolloConfig = this.apolloConfig) {
        const ctx = this.app.createAnonymousContext();
        const { appId, clusterName, configServerUrl, clientIp = '' } = apolloConfig;
        const url = `${configServerUrl}/configfiles/json/${appId}/${clusterName}/application?ip=${clientIp}`;
        const res = await ctx.curl(url, { dataType: 'json' });
        return res.data;
    }

    // 监听apolloy配置变化
	async checkNotification() {
        const ctx = this.app.createAnonymousContext();
        const notifications = this.notifications;
        const releaseKeys = this.releaseKeys;
        const apolloConfig = this.apolloConfig;
        if (!notifications) {
            notifications = [{
                namespaceName: 'application',
                notificationId: -1
            }];
        }
        const urlData = paramJson({
            appId: apolloConfig.appId,
            cluster: apolloConfig.clusterName,
            name: '',
            notifications: JSON.stringify(notifications)
        });

        const url = apolloConfig.configServerUrl + '/notifications/v2?' + urlData;
        let res = {};
        try {
            res = await ctx.curl(url, { dataType: 'json', timeout: 90000 });
        } catch (error) {
            this.logger.error(err);
            return { errcode: '1500', description: '获取配置中心变化异常' };
        }
        if (res.status === 304) {
            return {
                errcode: '0304',
                description: ''
            };
        }

        if (res.status === 200 && res.data) {
            const result = {};
            this.logger.info('配置中心数据变化', JSON.stringify(res.data));
            res.data.forEach(async(item) => {
                // 获取notificationId
                result[item.namespaceName] = item.notificationId;
            });
            // 通过不带缓存的接口获取更新信息
            let configRes = await this.remoteConfigServiceSkipCache(apolloConfig, releaseKeys);
            // 更新releaseKey
            if (configRes.length > 0) {
                configRes.forEach((configItem) => {
                    if (configItem && configItem.namespaceName) {
                        releaseKeys[configItem.namespaceName] = configItem.releaseKey;
                    }
                });
            }

            this.notifications = notifications.map((item) => {
                return {
                    namespaceName: item.namespaceName,
                    notificationId: result[item.namespaceName]
                };
            });

            this.releaseKeys = { ...releaseKeys };

            return {
                errcode: '0000',
                data: {
                    notifications,
                    releaseKeys,
                    configRes
                }
            };
        } else {
            this.logger.info('请求配置中心通知异常', res.status, res.data);
            return { errcode: '1500', description: '获取配置中心变化异常' };
        }
    }

    async initApollo() {
        const apolloConfig = this.apolloConfig;
        // 配置项没找到或禁用
        if (typeof apolloConfig !== 'object' || apolloConfig.disabled === true) {
            return false;
        }

        // 可能只启动了apollo
        const result = await this.remoteConfigServiceSkipCache(apolloConfig);
        const releaseKeys = {};
        // 更新releaseKey， 方便后续调用不带缓存接口
        result.forEach((item) => {
            releaseKeys[item.namespaceName] = item.releaseKey;
        });
        this.releaseKeys = releaseKeys;
        return {
            configRes: result,
            releaseKeys,
            notifications: [{
                namespaceName: 'application',
                notificationId: -1
            }]
        };
    }
}

module.exports = NodeApollo;