# 发票无忧前端工具函数

## cnpm操作命令

```
// 设置私有源地址
cnpm config set registry http://172.18.1.117:7001

// 登录私有源仓库
cnpm login --scope=@piaozone.com  --always-auth

// 当前目录发布时：
cnpm publish .

// 取消上一次发布
cnpm unpublish .

// 全局安装，包含私有项目(@piaozone.com)
npm install --registry=http://172.18.1.117:7001 --dev

// 全局安装，包含私有项目（@piaozone.com), 只安装正式包，不能进行build，只能运行线上node服务
npm install --registry=http://172.18.1.117:7001 --production


```

## 安装
```
$ npm install @piaozone.com/utils --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/utils --registry=http://172.18.1.117:7001
```


## 调用方法

```js

// 基础扩展直接使用

'string'.trim(); // 过滤首尾空格
'string'.entityify(); // 转换JSON数据中的<>等敏感字符
'string'.isEmail();
'string'.isEmpty();
'string'.isNotEmpty();
'string'.isPhone();
'string'.isPhoneOrMail();
'string'.isNumber();
'string'.getSub(n, flag); //获取前面n个字符，flag表示是否有...结尾

[].indexOf(v); // 全等判断是否有某个值在数组中

// 导入
import { cookieHelp, paramJson, pwyFetch } from '@piaozone.com/utils';

// cookieHelp
const { setCookie, getCookie, clearCookie,  clearAllCookie} = cookieHelp;
setCookie('name', 'value', seconds); //seconds为保存时间，单位秒，如果不传则保存永久直到用户手动清理
const ck = getCookie('name');
clearCookie('name');
clearAllCookie();

// 前端发送网络请求，await必须在async包围的函数中使用
const res = await pwyFetch(url, {
    method: 'post',
    data: {},
    contentType: 'json', // 请求数据的格式：json, file, 默认json
    dataType: '', // 返回数据的格式, 默认为json, 如果需要直接返回则可以传text
    onRequestProgress: (loaded, total) => { // 上传进度
        console.log(loaded, total);
    },
    onResponseProgress: (loaded, total) => { // 下载进度
        console.log(loaded, total);
    },
    onProgress: (readyState, status, loaded, total) => { // 全进度状态
        // readyState 0 初始化网络对象, loaded, total为空
        // readyState 1 创建网络连接，并开始上传数据，loaded, total开始时为空
        // readyState 2 上传完成等待返回，status为http状态码200为返回成功，loaded, total开始时为空
        // readyState 3 接收到返回响应，并开始接收返回数据，loaded和total开始时可能没有值
        // readyState 4 返回数据接收完成
    }
});

// 将json对象转换为url字符串
const urlParam = paramJson({'userName':'13714803333', 'password': '12345678'});
// 转换后格式
userName=13714803333&password=12345678

```

## 获取发票类型
```
import { checkInvoiceType } from '@piaozone.com/utils';

checkInvoiceType(fpdm);
//返回值：4专票，15通行费发票，5卷式发票，3普通发票，查验时专票根据金额去查验，其他根据校验码

```


## License

MIT
