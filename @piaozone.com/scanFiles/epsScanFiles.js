import { pwyFetch, loadJs, tools } from '@piaozone.com/utils';
import allowLocales from './allowLocales';
import { showSelectSource } from './showSelectSource';
const { syncUse } = loadJs;
const async = require('async');

export function AsyncScanFiles(opt) {
    const staticUrl = opt.staticUrl;
    this.uploadUrl = opt.uploadUrl;
    this.uploadingIds = []; // 正常上传的
    this.uploadFinishedIds = [];
    this.addUploadProgressList = []; // 防止重复执行添加队列
    this.queueScanIndex = [];
    this.queueFileInfo = {};

    this.fileIndex = 0;
    this.initFlag = false;
    this.limit = opt.limit || 2;
    this.PixelType = opt.PixelType; //彩色模式
    this.Resolution = opt.Resolution || 300; //300dpi
    this.version = opt.version || 15; // 默认15版本
    this.scanFileStaticJs = opt.scanFileStaticJs || [
        `${staticUrl}/static/gallery/scanner-${this.version}/dynamsoft.webtwain.initiate.js`,
        `${staticUrl}/static/gallery/scanner-${this.version}/dynamsoft.webtwain.config.js`
    ];
    this.needRegonizeQr = opt.needRegonizeQr; // 通知需要识别二维码，加载相关库文件
    this.imageWidth = 1920;
    this.imageHeight = 1080;
    this.uploadDataType = opt.uploadDataType || 'json';
    this.locale = opt.locale || 'zh_CN';
    this.localeDict = require('./locale/' + this.locale).default;
    this.debug = opt.debug;
    this.IfDuplexEnabled = opt.ifDuplexEnabled; // 设置单面扫描
    this.IfAutoDiscardBlankpages = opt.ifAutoDiscardBlankpages; // 自动丢弃空白页
    this.isAutoSelectSource = opt.isAutoSelectSource || false; // 是否自动选择扫描来源: 当只有一个扫描源时,无需选择.多个时,切换后记住当前操作的
    if (typeof opt.removeScanImagesFlag === 'undefined') {
        this.removeScanImagesFlag = false; // 默认，每次扫描结束不删除扫描的数据
    } else {
        this.removeScanImagesFlag = opt.removeScanImagesFlag;
    }

    if (!window.File || typeof window.File === 'object') {
        // 扫描仪不支持多个并发上传，当存在File对象时，使用blobFile对象上传, 否则并发限制为1, 使用扫描仪上传
        this.limit = 1;
    }

    if (this.needRegonizeQr) {
        this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
    }
}

