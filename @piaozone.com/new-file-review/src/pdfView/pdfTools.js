import { base64ToFile } from '@piaozone.com/process-image';
import { tools } from '@piaozone.com/utils';
const CryptoJS = require('crypto-js');
const { consoleLog, getUUId } = tools;
const _getDocument = (pdfJs, opt, filename, timeout = 20000) => {
    return Promise.race([
        new Promise((resolve) => {
            pdfJs
                .getDocument(opt)
                .promise.then((pdfDoc) => {
                    pdfDoc.filename = filename;
                    resolve({ errcode: '0000', data: pdfDoc });
                })
                .catch((err) => {
                    console.log(err);
                    resolve({ errcode: '5000', description: '服务端异常，请稍后再试' });
                });
        }),
        new Promise((resolve) => {
            setTimeout(() => {
                resolve({ errcode: 'getDocumentTimeout', description: 'pdf处理超时！' });
            }, timeout);
        })
    ]);
};

export const cleanPdfPage = (p) => {
    try {
        p.cleanup();
    } catch (error) {
        consoleLog('clean Pdf Page error', error);
    }
};

export const cleanPdfDoc = async(pDoc) => {
    try {
        pDoc.cleanup();
        pDoc.destroy();
    } catch (error) {
        consoleLog('clean Pdf Doc error', error);
    }
};

// 获取pdf文档对象
export const getPdfDocument = async(opt) => {
    const pdfJs = require('pdfjs-dist');
    const workerSrcEntry = require('pdfjs-dist/build/pdf.worker.entry');
    pdfJs.workerSrc = workerSrcEntry;

    const newOpt = {};
    const { CMAP_URL = '', file, data, timeout = 20000 } = opt;
    // if (workerSrc) {
    //     pdfJs.GlobalWorkerOptions.workerSrc = workerSrc;
    // }

    if (CMAP_URL) {
        newOpt.cMapUrl = CMAP_URL;
        newOpt.cMapPacked = true;
    }

    let filename = (+new Date() + '-' + Math.random()).replace('0.', '') + '.jpg';
    let fileHash = '';

    if (typeof data !== 'undefined') {
        newOpt.data = data;
    } else if (typeof file === 'object') {
        const arrBuffer = await readFile(file);
        newOpt.data = arrBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrBuffer);
        fileHash = CryptoJS.SHA256(wordArray).toString();
        filename = +new Date() + '-' + file.name;
    } else if (typeof file === 'string') {
        newOpt.url = file;
        newOpt.withCredentials = true; // 允许携带cookie
    } else {
        return {
            errcode: 'err',
            description: '参数异常，文件对象为空'
        };
    }

    try {
        const pdfDoc = await _getDocument(pdfJs, newOpt, filename, timeout);
        return { ...pdfDoc, fileHash };
    } catch (error) {
        consoleLog('获取pdf文档异常', error);
        return {
            errcode: 'err',
            description: '获取pdf文档失败'
        };
    }
};

const _pdfRenderToCanvas = (pdfDoc, canvasId, pageNo = 1, scale = 1.5) => {
    return new Promise((resolve) => {
        pdfDoc.getPage(pageNo).then((page) => {
            const viewport = page.getViewport({ scale });
            const canvas = document.getElementById(canvasId);
            const context = canvas.getContext('2d');
            const width = parseInt(viewport.width);
            const height = parseInt(viewport.height);
            canvas.height = height;
            canvas.width = width;
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            const pageRendering = page.render(renderContext);
            pageRendering.promise.then((err) => {
                if (err) {
                    resolve({ errcode: 'err', description: 'pdf处理异常' });
                    return;
                }
                resolve({ errcode: '0000', description: 'success' });
            });
        });
    });
};

// 校验多页pdf是否为发票pdf
export const checkMultiInvoicePdf = (pdfDoc, pageNo = 1) => {
    return new Promise((resolve) => {
        pdfDoc.getPage(pageNo).then((page) => {
            try {
                page.getTextContent().then((textContent) => {
                    if (!textContent) {
                        resolve({
                            errcode: '50002',
                            description: '获取pdf内容异常'
                        });
                        return;
                    }
                    const textArr = [];
                    let type = 2; // 默认为组装的多页PDF
                    for (let i = 0; i < textContent.items.length; i++) {
                        textArr.push(textContent.items[i].str);
                    }
                    const pdfStr = textArr.join('');
                    if (pdfStr.length > 50 && pdfStr.indexOf('发票') !== -1) {
                        type = 1; // 发票多页PDF
                    }
                    resolve({
                        errcode: '0000',
                        data: type
                    });
                });
            } catch (error) {
                console && console.warn('获取pdf内容异常', error);
                resolve({
                    errcode: '50003',
                    description: '获取pdf内容异常'
                });
            }
        }).catch((err) => {
            console && console.warn('pdf处理异常', err);
            resolve({
                errcode: '50001',
                description: 'pdf处理异常'
            });
        });
    });
};

