import { pwyFetch, loadJs, tools } from '@piaozone.com/utils';
const { syncUse } = loadJs;
const async = require('async');

export function AsyncScanFiles(opt) {
    const staticUrl = opt.staticUrl;
    this.uploadUrl = opt.uploadUrl;
    this.waitUploadFiles = [];
    this.uploadingFileNum = 0; // 当前正在上传的数量，用于控制onPostTransferAsync中的并发数量
    this.accessOnPostTransferAsync = 0; // 经过onPostTransferAsync的次数
    this.queueScanIndex = [];
    this.queueResultList = {};
    this.queueStepUploadStart = {};
    this.queueFileInfo = {};

    this.fileIndex = 0;
    this.initFlag = false;
    this.limit = opt.limit || 2;
    this.PixelType = opt.PixelType; //彩色模式
    this.Resolution = opt.Resolution || 300; //300dpi
    this.scanFileStaticJs = opt.scanFileStaticJs || [staticUrl + '/static/gallery/scanner-15/dynamsoft.webtwain.initiate.js', staticUrl + '/static/gallery/scanner-15/dynamsoft.webtwain.config.js'];
    this.needRegonizeQr = opt.needRegonizeQr; // 通知需要识别二维码，加载相关库文件
    this.imageWidth = 1920;
    this.imageHeight = 1080;
    this.uploadDataType = opt.uploadDataType || 'json';
    if (typeof opt.removeScanImagesFlag === 'undefined') {
        this.removeScanImagesFlag = false; // 默认，每次扫描结束不删除扫描的数据
    } else {
        this.removeScanImagesFlag = opt.removeScanImagesFlag;
    }

    if (!window.File) { // 扫描仪不支持多个并发上传，当存在File对象时，使用blobFile对象上传, 否则并发限制为1, 使用扫描仪上传
        this.limit = 1;
    }

    if (this.needRegonizeQr) {
        this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
    }
}