AsyncScanFiles.prototype = {
    setQrcodeRecognize: function (isQrcode) {
        this.needRegonizeQr = isQrcode;
    },
    setLocale: (l) => {
        if (l && this.locale !== l && allowLocales.indexOf(l) !== -1) {
            this.locale = l;
            this.localeDict = require('./locale/' + this.locale).default;
        }
    },
    setDuplexEnabled: function (isDuplex) {
        this.IfDuplexEnabled = isDuplex;
    },
    getUUId: () => {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    },
    myDebug: function (title, info) {
        if (window.console && this.debug) {
            console.log(title, info);
        }
    },
    setDiscardBlankpages: function (autoDiscard) {
        // 是否丢弃空白页
        this.IfAutoDiscardBlankpages = autoDiscard;
    },
    init: function () {
        return new Promise((resolve) => {
            if (window.Dynamsoft) {
                resolve({ errcode: '0000', description: 'success' });
            } else {
                localStorage.removeItem('isInstallService');
                syncUse(this.scanFileStaticJs, () => {
                    const Dynamsoft = window.Dynamsoft;
                    Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', () => {
                        localStorage['isInstallService'] = 1; // 注册成功说明已安装软件
                        window.DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
                        if (window.DWObject) {
                            this.removeAllImages();
                            resolve({ errcode: '0000', description: 'success' });
                        } else {
                            resolve({ errcode: 'initError', description: this.localeDict.initFail });
                        }
                    });
                });
            }
        });
    },
    _convertImage: function (i) {
        return new Promise((resolve) => {
            window.DWObject.ConvertToBlob(
                [i],
                window.EnumDWT_ImageType.IT_JPG,
                (result) => {
                    resolve({
                        errcode: '0000',
                        data: result
                    });
                },
                (errorCode, errorString) => {
                    console.warn(errorCode, errorString);
                    resolve({
                        errcode: 'covertErr',
                        description: errorString
                    });
                }
            );
        });
    },
    uploadByIds: function (ids, otherData, filename) {
        return new Promise((resolve) => {
            async.mapLimit(
                ids,
                this.limit,
                async (index, callback) => {
                    await this.handlerStepUploadStart(index, otherData, filename);
                    callback(null, {});
                },
                async (err) => {
                    if (err) {
                        console.error(err);
                    }
                    resolve({ errcode: '0000' });
                }
            );
        });
    },
    handlerAddUploadProgress: async function () {
        //有序执行 addUploadProgress
        // 有序的执行等待队列

        for (let i = 0; i < this.queueScanIndex.length; i++) {
            const curIndex = this.queueScanIndex[i];
            const fileInfo = this.queueFileInfo['k' + curIndex];
            if (typeof fileInfo === 'undefined') {
                // 保证有序
                break;
            } else if (typeof fileInfo === '') {
                // 已经执行完全部流程
                continue;
            } else if (typeof fileInfo === 'object' && this.addUploadProgressList.indexOf(curIndex) === -1) {
                this.addUploadProgressList.push(curIndex);
                this.myDebug('handlerAddUploadProgress addUploadProgressCallback', curIndex);
                if (typeof this.addUploadProgress === 'function') {
                    try {
                        await this.addUploadProgress(fileInfo);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    },
    loopGetFileInfo: async function () {
        for (let i = 0; i < this.queueScanIndex.length; i++) {
            const curIndex = this.queueScanIndex[i];
            const fileInfo = this.queueFileInfo['k' + curIndex];
            if (typeof fileInfo !== 'object') {
                await this.getFileInfo(curIndex);
            }
        }
        this.tick3 = setTimeout(() => {
            this.loopGetFileInfo();
        }, 500);
    },
    handlerStepUploadStart: async function (index, otherData, filename) {
        const fileInfo = this.queueFileInfo['k' + index];
        if (typeof fileInfo === 'object') {
            let preRes = {};
            if (typeof this.stepUploadStart === 'function') {
                try {
                    preRes = (await this.stepUploadStart(fileInfo)) || {};
                } catch (error) {
                    console.error('stepUploadStart处理失败：', error);
                }
            }
            const res = await this.handlerUpload(preRes, index, otherData, filename);
            if (res) {
                await this.handlerStepUploadFinish(index, fileInfo, res);
            }
        }
    },
    handlerUpload: async function (preRes, index, otherData, filename) {
        const fileInfo = this.queueFileInfo['k' + index];
        // 防止重复上传，处理的准备数据必须都准备好
        const stopStepUpload = !!preRes.stopStepUpload;
        let result = '';
        if (stopStepUpload) {
            result = [preRes, {}];
        } else {
            let res = {};
            let newData = {};
            if (fileInfo.file) {
                const upOtherData = preRes.otherData || {};
                newData = { ...otherData, ...upOtherData };
                try {
                    res = await this.uploadFile(fileInfo, newData, filename);
                } catch (error) {
                    console.error('uploadFile 处理失败', error);
                }
            }
            result = [res, newData];
        }

        const spliceIndex = this.uploadingIds.indexOf(index);
        if (spliceIndex !== -1) {
            this.uploadingIds.splice(spliceIndex, 1);
        }
        return result;
    },
    handlerStepUploadFinish: async function (index, fileInfo, res) {
        if (typeof this.stepUploadFinish === 'function') {
            try {
                // http请求出现异常
                if (!res[0].errcode) {
                    this.scanHttpHasError = true;
                }
                await this.stepUploadFinish(res[0], fileInfo, res[1]);
            } catch (error) {
                console.error('stepUploadFinish 处理失败', error);
            }
        }
        // 一个文件完全处理完成，清理相关数据减少内存占用
        this.uploadFinishedIds.push(index);
    },
    getNeedUploadIds: function () {
        const limitLen = this.limit - this.uploadingIds.length;
        let result = [];
        if (limitLen > 0) {
            const waitIds = this.addUploadProgressList.filter((index) => {
                return this.uploadFinishedIds.indexOf(index) === -1 && this.uploadingIds.indexOf(index) === -1;
            });
            this.myDebug('getNeedUploadIds addUploadProgressList', this.addUploadProgressList);
            this.myDebug('getNeedUploadIds waitIds', waitIds);
            this.myDebug('getNeedUploadIds uploadFinishedIds', this.uploadFinishedIds);
            this.myDebug('getNeedUploadIds uploadingIds', this.uploadingIds);

            const maxLen = waitIds.length > limitLen ? limitLen : waitIds.length;
            result = waitIds.splice(0, maxLen);
        }
        return result;
    },
    checkAndUpload: async function (otherData, filename) {
        await this.handlerAddUploadProgress();
        const ids = this.getNeedUploadIds();
        this.myDebug('checkAndUpload', ids);
        if (ids.length > 0) {
            this.uploadingIds = this.uploadingIds.concat(ids);
            async.mapLimit(
                ids,
                this.limit,
                async (index, callback) => {
                    await this.handlerStepUploadStart(index, otherData, filename);
                    callback(null, {});
                },
                async (err) => {
                    if (err) {
                        console.error(err);
                    }
                }
            );
        }

        if (!this.isOnPostAllTransfers) {
            this.tick1 = window.setTimeout(() => {
                this.checkAndUpload(otherData, filename);
            }, 1000);
        }
    },
    scanEndHanlder: function (totalNum = 0, errInfo) {
        // 还原初始化变量
        this.uploadingIds = []; // 当前正在上传的数量，用于控制onPostTransferAsync中的并发数量
        this.queueScanIndex = []; // 顺序数组
        this.addUploadProgressList = [];
        this.uploadFinishedIds = [];
        this.queueFileInfo = {};
        this.isOnPostAllTransfers = false;

        const ErrorCode = DWObject.ErrorCode;
        const ErrorString = DWObject.ErrorString;
        let errcode = '0000';
        let description = 'success';
        if (typeof errInfo === 'object') {
            errcode = errInfo.errcode || 'scanErr';
            description = errInfo.description || this.localeDict.scannerException;
        } else if (!this.scanHttpHasError) {
            // 每一步请求都有http返回认为整个扫描正常结束
            errcode = '0000';
            description = 'success';
        } else if (ErrorCode !== 0 && ErrorCode !== -2115) {
            // Cancel file dialog
            console.error(ErrorCode, ErrorString);
            errcode = 'scanErr';
            description = this.localeDict.scannerException;
        }

        window.clearTimeout(this.tick1);
        window.clearTimeout(this.tick2);
        window.clearTimeout(this.tick3);

        if (typeof this.uploadFinish === 'function') {
            try {
                this.uploadFinish({
                    errcode,
                    description,
                    data: {
                        imagesNum: totalNum,
                        howManyImagesInBuffer: window.DWObject.HowManyImagesInBuffer,
                        startHowManyImagesInBuffer: this.startHowManyImagesInBuffer
                    }
                });
            } catch (error) {
                console.warn(error);
            }
        }
    },
    checkScanFinish: async function (otherData, filename) {
        const totalNum = window.DWObject.HowManyImagesInBuffer - this.startHowManyImagesInBuffer; // 处理完成的文件必须大于等于这个
        // file对象还未生成完，防止重复生成文件对象
        const fileInfoListLen = this.queueScanIndex.filter((fileIndex) => {
            return typeof this.queueFileInfo['k' + fileIndex] === 'undefined';
        });

        // 防止id重复,找出已经完成的
        const finishIds = this.queueScanIndex.filter((fileIndex) => {
            return this.uploadFinishedIds.indexOf(fileIndex) !== -1;
        });

        this.myDebug('checkScanFinish finishIds', finishIds);
        this.myDebug('checkScanFinish fileInfoListLen', fileInfoListLen);

        // 处理完成
        if (finishIds.length >= totalNum) {
            this.scanEndHanlder(totalNum);
        } else if (fileInfoListLen.length === 0) {
            // 所有文件对象都已经生成
            // 防止还有没有执行完成的
            await this.handlerAddUploadProgress();
            const ids = this.getNeedUploadIds();
            this.uploadingIds = this.uploadingIds.concat(ids);
            async.mapLimit(
                ids,
                this.limit,
                async (index, callback) => {
                    await this.handlerStepUploadStart(index, otherData, filename);
                    callback(null, {});
                },
                async (err) => {
                    if (err) {
                        console.error(err);
                    }
                }
            );

            this.tick2 = setTimeout(() => {
                this.checkScanFinish(otherData, filename);
            }, 800);
        } else {
            this.tick2 = setTimeout(() => {
                this.checkScanFinish(otherData, filename);
            }, 1000);
        }
    },
    getFileInfo: async function (imgIndex) {
        if (typeof this.queueFileInfo['k' + imgIndex] === 'object') {
            return this.queueFileInfo['k' + imgIndex];
        }

        this.myDebug('start getFileInfo', imgIndex);

        const imgUrl = window.DWObject.GetImageURL(imgIndex, this.imageWidth, this.imageHeight);
        const res = await this._convertImage(imgIndex);

        let fileInfo = {};
        let qrcodeResult = '';
        const fileUid = this.getUUId() + '-' + imgIndex;
        if (res.errcode === '0000') {
            const localUrl = window.URL.createObjectURL(res.data);
            if (this.needRegonizeQr) {
                const qrRes = await this.regonizeQr(localUrl);
                if (qrRes.errcode === '0000') {
                    qrcodeResult = qrRes.data;
                }
            }
            fileInfo = {
                name: fileUid + '.jpg',
                index: imgIndex,
                status: 'init',
                id: fileUid,
                errcode: res.errcode || '0000',
                description: res.description,
                file: res.data,
                localUrl: imgUrl,
                qrcodeResult
            };
        } else {
            fileInfo = {
                name: fileUid + '.jpg',
                index: imgIndex,
                id: fileUid,
                status: 'init',
                errcode: res.errcode,
                description: res.description,
                qrcodeResult: '',
                localUrl: imgUrl
            };
        }
        this.myDebug('getFileInfo success', imgIndex);
        this.queueFileInfo['k' + imgIndex] = fileInfo;
        return fileInfo;
    },
    _AcquireImage: function ({
        otherData = {},
        scannerModel,
        filename = 'file',
        stepUploadStart,
        stepUploadFinish,
        uploadFinish,
        addUploadProgress,
        onProgress,
        checkDeviceNo
    }) {
        return new Promise((resolve) => {
            const DWObject = window.DWObject;
            if (typeof onProgress === 'function') {
                this.checkDeviceNo = checkDeviceNo;
            }
            if (typeof onProgress === 'function') {
                this.onProgress = onProgress;
            }

            if (typeof addUploadProgress === 'function') {
                this.addUploadProgress = addUploadProgress;
            }

            if (typeof stepUploadStart === 'function') {
                this.stepUploadStart = stepUploadStart;
            }

            if (typeof stepUploadFinish === 'function') {
                this.stepUploadFinish = stepUploadFinish;
            }

            if (typeof uploadFinish === 'function') {
                this.uploadFinish = uploadFinish;
            }
            if (DWObject) {
                DWObject.IfUseTwainDSM = true; // 不加载WIA的驱动来源
                const sources = DWObject.GetSourceNames();
                //const sources = ["EPSON DS-730N", "EPSON DS-870"];
                showSelectSource({
                    scannerSources: sources,
                    onSelect:(name) => { console.log('name--', name); },
                    onConfirm:(name) => {
                        const _index= sources.indexOf(name);
                        const scannerModelSelect = localStorage['scannerModelSelect'] || scannerModel; // 获取上次的sourceIndex
                        console.log('scannerModelSelect---', scannerModelSelect);
                        if (scannerModelSelect && scannerModelSelect == name) {
                            DWObject.SelectSourceByIndex(_index);
                            this.initConfig(otherData, filename);
                        } else {
                            checkDeviceNo(name);
                        }
                    },
                    onCancel: () => { console.log('onCancel'); }
                })
            }
        });
    },
    initConfig: function (otherData, filename) {
        this.startHowManyImagesInBuffer = window.DWObject.HowManyImagesInBuffer; // 初始扫描时的文件数
        this.queueScanIndex = []; // 顺序数组,用于控制addProgress的顺序执行
        this.uploadingIds = []; // 当前正在上传的数量，用于控制onPostTransferAsync中的并发数量
        this.addUploadProgressList = [];
        this.uploadFinishedIds = [];
        this.isOnPostAllTransfers = false;
        this.queueFileInfo = {};
        DWObject.OpenSource();

        DWObject.IfDisableSourceAfterAcquire = true;
        DWObject.PixelType = this.PixelType || window.EnumDWT_PixelType.TWPT_RGB; //彩色模式
        DWObject.Resolution = this.Resolution; //300dpi

        DWObject.IfShowUI = false;
        DWObject.IfShowProgressBar = false;
        DWObject.IfShowCancelDialogWhenImageTransfer = false;
        DWObject.IfShowFileDialog = false;
        DWObject.IfFeederEnabled = true;
        DWObject.IfDuplexEnabled = this.IfDuplexEnabled; // 是否多页扫描
        try {
            if (this.IfDuplexEnabled) {
                DWObject.IfAutoDiscardBlankpages = this.IfAutoDiscardBlankpages; //自动丢弃空白页
                //赋予自动丢弃空白页的能力
                DWObject.Capability = 4404;
                DWObject.CapType = 5;
                DWObject.CapValue = -1; //Auto
                if (DWObject.CapSet) {
                    console.log('自动废弃空白页设置成功');
                }
            }
        } catch (err) {
            console.warn('设置自动丢弃空白页失败', err);
        }

        // 异步事件存在异常，暂时不用
        // DWObject.RegisterEvent('OnPostTransferAsync', (outputInfo) => {
        //     const index = DWObject.ImageIDToIndex(outputInfo.imageId);
        //     this.myDebug('OnPostTransferAsync index', index);
        //     this.queueScanIndex.push(index);
        //     this.handlerAddUploadProgress(index);
        // });

        DWObject.RegisterEvent('OnPostTransfer', () => {
            const index = DWObject.CurrentImageIndexInBuffer;
            this.myDebug('OnPostTransfer index', index);
            this.queueScanIndex.push(index);
        });

        DWObject.RegisterEvent('OnPostAllTransfers', () => {
            this.isOnPostAllTransfers = true;
            window.DWObject.CloseSource();
            this.checkScanFinish(otherData, filename);
        });

        window.DWObject.AcquireImage(
            () => {},
            (err, msg) => {
                if (err) {
                    console.warn('扫描出错：', err, msg);
                    let description = this.localeDict.scannerException;
                    if (err === -1003) {
                        description = this.localeDict.unFindScanner;
                    }
                    this.scanEndHanlder(0, { errcode: 'scanErr', description: msg });
                    return;
                }
                window.DWObject.CloseSource();
                resolve({ errcode: '0000', description: 'success' });
            }
        );
    },
    uploadBlobFile: async function (info, otherData, filename = 'file') {
        // ie10 及高版本浏览器使用blob转换为file上传
        const upFile = tools.blobToFile(info.file, info.name);
        const formData = new FormData();
        const allKeys = Object.keys(otherData);
        for (let i = 0; i < allKeys.length; i++) {
            formData.append(allKeys[i], otherData[allKeys[i]]);
        }

        formData.append(filename, upFile);
        const requestParam = {
            method: 'post',
            data: formData,
            contentType: 'file'
        };

        // 需要进度提示
        if (typeof this.onProgress === 'function') {
            // 上传进度显示
            requestParam.onRequestProgress = (loaded, total) => {
                try {
                    this.onProgress(info, loaded, total);
                } catch (error) {
                    typeof window.console && console.error(error);
                }
            };
        }

        const res = await pwyFetch(this.uploadUrl, requestParam);

        if (['gatewayTimeout', 'serverErr', 'requestErr', 'timeoutErr'].indexOf(res.errcode) !== -1) {
            return {
                ...res,
                description: this.localeDict[res.errcode]
            };
        } else {
            return res;
        }
    },
    uploadFile: async function (info, otherData, filename = 'file') {
        if (window.File && typeof window.File === 'function') {
            const res = await this.uploadBlobFile(info, otherData, filename);
            return res;
        } else {
            return new Promise((resolve) => {
                const port = window.location.port || '';
                if (port) {
                    window.DWObject.HTTPPort = parseInt(port);
                }

                window.DWObject.ClearAllHTTPFormField();
                const allKeys = Object.keys(otherData);
                for (let i = 0; i < allKeys.length; i++) {
                    window.DWObject.SetHTTPFormField(allKeys[i], otherData[allKeys[i]]);
                }
                window.DWObject.HttpFieldNameOfUploadedImage = filename;

                if (window.location.protocol === 'https:') {
                    window.DWObject.IfSSL = true;
                }
                const scanPath = this.uploadUrl.replace(/^https?:\/\/.*?\/(.*)/, '/$1');
                const parseResult = (result) => {
                    if (result) {
                        let res;
                        if (this.uploadDataType === 'json') {
                            try {
                                res = JSON.parse(result);
                                resolve(res);
                            } catch (err) {
                                console.warn(err);
                                resolve({ errcode: '500', description: this.localeDict.scannerException });
                            }
                        } else {
                            resolve(result);
                        }
                    } else {
                        resolve({ errcode: '500', description: this.localeDict.scannerException });
                    }
                };

                window.DWObject.HTTPUploadThroughPostEx(
                    window.location.hostname,
                    info.index,
                    scanPath,
                    info.name,
                    1, //jpg格式
                    (httpResponse) => {
                        parseResult(httpResponse);
                    },
                    (errorCode, errorString, httpResponse) => {
                        if (httpResponse) {
                            parseResult(httpResponse);
                        } else {
                            console.warn(errorCode, errorString);
                            resolve({ errcode: 'errorCode', description: errorString });
                        }
                    }
                );
            });
        }
    },
    regonizeQr: async (url) => {
        return new Promise((resolve) => {
            const pwyQrcode = window.qrcode;
            /**
             * result.indexOf(',') === -1; 过滤增值税发票二维码(包含,)
             * result.indexOf('-') === -1; 过滤火车票二维码(只包含数字)
             * result.indexOf('^') === -1; 过滤轮船票二维码(包含^)
             */
            try {
                pwyQrcode.result = '';
                pwyQrcode.decode(url);
                pwyQrcode.callback = (result) => {
                    let isMatchChars = result.match(/(\|)|}|;|,|(\^)/); // 包含
                    if (result && result.indexOf('error') === -1 && result.indexOf('-') !== -1 && !isMatchChars) {
                        resolve({ errcode: '0000', data: result });
                    } else {
                        resolve({ errcode: 'empty', data: '' });
                    }
                };
            } catch (err) {
                console.warn(err);
                resolve({ errcode: 'empty', data: '' });
            }
        });
    },
    removeAllImages: function () {
        if (window.DWObject) {
            window.DWObject.RemoveAllImages();
            this.fileIndex = 0;
        }
    },
    startScan: async function (opt) {
        const { data = {}, scannerModel, ...otherOpt } = opt;
        if (!window.Dynamsoft) {
            const initRes = await this.init();
            if (initRes.errcode !== '0000') {
                return initRes;
            }
        }
        // 没有安装Dynamsoft Service.exe 会提示安装
        if (!localStorage['isInstallService'] && window.Dynamsoft) {
            window.Dynamsoft.WebTwainEnv.Unload();
            window.Dynamsoft.WebTwainEnv.Load(); // 重新加载配置
            return { errcode: 'initError', description: this.localeDict.initFail };
        }
        this.isOnPostAllTransfers = false;
        this.scanHttpHasError = false;
        window.clearTimeout(this.tick1);
        window.clearTimeout(this.tick2);
        window.clearTimeout(this.tick3);
        this.checkAndUpload(data, opt.filename);
        this.loopGetFileInfo();
        const res = await this._AcquireImage({ otherData: data, scannerModel, ...otherOpt, });
        return res;
    }
};
