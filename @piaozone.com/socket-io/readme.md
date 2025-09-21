# 发票无忧socket-io封装

## Login
```
$ cnpm login --registry=http://172.18.1.117:7001 --scope=@piaozone.com  --always-auth
```

## 安装
```
$ npm install @piaozone.com/socket-io --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/socket-io --registry=http://172.18.1.117:7001

//或者引用在线url地址
//http链接
<script type="text/javascript" src="http://img.piaozone.com/static/gallery/socket.io.js"></script>
<script type="text/javascript" src="http://img.piaozone.com/static/public/js/pwy-socketio-v2.js"></script>

//https链接
<script type="text/javascript" src="https://img.piaozone.com/static/gallery/socket.io.js"></script>
<script type="text/javascript" src="https://img.piaozone.com/static/public/js/pwy-socketio-v2.js"></script>

```


## 调用方法

```js

var PwyWebSocket = require('@piaozone.com/socket-io');

//创建连接对象
var pwySocket = new PwyWebSocket({
    "env": "test", //指定环境，test：测试环境，prod：正式环境
    "apiUrl": "", // 后台轮询接口根地址，可不填，私有化部署发票云时需要传入接口根地址
    "url": "", // socket根地址，可不填，私有化部署发票云时需要指定socket根地址
    "path": "" // socket连接的path, 可不填，私有化部署发票云时指定path
	"name": "userName", //指定连接名称
	"onMessage": function(msg){
		//msg 为接收到的消息
	},
	"onError": function(errMsg){ //错误回调
	}	
});

//主动发送消息
pwySocket.sendNew({
	"to": "to userName", //消息发送给谁
	"msg": "msg content",
	"success": function(res){
		
	},
	"error": function(errMsg){
		
	}
})

```


## License

MIT
