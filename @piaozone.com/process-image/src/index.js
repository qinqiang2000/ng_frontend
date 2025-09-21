const processUtils = require('./utils');
const OperateCanvas = require('./operateCanvas').default;
const { compressImgFile } = require('./compressImg');

module.exports = {
    adjustSize: processUtils.adjustSize,
    loadImage: processUtils.loadImage,
    base64ToFile: processUtils.base64ToFile,
    normalize: processUtils.normalize,
    getRotateRect: processUtils.getRotateRect,
    cuteImage: processUtils.cuteImage,
    markImage: processUtils.markImage,
    sortByRegion: processUtils.sortByRegion,
    OperateCanvas,
    compressImgFile
};