import { getPdfDocument, getOnePageData, cleanPdfDoc, checkMultiInvoicePdf } from '@piaozone.com/pdf-to-image/src/pdfTools';
import { tools, loadJs, pwyFetch, clientCheck } from '@piaozone.com/utils';
import { compressImgFile } from '@piaozone.com/process-image';
import async from 'async';

const consoleLog = tools.consoleLog;
const getUUId = tools.getUUId;

export default class MultiInvoicesUpload {
    constructor(opt) {
        this.uploadSingleUrl = opt.uploadSingleUrl || ''; // 单页上传pdf的地址
        this.analysisFullUrl = opt.analysisFullUrl || ''; // 前端不支持时需要后台解析完整pdf，然后通过单页获取pdf信息
        this.getPdfInfoUrl = opt.getPdfInfoUrl || ''; // 后台解析pdf时，获取单页pdf信息的接口地址
        this.uploadFullUrl = opt.uploadFullUrl || ''; // 前台解析pdf时，上传完整pdf的接口地址
        this.datas = opt.datas || {};
        this.onPreUpload = opt.onPreUpload;
        this.onStepFinish = opt.onStepFinish || function() {};
        this.onFinish = opt.onFinish || function() {};
        this.limit = opt.limit || 2;
        this.scale = opt.scale ? (opt.scale > 3.5 ? 3.5 : opt.scale) : 1.5; // 最大放大系数为3.5, 默认1.5
        this.quality = opt.quality || 0.95;
        this.staticUrl = opt.staticUrl || '';
        this.limeFileSize = opt.limeFileSize || 20;
        this.uploadName = opt.uploadName || 'file';
        this.useBackendUpload = opt.useBackendUpload;
        this.pdfDoc = null;
        this.fileQuality = opt.fileQuality;
        this.fileLimitWidth = opt.fileLimitWidth;
        this.fileLimitHeight = opt.fileLimitHeight;
        this.fileLimitPixel = opt.fileLimitPixel;
        this.fileLimitSize = opt.fileLimitSize;
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

    getNormalOpt = (opt, curFile) => {
        let init = {
            index: opt.index || 0, // 文件索引
            pageNo: opt.pageNo || 1, // 多页pdf的当前处理的页
            totalPages: opt.totalPages || 1, // 多页pdf时的页数
            id: opt.id, // 当前处理对象的唯一索引
            fileHash: opt.fileHash || '' // 文件的hash值
        };
        if (typeof curFile === 'object') {
            init = {
                ...init,
                localUrl: opt.localUrl || window.URL.createObjectURL(curFile),
                name: opt.name || curFile.name,
                file: curFile,
                size: curFile.size,
                width: curFile.width || 0,
                height: curFile.height || 0
            };
        }
        return init;
    }

    // 获取上传文件前的参数
    getUploadOpt = async(curFile, opt) => {
        let preResData = {};
        opt = opt || {};
        const name = opt.name || curFile.name; // 文件名称，如果是多页pdf可以用拆分后返回的name
        if (typeof this.onPreUpload === 'function') {
            try {
                const normalOpt = this.getNormalOpt(opt, curFile);
                const preRes = await this.onPreUpload(normalOpt);
                if (preRes.errcode === '0000') {
                    preResData = preRes.data;
                } else {
                    return {
                        ...preRes,
                        description: preRes.description || '获取上传前参数异常'
                    };
                }
            } catch (error) {
                consoleLog(error, 'error', '处理上传回调失败');
            }
        }
        const formData = new FormData();
        const tempDatas = { ...this.datas, ...preResData };
        formData.append(this.uploadName, curFile, name);
        Object.keys(tempDatas).forEach((keyName) => {
            formData.append(keyName, tempDatas[keyName]);
        });
        return {
            errcode: '0000',
            data: formData,
            description: 'success'
        };
    }

    handleUploadFile = async(url, formData) => {
        const uploadRes = await pwyFetch(url, {
            method: 'post',
            body: formData,
            contentType: 'file'
        });
        return uploadRes;
    }

    // 文件通用处理
    handleFile = async(waitFile, opt) => {
        if (this.uploadSingleUrl === '') {
            return {
                errcode: '30001',
                description: '参数错误，文件上传地址不能为空'
            };
        }

        const res = await this.getUploadOpt(waitFile, opt);
        if (res.errcode !== '0000') {
            return res;
        }
        const upRes = await this.handleUploadFile(this.uploadSingleUrl, res.data);
        return upRes;
    }

    handleImage = async(waitFile, opt) => {
        const compressOpt = {};
        if (this.fileQuality) {
            compressOpt.fileQuality = this.fileQuality;
        }

        if (this.fileLimitWidth) {
            compressOpt.fileLimitWidth = this.fileLimitWidth;
        }

        if (this.fileLimitHeight) {
            compressOpt.fileLimitHeight = this.fileLimitHeight;
        }

        if (this.fileLimitPixel) {
            compressOpt.fileLimitPixel = this.fileLimitPixel;
        }

        if (this.fileLimitSize) {
            compressOpt.fileLimitSize = this.fileLimitSize;
        }

        const presRes = await compressImgFile(waitFile, compressOpt);
        let res;
        // 压缩失败，直接上传原件
        if (presRes.errcode !== '0000') {
            res = await this.handleFile(waitFile, opt);
        } else {
            const file = presRes.file;
            res = await this.handleFile(file, opt);
        }
        return res;
    }

    readAsBinaryString = (fileData) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            if (typeof FileReader.prototype.readAsBinaryString === 'function') {
                reader.onload = function(e) {
                    resolve(reader.result);
                };
                reader.onerror = function() {
                    resolve(null);
                };
                reader.readAsBinaryString(fileData);
            } else {
                let binary = '';
                reader.onload = function(e) {
                    var bytes = new Uint8Array(reader.result);
                    var length = bytes.byteLength;
                    for (var i = 0; i < length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    resolve(binary);
                };
                reader.onerror = function() {
                    resolve(null);
                };
                reader.readAsArrayBuffer(fileData);
            }
        });
    }

    readInvoiceExcel = async(file) => {
        const binaryData = await this.readAsBinaryString(file);
        if (!binaryData) {
            return {
                errcode: '4000',
                description: '文件解析异常'
            };
        }
        const XLSX = window.XLSX;
        const wb = XLSX.read(binaryData, {
            type: 'binary'
        });
        const resultList = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
            defval: ''
        });
        const resList = [];
        for (let i = 0; i < resultList.length; i++) {
            const invoiceCode = resultList[i]['发票代码'] || '';
            const invoiceNo = resultList[i]['发票号码'] || '';
            let invoiceDate = resultList[i]['开票日期'] || '';
            const checkCode = resultList[i]['校验码后六位(普票必填)'] || '';
            const invoiceMoney = resultList[i]['开票不含税金额（专票必填）'] || '';
            if (!invoiceCode || !invoiceNo || !invoiceDate) {
                continue;
            }
            invoiceDate = invoiceDate.toString().trim();
            if (invoiceDate.length === 8) {
                invoiceDate = invoiceDate.substr(0, 4) + '-' + invoiceDate.substr(4, 2) + '-' + invoiceDate.substr(6, 2);
            }

            resList.push({
                fpdm: invoiceCode,
                fphm: invoiceNo,
                kprq: invoiceDate,
                kpje: invoiceMoney,
                jym: checkCode
            });
        }
        return {
            errcode: '0000',
            data: resList
        };
    }

    loadJsLib = (url) => {
        return new Promise((resolve) => {
            loadJs.syncUse(url, async() => {
                this.loadedExcelLib = true;
                resolve(null);
            });
        });
    }

    handleExcel = async(waitFile) => {
        if (!this.loadedExcelLib) {
            await this.loadJsLib(this.staticUrl + '/gallery/xlsx/xlsx.full.min.js');
        }
        const res = await this.readInvoiceExcel(waitFile);
        if (res.errcode !== '0000') {
            return res;
        }
        return res;
    }

    // 后台解析是获取后台pdf处理结果
    getPdfPagesInfo = (resData, opt) => {
        return new Promise((resolve) => {
            async.mapLimit(resData, this.limit, async(pageItem, callback) => {
                const fileUrl = pageItem.fileUrl;
                let getRes = { errcode: '5000', description: '服务端异常，请稍后再试' };
                try {
                    getRes = await pwyFetch(this.getPdfInfoUrl, {
                        method: 'post',
                        body: {
                            fileUrl: fileUrl,
                            ...this.datas
                        }
                    });
                } catch (error) {
                    console && console.error('getPdfPagesInfo error', error);
                }
                await this.wrapStepFinish({
                    ...getRes,
                    ...opt,
                    imgSrc: pageItem.fileUrl,
                    pageNo: pageItem.index,
                    processType: 'pdfPageInfo'
                });
                callback(null);
            }, async() => {
                resolve({ errcode: '0000' });
            });
        });
    }

    startAnalysisFullPdf = async(waitFile, opt) => {
        const normalOpt = this.getNormalOpt(opt, waitFile);
        const formData = new FormData();
        formData.append(this.uploadName, waitFile, waitFile.name);
        Object.keys(this.datas).forEach((keyName) => {
            formData.append(keyName, this.datas[keyName]);
        });
        const uploadRes = await this.handleUploadFile(this.analysisFullUrl, formData);
        if (uploadRes.errcode !== '0000') {
            return {
                processType: 'pdf',
                ...uploadRes,
                ...normalOpt
            };
        }
        const resData = uploadRes.data;
        this.getPdfPagesInfo(resData, normalOpt);
    }

    // 处理多页pdf的页
    handleMultiPdfPage = async(pageNo, opt) => {
        const normalOpt = this.getNormalOpt({ ...opt, totalPages: this.pdfDoc.numPages });
        const res = await getOnePageData(this.pdfDoc, pageNo, this.scale, this.quality);
        if (res.errcode !== '0000') {
            await this.wrapStepFinish({
                ...res,
                ...normalOpt,
                pageNo,
                processType: 'pdfPage'
            });
            return;
        }
        const { file, name, localUrl, id, totalPages, width, height } = res.data;
        const uploadInitOpt = {
            name,
            localUrl,
            id,
            pageNo,
            totalPages,
            width,
            height
        };
        const optRes = await this.getUploadOpt(file, uploadInitOpt);
        if (optRes.errcode !== '0000') {
            await this.wrapStepFinish({
                ...res,
                ...uploadInitOpt,
                processType: 'pdfPage'
            });
            return;
        }
        const upRes = await this.handleUploadFile(this.uploadSingleUrl, optRes.data);
        await this.wrapStepFinish({
            ...upRes,
            ...uploadInitOpt,
            processType: 'pdfPage'
        });
    }

    // 处理多页pdf
    handleMultiPdf = async(waitFile, opt) => {
        return new Promise((resolve) => {
            const innerHanlder = () => {
                const totalNum = this.pdfDoc.numPages;
                const pageList = [];
                for (let pageNo = 1; pageNo <= totalNum; pageNo++) {
                    pageList.push(pageNo);
                }

                async.mapLimit(pageList, this.limit, async(pageNo, callback) => {
                    await this.handleMultiPdfPage(pageNo, opt);
                    callback(null);
                }, async(err) => {
                    if (err) {
                        console.log('handlerPdfDoc err', err);
                    }
                    resolve({ errcode: '0000' });
                });
            };
            if (this.uploadFullUrl) {
                const formData = new FormData();
                const tempDatas = { ...this.datas, ...opt };
                formData.append(this.uploadName, waitFile, waitFile.name);
                Object.keys(tempDatas).forEach((keyName) => {
                    formData.append(keyName, tempDatas[keyName]);
                });

                this.handleUploadFile(this.uploadFullUrl, formData).then((upfullRes) => {
                    if (upfullRes.errcode !== '0000') {
                        cleanPdfDoc(this.pdfDoc);
                        resolve(upfullRes);
                        return;
                    }
                    innerHanlder();
                });
            } else {
                innerHanlder();
            }
        });
    }

    // 处理pdf入口
    handlePdf = async(waitFile, opt) => {
        const isLevelBroser = this.checkIsLowBroser();
        let browserIsSupport = true;
        if (isLevelBroser || !window.URL || !window.URL.createObjectURL) {
            if (!this.analysisFullUrl || !this.getPdfInfoUrl) {
                return {
                    errcode: '30002',
                    description: '当前浏览器不支持多页pdf处理'
                };
            }
            browserIsSupport = false;
        }

        let res;
        if (browserIsSupport) {
            const pdfRes = await getPdfDocument({
                CMAP_URL: this.staticUrl + '/gallery/pdfjs-dist/2.10.377/cmaps/', // pdfjs字体地址
                workerSrc: this.staticUrl + '/gallery/pdfjs-dist/2.10.377/build/pdf.worker.min.js', // pdfjs的worker地址
                file: waitFile
            });
            if (pdfRes.errcode !== '0000') {
                return pdfRes;
            }
            this.pdfDoc = pdfRes.data;
            const fileHash = pdfRes.fileHash;
            const checkRes = await checkMultiInvoicePdf(this.pdfDoc);
            if (checkRes.errcode !== '0000') { // 检测失败
                await this.startAnalysisFullPdf(waitFile, opt);
            } else if (checkRes.data === 2) { // 组装的多页PDF
                res = await this.handleMultiPdf(waitFile, { ...opt, fileHash });
                if (res.errcode !== '0000') {
                    res = await this.startAnalysisFullPdf(waitFile, opt);
                }
            } else { // 电子发票
                res = await this.handleFile(waitFile, opt);
                cleanPdfDoc(this.pdfDoc);
            }
        } else {
            res = await this.startAnalysisFullPdf(waitFile, opt);
        }
        return res;
    }


    wrapStepFinish = async(opt) => {
        try {
            await this.onStepFinish(opt);
        } catch (error) {
            console.log('onStepFinish error', error);
        }
    }

    startHandleSingleFile = async(waitFile, index) => {
        const fileType = waitFile.type;
        const name = waitFile.name;
        let processType = 'other';
        let res;
        let localUrl = '';
        try {
            localUrl = window.URL.createObjectURL(waitFile);
        } catch (error) {
            console.warn('获取本地连接异常', error);
        }
        const opt = {
            id: getUUId(),
            index,
            localUrl,
            name
        };

        // 前端限制文件大小
        const mSize = waitFile.size / 1024 / 1024;
        let myHandle;
        if (parseInt(mSize) > this.limeFileSize) {
            res = {
                errcode: '30003',
                description: '文件大小超出限制'
            };
        } else if (fileType.indexOf('image') !== -1) { // 图像可能存在压缩，需要通过图像方式处理
            myHandle = this.handleImage;
            processType = 'image';
        } else if (/\.(xlsx|XLSX|xls|XLS)$/.test(name)) { // excel 需要前端解析excel数据
            myHandle = this.handleExcel;
            processType = 'excel';
        } else if (/\.(ofd|OFD)$/.test(name)) { // ofd直接上传给后台处理，使用通用的处理方式
            myHandle = this.handleFile;
            processType = 'ofd';
        } else if (/\.(pdf|PDF)$/.test(name)) { // pdf需要单独处理
            myHandle = this.handlePdf;
            processType = 'pdf';
        } else {
            processType = 'other';
            res = {
                errcode: '30000',
                description: '不支持该文件类型，请重新选择'
            };
        }

        if (myHandle) {
            res = await myHandle(waitFile, opt);
        }

        await this.wrapStepFinish({
            ...res,
            ...opt,
            file: waitFile,
            processType
        });
    }

    start = async(waitFile, opt = {}) => {
        if (opt.onStepFinish) {
            this.onStepFinish = opt.onStepFinish;
        }
        if (opt.onFinish) {
            this.onFinish = opt.onFinish;
        }
        if (opt.onPreUpload) {
            this.onPreUpload = opt.onPreUpload;
        }
        let res = { errcode: '0000', data: [], description: 'success' };
        if (waitFile instanceof File) {
            await this.startHandleSingleFile(waitFile, 0);
        } else if (waitFile instanceof Array || waitFile instanceof FileList) {
            for (let i = 0; i < waitFile.length; i++) {
                await this.startHandleSingleFile(waitFile[i], i);
            }
        } else {
            res = {
                errcode: '30002',
                description: '参数错误, 请检查！'
            };
        }
        await this.onFinish(res);
    }
}
