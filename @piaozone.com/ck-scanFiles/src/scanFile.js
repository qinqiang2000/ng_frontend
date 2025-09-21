import moment from 'moment';
import JsScannerSdk from './JsScanner';
import { tools, pwyFetch } from '@piaozone.com/utils';
import { compressImgFile } from '@piaozone.com/process-image';
import async from 'async';
import { showSelectSource, showDownloadMsi } from './controlDialogBox';
class ScanFile {
    constructor(opt) {
        this.versionMajor = 1;
        this.versionMinor = 4;
        this.version = `${this.versionMajor}.${this.versionMinor}`;
        this.disabledClearFiles = opt.disabledClearFiles || false;
        this.setScanParam(opt);
        this.initScan(opt);
    }

    initScan = (opt) => {
        this.data = opt.data || {};
        this.sourceName = '';
        this.staticUrl = opt.staticUrl || '';
        this.needRegonizeQr = opt.needRegonizeQr || false;
        this.uploadUrl = opt.uploadUrl;
        this.headers = opt.headers;
        this.locale = opt.locale;
        this.limit = opt.limit || 2;
        this.debug = opt.debug || false;
        this.queryDelay = opt.queryDelay || 1000; // 轮询异步扫描结果
        this.scanFileStaticJs = opt.scanFileStaticJs || [
            `${this.staticUrl}/static/gallery/scanner-ruizhen/JsScanner-min.js`
        ];
        this.scannerApiUrl = opt.scannerApiUrl || 'http://127.0.0.1:25972/jsscaner/api/v1/command'; //扫描仪sdk请求地址
        // 软件下载地址
        this.downloadUrl = opt.downloadUrl || `${this.staticUrl}/static/gallery/scanner-ruizhen/JsScanner.msi`;
        this.onError = opt.onError || function() {};
        this.setCompressOpt(opt);

        if (this.needRegonizeQr) {
            this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
        }

        this.scanner = new JsScannerSdk({
            API_URL: this.scannerApiUrl
        });
    }

    // 设置压缩相关参数
    setCompressOpt = (opt) => {
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
    }

    // 设置扫描相关参数
    setScanParam(opt = {}) {
        this.duplex = opt.duplex || this.duplex || 0; // 1双面, 0单面
        this.color = opt.color || this.color || 2;  // 1: 灰度; 0:B&W 2:彩色
        this.resolution = opt.resolution || this.resolution || 300;  //分辨率 100,150,200,300
        this.format = opt.format || this.format || 'jpg'; // bmp,jpg,tiff,png,pdf
        this.ifDuplexEnabled = opt.ifDuplexEnabled || this.ifDuplexEnabled || false; // 过滤空白页
    }

    // 双面扫描时默认过滤空白页
    setDuplexEnabled = (isEnable, ifDuplexEnabled) => {
        if (isEnable) {
            this.ifDuplexEnabled = typeof ifDuplexEnabled === 'undefined' ? true : ifDuplexEnabled;
            this.duplex = 1;
        } else {
            this.ifDuplexEnabled = typeof ifDuplexEnabled === 'undefined' ? false : ifDuplexEnabled;
            this.duplex = 0;
        }
    }

    // 过滤空白页
    setDiscardBlankpages = (value) => {
        this.ifDuplexEnabled = value;
    }

    setQrcodeRecognize = (isEnable) => {
        // 防止报错,实际上二维码不进行二维码识别.
        this.needRegonizeQr = isEnable;
    }

    resetScan = () => {
        // 一批扫描处理结束控制
        this.handleIsEnd = true;
        // queryResult 结束控制
        this.queryIsEnd = true;
        this.queryResultIsEnd = false;
        this.scannerSources = [];
        this.filename = ''; // formdata中File的name
        if (this.timer) {
            window.clearTimeout(this.timer);
        } else {
            this.timer = null; //异步定时器
        }

        if (!this.disabledClearFiles && this.Guid && this.processFile && this.processFile.length > 0) {
            const guid = this.Guid;
            setTimeout(() => {
                this.scanner.DeleteAcquireFiles(guid);
            }, 1000);
        }

        this.processFile = [];
        this.Guid = '';
        if (this.asyncPathsMap && this.asyncPathsMap.size > 0) {
            this.asyncPathsMap.clear();
        } else {
            this.asyncPathsMap = new Map();
        }
    }

