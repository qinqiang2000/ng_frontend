import { loadImage, base64ToFile } from './utils';

export async function tempCompressImgFile(file, options = { }) {
    let localUrl = options.localUrl || '';
    // 浏览器兼容
    const URL = window.URL || window.webkitURL || window.mozURL || {};
    const fileType = file.type || '';
    // 非图像，不支持的浏览器不压缩，没有设置压缩，直接返回
    if (fileType.indexOf('image/') === -1 || typeof URL.createObjectURL !== 'function' || typeof options.fileLimitSize === 'undefined') {
        return {
            errcode: '0000',
            localUrl,
            file
        };
    }

    const {
        fileLimitWidth,
        fileLimitHeight,
        fixShootDeg, // 是否通过canvas修正拍摄角度
        onlyGetBase64 // 只需要返回base64，不需要转换为file
    } = options;


    // 短边最小值
    let fileLimitPixel = options.fileLimitPixel;
    if (!fileLimitPixel && fileLimitWidth && fileLimitHeight) {
        fileLimitPixel = fileLimitWidth > fileLimitHeight ? fileLimitHeight : fileLimitWidth;
    }

    if (!fileLimitPixel) {
        fileLimitPixel = 1500;
    }

    let fileLimitQuality = options.fileQuality || 0.98;
    if (isNaN(parseFloat(fileLimitQuality))) {
        fileLimitQuality = 0.98;
    } else {
        fileLimitQuality = parseFloat(fileLimitQuality);
    }


    if (localUrl === '') {
        try {
            localUrl = URL.createObjectURL(file);
        } catch (error) {
            if (window.console) {
                console.error(error);
            }
            return {
                errcode: '0000',
                localUrl,
                file
            };
        }
    }

    const fileLimitSize = options.fileLimitSize;
    const fileSize = file.size;
    const fileLimitSizeTemp = parseFloat(fileLimitSize) * 1024 * 1024;
    // 文件大小小于指定大小不需要压缩
    if (fileSize <= fileLimitSizeTemp && !fixShootDeg) {
        return {
            errcode: '0000',
            localUrl,
            file
        };
    }

    // 计算压缩比例
    let rate = fileLimitSizeTemp / fileSize;
    rate = rate > 1 ? 1 : rate;
    const loadRes = await loadImage(localUrl);

    // 前端加载图像失败，直接返回原始图像不压缩
    if (loadRes.errcode !== '0000') {
        return {
            errcode: '0000',
            localUrl,
            file
        };
    }

    const { width, height, imgObj } = loadRes.data;
    const info = {
        originWidth: width,
        originHeight: height,
        width,
        height,
        localUrl
    };

    // 图像原始像素比较小，不需要通过canvas修复拍摄角度则直接返回
    if ((width < fileLimitPixel || height < fileLimitPixel) && !fixShootDeg) {
        return {
            errcode: '0000',
            ...info,
            file
        };
    }

    let newWidth = width;
    let newHeight = height;
    const imgRate = width / height;
    // 以短边作为压缩基准
    if (width <= height) {
        newHeight = Math.floor(height * rate);
        newWidth = Math.floor(newHeight * imgRate);
    } else {
        newWidth = Math.floor(width * rate);
        newHeight = Math.floor(newWidth / imgRate);
    }

    // 压缩后的图像大小小于指定限制, 直接使用最小值作为短边的像素大小，长边等比例缩放
    if (newWidth < fileLimitPixel || newHeight < fileLimitPixel) {
        if (newWidth <= newHeight) {
            newWidth = fileLimitPixel;
            newHeight = Math.floor(newWidth / imgRate);
        } else {
            newHeight = fileLimitPixel;
            newWidth = Math.floor(newHeight * imgRate);
        }
    }


    info.width = newWidth;
    info.height = newHeight;
    let imgCanvasData;

    try {
        let canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, newWidth, newHeight);
        context.drawImage(imgObj, 0, 0, newWidth, newHeight);
        imgCanvasData = canvas.toDataURL('image/jpeg', fileLimitQuality);
        canvas = null;
    } catch (error) {
        if (window.console) {
            console.error(error);
        }
        return {
            errcode: '0000',
            ...info,
            file
        };
    }

    // 只返回base64
    if (onlyGetBase64) {
        return {
            errcode: '0000',
            base64: imgCanvasData,
            description: 'success'
        };
    }

    const bFileRes = await base64ToFile(imgCanvasData, file.name);


    // 转换失败，压缩后图像变大，直接使用原图
    if (bFileRes.errcode !== '0000' || bFileRes.data.size > file.size) {
        return {
            errcode: '0000',
            ...info,
            width,
            height,
            file // 压缩后图像变大，直接使用原图
        };
    }

    return {
        errcode: '0000',
        ...info,
        file: bFileRes.data
    };
}

// 部分gui用户，不方便远程调试，可能压缩中出现异常，先全局捕获下异常
export async function compressImgFile(file, options = { }) {
    try {
        const res = await tempCompressImgFile(file, options);
        return res;
    } catch (error) {
        if (window.console) {
            console.error(error);
        }
    }
    const localUrl = options.localUrl || '';
    return {
        errcode: '0000',
        localUrl,
        file
    };
}