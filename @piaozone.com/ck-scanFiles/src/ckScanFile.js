import JsScannerSdk from './JsScanner';
import { mapLimit } from 'async';
import { tools, pwyFetch, loadJs } from '@piaozone.com/utils';
import { compressImgFile } from '@piaozone.com/process-image';

const { syncUse } = loadJs;

class CkScanFile {
    constructor(opt) {
        this.options = opt;
        this.duplex = opt.duplex || 0; // 1双面,0单面
        this.color = opt.color || 1; // 1: 灰度; 0:B&W 2:彩色
        this.resolution = opt.resolution || 300; // 100,150,200,300
        this.format = opt.format || 'jpg'; // bmp,jpg,tiff,png,pdf
        this.staticUrl = opt.staticUrl || '';
        this.needRegonizeQr = opt.needRegonizeQr || false;
        this.uploadUrl = opt.uploadUrl;
        this.headers = opt.headers;
        this.locale = opt.locale;
        this.limit = opt.limit || 2;
        this.ifDuplexEnabled = opt.ifDuplexEnabled; // 过滤空白页
        this.version = opt.version;
        this.isAutoSelectSource = opt.isAutoSelectSource;
        this.debug = opt.debug || false;
        this.qureyDelay = opt.qureyDelay || 1000; // 轮询异步扫描结果
        this.checkDelay = opt.checkDelay || 1000; // 轮询checkFile
        this.scanner = null;
        this.connectStatus = null;
        this.scannerSources = [];
        this.fileInfo = {};
        this.filename = ''; // formdata中File的name
        this.data = null; // formdata处理额外的上传数据.
        this.fileIndex = -1;
        this.fileList = [];
        this.totalFiles = 0;
        this.fileIds = [];
        this.scanFileStaticJs = opt.scanFileStaticJs || [
            `${this.staticUrl}/static/gallery/scanner-ruizhen/JsScanner-min.js`
        ];
        this.scannerApiUrl = opt.scannerApiUrl || 'http://127.0.0.1:25972/jsscaner/api/v1/command'; //扫描仪sdk请求地址

        // 软件下载地址
        this.downloadUrl = opt.downloadUrl || `${this.staticUrl}/static/gallery/scanner-ruizhen/JsScanner.msi`;
        this.socketUrl = ''; // socket连接地址
        this.needRegonizeQr = opt.needRegonizeQr; // 通知需要识别二维码，加载相关库文件
        this.onError = opt.onError;
        this.isSync = opt.isSync || false; // 是否同步扫描？

        this.hasUploadCount = 0; // 已上传张数
        this.timer = null; //异步定时器
        this.timer2 = null; //
        this.asyncPathsMap = new Map();
        this.hasFinished = 0; // 2次Status=2才确认扫描完成，此时清除之前的map image数据
        this.mermoryFilePaths = []; // 采集的文件path
        this.totalImages = 0; //
        this.curIndex = 0; //
        this.processFile = [];
        this.isNext = true;
        this.isContinue = true;
        // this.noResponseFiles = []; // 异常请求数据（待后续上传插入）

        const compressOpt = {};
        if (opt.fileQuality) {
            compressOpt.fileQuality = opt.fileQuality;
        }

        if (opt.fileLimitWidth) {
            compressOpt.fileLimitWidth = opt.fileLimitWidth;
        }

        if (opt.fileLimitHeight) {
            compressOpt.fileLimitHeight = opt.fileLimitHeight;
        }

        if (opt.fileLimitPixel) {
            compressOpt.fileLimitPixel = opt.fileLimitPixel;
        }

        if (opt.fileLimitSize) {
            compressOpt.fileLimitSize = opt.fileLimitSize;
        }

        this.compressOpt = compressOpt;

        if (this.needRegonizeQr) {
            this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
        }
    }
    startScan = async (options) => {
        const { data = {}, ...otherOpt } = options;
        const {
            redirectUpload,
            filename = 'file',
            sourceInfo = { sourceName: '', sourceIndex: 0 },
            addUploadProgress = function () {},
            stepUploadStart = function () {},
            stepUploadFinish = function () {},
            uploadFinish = function () {},
            onConnected = function () {}
        } = otherOpt;

        this.sourceInfo = sourceInfo; // 扫描源信息,sourceName,sourceIndex
        this.filename = filename;
        this.onConnected = onConnected;
        this.addUploadProgress = addUploadProgress;
        this.stepUploadStart = stepUploadStart;
        this.stepUploadFinish = stepUploadFinish;
        this.uploadFinish = uploadFinish;
        this.data = data;

        // 初始化sdk
        let scannerOptions = {
            API_URL: this.scannerApiUrl
        }
        this.scanner = new JsScannerSdk(scannerOptions);
        const { sourceName } = this.sourceInfo;
        let syncCallBackParams = {};
        let sourceCallbackParams = {};
        if (sourceName) {
            this.AcquireSync(sourceName, syncCallBackParams);
        } else {
            this.GetDataSources(sourceCallbackParams);
            // 未指定扫描源错误
            // this.uploadFinish({ errcode: '1405', description: '扫描异常' });
        }
    };