export const getOnePageData = (pdfDoc, pageNo, scale = 1.5, quality = 0.95, disabledToFile, viewportProportion = 1) => {
    return new Promise((resolve) => {
        pdfDoc
            .getPage(pageNo)
            .then((page) => {
                const view = page._pageInfo.view;
                if (view.length > 3) {
                    const viewWidth = view[2] - view[0];
                    const viewHeight = view[3] - view[1];
                    if (viewWidth > 1300 && viewHeight > 1300) {
                        // 对于过大的页，不用放大处理
                        scale = 1;
                    }
                }

                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const width = parseInt(viewport.width * viewportProportion);
                const height = parseInt(viewport.height * viewportProportion);
                canvas.height = height;
                canvas.width = width;
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                if (viewportProportion !== 1) {
                    renderContext.transform = [viewportProportion, 0, 0, viewportProportion, 0, 0];
                }
                const pageRendering = page.render(renderContext);
                const filename = pageNo + '-' + pdfDoc.filename.replace(/\.(pdf|PDF)$/, '') + '.jpg';
                const baseInfo = { id: getUUId(), pageNo, totalPages: pdfDoc.numPages, name: filename };
                pageRendering.promise
                    .then((err) => {
                        if (err) {
                            cleanPdfPage(page);
                            resolve({ data: baseInfo, errcode: 'err', description: 'pdf转换异常' });
                            return;
                        }

                        const base64Result = canvas.toDataURL('image/jpeg', quality);
                        if (disabledToFile) {
                            cleanPdfPage(page);
                            resolve({
                                errcode: '0000',
                                data: {
                                    ...baseInfo,
                                    width,
                                    height,
                                    base64: base64Result
                                }
                            });
                            return;
                        }

                        const fileRes = base64ToFile(base64Result, filename);
                        if (fileRes.errcode !== '0000') {
                            cleanPdfPage(page);
                            resolve({
                                data: baseInfo,
                                errcode: '50001',
                                description: 'pdf处理异常'
                            });
                            return;
                        }

                        cleanPdfPage(page);
                        resolve({
                            errcode: '0000',
                            data: {
                                ...baseInfo,
                                width,
                                height,
                                file: fileRes.data,
                                localUrl: window.URL.createObjectURL(fileRes.data)
                            }
                        });
                    })
                    .catch((err) => {
                        cleanPdfPage(page);
                        consoleLog('pdf处理异常', err);
                        resolve({
                            data: baseInfo,
                            errcode: '50001',
                            description: 'pdf处理异常'
                        });
                    });
            })
            .catch((err) => {
                consoleLog('pdf处理异常', err);
                resolve({
                    errcode: '50001',
                    description: 'pdf处理异常'
                });
            });
    });
};

export const readFile = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            resolve(reader.result);
        };
    });
};

// pdf渲染到canvas上
export const pdfRenderToCanvas = async(pdfDoc, opt) => {
    const { canvasId, pageNo, scale = 1.5 } = opt;
    if (scale > 3.5) {
        return {
            errcode: '3001',
            description: '放大系数不能超过3.5'
        };
    }

    const res = await _pdfRenderToCanvas(pdfDoc, canvasId, pageNo, scale);
    return res;
};

// pdf转换为图像
export const pdfToImage = async(pdfDoc, opt) => {
    const { onStepFinish, onFinish, scale = 1.5, quality = 0.95, disabledToFile, viewportProportion } = opt;
    const handlerFinish = async(result) => {
        if (typeof onFinish === 'function') {
            try {
                await onFinish(result);
            } catch (error) {
                consoleLog('pdf转换为图片异常', error);
            }
        }
    };
    if (scale > 3.5) {
        handlerFinish({
            errcode: '3001',
            description: '放大系数不能超过3.5'
        });
        return;
    }

    const totalNum = pdfDoc.numPages;
    for (let pageNo = 1; pageNo <= totalNum; pageNo++) {
        const res = await getOnePageData(pdfDoc, pageNo, scale, quality, disabledToFile, viewportProportion);
        if (typeof onStepFinish === 'function') {
            const resData = res.data || {};
            try {
                await onStepFinish({
                    errcode: res.errcode,
                    data: {
                        ...resData,
                        pageNo,
                        totalNum
                    }
                });
            } catch (e) {
                consoleLog('回调处理异常', e);
            }
        }
    }

    handlerFinish({
        errcode: '0000',
        data: {
            totalNum
        }
    });
};
