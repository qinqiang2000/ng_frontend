

# 路由插件的开发

## 插件目录结构及注意

目录注意有controller，service, 和index文件，其它目录可以自定义，比如utils，libs等，所有文件都能使用全局的对象

最终通过 export default导出一个路由数组，格式参考：

如果需要强制覆盖已经存在的路由，需要增加overwriteFlag: true参数，优先级为后面的路由覆盖前面的路由

```js

import { TestController } from './controller/testController';

const index = (opt) => {
    const testController = new TestController(opt);
    testController.index();
};

export default [{
    path: '/fpdk/route/plugin/test',
    method: 'POST',
    handleFunc: index
}];

```

## 全局对象，插件中可以直接使用

### ctx

每个controller和service可以直接使用this.ctx获取到http请求上下文，上下文环境里面支持一下内容：

ctx.service：可以访问所有的service，包括当前插件定义的service和发票客户端自身的service，插件的service会覆盖客户端自身的service, 但只影响当前插件定义的接口

ctx.service.log.info：打印日志，日志会打印到fpdk-gov开始的日志文件里面

ctx.request.method: 请求method

ctx.request.url: 请求地址

ctx.request.headers: 请求头

ctx.request.query: url请求参数，为使用json对象，没有则为{}

ctx.request.body: body请求参数，为使用json对象，没有则为{}

ctx.eventEmitter: 事件库，可以自定义事件，对应库为：events

ctx.db: 数据库对象

ctx.app.config: 客户端配置

ctx.bsWindows: 浏览器窗体对象

### errcodeInfo：

已经定义好的errcode对象，重要的errcode如下，其它可以参考发票客户端代码里面errcodeInfo定义

errcodeInfo.success: 程序处理成功

errcodeInfo.govLogout: 税局登录失效

errcodeInfo.govErr: 税局请求异常

### BaseController

每个自定义controller必须依赖PluginBaseController，PluginBaseController必须依赖BaseController

在PluginBaseController中主要添加自定义的service

### BaseService：

自定义的service必须继承这个class, 自定义的service只会影响当前插件增加的功能，不影响其它插件或者其它接口


### pwyStore

客户端缓存对象，支持获取缓存，增加缓存，删除缓存

获取缓存：pwyStore.get(k: string);

设置缓存：pwyStore.set(k: string, v: any, time?: number);

删除缓存：pwyStore.delete(k: string);

### etaxLoginedCachePreKey

电子税局登录时缓存的前缀key，一般在登录时获取指定税号的登录信息时使用

如：

```js
    const loginData = await pwyStore.get(etaxLoginedCachePreKey + pageId);
```

### setTimeout，path, fs

nodeJs里面的标准库

### log

日志打印，这个日志会打印到main开始的日志文件里面

### xlsx
node-xlsx库，具体参考官方文档

### moment(时间处理库)，qrcode(二维码库), urllib（网络请求库）

urllib为nodejs的底层库，正常情况使用ctx.helper.curl，ctx.helper.jsonCurl进行请求

