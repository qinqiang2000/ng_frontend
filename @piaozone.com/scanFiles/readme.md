# 发票无忧上传扫描图像

## Login
```
$ cnpm login --registry=http://172.18.1.117:7001 --scope=@piaozone.com  --always-auth
```

## 安装
```
$ npm install @piaozone.com/scanFiles --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/scanFiles --registry=http://172.18.1.117:7001
```


## 调用方法

```js

import { scanFiles } = from '@piaozone.com/scanFiles';

var res = scanFiles({
	fileIndex: 0, //图片缓存索引
	removeImageFlag: true, //每次扫描结束是否清理图片缓存数据
	path: '/path/upload', //以/开头的地址，必须
	initFail: (errRes) => { //初始化失败，根据情况自定义，非必须
		console.log(errRes);
	},
	startUpload: function(len){ //总共扫描件数量，根据情况自定义，非必须
		console.log(len)
	},
	stepFinish: (res, i) => { //单个上传成功后的回调，根据情况自定义，非必须
		console.log(res);
		//i为图片缓存索引
    },
    finish: (result) => { //全部上传完成后的回调, result为全部返回，数组格式，根据情况自定义，非必须
    	console.log(result);
    }
});

/*
 支持的可选其他参数
{
	limit,   //上传并发数量控制，默认20
	PixelType, //默认为2，彩色模式
	Resolution, //默认300，扫描质量300dpi
    blankImageMaxStdDev, //默认20, 过滤空白页噪点大小
}
*/


//将扫描仪缓存数据转换为blob数据
var convertRes = convertImage(i, function(flag, result){
	//i为扫描仪缓存索引
	//flag为成功标志
	//result为缓存数据转换结果，转换出来的数据可以用于上传
});


//通过扫描仪提供的组件上传blob数据
var upload = DWObjectUploadFile(path, data, fileIndex, function(res){
	//上传路径，与scanFiles类似
	//data为convertImage转换后的数据
	//fileIndex自定义编号，与缓存索引无关
	//res为后台返回结果
})


```
## v14新版本扫描库文件

```js

    import { PwyScanFiles }= require('@piaozone.com/scanFiles');

    // 初始化扫描对象
    const scanFiles = new PwyScanFiles({
        limit: 2, // 上传时的并发控制
        staticUrl: 'http://localhost', // 指定加载扫描仪库文件的根路径
        needRegonizeQr: true, // 开启识别二维码
        uploadUrl: this.props.recognizeUrl, // 上传路径
        version: 16 // 目前16是最新版本,不传默认还是15.若更新到17则需要新增v17的文件夹
    });

    // 开始上传
    scanFiles.startScan({
        redirectUpload: true,
        filename: 'file', // 上传文件时指定的formdata file的名称
        data: { // 固定的附加数据
            batchNo: 'batchNo',
            resource: 'resource'
        },
        stepUploadStart: async(item) => { // 上传前的控制，qrcodeResult为识别识别二维码时的内容，没有识别出来返回为空字符串，返回值otherData用于上传时的动态参数控制
            if (item.qrcodeResult !== '') {
                return {
                    errcode: '0000',
                    stopStepUpload: true,
                    qrcodeResult: item.qrcodeResult
                };
            } else {
                return {
                    errcode: '0000',
                    otherData: { // 需要上传时添加的数据
                        qrcodeResult: 'test'
                    }
                };
            }
        },
        stepUploadFinish: (res, fileInfo) => { // 每一步上传处理完成后的回调
            console.log(fileInfo.index + ', res', res);
            // console.log('fileInfo', fileInfo);
        },
        uploadFinish: () => { // 全部上传完成后的回调
            message.destroy();
            message.info('处理完成');
        }
    });

    // 单个文件通过扫描仪上传
    const fileInfo = {
        index: '',
        name: ''
    };

    const otherData = {}; // 上传时的额外数据
    const filename = 'file';
    const res = await scanFiles.uploadFile(fileInfo, otherData, filename);

    // 清理扫描仪图像数据
    scanFiles.removeAllImages();

```

