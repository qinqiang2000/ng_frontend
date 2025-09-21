import { getPdfDocument, getOnePageData, cleanPdfDoc } from './pdfTools';
import { tools, pwyFetch, clientCheck } from '@piaozone.com/utils';
import async from 'async';

const consoleLog = tools.consoleLog;
const getUUId = tools.getUUId;

// 上传多页pdf
export default class UploadMultPagePdf {
    constructor(opt) {
        this.uploadSingleUrl = opt.uploadSingleUrl || ''; // 单页上传pdf的地址
        this.analysisFullUrl = opt.analysisFullUrl || ''; // 前端不支持时需要后台解析完整pdf，然后通过单页获取pdf信息
        this.getPdfInfoUrl = opt.getPdfInfoUrl || ''; // 后台解析pdf时，获取单页pdf信息的接口地址
        this.uploadFullUrl = opt.uploadFullUrl || ''; // 前台解析pdf时，上传完整pdf的接口地址
        this.datas = opt.datas || {};
        this.onPreUpload = opt.onPreUpload;
        this.onStepFinish = opt.onStepFinish;
        this.limit = opt.limit || 2;
        this.scale = opt.scale ? (opt.scale > 3.5 ? 3.5 : opt.scale) : 1.5; // 最大放大系数为3.5, 默认1.5
        this.quality = opt.quality || 0.95;
        this.staticUrl = opt.staticUrl || '';
        this.limeFileSize = opt.limeFileSize || 20;
        this.uploadName = opt.uploadName || 'file';
        this.useBackendUpload = opt.useBackendUpload;
        this.pdfDoc = null;
    }

    checkIsLowBroser = () => {
        if (this.useBackendUpload) {
            return true;
        }

        if (typeof FileReader !== 'function') {
            return true;
        }

        const clientInfo = clientCheck();
        const { browser } = clientInfo;
        if (browser.chrome > 50) {
            return false;
        } else if (browser.firefox > 50) {
            return false;
        }
        return true;
    }

    handlerPdfPage = async(pageNo, fileHash, handlerStepFinish) => {
        const res = await getOnePageData(this.pdfDoc, pageNo, this.scale, this.quality);
        if (res.errcode !== '0000') {
            this.uploadIndex += 1;
            await handlerStepFinish({
                percentIndex: this.uploadIndex,
                status: 2,
                ...res.data
            });
        } else {
            let preResData = {};
            if (typeof this.onPreUpload === 'function') {
                try {
                    const preRes = await this.onPreUpload(res.data);
                    if (preRes.errcode === '0000') {
                        preResData = preRes.data;
                    }
                } catch (error) {
                    consoleLog(error, 'error', '处理上传回调失败');
                }
            }
            const { file, name, localUrl, id, totalPages, pageNo, width, height } = res.data;
            const formData = new FormData();
            const tempDatas = { ...this.datas, ...preResData, fileHash };
            formData.append(this.uploadName, file, name);
            Object.keys(tempDatas).forEach((keyName) => {
                formData.append(keyName, tempDatas[keyName]);
            });

            const uploadRes = await pwyFetch(this.uploadSingleUrl, {
                method: 'post',
                body: formData,
                contentType: 'file'
            });
            this.uploadIndex += 1;
            const errcode = uploadRes.errcode;
            await handlerStepFinish({
                fileHash,
                percentIndex: this.uploadIndex,
                id,
                width,
                height,
                pageNo,
                totalPages,
                data: uploadRes.data,
                status: errcode === '0000' ? 1 : 3,
                errcode: errcode,
                description: uploadRes.description,
                file: errcode === '0000' ? '' : file,
                size: file.size,
                imgSrc: localUrl
            });
        }
    }

    handlerPdfDoc = (fileHash, handlerStepFinish) => {
        return new Promise((resolve) => {
            const totalNum = this.pdfDoc.numPages;
            const pageList = [];
            for (let pageNo = 1; pageNo <= totalNum; pageNo++) {
                pageList.push(pageNo);
            }
            async.mapLimit(pageList, this.limit, async(pageNo, callback) => {
                const res = await this.handlerPdfPage(pageNo, fileHash, handlerStepFinish);
                callback(null, res);
            }, async(err) => {
                if (err) {
                    console.log('handlerPdfDoc err', err);
                }
                resolve({ errcode: '0000' });
            });
        });
    }

    startUploadFile = async(file, onStepFinish) => {
        // 前端限制文件大小
        const mSize = file.size / 1024 / 1024;
        const filename = file.name;
        if (parseInt(mSize) > this.limeFileSize) {
            return {
                filename,
                errcode: '30001',
                description: '文件大小超出限制，最大允许' + this.limeFileSize + 'M'
            };
        }


        const pdfRes = await getPdfDocument({
            CMAP_URL: this.staticUrl + '/gallery/pdfjs-dist/cmaps/', // pdfjs字体地址
            workerSrc: this.staticUrl + '/gallery/pdfjs-dist/build/pdf.worker.min.js', // pdfjs的worker地址
            file
        });

        if (pdfRes.errcode !== '0000') {
            return pdfRes;
        }

        this.pdfDoc = pdfRes.data;
        if (this.uploadFullUrl) {
            const upfullRes = await this.uploadFullPdf(file, pdfRes.fileHash);
            if (upfullRes.errcode !== '0000') {
                cleanPdfDoc(this.pdfDoc);
                return upfullRes;
            }
        }

        const handlerStepFinish = async(info) => {
            try {
                await onStepFinish({ ...info, filename: file.name });
            } catch (error) {
                consoleLog(error, 'error', '处理上传回调失败');
            }
        };
        const res = await this.handlerPdfDoc(pdfRes.fileHash, handlerStepFinish);
        return res;
    }


