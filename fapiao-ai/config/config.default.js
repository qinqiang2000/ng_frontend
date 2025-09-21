/* eslint valid-jsdoc: "off" */

'use strict';

const { CLIENT_RENEG_WINDOW } = require("tls");

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
    config.keys = appInfo.name + '_1703123456789_1234';

    // add your middleware config here
    config.middleware = [];

    // add your user config here
    const userConfig = {
        // myAppName: 'egg',
    };

    // 模板引擎配置
    config.view = {
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.tpl': 'nunjucks',
            '.html': 'nunjucks',
        },
    };

    // 静态资源配置
    config.static = {
        prefix: '/public/',
        dir: 'app/public',
        dynamic: true, // 如果当前访问的静态资源没有缓存，则缓存静态文件，和`preload`配合使用；
        preload: false,
        maxAge: 0, // in prod env, 0 in other envs
        buffer: false, // in prod env, false in other envs
    };

    // 安全配置
    config.security = {
        csrf: {
            enable: false,
        },
        domainWhiteList: ['http://localhost:7001'],
    };

    // CORS 配置
    config.cors = {
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    };

    // 文件上传配置
    config.multipart = {
        mode: 'file',
        fileSize: '50mb',
        whitelist: [
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.wbmp', '.webp', '.tif', '.psd',
            '.svg', '.js', '.jsx', '.json', '.css', '.less', '.html', '.htm',
            '.xml', '.pdf', '.ofd', '.zip', '.gz', '.tgz', '.gzip', '.mp3', '.mp4', '.avi',
            '.doc', '.docx', '.xlsx', '.xls', '.txt', '.csv'
        ],
        fields: 10, // 增加字段数量限制
        files: 20,  // 增加文件数量限制
    };

    /*
    // 数据库配置（如果需要）
    config.mysql = {
        // 单数据库信息配置
        client: {
            // host
            host: 'localhost',
            // 端口号
            port: '3306',
            // 用户名
            user: 'root',
            // 密码
            password: '',
            // 数据库名
            database: 'eggjs_template',
        },
        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false,
    };

    // Redis 配置（如果需要）
    config.redis = {
        client: {
            port: 6379,          // Redis port
            host: '127.0.0.1',   // Redis host
            password: '',
            db: 0,
        },
    };
    */

    // Session 配置
    config.session = {
        key: 'EGG_SESS',
        maxAge: 24 * 3600 * 1000, // 1 天
        httpOnly: true,
        encrypt: true,
        renew: true, // 延长会话有效期
    };

    // 日志配置
    config.logger = {
        level: 'INFO',
        consoleLevel: 'INFO',
        dir: 'logs',
        encoding: 'utf8',
        outputJSON: false,
        buffer: true,
        appLogName: `${appInfo.name}-web.log`,
        coreLogName: 'egg-web.log',
        agentLogName: 'egg-agent.log',
        errorLogName: 'common-error.log',
    };

    // 集群配置
    config.cluster = {
        listen: {
            path: '',
            port: 7001,
            hostname: '0.0.0.0',
        },
    };

    // DeepSeek AI 配置
    config.deepseek = {
        apiKey: process.env.DEEPSEEK_API_KEY || 'sk-82ff44b27e4043729697ba8a16c8a8ea', // 从环境变量获取API密钥
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        timeout: 60000, // 请求超时时间（毫秒）
    };

    // HTTP 客户端配置
    config.httpclient = {
        request: {
            timeout: 60000,
        },
        httpAgent: {
            timeout: 60000,
        },
        httpsAgent: {
            timeout: 60000,
        },
    };

    // 任务管理配置
    config.taskManager = {
        maxConcurrentTasks: 10, // 最大并发任务数
        taskTimeout: 300000, // 任务超时时间（5分钟）
        cleanupInterval: 3600000, // 清理过期任务的间隔（1小时）
        maxTaskAge: 86400000, // 任务最大保存时间（24小时）
    };

    // 聊天配置
    config.chat = {
        maxHistoryLength: 50, // 最大对话历史长度
        maxMessageLength: 10000, // 最大消息长度
        maxFileSize: 50 * 1024 * 1024, // 最大文件大小（50MB）
        supportedFileTypes: [
            'jpg', 'jpeg', 'png', 'pdf',
            'doc', 'docx', 'xlsx', 'csv', 'txt'
        ],
    };

    config.authConfig = {
        baseUrl: 'https://api-dev.piaozone.com/test',
        clientId: 'i2ntHzlEsFKBcZCgfYVL',
        clientSecret: '433b7c2edfbc4602bc2dd673cb8faf38'
    }
    return {
        ...config,
        ...userConfig,
    };
};