    GetDataSources = (otherParams) => {
        this.scanner.GetDataSources(this.onGetSourcesCompleted, otherParams);
    }

    onGetSourcesCompleted = (json, params) => {
        if(json.ErrorCode != 0){
            this.onScanError(json); // 抛出异常
            return;
        }
        // 第一次点击
        this.scannerSources = json.Sources;
        // 如果只有一个扫描仪,自动选择.直接开始扫描
        if (json.Sources.length == 1) {
            this.AcquireSync(json.Sources[0]);
        }
        this.onConnected(this.scannerSources);
        this.debug && console.log('GetSourcesCompleted', json.Sources);
    }

    AcquireSync = (prdName, otherParams) => {
        // 同步扫描
        const isBlank = this.ifDuplexEnabled ? 1 : 0;
        if(this.isSync){
            this.scanner.AcquireSync(prdName, this.duplex, this.color, this.resolution, this.format, isBlank, this.onAcquireSyncCompleted, otherParams);
        } else { // 异步扫描
            const res = this.scanner.AcquireAsync(prdName, this.duplex, this.color, this.resolution, this.format, isBlank);
            this.hasUploadCount = 0;
            this.asyncPathsMap.clear();
            this.totalImages = 0;
            if(res.ErrorCode != 0){
                this.onScanError(res); // 抛出异常
                return;
            }
            if(res.Guid){
                this.timer = setInterval(() => {
                    this.QueryResult(res.Guid);
                }, this.qureyDelay);
                this.timer2 = setInterval(async () => {
                    this.checkFile(res.Guid);
                }, this.checkDelay);
            }
        }
    }

    onAcquireSyncCompleted = async (json, otherParams) => {
        if(json.ErrorCode != 0){
            this.onScanError(json); // 抛出异常
            return;
        }
        // 第一次点击
        this.totalFiles = json.Paths.length;
        this.otherParams = null;
        for (let i = 0, len = json.Paths.length; i < len; i++) {
            await this.GetFileSync(json.Paths[i], otherParams);
        }
    }

    GetFileSync = (path, otherParams) => {
        return new Promise((resolve, reject) => {
            this.scanner.GetFileSync(path, (json, otherParams) => {
                if (json.ErrorCode !== 0) {
                    // 抛出异常
                    this.onScanError(json);
                    return;
                }
                this.fileIndex++;
                // 转换完成
                let base64str = json.Base64String;
                const fileUid = this.getUUId();
                const filename = fileUid + '-' + this.fileIndex + '.jpg';
                const file = this.base64ToFile(base64str, filename);
                const fileInfo = {
                    name: filename,
                    index: this.fileIndex,
                    status: 'init',
                    id: fileUid,
                    errcode: '0000',
                    description: 'success',
                    file: file,
                    localUrl: 'data:image/jpg;base64,' + base64str,
                    qrcodeResult: ''
                };
                this.fileList.push(fileInfo);
                this.fileIds.push(fileUid); // 记录文件id
                if (typeof this.addUploadProgress === 'function') {
                    this.addUploadProgress(fileInfo);
                }
                // 文件全部转换完成-同步
                if (this.fileIndex == this.totalFiles - 1) {
                    this.handleStepUploadStart();
                }
                resolve();
            }, otherParams);
        })
    }

