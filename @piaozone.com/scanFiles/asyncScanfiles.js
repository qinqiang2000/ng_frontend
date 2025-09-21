import { pwyFetch, loadJs, tools } from '@piaozone.com/utils';
import allowLocales from './allowLocales';
import moment from 'moment';
const { syncUse } = loadJs;
const async = require('async');

export function AsyncScanFiles(opt) {
    const staticUrl = opt.staticUrl;
    const staticPathUrl = opt.staticPathUrl;
    this.uploadUrl = opt.uploadUrl;
    this.headers = opt.headers;
    this.uploadingIds = []; // 正常上传的
    this.uploadFinishedIds = [];
    this.addUploadProgressList = []; // 防止重复执行添加队列
    this.queueScanIndex = [];
    this.queueFileInfo = {};

    this.fileIndex = 0;
    this.initFlag = false;
    this.limit = opt.limit || 2;
    this.PixelType = opt.PixelType; //彩色模式
    this.IfShowUI = opt.IfShowUI; // 是否展示扫描仪界面
    this.Resolution = opt.Resolution || 300; //300dpi
    this.version = parseInt(opt.version || 15); // 默认15版本, 18版本我们没有购买，是提供给私有化客户自行购买了的采用( 目前需要v18支持的客户，广东交通（信创扫描仪客户）)
    this.scanFileStaticJs = opt.scanFileStaticJs || (staticPathUrl ? [
        `${staticPathUrl}/gallery/scanner-${this.version}/dynamsoft.webtwain.initiate.js`,
        `${staticPathUrl}/gallery/scanner-${this.version}/dynamsoft.webtwain.config.js`
    ] : [
        `${staticUrl}/static/gallery/scanner-${this.version}/dynamsoft.webtwain.initiate.js`,
        `${staticUrl}/static/gallery/scanner-${this.version}/dynamsoft.webtwain.config.js`
    ]);
    this.needRegonizeQr = opt.needRegonizeQr; // 通知需要识别二维码，加载相关库文件
    this.imageWidth = 1920;
    this.imageHeight = 1080;
    this.uploadDataType = opt.uploadDataType || 'json';
    this.locale = opt.locale || 'zh_CN';
    this.localeDict = require('./locale/' + this.locale).default;
    this.debug = opt.debug;
    this.IfDuplexEnabled = opt.ifDuplexEnabled; // 设置单双面扫描
    this.isAutoAFD = opt.isAutoAFD; // 设置是否自动侦测ADF扫描仪
    this.IfAutoDiscardBlankpages = opt.ifAutoDiscardBlankpages; // 自动丢弃空白页
    this.isAutoSelectSource = opt.isAutoSelectSource || false; // 是否自动选择扫描来源: 当只有一个扫描源时,无需选择.多个时,切换后记住当前操作的
    this.isDynamsoftDiscardBlankpages = opt.isDynamsoftDiscardBlankpages || false; // 是否需要sdk过滤空白页
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
        if (staticPathUrl) {
            this.scanFileStaticJs.push(staticPathUrl + '/gallery/llqrcode.min.js');
        } else {
            this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
        }
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
    setIfShowUI: function (ifShowUI) {
        this.IfShowUI = ifShowUI;
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
                    //DWT
                    let dwtObj = null;
                    if (this.version === 18) {
                        dwtObj = Dynamsoft.DWT;
                    } else {
                        dwtObj = Dynamsoft.WebTwainEnv;
                    }
                    dwtObj.CreateDWTObjectEx({
                        WebTwainId: 'myDwtInstance'
                    }, (DWTObject) => {
                        window.dwtInstance = DWTObject;
                        localStorage['isInstallService'] = 1; // 注册成功说明已安装软件
                        this.removeAllImages();
                        resolve({ errcode: '0000', description: 'success' });
                    }, (error) => {
                        resolve({ errcode: 'initError', description: this.localeDict.initFail });
                    });
                });
            }
        });
    },
    _convertImage: function (i) {
        return new Promise((resolve) => {
            // 1 B&W,8-Gray,24-RGB
            let picFormat = '';
            if (this.version === 18) {
                picFormat = Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG;
            } else {
                picFormat = window.EnumDWT_ImageType.IT_JPG;
            }
            let bitdepth = window.dwtInstance.GetImageBitDepth(i);
            // 黑白使用png输出
            console.log('==>bitdepth==test', bitdepth);
            if (bitdepth == 1) {
                if (this.version === 18) {
                    picFormat = Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG;
                } else {
                    picFormat = window.EnumDWT_ImageType.IT_PNG;
                }
            }
            window.dwtInstance.ConvertToBlob(
                [i],
                picFormat,
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
                this.uploadFinishedIds.push(index);
                await this.handlerStepUploadFinish(fileInfo, res);
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
    handlerStepUploadFinish: async function (fileInfo, res) {
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
        //this.uploadFinishedIds.push(index);
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

        const ErrorCode = window.dwtInstance.ErrorCode;
        const ErrorString = window.dwtInstance.ErrorString;
        let errcode = '0000';
        let description = 'success';
        if (typeof errInfo === 'object') {
            errcode = errInfo.errcode || 'scanErr';
            description = errInfo.description || this.localeDict.scannerException;
            localStorage.removeItem('sourceIndex'); //防止客户扫描仪连接突然异常，或更换扫描仪设备时，无法选中当前设备报错，
            localStorage.removeItem('scanSources');
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
                        howManyImagesInBuffer: window.dwtInstance.HowManyImagesInBuffer,
                        startHowManyImagesInBuffer: this.startHowManyImagesInBuffer
                    }
                });
            } catch (error) {
                console.warn(error);
            }
        }
    },
    checkScanFinish: async function (otherData, filename) { //用于检查扫描是否完成，并处理剩余的上传任务
        const totalNum = window.dwtInstance.HowManyImagesInBuffer - this.startHowManyImagesInBuffer; // 处理完成的文件必须大于等于这个
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
        const imgUrl = window.dwtInstance.GetImageURL(imgIndex, this.imageWidth, this.imageHeight);
        // const isEmpty = await window.dwtInstance.IsBlankImageAsync(imgIndex); //是否空白页
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
    setAutoAFD: function () {
        window.dwtInstance.setCapabilities(
            {
              exception: "ignore",
              capabilities: [
                {
                  capability: Dynamsoft.EnumDWT_Cap.CAP_FEEDERENABLED,
                  curValue: true, // set feederenabled to true
                  exception: "fail",
                },
                {
                  capability: Dynamsoft.EnumDWT_Cap.CAP_AUTOMATICSENSEMEDIUM,
                  curValue: true, // set automaticsensemedium to true
                  exception: "fail",
                },
                {
                    capability: 0x8085,
                    curValue: 0,
                    exception: "fail",
                },
                {
                      capability: Dynamsoft.EnumDWT_Cap.ICAP_AUTOSIZE,
                      curValue: 0,
                      exception: "fail",
                },
                {
                    capability: 0x8050,
                    curValue: 0,
                    exception: "fail",
                },
                {
                    capability: 0x8081,
                    curValue: 0,
                    exception: "fail",
                },

              ],
            },
            function (result) {
              console.log(result);
            },
            function (error) {
              console.log(error);
            }
        );
    },
    _AcquireImage: function ({
        otherData = {},
        filename = 'file',
        stepUploadStart,
        stepUploadFinish,
        uploadFinish,
        addUploadProgress,
        onProgress
    }) {
        return new Promise((resolve) => {
             //window.DWObject v18不再支持;
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
            if (window.dwtInstance) {
                window.dwtInstance.IfUseTwainDSM = true; // 不加载WIA的驱动来源
                const sourceIndex = localStorage['sourceIndex'] || ''; // 获取上次的sourceIndex
                var sources = window.dwtInstance.GetSourceNames() || [];
                if (sources.length > 0 && sourceIndex) {
                    localStorage['scanSources'] = JSON.stringify(sources);
                    if (this.isAutoSelectSource) {
                        // 是否选择扫描来源
                        window.dwtInstance.SelectSourceByIndex(sourceIndex);
                        this.initConfig(otherData, filename);
                    } else {
                        window.dwtInstance.SelectSourceAsync().then((sourceIndex) => {
                            localStorage['sourceIndex'] = sourceIndex; // 记住上次的选择
                            this.initConfig(otherData, filename);
                        },() => {
                            this.scanEndHanlder(0);
                        });
                    }
                } else {
                    window.dwtInstance.SelectSourceAsync().then((sourceIndex) => {
                        localStorage['sourceIndex'] = sourceIndex; // 记住上次的选择
                        this.initConfig(otherData, filename);
                    },() => {
                        this.scanEndHanlder(0);
                    });
                }
            } else {
                resolve({ errcode: '0005', description: '初始化设备失败，请刷新页面重新操作试试！' });
            }
        });
    },
    initConfig: function (otherData, filename) {
        this.startHowManyImagesInBuffer = window.dwtInstance.HowManyImagesInBuffer; // 初始扫描时的文件数
        this.queueScanIndex = []; // 顺序数组,用于控制addProgress的顺序执行
        this.uploadingIds = []; // 当前正在上传的数量，用于控制onPostTransferAsync中的并发数量
        this.addUploadProgressList = [];
        this.uploadFinishedIds = [];
        this.isOnPostAllTransfers = false;
        this.queueFileInfo = {};

        window.dwtInstance.OpenSource();

        window.dwtInstance.IfDisableSourceAfterAcquire = true;
        if (this.version === 18) {
            window.dwtInstance.PixelType = this.PixelType || Dynamsoft.DWT.EnumDWT_PixelType.TWPT_RGB;
        } else {
            window.dwtInstance.PixelType = this.PixelType || window.EnumDWT_PixelType.TWPT_RGB;
        }
        window.dwtInstance.Resolution = this.Resolution; //300dpi
        window.dwtInstance.IfShowUI = this.IfShowUI || false;
        window.dwtInstance.IfShowProgressBar = false;
        window.dwtInstance.IfShowCancelDialogWhenImageTransfer = false;
        window.dwtInstance.IfShowFileDialog = false;
        window.dwtInstance.IfFeederEnabled = !this.isAutoAFD ? true : 'undefined';
        window.dwtInstance.IfDuplexEnabled = this.IfDuplexEnabled; // 是否多页扫描
        try {
            if (this.IfDuplexEnabled) {
                window.dwtInstance.IfAutoDiscardBlankpages = this.IfAutoDiscardBlankpages; //自动丢弃空白页
                //赋予自动丢弃空白页的能力
                window.dwtInstance.Capability = 4404;
                window.dwtInstance.CapType = 5;
                window.dwtInstance.CapValue = -1; //Auto
                if (window.dwtInstance.CapSet) {
                    console.log('自动废弃空白页设置成功');
                }
            }
        } catch (err) {
            console.warn('设置自动丢弃空白页失败', err);
        }

        window.dwtInstance.RegisterEvent('OnPostTransfer', () => {
            //事件在每一页（或每一图像帧）扫描并传输完成后触发。
            //这个事件可以用来处理每一页的后续操作，
            //可以在这里上传图像、进行图像处理或更新用户界面。
            //这个事件对于需要对每个扫描图像进行即时处理的场景非常有用。
            const index = window.dwtInstance.CurrentImageIndexInBuffer;
            // 需要过滤空白页，当扫描仪不支持api设置时，直接通过sdk过滤
            if (this.IfAutoDiscardBlankpages && this.isDynamsoftDiscardBlankpages && window.dwtInstance.IsBlankImageExpress(index)) {
                window.dwtInstance.BlankImageMaxStdDev = 0; // 0: 单色,不包含任何噪点.
                window.dwtInstance.RemoveImage(index);
            } else {
                this.queueScanIndex.push(index);
            }
            this.myDebug('OnPostTransfer index', index);
        });

        window.dwtInstance.RegisterEvent('OnPostAllTransfers', () => {
            // 事件在所有页面（或所有图像帧）扫描并传输完成后触发。
            // 这个事件通常用于执行扫描会话结束后的操作，例如，关闭数据源、上传所有扫描的图像或执行最终的图像处理。
            this.isOnPostAllTransfers = true;
            window.dwtInstance.CloseSource();
            this.checkScanFinish(otherData, filename);
        });

        this.isAutoAFD && this.setAutoAFD();
        window.dwtInstance.AcquireImage(
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
                window.dwtInstance.CloseSource();
                resolve({ errcode: '0000', description: 'success' });
            }
        );
        this.myDebug('window.dwtInstance.AcquireImage', window.dwtInstance.AcquireImage);
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
        formData.append('originalFilename', info.name);
        const operateId = otherData.operateId;
        const operateName = otherData.operateName;
        const requestParam = {
            method: 'post',
            data: formData,
            contentType: 'file',
            headers: { ...this.headers, curtime: moment(new Date()).format('YYYYMMDDHHmmss') }
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

        const apiUrl = operateName ? `${this.uploadUrl}&operateId=${operateId}&operateName=${operateName}` : this.uploadUrl;
        const res = await pwyFetch(apiUrl, requestParam);

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
                    window.dwtInstance.HTTPPort = parseInt(port);
                }

                window.dwtInstance.ClearAllHTTPFormField();
                const allKeys = Object.keys(otherData);
                for (let i = 0; i < allKeys.length; i++) {
                    window.dwtInstance.SetHTTPFormField(allKeys[i], otherData[allKeys[i]]);
                }
                window.dwtInstance.HttpFieldNameOfUploadedImage = filename;

                if (window.location.protocol === 'https:') {
                    window.dwtInstance.IfSSL = true;
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

                window.dwtInstance.HTTPUploadThroughPostEx(
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
        if (window.dwtInstance) {
            window.dwtInstance.RemoveAllImages();
            this.fileIndex = 0;
        }
    },
    startScan: async function (opt) {
        const { data = {}, ...otherOpt } = opt;
        if (!window.Dynamsoft) {
            const initRes = await this.init();
            if (initRes.errcode !== '0000') {
                if (opt.onBreakScan && typeof opt.onBreakScan === 'function') {
                    await opt.onBreakScan(initRes);
                }
            }
        }
        // 没有安装Dynamsoft Service.exe 会提示安装
        if (!localStorage['isInstallService'] && window.Dynamsoft) {
            if (this.version === 18) {
                window.Dynamsoft.DWT.Unload();
                window.Dynamsoft.DWT.Load(); // 重新加载配置
                const initRes = await this.init();
                if (initRes.errcode !== '0000') {
                    if (opt.onBreakScan && typeof opt.onBreakScan === 'function') {
                        await opt.onBreakScan(initRes);
                    }
                }
            } else {
                window.Dynamsoft.WebTwainEnv.Unload();
                window.Dynamsoft.WebTwainEnv.Load(); // 重新加载配置
            }
            if (opt.onBreakScan && typeof opt.onBreakScan === 'function') {
                await opt.onBreakScan({ errcode: 'initError', description: this.localeDict.initFail });
            }
            return { errcode: 'initError', description: this.localeDict.initFail };
        }
        this.isOnPostAllTransfers = false;
        this.scanHttpHasError = false;
        window.clearTimeout(this.tick1);
        window.clearTimeout(this.tick2);
        window.clearTimeout(this.tick3);
        this.checkAndUpload(data, opt.filename);
        this.loopGetFileInfo();
        const res = await this._AcquireImage({ otherData: data, ...otherOpt });
        return res;
    }
};