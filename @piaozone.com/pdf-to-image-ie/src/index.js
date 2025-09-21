const { getPdfDocument, readFile, pdfRenderToCanvas, pdfToImage, getOnePageData } = require('./pdfTools');
const UploadMultPagePdf = require('./uploadMultPagePdf').default;

export {
    getPdfDocument,
    readFile,
    pdfRenderToCanvas,
    getOnePageData,
    pdfToImage,
    UploadMultPagePdf
};