    QueryResult = async (guid) => {
        const res = this.scanner.QueryResult(guid);
        const { Status, Files, Data } = res;

        if(this.isNext && Files.length){
            // console.log('this.curIndex-before', this.curIndex);
            // console.log('Files-before', Files);
            this.processFile = Files.slice(this.curIndex);
            this.curIndex += this.processFile.length;
            this.isNext = false;
            // console.log('this.curIndex-after', this.curIndex);
            // console.log('this.processFile', this.processFile);
        }
        if (Status == 2) { // 全部扫描完成
            // 总数
            console.log('已上传张数, 总文件数Files', this.hasUploadCount, Files.length);
            this.totalImages = Files.length;
            this.mermoryFilePaths = Files;
            // 缺纸 {"Status":2,"Format":"jpg","Files":[],"Data":{"Paths":[],"ErrorCode":7,"ErrorType":2,"ErrorDescription":"This data source cannot open","Command":"Acquire"}}
            // 卡纸 {"Status":2,"Format":"jpg","Files":[],"Data":{"Paths":null,"ErrorCode":10,"ErrorType":2,"ErrorDescription":"Scan process shut down by unknown error","Command":"Unknown"}}
            clearInterval(this.timer);
            if (Data) {
                if (Data.ErrorCode == 7) {
                    this.scanErrorDescription = '扫描仪缺纸，请检查！';
                } else if (Data.ErrorCode == 10) {
                    this.scanErrorDescription = '扫描仪卡纸，请检查！';
                }
            }
        }
    }

    checkFile = async (guid) => {
        if(this.isContinue && this.curIndex < this.mermoryFilePaths.length){
            this.processFile = this.mermoryFilePaths.slice(this.curIndex);
            this.curIndex += this.processFile.length;
        }
        if((this.totalImages != 0 && this.hasUploadCount >= this.totalImages) || (this.scanErrorDescription && this.hasUploadCount >= this.totalImages)) {
            clearInterval(this.timer2);
            try {
                this.uploadFinish({
                    errcode: this.scanErrorDescription ? '5000' : '0000',
                    description: this.scanErrorDescription || 'success',
                    data: {
                        imagesNum: this.hasUploadCount
                    }
                });
            } catch (err) {
                console.warn(err);
            }
            this.hasUploadCount = 0;
            this.asyncPathsMap.clear();
            this.processFile = [];
            this.isNext = true;
            this.curIndex = 0;
            this.mermoryFilePaths = [];
            this.scanErrorDescription = '';
            this.scanner.DeleteAcquireFiles(guid);
            console.log('全部上传完成,重置部分数据');
            return;
        }
        if(this.processFile.length && this.isContinue){
            this.isContinue = false;
            let curIndex = 0;
            const stepGetFile = async (curIndex) => {
                try {
                    const res = await this.AwaitGetFileAsyncByPath(guid, this.processFile[curIndex]);
                    if (res.ErrorCode !== 0) {
                        // 抛出异常
                        this.onScanError(res);
                        return;
                    }
                    this.fileIndex++;
                    // 转换完成
                    let base64str = res.Base64String;
                    const fileUid = this.getUUId();
                    const filename = fileUid + '-' + this.fileIndex + '.jpg';
                    const file = this.base64ToFile(base64str, filename);
                    const fileInfo = {
                        name: filename,
                        index: this.fileIndex,
                        status: 'init',
                        id: fileUid,
                        errcode: '0000',
                        description: 'success',
                        file: file,
                        localUrl: 'data:image/jpg;base64,' + base64str,
                        qrcodeResult: ''
                    };
                    // 异步
                    await this.handleAsyncUpload(fileInfo, this.processFile[curIndex]);
                    // console.log('上传完成');
                    curIndex++;
                    if (curIndex < this.processFile.length) {
                        stepGetFile(curIndex);
                    } else {
                        this.isNext = true;
                        this.isContinue = true;
                    }
                } catch(error){
                    console.error('上传错误，sdk无响应', error);
                    // 重试一次，记录未上传成功的path和index。后续进行插入。
                    // this.noResponseFiles.push({
                    //     index: curIndex,
                    //     filePath: this.processFile[curIndex],
                    //     guid: '',
                    // });
                    if (curIndex < this.processFile.length) {
                        stepGetFile(curIndex);
                    } else {
                        this.isNext = true;
                        this.isContinue = true;
                    }
                }
            }
            stepGetFile(curIndex);
        }
    }

