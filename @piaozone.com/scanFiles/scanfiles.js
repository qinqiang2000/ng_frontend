import { pwyFetch, loadJs, tools } from '@piaozone.com/utils';
const { syncUse } = loadJs;
const async = require('async');

export function ScanFiles(opt) {
    const staticUrl = opt.staticUrl;
    this.uploadUrl = opt.uploadUrl;
    this.fileIndex = 0;
    this.initFlag = false;
    this.limit = opt.limit || 3;
    this.PixelType = opt.PixelType || 2; //彩色模式
    this.Resolution = opt.Resolution || 300; //300dpi
    this.scanFileStaticJs = opt.scanFileStaticJs || [staticUrl + '/static/gallery/scanner/dynamsoft.webtwain.initiate.js', staticUrl + '/static/gallery/scanner/dynamsoft.webtwain.config.js'];
    this.needRegonizeQr = opt.needRegonizeQr; // 通知需要识别二维码，加载相关库文件
    this.imageWidth = 1024;
    this.imageHeight = 768;
    this.uploadDataType = opt.uploadDataType || 'json';
    if (typeof opt.removeScanImagesFlag === 'undefined') {
        this.removeScanImagesFlag = false; // 默认，每次扫描结束不删除扫描的数据
    } else {
        this.removeScanImagesFlag = opt.removeScanImagesFlag;
    }

    if (this.needRegonizeQr) {
        this.scanFileStaticJs.push(staticUrl + '/static/gallery/llqrcode.min.js');
    }
}

ScanFiles.prototype = {
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
                            window.DWObject.IfShowUI = false;
                            window.DWObject.IfShowFileDialog = false;
                            window.DWObject.IfFeederEnabled = false;
                            window.DWObject.Resolution = this.Resolution; //300dpi
                            window.DWObject.SetViewMode(-1, -1);
                            this.setDiscardBlankpages(); // 自动丢弃空白页
                            window.DWObject.ScanedInvoiceLen = 0;
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
    _AcquireImage: function() {
        return new Promise((resolve) => {
            window.DWObject.IfDisableSourceAfterAcquire = true;
            window.DWObject.SelectSource(() => {
                window.DWObject.OpenSource();
                window.DWObject.PixelType = this.PixelType; //彩色模式
                window.DWObject.Resolution = this.Resolution; //300dpi
                window.DWObject.IfDisableSourceAfterAcquire = true;
                window.DWObject.IfShowProgressBar = false;
                window.DWObject.IfShowCancelDialogWhenImageTransfer = false;

                window.DWObject.AcquireImage(async() => {
                    const len = window.DWObject.HowManyImagesInBuffer;
                    const result = [];
                    const fileIndex = window.DWObject.ScanedInvoiceLen || 0;

                    for (let i = fileIndex; i < len; i++) {
                        const id = this.getUUId();
                        const res = await this._convertImage(i);
                        let qrcodeResult = '';
                        if (res.errcode === '0000') {
                            const localUrl = window.URL.createObjectURL(res.data);
                            if (this.needRegonizeQr) {
                                const qrRes = await this.regonizeQr(localUrl);
                                if (qrRes.errcode === '0000') {
                                    qrcodeResult = qrRes.data;
                                }
                            }
                            result.push({
                                name: id + '.jpg',
                                index: i,
                                id,
                                errcode: '0000',
                                file: res.data,
                                localUrl,
                                qrcodeResult
                            });
                        } else {
                            const localUrl = window.DWObject.GetImageURL(i, this.imageWidth, this.imageHeight);
                            result.push({
                                name: id + '.jpg',
                                index: i,
                                id,
                                errcode: res.errcode,
                                description: res.description,
                                qrcodeResult: '',
                                localUrl
                            });
                        }
                    }

                    if (this.removeScanImagesFlag === false) {
                        window.DWObject.ScanedInvoiceLen = len;
                    }

                    resolve({ errcode: '0000', data: result });
                    window.DWObject.CloseSource();
                }, function(err, msg) {
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
    },
    regonizeQr: async(url) => {
        return new Promise((resolve) => {
            const pwyQrcode = window.qrcode;
            try {
                pwyQrcode.result = '';
                pwyQrcode.decode(url);
                pwyQrcode.callback = (result) => {
                    if (result && result.indexOf('error') === -1) {
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
        const { redirectUpload, data = {}, filename = 'file', stepUploadStart, stepUploadFinish, uploadFinish } = opt;
        if (!window.Dynamsoft) {
            const initRes = await this.init();
            if (initRes.errcode !== '0000') {
                return initRes;
            }
        }

        const res = await this._AcquireImage();
        // 直接上传
        if (redirectUpload) {
            this.startUpload({ fileInfoList: res.data, otherData: data, filename, stepUploadStart, stepUploadFinish, uploadFinish });
        }
        return res;
    },
    startUpload: function({ fileInfoList = [], otherData = {}, filename = 'file', stepUploadStart, stepUploadFinish, uploadFinish }) {
        if (typeof stepUploadStart === 'function') {
            this.stepUploadStart = stepUploadStart;
        }

        if (typeof stepUploadFinish === 'function') {
            this.stepUploadFinish = stepUploadFinish;
        }

        if (typeof uploadFinish === 'function') {
            this.uploadFinish = uploadFinish;
        }

        if (!window.File) { // 扫描仪不支持多个并发上传，当存在File对象时，使用blobFile对象上传, 否则并发限制为1, 使用扫描仪上传
            this.limit = 1;
        }

        async.mapLimit(fileInfoList, this.limit, async(fileInfo, callback) => {
            let res = null;
            let stopStepUpload = false;
            let preRes;
            if (typeof this.stepUploadStart === 'function') {
                preRes = await this.stepUploadStart(fileInfo) || {};
                if (preRes && preRes.stopStepUpload) {
                    stopStepUpload = !!preRes.stopStepUpload;
                }
            }

            const upOtherData = preRes.otherData || {};
            const newData = { ...otherData, ...upOtherData };

            if (!stopStepUpload) {
                let res;
                try {
                    if (window.File) { // 扫描仪不支持多个并发上传，当存在File对象时，使用blobFile对象上传
                        res = await this.uploadBlobFile(fileInfo, newData, filename);
                    } else {
                        res = await this.uploadFile(fileInfo, newData, filename);
                    }
                } catch (error) {
                    console.log(error);
                }

                if (typeof this.stepUploadFinish === 'function') {
                    this.stepUploadFinish(res, fileInfo, newData);
                }
            } else {
                if (typeof this.stepUploadFinish === 'function') {
                    this.stepUploadFinish(preRes, fileInfo, newData);
                }
            }
            callback(null, res);
        }, (err) => {
            if (err) {
                console.error(err);
            }

            if (this.removeScanImagesFlag) {
                window.DWObject.RemoveAllImages();
                this.fileIndex = 0;
            }

            if (typeof this.uploadFinish === 'function') {
                this.uploadFinish();
            }
        });
    }
};