    // 便于继承重写弹出扫描仪源
    showSelectSource = () => {
        showSelectSource({
            scannerSources: this.scannerSources,
            sourceName: this.sourceName,
            onSelect: (newSourceName) => {
                this.sourceName = newSourceName;
            },
            onConfirm: (newSourceName) => {
                this.sourceName = newSourceName;
                this.AcquireSync(newSourceName, {});
            },
            onCancel: async() => {
                this.sourceName = '';
                await this.onScanEnd({
                    errcode: '0000',
                    description: 'success',
                    data: {
                        imagesNum: 0,
                        operateStatus: 'cancelSelectSource' // 取消选择扫描仪
                    }
                });
            }
        });
    }

    showDownloadMsi = (upgradeFlag) => {
        showDownloadMsi({
            downloadUrl: this.downloadUrl,
            upgradeFlag,
            onConfirm: async() => {
                await this.onScanEnd({
                    errcode: '0000',
                    description: 'success',
                    data: {
                        operateStatus: 'confirmDownload', // 确认下载
                        imagesNum: 0
                    }
                });
            },
            onCancel: async() => {
                await this.onScanEnd({
                    errcode: '0000',
                    description: 'success',
                    data: {
                        operateStatus: 'cancelDownload', // 取消下载
                        imagesNum: 0
                    }
                });
            }
        });
    }

    // 用于外部可以直接指定扫描仪源
    setScanSource = (s) => {
        this.sourceName = s;
    }

    // 对外提供获取扫描仪源
    getScanSources = async(fresh) => {
        if (!fresh && this.scannerSources.length > 0) {
            return {
                errcode: '0000',
                description: 'success',
                data: this.scannerSources
            };
        }
        const res = await this.GetDataSources();
        // 需要下载安装包
        if (res.ErrorCode === '4000') {
            this.showDownloadMsi();
            return {
                errcode: '4000',
                description: '未安装jsScanner扫描组件'
            };
        } else if (res.ErrorCode != 0) {
            return {
                errcode: '4000',
                description: res.ErrorDescription || '获取扫描仪异常，请重试'
            };
        }
    }

    checkVersion = async() => {
        let res;
        try {
            res = await this.scanner.GetProductVersion();
        } catch (error) {
            return {
                ErrorCode: '4000',
                ErrorDescription: '扫描仪组件调用异常，请检查是否安装'
            };
        }
        return res;
    }

    startScan = async(options) => {
        this.resetScan(true);
        const { data, ...otherOpt } = options;
        const {
            redirectUpload,
            filename = 'file',
            addUploadProgress = function () {},
            stepUploadStart = function () {},
            stepUploadFinish = function () {},
            uploadFinish = function () {},
            onConnected = function () {}
        } = otherOpt;

        // 可以在扫描时选择修改扫描仪相关参数
        this.setScanParam(otherOpt);

        this.filename = filename;
        this.onConnected = onConnected;
        this.addUploadProgress = addUploadProgress;
        this.stepUploadStart = stepUploadStart;
        this.stepUploadFinish = stepUploadFinish;
        this.uploadFinish = uploadFinish;
        if (!data) {
            this.data = data;
        }

        const sourceName = this.sourceName;

        const resCheck = await this.checkVersion();
        // 未安装
        if (resCheck.ErrorCode === '4000') {
            this.showDownloadMsi();
            return;
        }
        // 调用异常
        if (resCheck.ErrorCode != 0) {
            await this.onScanEnd(resCheck); // 获取扫描仪源异常
            return;
        }

        const { Major, Minor } = resCheck;
        // 需要下载升级
        if (this.versionMajor > Major || (this.versionMajor === Major && this.versionMinor > Minor)) {
            this.showDownloadMsi(true);
            return;
        }

        const res = await this.GetDataSources();
        if (res.ErrorCode != 0) {
            await this.onScanEnd(res); // 获取扫描仪源异常
            return;
        }

        this.scannerSources = res.Sources;
        // 扫描仪获取到为空
        if (this.scannerSources.length === 0) {
            await this.onScanEnd({
                ErrorCode: '30001',
                ErrorDescription: '未获取到扫描仪，请检查扫描仪驱动是否安装'
            });
            return;
        }

        if (this.scannerSources.length === 1) {
            this.sourceName = this.scannerSources[0];
            this.AcquireSync(this.scannerSources[0], {});
            return;
        }

        // 扫描仪源多于1个，当未指定指定的扫描仪，或者指定的不存在时需要重新选择
        if (!sourceName || this.scannerSources.indexOf(sourceName) === -1) {
            this.showSelectSource();
        } else {
            this.AcquireSync(sourceName, {});
        }
    }