    AwaitGetFileAsyncByPath = (guid, key) => {
        return new Promise((resolve, reject) => {
            const fileRes = this.scanner.GetFileAsyncByPath(guid, key);
            resolve(fileRes);
        });
    }

    initScanner = () => {
        return new Promise((resolve) => {
            if (window.CreateConnection) {
                // 加载成功
                resolve({ errcode: '0000', description: 'success' });
            } else {
                if (this.scanFileStaticJs.length == 0) {
                    resolve({ errcode: '1404', description: '缺少JsScanner.min.js文件' });
                }
                syncUse(this.scanFileStaticJs, () => {
                    if (window.CreateConnection) {
                        resolve({ errcode: '0000', description: 'success' });
                    } else {
                        resolve({ errcode: 'initError', description: 'initial fail' });
                    }
                });
            }
        });
    };
    // 获取扫描仪驱动完成
    GetSourcesCompleted = (json) => {
        if (json.ErrorCode !== 0) {
            this.onScanError(json); // 抛出异常
            return;
        }
        // 第一次点击
        this.scannerSources = json.Sources;
        // 如果只有一个扫描仪,自动选择.直接开始扫描
        if (json.Sources.length == 1) {
            this.scanner.Acquire(json.Sources[0], this.duplex, this.color, this.resolution, this.format);
        }
        this.onConnected(this.scannerSources);
        this.debug && console.log('GetSourcesCompleted', json.Sources);
    };
    AcquireDataCompleted = (json) => {
        if (json.ErrorCode !== 0) {
            // 抛出异常
            this.onScanError(json);
            return;
        }
        this.totalFiles = json.Paths.length;
        for (let i = 0, len = json.Paths.length; i < len; i++) {
            this.scanner.GetFile(json.Paths[i]);
        }
        this.debug && console.log('AcquireDataCompleted', json.Paths);
    };

    GetAsyncFileCompleted = (json, otherParams) => {
        return new Promise(async (resolve, reject) => {
            if (json.ErrorCode !== 0) {
                // 抛出异常
                this.onScanError(json);
                return;
            }
            this.fileIndex++;
            // 转换完成
            let base64str = json.Base64String;
            const fileUid = this.getUUId();
            const filename = fileUid + '-' + this.fileIndex + '.jpg';
            const file = this.base64ToFile(base64str, filename);
            const fileInfo = {
                name: filename,
                index: this.fileIndex,
                status: 'init',
                id: fileUid,
                errcode: '0000',
                description: 'success',
                file: file,
                localUrl: 'data:image/jpg;base64,' + base64str,
                qrcodeResult: ''
            };
             // 异步
            const { filePath } = otherParams;
            if(this.asyncPathsMap.has(filePath) && this.asyncPathsMap.get(filePath) == 0){
                this.asyncPathsMap.set(filePath, 1); // 待上传
                await this.handleAsyncUpload(fileInfo, filePath);
                resolve();
            }
        });
    }

