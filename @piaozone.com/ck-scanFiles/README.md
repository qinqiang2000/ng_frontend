# @piaozone.com/ck-scanfiles  
> 用来处理睿琪扫描仪sdk,基础api与 `@piaozone.com/scanFiles` 相同.需要自己实现弹窗UI,参考`./tpl/selectSourcePanel.js`  

## 更新日志

**2022-03-04**
升级至v2.0.9 
1. 【新增】 **`options.queryDelay`** 查询扫描仪扫描文件结果定时器 timer delay ，默认为1000ms。 
2. 【新增】 **`options.checkDelay`** 获取文件内容定时器 timer2 delay ，默认为1000ms。 
3. 【新增】睿琪安装包JsScanner.msi，静态资源路径为`/static/gallery/scanner-ruizhen/v3/JsScanner.msi` 

**2021-12-20**
升级至v2.0.1。
1. 睿琪sdk api 废弃`websocket`改为`http`。
2. 【新增】异步扫描，支持实时获取扫描完成的图像。
3. 【新增】过滤空白页配置。
4. 【新增】睿琪安装包JsScanner.msi，静态资源路径为`/static/gallery/scanner-ruizhen/v2/JsScanner.msi`


**2021-11-25**  
1. 【新增】 `scannerSetting`，可以动态配置扫描仪参数。
- 修复 `option` 为 0 ，参数错误的情况 
```javascript
    // 不必每个都传，修改哪个传哪个
    this.scanFiles.scannerSetting({
        color: 0,
        format: 'jpg',
        resolution: 300
    });
```

**2021-05-11**  
1. 优化未安装客户端逻辑,在`uploadFinish`回调中可以通过`res.data`拿到下载链接,处理下载。  

**2021-05-10**  
1. 处理初始化时上传文件额外参数`data`和`stepUploadStart`callback参数`otherData`,合并到`formdata`。  

**2021-05-07**  
1. 修复单双面扫描切换不生效的问题。  


## 安装
```bash
    npm install @piaozone.com/ck-scanfiles --registry=http://172.18.1.117:7001 -S
```  
## 更新
```bash
    npm update @piaozone.com/ck-scanfiles --registry=http://172.18.1.117:7001 -S
```

## 使用方法
引入文件
```js
    import CkScanFile from '@piaozone.com/ck-scanfiles';
    const ck = new CkScanFile(options); // 构造函数options
```
### 初始化Options
- **staticUrl**   静态资源域名地址  
- **scanFileStaticJs**    动态加载的js文件  
- **downloadUrl** JsScannr.msi 下载地址
- **needRegonizeQr** 暂未处理,默认`false`; TODO  
- **uploadUrl**   扫描文件上传接口地址.  
- **headers**  上传接口需要的配置的自定义header  
- **locale**  国际化,默认`en-US`; TODO  
- **limit**   文件上传并发数,默认为3  
- **ifDuplexEnabled** 是否双面扫描,睿琪sdk不支持.默认`false`.   
- **isAutoSelectSource** 是否自动选择扫描源,依据`localStorage['scanSources']`使用代码进行切换  

### 开始扫描(StartScan)
```js
    ck.startScan(options); // 扫描参数
```
#### Options
- **filename** formData的`file`字段名  
- **data**    额外数据  
- **onConnected**  
当websocket连接成功时,可以从这里获取`localStorage['scanSources']`.处理显示选择扫描源弹窗UI的逻辑.  
```js
    onConnected(sources){
        console.log('扫描源', sources);
        this.setState({ showModal: true, sources: localStorage['scanSources'] });
    }
```
- **addUploadProgress(fileInfo)**   文件上传之前的操作  
- **stepUploadStart(fileInfo)**     开始上传 
    - `otherData`,动态额外数据. 会与`data`进行合并,同名属性会覆盖,以`otherData`为准。
- **stepUploadFinish(res, fileInfo, otherData)**    单个上传完成  
    res: 文件上传接口返回结果.  
    
- **uploadFinish**        全部上传完成  
>onError 也会调用 this.uploadFinish,抛出错误.
- response.errcode 错误代码  
    - response.description 错误描述  
    >errcode:0002,表示未安装JsScanner.msi客户端.页面可给出相关提示.
```js
    const fileInfo = {
        name: filename, // 文件名
        index: this.fileIndex, // 文件下标
        status: 'init', // 状态
        id: fileUid, // 文件uid
        errcode: '0000',
        description: 'success',
        file: file, // 文件数据
        localUrl: 'data:image/jpg;base64,' + base64str, // 本地预览url
        qrcodeResult: '' // 二维码识别结果
    }
```
参考 @piaozone.com/scanFiles


## 其他api参考 @piaozone.com/scanFiles

## 弹窗处理
引入 selectSourcePanel.js
```js
    import SelectSourcePanel from './selectSourcePanel.js';
    import CkScanFile from '@piaozone.com/ck-scanfiles';
    //...
    componentDidMount(){
        this.scanFile = new CkScanFile({
            //...
            onConnected: () => {
                const sources = JSON.parse(localStorage['scanSources']);
                this.setState({ isRzShow: true, scannerSource: sources });
            },
            onError: ({ errcode, description }) => {
                message.warning(`${description}[${errcode}]`);
            }
        });
    }
    onScan(){
        this.scanFile.startScan({

        })
    }
    //render部分
    onStartScan(prdname, sourceIndex){
        prdname = prdname || this.scanFiles.scannerSources[0];
        localStorage['sourceIndex'] = sourceIndex;
        this.scanFile.AcquireImage();
    }
    render(){
        (
            this.state.isRzShow ? (
                <SelectSourcePanel 
                sources={scannerSource}
                isVisible={isRzShow} 
                onHide={() => this.setState({ isRzShow: false })} 
                onOk={this.onStartScan}/>)
             : null
        )
        
    }
```

## 依赖
- `@piaozone.com/utils`

## JsScanner websocket接口
> JsScanner.min.js的方法都挂载在全局window下.经过二次封装到`./src/JsScanner.js`中.
**CreateConnection** 创建websocket连接  

**GetSources** 获取扫描源数组  

**Acquire** 获取扫描仪图像  

**GetFile** 获取文件数据,默认是base64.`@piaozone.com/ck-scanfiles`已将其转为`File`对象.  

**GetProductVersion** 获取JsScanner.msi的版本号