## v15新版本扫描库文件

```js

    import { PwyAsyncScanFiles } from '@piaozone.com/scanFiles';

    const asyncScanFiles = new PwyAsyncScanFiles({
        staticUrl: 'http://localhost', // 指定加载扫描仪库文件的根路径
        needRegonizeQr: true, // 开启识别二维码
        uploadUrl: 'uploadUrl', // 上传路径
        locale: 'zh_CN', // 多语言支持，目前只支持en_GB，en_US，es_ES，zh_CN，默认中文
        disabledSortStepUploadStart: true, // 不需要按序执行stepUploadStart
        disabledSortStepUploadFinish: true, // 不需要按序执行stepUploadFinish
        isAutoSelectSource: true, // 是否需要记住上次是扫描源,第二次自动选择
        ifAutoDiscardBlankpages: false // 是否自动丢弃空白页,扫描仪兼容性不太好
    });

    asyncScanFiles.setLocale('zh_CN'); // 也可以通过函数设置修改多语言

    asyncScanFiles.startScan({
        filename: 'file', // 上传文件时指定的formdata file的名称
        data: { // 固定的附加数据
            batchNo: 'batchNo',
            resource: 'resource'
        },
        onProgress: function(fileInfo, loaded, total) { // 上传进度函数
            // fileInfo 对象
            // loaded 上传成功多少字节
            // total 总共多少字节
        },
        addUploadProgress: async (fileInfo) => {
            // 按序返回文件对象
        },
        stepUploadStart: async(item) => { // 上传前的控制，qrcodeResult为识别识别二维码时的内容，没有识别出来返回为空字符串，返回值otherData用于上传时的动态参数控制
            if (item.qrcodeResult !== '') {
                return {
                    errcode: '0000',
                    stopStepUpload: true,
                    qrcodeResult: item.qrcodeResult
                };
            } else {
                return {
                    errcode: '0000',
                    otherData: { // 需要上传时添加的数据
                        qrcodeResult: 'test'
                    }
                };
            }
        },
        stepUploadFinish: (res, fileInfo) => { // 每一步上传处理完成后的回调
            console.log(fileInfo.index + ', res', res);
        },
        uploadFinish: (res) => { // 全部上传完成后的回调
            // errcde为0000，表示扫描过程中扫描仪未出现异常，否则可能出现了异常
            // {errcode: '0000', data: { imagesNum, howManyImagesInBuffer, startHowManyImagesInBuffer}, description: ''};
            console.log('处理完成');
        }
    });

    // 单个文件通过扫描仪上传
    const fileInfo = {
        index: '',
        name: ''
    };

    const otherData = {}; // 上传时的额外数据
    const filename = 'file';
    const res = await scanFiles.uploadFile(fileInfo, otherData, filename);

    // 清理扫描仪图像数据
    scanFiles.removeAllImages();
    // isAutoSelectSource:true时,会在启动扫描之后保存 sourceIndex, scanSources 到localstorage
    // sourceIndex 选择的扫描仪列表下标
    // scanSources 所有扫描仪的名称列表
```
### 检测是否安装Dynamsoft Service
> 如果未安装 **Dynamsoft Service** Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady')就会
> 失败不会进入到回调函数,利用这个特性判断是否安装了软件。
加入以下代码,如果用户关闭安装提示,第二次再启动扫描时,依旧可以启动二次检测,提示安装。
``` javascript
    if (!localStorage['isInstallService'] && window.Dynamsoft) {
        window.Dynamsoft.WebTwainEnv.Unload();
        window.Dynamsoft.WebTwainEnv.Load(); // 重新加载配置
        return {errcode: 'initError', description: this.localeDict.initFail};
    }
```

## License

MIT