    GetFileCompleted = async (json, otherParams) => {
        if (json.ErrorCode !== 0) {
            // 抛出异常
            this.onScanError(json);
            return;
        }
        this.fileIndex++;
        // 转换完成
        let base64str = json.Base64String;
        const fileUid = this.getUUId();
        const filename = fileUid + '-' + this.fileIndex + '.jpg';
        const file = this.base64ToFile(base64str, filename);
        const fileInfo = {
            name: filename,
            index: this.fileIndex,
            status: 'init',
            id: fileUid,
            errcode: '0000',
            description: 'success',
            file: file,
            localUrl: 'data:image/jpg;base64,' + base64str,
            qrcodeResult: ''
        };
        // 同步
        if(this.isSync){
            this.fileList.push(fileInfo);
            this.fileIds.push(fileUid); // 记录文件id
            if (typeof this.addUploadProgress === 'function') {
                this.addUploadProgress(fileInfo);
            }
            // 文件全部转换完成-同步
            if (this.fileIndex == this.totalFiles - 1) {
                this.handleStepUploadStart();
            }
        } else { // 异步
            const { filePath } = otherParams;
            if(this.asyncPathsMap.has(filePath) && this.asyncPathsMap.get(filePath) == 0){
                this.asyncPathsMap.set(filePath, 1); // 待上传
                await this.handleAsyncUpload(fileInfo, filePath);
            }
        }
    };
    GetVersionCompleted = (version) => {
        // console.log('JsScanner-version', version);
        return version;
    };
    setDuplexEnabled = (isEnable) => {
        if (isEnable) {
            this.ifDuplexEnabled = true;
            this.duplex = 1;
        } else {
            this.ifDuplexEnabled = false;
            this.duplex = 0;
        }
    };
    setQrcodeRecognize = (isEnable) => {
        // 防止报错,实际上二维码不进行二维码识别.
        this.needRegonizeQr = isEnable;
    };
    setDiscardBlankpages = () => {
        // 丢弃空白页
        return false;
    };
    scannerSetting = (options) => { // 设置扫描参数
        const { color, resolution, format } = options;
        this.color = color ?? this.color;
        this.resolution = resolution ?? this.resolution;
        this.format = format ?? this.format;
    };
    getUUId = () => {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    };
    base64ToFile = (base64str, filename) => {
        const blob = this.dataURLtoBlob(base64str);
        let upFile = tools.blobToFile(blob, filename);
        if (upFile) {
            return upFile;
        }
        return this.blobToFile(blob, filename);
    };
    dataURLtoBlob = (dataurl) => {
        var bstr = window.atob(dataurl);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: 'image/jpeg' });
    };

    blobToFile = (theBlob, fileName) => {
        const date = new Date();
        theBlob.lastModified = date.getTime();
        theBlob.lastModifiedDate = date;
        theBlob.name = fileName;
        return theBlob;
    };

    handleAsyncUpload = (item, filePath) => { // 异步扫描上传
        console.log('handleAsyncUpload');
        return new Promise(async (resolve, reject) => {
            let uploadEnable = true;
            let preRes = {};
            await this.addUploadProgress(item);
            try {
                preRes = (await this.stepUploadStart(item)) || {};
                this.debug && console.log('stepUploadStart', preRes);
            } catch (error) {
                console.error('stepUploadStart处理失败：', error);
            }
            if (uploadEnable) {
                const res = await this.handlerUpload(preRes, item);
                if (preRes.otherData && preRes.otherData.stopStepUpload) {
                    uploadEnable = false;
                }
                if (res) {
                    await this.handlerStepUploadFinish(res, item, preRes);
                }
                console.log('当前上传成功', this.hasUploadCount);
                // this.asyncPathsMap.set(filePath, 1);
                this.hasUploadCount++;
                resolve();
            }
        });
    }

    handleStepUploadStart = () => {
        let uploadEnable = true;
        this.debug && console.log('fileList', this.fileList);
        mapLimit(
            this.fileList,
            this.limit,
            async (item, callback) => {
                let preRes = {};
                try {
                    preRes = (await this.stepUploadStart(item)) || {};
                    this.debug && console.log('stepUploadStart', preRes);
                } catch (error) {
                    console.error('stepUploadStart处理失败：', error);
                }
                if (uploadEnable) {
                    const res = await this.handlerUpload(preRes, item);
                    if (preRes.otherData && preRes.otherData.stopStepUpload) {
                        uploadEnable = false;
                    }
                    if (res) {
                        await this.handlerStepUploadFinish(res, item, preRes);
                    }
                }
                // 排除已经上传的id
                const _index = this.fileIds.findIndex((itm) => itm == item.id);
                this.fileIds.splice(_index, 1);
                if (this.fileIds.length == 0) {
                    try {
                        this.uploadFinish({
                            errcode: '0000',
                            description: 'success',
                            data: {
                                imagesNum: this.fileList.length
                            }
                        });
                    } catch (err) {
                        console.warn(err);
                    }
                    this.fileIndex = -1;
                    this.fileList = [];
                    console.log('全部上传完成,重置部分数据');
                }
                callback(null, {});
            },
            (err) => {
                console.log('扫描仪并发上传错误：', err);
            }
        );
    };

    handlerUpload = async (preRes, item) => {
        const formData = new FormData();
        const res = await compressImgFile(item.file, this.compressOpt);
        let curFile = item.file;
        if (res.errcode === '0000') {
            curFile = res.file;
        }
        // 第三个参数指定filename,在ie11浏览器中,不指定会默认为blob,不带后缀名在eggjs上传时会报错
        formData.append(this.filename, curFile, item.file.name);
        // 将this.data与otherData合并.
        const extraData = Object.assign(this.data, preRes.otherData);
        if (extraData) {
            for (const key in extraData) {
                if (Object.hasOwnProperty.call(extraData, key)) {
                    const element = extraData[key];
                    formData.append(key, element);
                }
            }
        }
        const requestParam = {
            method: 'post',
            data: formData,
            contentType: 'file',
            headers: this.headers
        };
        return new Promise(async (resolve, reject) => {
            const res = await pwyFetch(this.uploadUrl, requestParam);
            resolve(res);
        });
    };
    handlerStepUploadFinish = async (res, item, preRes) => {
        const { otherData = {} } = preRes;
        try {
            await this.stepUploadFinish(res, item, otherData);
            // 上传完成
        } catch (error) {
            console.error('stepUploadFinish处理失败：', error);
        }
    };
    AcquireImage = (sourceName) => {
        const isBlank = this.ifDuplexEnabled ? 1 : 0;
        if(this.isSync){
            this.scanner.AcquireSync(sourceName, this.duplex, this.color, this.resolution, this.format, isBlank, this.onAcquireSyncCompleted, null);
        } else {
            const res = this.scanner.AcquireAsync(sourceName, this.duplex, this.color, this.resolution, this.format, isBlank);
            this.hasUploadCount = 0;
            this.totalImages = 0;
            this.asyncPathsMap.clear();
            if(res.ErrorCode != 0){
                this.onScanError(res); // 抛出异常
                return;
            }
            if(res.Guid){
                this.timer = setInterval(() => {
                    this.QueryResult(res.Guid);
                }, this.qureyDelay);
                this.timer2 = setInterval(async () => {
                    this.checkFile(res.Guid);
                }, this.checkDelay);
            }
        }
    };
    onScanError = (json) => {
        let errorInfo = {
            errcode: json.ErrorCode,
            description: json.ErrorDescription,
            data: json.data || ''
        };
        if(json.ErrorCode == '4000'){
            errorInfo['errcode'] = '0002';
            errorInfo['description'] = '请先安装JsScanner.msi程序';
            errorInfo['data'] = this.downloadUrl;
        }
        const { errcode, description, data } = errorInfo;
        if (typeof this.uploadFinish == 'function') {
            this.uploadFinish({ errcode, description, data });
        } else {
            this.onError({ errcode, description });
        }
    };
    getSources = () => {
        // 获取扫描仪来源
        const sources = JSON.parse(localStorage['scanSources']);
        if (sources) {
            return sources;
        }
        return [];
        //ws未连接
        // if (this.connectStatus != 1) {
        //     this.scanner = new JsScannerSdk();
        //     this.scanner.CreateConnection();
        //     const timer = setInterval(() => {
        //         if (this.connectStatus == 1) {
        //             clearInterval(timer);
        //             return this.scannerSources;
        //         }
        //     }, 500);
        // } else {
        //     this.scanner.GetDataSources();
        // }
    };
}

export default CkScanFile;
