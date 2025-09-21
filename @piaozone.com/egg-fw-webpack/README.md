# 基础框架

## 服务部署

```js


//进入项目根目录
$ npm install --dev --registry=http://172.18.1.117:7001

//服务端 启动时需要安装，本地开发不需要
$ npm install egg-scripts

//本地开发
$ npm run dev

//编译
$ npm run build

//启动测试环境
$ npm run start-test

//启动开发环境
$ npm run start-dev

//启动演示环境
$ npm run start-demo

//启动正式环境
$ npm run start

//停止服务
$ npm run stop

```

## 安装
```
$ npm install @piaozone.com/egg-fw-webpack --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/egg-fw-webpack--registry=http://172.18.1.117:7001
```

## 添加框架依赖
```
//在package.json中添加

"egg": {
	"framework": "@piaozone.com/egg-fw-webpack"
}

```

## 集成的公共插件和初始化配置


## 中间件的使用

```js

// auth中间件，负责判断用户是否登录，修改后台：router.js, 不需要登录的地址则不加
router.get('/*', auth, controller.home.index);

// services的使用

service.menu.getMenu();

// 需要token的转发service
service.forward.forward({
	method='POST', //默认POST
	data={},
	path='',
	url //默认this.config.apiUrl.baseUrl
})


// 公共controller的使用
const publicController = app.middleware.publicController;

// publicController支持参数validate，能够进行对请求的参数进行校验，
// validate为自定义函数，返回{errcode: '0000'}表示成功, 系统会自动将GET或者POST参数传递给validate参数，具体校验自己处理就行
// publicController会进行自定义的参数校验，如果通过则会转发请求到后端api,路径和path一致
router.get('path', publicController({validate: f=>f}));

// 上传中间件的使用, 系统会自动转发文件到api系统，并完成定时清理，
// 调用时不用关心具体细节，只需要告诉中间件api请求路径，注意上传方式是使用formdata的形式
// 系统设置的默认上传临时目录为项目根目录的uploadDir
const uploadController = app.middleware.publicUpload();
router.post('path', uploadController);


// helper 扩展的调用

// 自动添加token及权限参数，向接口发起请求
ctx.helper.authCurl(url, {
	data,
	method
});

// 不添加token及权限参数，向接口发起请求
ctx.helper.curl(url, {
	data,
	method
});


```

## License

MIT