AsyncScanFiles.prototype = {
    getUUId: () => {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    },
    setDiscardBlankpages: function() {
        try {
            window.DWObject.IfAutoDiscardBlankpages = true; //自动丢弃空白页
            //赋予自动丢弃空白页的能力
            window.DWObject.Capability = 4404;
            window.DWObject.CapType = 5;
            window.DWObject.CapValue = -1; //Auto
            if (window.DWObject.CapSet) {
                console.log('自动废弃空白页设置成功');
            }
        } catch (err) {
            console.warn(err);
        }
    },
    init: function() {
        return new Promise((resolve) => {
            if (window.Dynamsoft) {
                resolve({ errcode: '0000', description: 'success' });
            } else {
                syncUse(this.scanFileStaticJs, () => {
                    const Dynamsoft = window.Dynamsoft;
                    Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', () => {
                        window.DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer');
                        if (window.DWObject) {
                            this.removeAllImages();
                            window.DWObject.SetViewMode(-1, -1);
                            this.setDiscardBlankpages(); // 自动丢弃空白页
                            resolve({ errcode: '0000', description: 'success' });
                        } else {
                            resolve({ errcode: 'initError', description: '初始化扫描仪失败' });
                        }
                    });
                });
            }
        });
    },
    _convertImage: function(i) {
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
    uploadFiles: function(waitUploadFiles, { otherData = {}, filename = 'file', stepUploadStart, stepUploadFinish, uploadFinish, addUploadProgress }) {
        async.mapLimit(waitUploadFiles, this.limit, async(fileInfo, callback) => {
            let stopStepUpload = false;
            let preRes = {};

            if (typeof addUploadProgress === 'function') {
                await addUploadProgress(fileInfo);
            }

            if (typeof stepUploadStart === 'function') {
                preRes = await stepUploadStart(fileInfo) || {};
                if (preRes && preRes.stopStepUpload) {
                    stopStepUpload = !!preRes.stopStepUpload;
                }
            }

            // 需要上传，且文件对象存在
            if (!stopStepUpload) {
                let res = {};
                let newData = {};
                if (fileInfo.file) {
                    const upOtherData = preRes.otherData || {};
                    newData = { ...otherData, ...upOtherData };
                    res = await this.uploadFile(fileInfo, newData, filename);
                }

                if (typeof stepUploadFinish === 'function') {
                    await stepUploadFinish(res, fileInfo, newData);
                }
            } else {
                if (typeof stepUploadFinish === 'function') {
                    await stepUploadFinish(preRes, fileInfo, {});
                }
            }
            callback(null, {});
        }, (err) => {
            if (err) {
                console.error(err);
            }
            if (typeof uploadFinish === 'function') {
                uploadFinish();
            }
        });
    },
    handlerStepUploadStart: async function(index, stepUploadStart, otherData, filename, stepUploadFinish, controlChangeNum){
        if (!this.queueFileInfo['k' + index]) {
            await this.getFileInfo(index);
        }

        if(this.isHandlerStepUploadStart) {
            return;
        }

        this.isHandlerStepUploadStart = true;
        for(let i=0; i< this.queueScanIndex.length; i++) {
            const curIndex = this.queueScanIndex[i];
            const fileInfo = this.queueFileInfo['k' + curIndex];
            if (fileInfo === '') {
                continue;
            } else if (typeof fileInfo === 'object') {
                if (typeof this.queueStepUploadStart['k' + curIndex] === 'undefined') { // 防止重复处理
                    let preRes = {};
                    if (typeof stepUploadStart === 'function') {
                        try {
                            preRes = await stepUploadStart(fileInfo) || {};
                        } catch (error) {
                            console.error('stepUploadStart处理失败：', error);
                        }
                    }
                    this.queueStepUploadStart['k' + curIndex] = [ preRes ];
                    await this.handlerUpload(curIndex, controlChangeNum, otherData, filename);
                    this.handlerStepUploadFinish(stepUploadFinish);
                }
            } else {
                break;
            }
        }
        this.isHandlerStepUploadStart = false;
    },
    handlerUpload: async function(index, controlChangeNum, otherData, filename){
        const fileInfo = this.queueFileInfo['k' + index];
        const curData = this.queueStepUploadStart['k' + index];
        // 防止重复上传，处理的准备数据必须都准备好
        if (typeof this.queueResultList['k' + index] === 'undefined' && typeof curData === 'object' && typeof fileInfo === 'object') {
            const preRes= curData[0];
            const stopStepUpload = !!preRes.stopStepUpload;
            if (stopStepUpload) {
                this.queueResultList['k' + index] = [preRes, {}];
            } else {
                if (this.uploadingFileNum < this.limit) {
                    this.uploadingFileNum += controlChangeNum; // 控制并发上传的数量
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
                    this.uploadingFileNum -= controlChangeNum;
                    this.queueResultList['k' + index] = [res, newData];

                }
            }
        }
    },
    handlerStepUploadFinish: async function(stepUploadFinish) {
        if(this.isHandlerStepUploadFinish) {
            return;
        }

        this.isHandlerStepUploadFinish = true;
        for(let i=0; i< this.queueScanIndex.length; i++) {
            const index = this.queueScanIndex[i];
            if (this.queueFileInfo['k' + index] === '') { //表示已处理完这个文件
                continue;
            } else if (typeof this.queueFileInfo['k' + index] === 'object') { // 文件对象已经生成好
                const fileInfo = this.queueFileInfo['k' + index];
                if (this.queueResultList['k' + index] === '') { // 文件已经处理完成
                    continue;
                }else if (typeof this.queueResultList['k' + index] === 'object') { // 表示stepFinish结果已经处理好
                    const curData = this.queueResultList['k' + index];
                    if (typeof stepUploadFinish === 'function') {
                        try {
                            await stepUploadFinish(curData[0], fileInfo, curData[1]);
                        } catch (error) {
                            console.error('stepUploadFinish 处理失败', error);
                        }
                    }
                    // 一个文件完全处理完成，清理相关数据减少内存占用
                    this.queueResultList['k' + index] = '';
                    this.queueStepUploadStart['k' + index] = '';
                    this.queueFileInfo['k' + index] = '';
                } else { // 遇到第一个未定义的结果表示还未处理，直接退出，保持有序返回
                    break;
                }
            } else {
                break;
            }
        }
        this.isHandlerStepUploadFinish = false;
    },
    handleFileIndex: async function(index, otherData, filename, stepUploadStart, stepUploadFinish) {
        await this.handlerStepUploadStart(index, stepUploadStart, otherData, filename, stepUploadFinish, 1);

    },
    checkScanFinish: function(otherData, filename, stepUploadStart, stepUploadFinish, uploadFinish, errInfo = {}) {
        const totalNum = window.DWObject.HowManyImagesInBuffer - this.startHowManyImagesInBuffer; // 处理完成的文件必须大于等于这个

        // 处理结束的数量
        const finishKeys = Object.keys(this.queueResultList).filter((item) => {
            return this.queueResultList[item] === '';
        });

        // 处理完成
        if (finishKeys.length >= totalNum) {

            // 还原初始化变量
            this.uploadingFileNum = 0; // 当前正在上传的数量，用于控制onPostTransferAsync中的并发数量
            this.queueScanIndex = []; // 顺序数组
            this.queueResultList = {}; // stepUploadFinish结果存储
            this.queueStepUploadStart = {}; // StepUploadStart结果存储
            this.queueFileInfo = {}; // 文件对象存储

            this.isHandlerStepUploadStart = false;
            this.isHandlerStepUploadFinish = false;
            if (typeof uploadFinish === 'function') {
                try {
                    uploadFinish({
                        errcode: errInfo.errcode || '0000',
                        description: errInfo.description || 'success',
                        data: {
                            imagesNum: totalNum,
                            howManyImagesInBuffer:  window.DWObject.HowManyImagesInBuffer,
                            startHowManyImagesInBuffer: this.startHowManyImagesInBuffer
                        }});
                } catch (error) {
                    console.warn(error);
                }
            }
        } else if (this.uploadingFileNum === 0 && !this.isHandlerStepUploadStart && !this.isHandlerStepUploadFinish){ // 没有在处理中
            const unFinishedIndexs = this.queueScanIndex.filter((item) => {
                return finishKeys.indexOf('k' + item) === -1
            });

            async.mapLimit(unFinishedIndexs, this.limit, async(index, callback) => {
                if (typeof this.queueStepUploadStart['k' + index] !== 'object') {
                    await this.handlerStepUploadStart(index, stepUploadStart, otherData, filename, stepUploadFinish, 0);
                } else if (typeof this.queueResultList['k' + index] !== 'object') {
                    await this.handlerUpload(index, 0, otherData, filename);
                    await this.handlerStepUploadFinish(stepUploadFinish);
                } else {
                    await this.handlerStepUploadFinish(stepUploadFinish);
                }

                callback(null, {});
            }, async(err) => {
                if (err) {
                    console.error(err);
                }

                setTimeout(() => {
                    this.checkScanFinish(otherData, filename, stepUploadStart, stepUploadFinish, uploadFinish);
                }, 800);
            });
        } else {
            setTimeout(() => {
                this.checkScanFinish(otherData, filename, stepUploadStart, stepUploadFinish, uploadFinish);
            }, 1000);
        }
    },
    getFileInfo: async function(imgIndex) {
        if (typeof this.queueFileInfo['k' + imgIndex] === 'object') {
            return this.queueFileInfo['k' + imgIndex];
        }

        const imgUrl = DWObject.GetImageURL(imgIndex, this.imageWidth, this.imageHeight);
        const res = await this._convertImage(imgIndex);
        let fileInfo = {};
        let qrcodeResult = '';
        const fileUid = this.getUUId() + '-' + imgIndex;
        if (res.errcode === '0000' && this.needRegonizeQr) {
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

        this.queueFileInfo['k' + imgIndex] = fileInfo;
        return fileInfo;
    },
    _AcquireImage: function({ otherData = {}, filename = 'file', stepUploadStart, stepUploadFinish, uploadFinish, addUploadProgress }) {
        return new Promise((resolve) => {
            const DWObject = window.DWObject;
            DWObject.SelectSource(async() => {

                this.uploadingFileNum = 0; // 当前正在上传的数量，用于控制onPostTransferAsync中的并发数量
                this.startHowManyImagesInBuffer = window.DWObject.HowManyImagesInBuffer; // 初始扫描时的文件数

                this.queueScanIndex = []; // 顺序数组
                this.queueResultList = {}; // stepUploadFinish结果存储
                this.queueStepUploadStart = {}; // StepUploadStart结果存储
                this.queueFileInfo = {}; // 文件对象存储

                this.isHandlerStepUploadStart = false;
                this.isHandlerStepUploadFinish = false;

                DWObject.OpenSource();
                DWObject.IfDisableSourceAfterAcquire = true;
                DWObject.PixelType = this.PixelType || window.EnumDWT_PixelType.TWPT_RGB; //彩色模式
                DWObject.Resolution = this.Resolution; //300dpi

                DWObject.IfShowUI = false;
                DWObject.IfShowProgressBar = false;
                DWObject.IfShowCancelDialogWhenImageTransfer = false;
                DWObject.IfShowFileDialog = false;
                DWObject.IfFeederEnabled = false;

                DWObject.RegisterEvent('OnPostTransferAsync', async(outputInfo) => {
                    const index = DWObject.ImageIDToIndex(outputInfo.imageId);
                    this.queueScanIndex.push(index);

                    if (typeof addUploadProgress === 'function') {
                        addUploadProgress(index);
                    }

                    this.handleFileIndex(index, otherData, filename, stepUploadStart, stepUploadFinish);
                });


                DWObject.RegisterEvent('OnPostAllTransfers', () => {
                    this.checkScanFinish(otherData, filename, stepUploadStart, stepUploadFinish, uploadFinish);
                });


                window.DWObject.AcquireImage(async() => {
                    resolve({ errcode: '0000', data: [] });
                    window.DWObject.CloseSource();
                }, async(err, msg) => {

                    if (err) {
                        console.warn('扫描出错：', err, msg);
                        this.checkScanFinish(otherData, filename, stepUploadStart, stepUploadFinish, uploadFinish, {errcode: 'err', description: '扫描异常, ' + msg});
                    }

                    resolve({ errcode: err, description: msg });
                    window.DWObject.CloseSource();
                });
            }, () => {
                resolve({ errcode: 'unSelect', description: '未选择扫描仪' });
            });
        });
    },
    uploadBlobFile: async function(info, otherData, filename = 'file') { // ie10 及高版本浏览器使用blob转换为file上传
        const upFile = tools.blobToFile(info.file, info.name);
        const formData = new FormData();
        const allKeys = Object.keys(otherData);
        for (let i = 0; i < allKeys.length; i++) {
            formData.append(allKeys[i], otherData[allKeys[i]]);
        }
        formData.append(filename, upFile);
        let res = await pwyFetch(this.uploadUrl, {
            method: 'post',
            data: formData,
            contentType: 'file'
        });
        return res;
    },
    uploadFile: async function(info, otherData, filename = 'file') {
        if (window.File) {
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
                };
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
                                resolve({ errcode: '500', description: '服务端异常' });
                            }
                        } else {
                            resolve(result);
                        }
                    } else {
                        resolve({ errcode: '500', description: '服务端异常' });
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
    regonizeQr: async(url) => {
        return new Promise((resolve) => {
            const pwyQrcode = window.qrcode;
            try {
                pwyQrcode.result = '';
                pwyQrcode.decode(url);
                pwyQrcode.callback = (result) => {
                    if (result && result.indexOf('error') === -1 && result.indexOf('-') !== -1) {
                        resolve({ 'errcode': '0000', data: result });
                    } else {
                        resolve({ 'errcode': 'empty', data: '' });
                    }
                };
            } catch (error) {
                console.warn(error);
                resolve({ 'errcode': 'empty', data: '' });
            }
        });
    },
    removeAllImages: function() {
        if (window.DWObject) {
            window.DWObject.RemoveAllImages();
            this.fileIndex = 0;
        }
    },
    startScan: async function(opt) {
        const { data = {}, ...otherOpt } = opt;
        if (!window.Dynamsoft) {
            const initRes = await this.init();
            if (initRes.errcode !== '0000') {
                return initRes;
            }
        }

        const res = await this._AcquireImage({ otherData: data, ...otherOpt });
        return res;
    }
};