    getPdfPagesInfo = (resData, handlerStepFinish) => {
        return new Promise((resolve) => {
            async.mapLimit(resData, this.limit, async(pageItem, callback) => {
                const pageNo = pageItem.index;
                const fileUrl = pageItem.fileUrl;
                const getRes = await pwyFetch(this.getPdfInfoUrl, {
                    method: 'post',
                    body: {
                        fileUrl: fileUrl,
                        ...this.datas
                    }
                });
                this.uploadIndex += 1;
                const errcode = getRes.errcode;
                await handlerStepFinish({
                    percentIndex: this.uploadIndex,
                    id: getUUId(),
                    pageNo,
                    totalPages: resData.length,
                    data: getRes.data,
                    status: errcode === '0000' ? 1 : 4,
                    errcode: errcode,
                    description: getRes.description,
                    file: errcode === '0000' ? '' : fileUrl,
                    imgSrc: fileUrl
                });
                callback(null, getRes);
            }, async() => {
                resolve({ errcode: '0000' });
            });
        });
    }

    startAnalysisFullPdf = async(file, onStepFinish) => {
        const mSize = file.size / 1024 / 1024;
        const filename = file.name;
        if (parseInt(mSize) > this.limeFileSize) {
            return {
                filename,
                errcode: '30001',
                description: '文件大小超出限制，最大允许' + this.limeFileSize + 'M'
            };
        }

        const formData = new FormData();
        formData.append(this.uploadName, file, file.name);
        Object.keys(this.datas).forEach((keyName) => {
            formData.append(keyName, this.datas[keyName]);
        });

        const uploadRes = await pwyFetch(this.analysisFullUrl, {
            method: 'post',
            body: formData,
            contentType: 'file'
        });

        if (uploadRes.errcode !== '0000') {
            return uploadRes;
        }

        const handlerStepFinish = async(info) => {
            try {
                await onStepFinish({ ...info, filename });
            } catch (error) {
                consoleLog(error, 'error', '上传处理回调失败');
            }
        };
        const resData = uploadRes.data;
        const res = await this.getPdfPagesInfo(resData, handlerStepFinish);
        return res;
    }

    uploadFullPdf = async(file, fileHash) => {
        const formData = new FormData();
        const tempDatas = { ...this.datas, fileHash };
        formData.append(this.uploadName, file, file.name);
        Object.keys(tempDatas).forEach((keyName) => {
            formData.append(keyName, tempDatas[keyName]);
        });

        const uploadRes = await pwyFetch(this.uploadFullUrl, {
            method: 'post',
            body: formData,
            contentType: 'file'
        });
        return uploadRes;
    }

    startUpload = async(waitFile, onStepFinish, isUseBackend) => {
        const result = [];
        const isLevelBroser = this.checkIsLowBroser();
        if (isLevelBroser || isUseBackend || !window.URL || !window.URL.createObjectURL) {
            if (!this.analysisFullUrl || !this.getPdfInfoUrl) {
                return {
                    errcode: '30002',
                    description: '当前浏览器不支持多页pdf处理'
                };
            }

            if (waitFile instanceof File) {
                this.uploadIndex = 0;
                const res = await this.startAnalysisFullPdf(waitFile, onStepFinish);
                result.push(res);
            } else if (waitFile instanceof Array || waitFile instanceof FileList) {
                for (let i = 0; i < waitFile.length; i++) {
                    this.uploadIndex = 0;
                    const res = await this.startAnalysisFullPdf(waitFile[i], onStepFinish);
                    result.push(res);
                }
            } else {
                return {
                    errcode: '30002',
                    description: '参数错误, 请检查！'
                };
            }
        } else {
            if (waitFile instanceof File) {
                this.uploadIndex = 0;
                const res = await this.startUploadFile(waitFile, onStepFinish);
                result.push(res);
            } else if (waitFile instanceof Array || waitFile instanceof FileList) {
                for (let i = 0; i < waitFile.length; i++) {
                    this.uploadIndex = 0;
                    const res = await this.startUploadFile(waitFile[i], onStepFinish);
                    result.push(res);
                }
            } else {
                return {
                    errcode: '30002',
                    description: '参数错误, 请检查！'
                };
            }
        }
        return { errcode: '0000', data: result };
    }

    retryUpload = async(list, onPreStepUpload, onStepFinish) => {
        return new Promise((resolve, reject) => {
            async.mapLimit(list, this.limit, async(item, callback) => {
                const status = item.status;
                await onPreStepUpload(item);
                const handlerStepFinish = async(info) => {
                    try {
                        await onStepFinish({
                            ...info,
                            id: item.id // 重试时保存id为原始id
                        });
                    } catch (error) {
                        consoleLog(error, 'error', '上传处理回调失败');
                    }
                };

                // 前端切图后处理异常
                if (status === 2 || status === 3) {
                    await this.handlerPdfPage(item.pageNo, item.fileHash, handlerStepFinish);
                } else if (status === 4) {
                    const res = await pwyFetch(this.getPdfInfoUrl, {
                        method: 'POST',
                        body: {
                            fileUrl: item.imgSrc,
                            ...this.datas
                        }
                    });
                    if (res.errcode === '0000') {
                        await handlerStepFinish({ ...res, status: 1 });
                    } else {
                        await handlerStepFinish({ ...res, status: 4 });
                    }
                } else {
                    await handlerStepFinish(item);
                }
                callback(null);
            }, () => {
                resolve({ errcode: '0000' });
            });
        });
    }
}