    GetDataSources = () => {
        return new Promise((resolve) => {
            this.scanner.GetDataSources((json) => {
                this.debug && console.log('GetSourcesCompleted', json);
                resolve(json);
            }, {});
        });
    }

    getUUId = () => {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }

    dataURLtoBlob = (dataurl) => {
        var bstr = window.atob(dataurl);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: 'image/jpeg' });
    }

    blobToFile = (theBlob, fileName) => {
        const date = new Date();
        theBlob.lastModified = date.getTime();
        theBlob.lastModifiedDate = date;
        theBlob.name = fileName;
        return theBlob;
    }

    base64ToFile = (base64str, filename) => {
        const blob = this.dataURLtoBlob(base64str);
        let upFile = tools.blobToFile(blob, filename);
        if (upFile) {
            return upFile;
        }
        return this.blobToFile(blob, filename);
    }

    handlerUpload = async(preRes, item) => {
        const formData = new FormData();
        const res = await compressImgFile(item.file, this.compressOpt);
        let curFile = item.file;
        if (res.errcode === '0000') {
            curFile = res.file;
        }
        // 第三个参数指定filename,在ie11浏览器中,不指定会默认为blob,不带后缀名在eggjs上传时会报错
        formData.append(this.filename, curFile, item.file.name);
        // 将this.data与otherData合并.
        const extraData = Object.assign(this.data || {}, preRes?.otherData || {});
        if (extraData) {
            for (const key in extraData) {
                if (Object.hasOwnProperty.call(extraData, key)) {
                    const element = extraData[key];
                    formData.append(key, element);
                }
            }
        }
        const operateId = extraData.operateId;
        const operateName = extraData.operateName;
        const requestParam = {
            method: 'post',
            data: formData,
            contentType: 'file',
            headers: { ...this.headers, curtime: moment(new Date()).format('YYYYMMDDHHmmss') }
        };
        const apiUrl = operateName ? `${this.uploadUrl}&operateId=${operateId}&operateName=${operateName}` : this.uploadUrl;
        return new Promise(async (resolve, reject) => {
            pwyFetch(apiUrl, requestParam).then((res) => {
                resolve(res);
            });
        });
    }

    getFileInfo = (fileRes = {}) => {
        const {
            index,
            Base64String = '',
            ErrorDescription,
            ErrorCode
        } = fileRes;
        const fileUid = this.getUUId();
        const filename = fileUid + '-' + index + '.jpg';
        const fileInfo = {
            name: filename,
            index: index,
            status: 'init',
            id: fileUid,
            errcode: '0000',
            description: 'success',
            file: {
                name: filename,
                size: 0
            },
            localUrl: '',
            qrcodeResult: ''
        };

        let errcode = '0000';
        let description = 'success';
        let file;

        // 获取文件异常，直接返回单步回调通知当前扫描仪页数据获取异常信息
        if (ErrorCode != '0') {
            errcode = '5000';
            description = ErrorDescription || '获取扫描仪文件异常';
        } else {
            try {
                file = this.base64ToFile(Base64String, filename);
            } catch (error) {
                console.error('base64ToFile error', error);
                errcode = '5001';
                description = '浏览器不支持，请更换chrome或者高版本浏览器';
            }
        }

        fileInfo.localUrl = 'data:image/jpg;base64,' + Base64String;
        if (file) {
            fileInfo.file = file;
        }
        return {
            errcode,
            description,
            fileInfo
        };
    }

    mapLimitUpload = (arr) => {
        return new Promise((resolve) => {
            async.mapLimit(arr, this.limit, async(filePath, callback) => {
                    const fileRes = this.asyncPathsMap.get(filePath);
                    // 只处理数据已经准备好的
                    if (fileRes && fileRes.status === 'waitUpload') {
                        const res = await this.handlerUpload(fileRes.preRes, fileRes.fileInfo);
                        this.asyncPathsMap.set(filePath, {
                            status: 'uploaded',
                            res,
                            fileInfo: fileRes.fileInfo,
                            preRes: fileRes.preRes
                        });
                    }
                    callback(null, {});
                }, (err) => {
                    if (err) {
                        console.error('mapLimitUpload error', err);
                    }
                    resolve({ errcode: '0000', description: 'success' });
                }
            );
        });
    }

    handlePreUploadBySort = async(arr) => {
        for (let i = 0; i < arr.length; i++) {
            const filePath = arr[i];
            const fileRes = this.asyncPathsMap.get(filePath);
            if (!fileRes) {
                break;
            }

            if (fileRes.status === 'waiting') {
                const fileInfoRes = this.getFileInfo(fileRes);
                const { errcode, description, fileInfo } = fileInfoRes;
                if (typeof this.addUploadProgress === 'function') {
                    try {
                        await this.addUploadProgress(fileInfo);
                    } catch (error) {
                        console.error('addUploadProgress error', fileInfo, error);
                    }

                }
                if (errcode !== '0000') {
                    this.asyncPathsMap.set(filePath, {
                        status: 'uploaded',
                        res: {
                            errcode,
                            description
                        },
                        fileInfo,
                        preRes: {}
                    });
                    return;
                }

                let uploadEnable = true;
                let preRes = {};
                try {
                    preRes = await this.stepUploadStart(fileInfo);
                } catch (error) {
                    preRes = {};
                    console.error('stepUploadStart处理失败：', error);
                }

                // 允许回调控制本次是否需要上传到后台，并且可以根据当前文件信息返回额外的上传参数
                if (preRes && preRes.stopStepUpload) {
                    uploadEnable = false;
                } else if (preRes && preRes.otherData && preRes.otherData.stopStepUpload) {
                    uploadEnable = false;
                }

                // 不需要上传, 直接回调本次结束函数
                if (!uploadEnable) {
                    this.asyncPathsMap.set(filePath, {
                        status: 'uploaded',
                        res: {
                            errcode: '0000',
                            description: 'success'
                        },
                        fileInfo,
                        preRes
                    });
                    return;
                }
                this.asyncPathsMap.set(filePath, {
                    status: 'waitUpload',
                    fileInfo,
                    preRes
                });
            }
        }
    }


    handlerStepUploadFinishBySort = async(arr) => {
        for (let i = 0; i < arr.length; i++) {
            const filePath = arr[i];
            const fileRes = this.asyncPathsMap.get(filePath);
            if (!fileRes) {
                break;
            } else if (fileRes.status === 'done') {
                continue;
            } else if (fileRes.status !== 'uploaded') {
                break;
            }
            const { otherData = {} } = fileRes.preRes || {};
            try {
                await this.stepUploadFinish(fileRes.res, fileRes.fileInfo, otherData);
                // 上传完成
            } catch (error) {
                console.error('stepUploadFinish处理失败：', error);
            }
            this.asyncPathsMap.set(filePath, {
                status: 'done'
            });
        }
    }

    // 处理已经扫描的文件
    handleScanedFiles = async(errInfo = {}) => {
        const arr = this.processFile;
        await this.handlePreUploadBySort(arr);
        await this.mapLimitUpload(arr);
        await this.handlerStepUploadFinishBySort(arr);
        let curArrIsAllDone = true;
        for (let i = 0; i < arr.length; i++) {
            const curPath = arr[i];
            const fileRes = this.asyncPathsMap.get(curPath);
            // 文件不存在，为了保持有序，直接退出不处理后续的记录，等待下一次进入再处理
            if (!fileRes || fileRes.status !== 'done') {
                curArrIsAllDone = false;
                break;
            }
        }

        // QueryResult正常结束，是最后的一次处理
        if (this.queryIsEnd && curArrIsAllDone) {
            this.handleIsEnd = true;
            window.clearTimeout(this.timer);
            await this.onScanEnd({
                errcode: errInfo.errcode || '0000',
                description: errInfo.description || 'success',
                data: {
                    imagesNum: arr.length
                }
            });
        }
    }

    getFileAsyncByPath = (guid, filePath, retry = 0) => {
        let fileRes = {};
        try {
            fileRes = this.scanner.GetFileAsyncByPath(guid, filePath);
        } catch (error) {
            // 重试三次
            if (retry >= 2) {
                console.error('getFilesData fileRes: ', error);
                return {
                    ErrorCode: '500',
                    ErrorDescription: '获取扫描仪件异常'
                };
            }
            return this.getFileAsyncByPath(guid, filePath, retry + 1);
        }
        return fileRes;
    }

    getFilesData = (Files = []) => {
        for (let i = 0; i < Files.length; i++) {
            const filePath = Files[i];
            if (!this.asyncPathsMap.get(filePath)) {
                const fileRes = this.getFileAsyncByPath(this.Guid, filePath);
                const { Base64String = '', ErrorDescription = '获取扫描仪件异常' } = fileRes;
                let ErrorCode = fileRes.ErrorCode;
                if (typeof fileRes.ErrorCode === 'undefined') {
                    ErrorCode = '500';
                }
                this.asyncPathsMap.set(filePath, {
                    status: 'waiting',
                    index: i,
                    Base64String,
                    ErrorDescription,
                    ErrorCode
                });
            }
        }
    }

    QueryResult = async() => {
        let res;
        try {
            res = this.scanner.QueryResult(this.Guid);
        } catch (error) {
            console.error('scanner QueryResult error', error);
            await this.onScanEnd({
                errcode: '30000',
                description: '扫描异常，请检查扫描仪是否连接正常'
            });
            return;
        }

        const { Status, Files, Data, ErrorCode, ErrorDescription } = res;

        // 扫描异常
        if (ErrorCode != '0') {
            this.debug && console.warn('QueryResult res', res);
            this.sourceName = '';
            await this.onScanEnd({
                errcode: '30001',
                description: ErrorDescription || '扫描异常，请检查扫描仪是否连接正常'
            });
            return;
        }

        if (Status == 1) {
            this.processFile = Files;
            this.getFilesData(Files);
            await this.handleScanedFiles();
        } else if (Status == 2) {
            this.queryIsEnd = true;
            if (Data.Paths && Data.Paths.length > this.processFile.length) {
                this.processFile = Data.Paths;
                this.getFilesData(this.processFile);
            }
            if (Data.ErrorCode != '0') {
                let curDescription;
                let ErrorCode = '30002';
                if (Data.ErrorCode == 7) {
                    this.sourceName = ''; // 无法找到扫描仪时重新打开选择扫描仪
                    ErrorCode = '30004';
                    curDescription = '无法打开指定的扫描仪，请检查扫描仪是否选择正确';
                } else if (Data.ErrorCode == 9) {
                    ErrorCode = '30004';
                    curDescription = '扫描仪缺纸，请检查！';
                } else if (Data.ErrorCode == 10) {
                    ErrorCode = '30005';
                    curDescription = '扫描仪进程异常退出，请检查！';
                } else if (Data.ErrorCode === 13) {
                    ErrorCode = '30006';
                    curDescription = '扫描仪卡纸，请检查！';
                } else {
                    curDescription = Data.ErrorDescription || '扫描异常，请重试';
                }
                await this.handleScanedFiles({
                    errcode: ErrorCode,
                    description: curDescription
                });
            } else {
                await this.handleScanedFiles();
            }
        }
    }

    // 整个扫描仪循环获取状态
    loopHandlerFiles = async() => {
        if (this.handleIsEnd) {
            window.clearTimeout(this.timer);
            return;
        }

        try {
            if (this.queryIsEnd) {
                await this.handleScanedFiles();
            } else {
                await this.QueryResult();
            }
        } catch (error) {
            console.error('loopHandlerFiles error', error);
        }

        this.timer = window.setTimeout(() => {
            this.loopHandlerFiles();
            return false;
        }, this.queryDelay);
    }

    AcquireSync = async(prdName) => {
        // 同步扫描
        const isBlank = this.ifDuplexEnabled ? 1 : 0;
        let res;
        try {
            res = this.scanner.AcquireAsync(prdName, this.duplex, this.color, this.resolution, this.format, isBlank);
        } catch (error) {
            console.error('AcquireAsync error', error);
            await this.onScanEnd({
                errcode: '500',
                description: '扫描服务进程异常，请检查！'
            });
            return;
        }

        if (res.ErrorCode != 0) {
            this.debug && console.warn('AcquireSync res', res);
            await this.onScanEnd(res); // 抛出异常
            return;
        }

        if (res.Guid) {
            this.Guid = res.Guid;
            this.handleIsEnd = false;
            this.queryIsEnd = false;
            this.loopHandlerFiles();
        } else {
            this.debug && console.warn('AcquireAsync 异常', res);
            await this.onScanEnd({
                ErrorCode: '30003',
                ErrorDescription: '扫描异常，请检查扫描仪'
            });
        }
    }

    onScanEnd = async(json) => {
        const errorInfo = {
            errcode: json.ErrorCode || json.errcode,
            description: json.ErrorDescription || json.description,
            data: json.data || ''
        };

        const { errcode, description, data } = errorInfo;
        this.resetScan();
        try {
            if (typeof this.uploadFinish == 'function') {
                await this.uploadFinish({ errcode, description, data });
            } else {
                await this.onError({ errcode, description });
            }
        } catch (error) {
            console.error('onScanEnd error', error);
        }
    };
}

export default ScanFile;