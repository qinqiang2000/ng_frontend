// 等比例换算图像长宽
export const defaultMaxWidth = 5000;
export const defaultMaxHeight = 5000;

export function adjustSize(width, height, maxWidth, maxHeight) {
    const tempRateW = parseFloat(maxWidth / width);
    const tempRateH = parseFloat(maxHeight / height);
    const rate = parseFloat(width / height);
    if (width > maxWidth || height > maxHeight) {
        if (tempRateW < tempRateH) {
            width = maxWidth;
            height = Math.floor(width / rate);
        } else {
            height = maxHeight;
            width = height * rate;
        }
    }
    return {
        width,
        height,
        rate
    };
}

export function loadImage(imgSrc) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = async() => {
            resolve({
                errcode: '0000',
                data: {
                    imgObj: img,
                    width: img.width,
                    height: img.height
                }
            });
        };

        img.onerror = () => {
            resolve({ errcode: '2000', description: '加载图像失败' });
        };
        img.src = imgSrc;
    });
}


export function base64ToFile(baseStr, filename = '') {
    filename = filename || 'temp_' + (+new Date()) + '_' + Math.random().toString().replace(/0\./, '') + '.jpg';
    const arr = baseStr.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const suffix = mime.split('/')[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    filename = filename.split('.')[0];

    if (window.File && typeof window.File === 'function') {
        const newFile = new File([u8arr], `${filename}.${suffix}`, { type: mime });
        return { errcode: '0000', data: newFile };
    } else {
        try {
            const theBlob = new Blob([u8arr], { type: mime });
            theBlob.lastModifiedDate = new Date();
            theBlob.name = `${filename}.${suffix}`;
            return { errcode: '0000', data: theBlob };
        } catch (error) {
            console.error(error);
            return { errcode: '90002', description: 'base64转换为图片异常，请检查图片是否正常' };
        }
    }
}


export async function normalize(file, opt = {}) {
    const localUrl = URL.createObjectURL(file);
    const res = await loadImage(localUrl);
    if (res.errcode !== '0000') {
        return res;
    }

    const { maxWidth = defaultMaxWidth, maxHeight = defaultMaxHeight, quality = 0.95, toType = 'base64', filename = '' } = opt;
    const { width, height, imgObj } = res.data;
    const newSize = adjustSize(width, height, maxWidth, maxHeight);
    const imageWidth = newSize.width;
    const imageHeight = newSize.height;
    let base64Result = '';
    try {
        const canvas = document.createElement('canvas');
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, imageWidth, imageHeight);
        context.drawImage(imgObj, 0, 0, imageWidth, imageHeight);
        base64Result = canvas.toDataURL('image/jpeg', quality);
        if (toType === 'base64') {
            return {
                errcode: '0000',
                data: {
                    imageWidth,
                    imageHeight,
                    base64: base64Result
                }
            };
        }
    } catch (error) {
        console.error(error);
        return { errcode: '90001', description: '图片转换异常, 请检查图片是否正常' };
    }

    const resFile = await base64ToFile(base64Result, filename);
    if (resFile.errcode !== '0000') {
        return resFile;
    }

    return {
        errcode: '0000',
        data: {
            imageWidth,
            imageHeight,
            file: resFile.data
        }
    };
};

// 获取图像旋转任意角度后, 在指定区域显示的大小, emptyPix为留白区域大小
export function getRotateRect(deg, imgWidth, imgHeight, maxWidth, maxHeight, emptyPix = 10, minWidth, minHeight) {
    const pi = parseFloat(Math.PI / 180);
    const cos = Math.cos;
    const sin = Math.sin;
    const rate = parseFloat(imgWidth / imgHeight);
    deg = Math.abs(deg);
    deg = deg % 360;

    let maxRw = maxWidth - emptyPix;
    let maxRh = maxHeight - emptyPix;
    let rw = imgWidth;
    let rh = imgHeight;

    if (deg === 0 || deg === 180) {
        maxRw = maxWidth;
        maxRh = maxHeight;
    } else if (deg === 90 || deg === 270) {
        maxRw = maxHeight;
        maxRh = maxWidth;
    } else if ((deg > 0 && deg < 90) || (deg > 180 && deg < 270)) {
        maxRw = maxWidth * cos(deg * pi) + maxHeight * sin(deg * pi);
        maxRh = maxHeight * cos(deg * pi) + maxWidth * sin(deg * pi);
    } else if ((deg > 90 && deg < 180) || (deg > 270 && deg < 360)) {
        maxRw = maxHeight * cos(deg * pi) + maxWidth * sin(deg * pi);
        maxRh = maxWidth * cos(deg * pi) + maxHeight * sin(deg * pi);
    }

    if (minWidth && minHeight && (imgWidth < minWidth || imgHeight < minHeight)) {
        if (imgHeight < minHeight) {
            rh = minHeight;
            rw = rate * rh;
        } else {
            rw = minWidth;
            rh = rw / rate;
        }
    }

    if (rw > maxRw || rh > maxRh) {
        if (rw > rh) {
            rh = maxRh;
            rw = rate * rh;
        } else {
            rw = maxRw;
            rh = rw / rate;
        }

        if (rw > maxRw) {
            rw = maxRw;
            rh = rw / rate;
        } else if (rh > maxRh) {
            rh = maxRh;
            rw = rh * rate;
        }
    }

    return {
        rw: parseInt(rw),
        rh: parseInt(rh)
    };
}

// 图像裁剪
export async function cuteImage(imgObj, { pixel = '', region = '', maxWidth = defaultMaxWidth, maxHeight = defaultMaxHeight }) {
    if (region === '') {
        return {
            errcode: '0000',
            data: imgObj
        };
    }
    const imgWidth = imgObj.width;
    const imgHeight = imgObj.height;

    let sx, sy, sw, sh;
    if (region && pixel) {
        const pixelArr = pixel.split(',');
        let originWidth = parseInt(pixelArr[0]);
        let originHeight = parseInt(pixelArr[1]);
        if ((imgWidth > imgHeight && originWidth < originHeight) || (imgWidth < imgHeight && originWidth > originHeight)) {
            originWidth = parseInt(pixelArr[1]);
            originHeight = parseInt(pixelArr[0]);
        }

        const wRate = parseFloat(imgWidth / originWidth);
        const hRate = parseFloat(imgHeight / originHeight);
        // eslint-disable-next-line
        const regionArr = region.replace(/[\[\]]/g, '').split(',');
        sx = parseInt(regionArr[0]) * wRate;
        sy = parseInt(regionArr[1]) * hRate;
        sw = parseInt(regionArr[2]) * wRate - sx;
        sh = parseInt(regionArr[3]) * hRate - sy;
    } else {
        sx = 0;
        sy = 0;
        sw = imgWidth;
        sh = imgHeight;
    }

    const rate = parseFloat(sw / sh);

    let rw = sw;
    let rh = sh;

    const canvas = document.createElement('canvas');
    if (typeof canvas.getContext !== 'function') {
        return { errcode: 'unsport', description: '浏览器不支持canvas' };
    }

    maxWidth = sw > defaultMaxWidth ? defaultMaxWidth : sw;
    maxHeight = sh > defaultMaxHeight ? defaultMaxHeight : sh;

    canvas.width = maxWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    if (imgWidth > maxWidth || imgHeight > maxHeight) {
        scaleContext(ctx, canvas.width, canvas.height);
    }

    ctx.clearRect(0, 0, maxWidth, maxHeight);
    const maxRw = maxWidth;
    const maxRh = maxHeight;

    ctx.save();
    ctx.translate(maxWidth / 2, maxHeight / 2);

    if (rw > rh) {
        rh = maxRh;
        rw = rate * rh;
    } else {
        rw = maxRw;
        rh = rw / rate;
    }

    if (rw > maxRw) {
        rw = maxRw;
        rh = rw / rate;
    } else if (rh > maxRh) {
        rh = maxRh;
        rw = rh * rate;
    }

    ctx.translate(-rw / 2, -rh / 2);
    ctx.drawImage(imgObj, sx, sy, sw, sh, 0, 0, rw, rh);
    ctx.restore();
    return {
        errcode: '0000',
        description: 'success',
        data: canvas
    };
}

// 根据裁剪区域坐标排序
export function sortByRegion(dataArr) {
    if (dataArr.length <= 1) {
        return dataArr;
    } else {
        for (let i = 0; i < dataArr.length - 1; i++) {
            for (let j = 0; j < dataArr.length - i - 1; j++) {
                const preData = dataArr[j];
                const nextData = dataArr[j + 1];
                let nextRegion = nextData.region || '';
                nextRegion = nextRegion.replace(/[[\]]/g, '').split(',');
                const nextRectX = parseInt(nextRegion[0]);
                const nextRectY = parseInt(nextRegion[1]);
                let preRegion = preData.region || '';

                preRegion = preRegion.replace(/[[\]]/g, '').split(',');
                const preRectX = parseInt(preRegion[0]);
                const preRectY = parseInt(preRegion[1]);
                const deltaX = nextRectX - preRectX;
                const deltaY = nextRectY - preRectY;
                let exchange = false;

                if (deltaX < 0 && deltaY < 0) {
                    exchange = true;
                } else if (deltaX < 0) {
                    if (deltaY + deltaX > 0) {
                        exchange = false;
                    } else {
                        exchange = true;
                    }
                } else if (deltaY < 0) {
                    if (deltaY + deltaX > 50) {
                        exchange = false;
                    } else {
                        exchange = true;
                    }
                }

                if (exchange) {
                    const temp = { ...nextData };
                    dataArr[j + 1] = { ...preData };
                    dataArr[j] = temp;
                }
            }
        }
        return dataArr;
    }
}

// 区域重叠，重新调整
export function adjuestRect(list = []) {
    const dataArr = list.map((item) => {
        return {
            ...item
        };
    });
    for (let i = 0; i < dataArr.length; i++) {
        const adjustData = dataArr[i];
        let adjustRegion = adjustData.region || '';
        adjustRegion = adjustRegion.replace(/[[\]]/g, '').split(',');

        let adjustLeftX = parseInt(adjustRegion[0]);
        let adjustLeftY = parseInt(adjustRegion[1]);
        let adjustRightX = parseInt(adjustRegion[2]);
        let adjustRightY = parseInt(adjustRegion[3]);

        //初始化最终修正的结果
        for (let j = 0; j < dataArr.length; j++) {
            if (j <= i) {
                continue;
            }

            const diffData = dataArr[j];
            let diffRegion = diffData.region || '';
            diffRegion = diffRegion.replace(/[[\]]/g, '').split(',');

            let diffLeftX = parseInt(diffRegion[0]);
            let diffLeftY = parseInt(diffRegion[1]);
            let diffRightX = parseInt(diffRegion[2]);
            let diffRightY = parseInt(diffRegion[3]);

            // 完全没有相交的区域
            if (adjustRightX < diffLeftX || adjustRightY < diffLeftY) {
                continue;
            }

            const w1 = Math.abs((adjustRightX > diffRightX ? adjustRightX : diffRightX) - (adjustLeftX < diffLeftX ? adjustLeftX : diffLeftX));
            const w2 = Math.abs(adjustRightX - adjustLeftX) + Math.abs(diffRightX - diffLeftX);
            const h1 = Math.abs((adjustRightY > diffRightY ? adjustRightY : diffRightY) - (diffLeftY < adjustLeftY ? diffLeftY : adjustLeftY));
            const h2 = Math.abs(adjustRightY - adjustLeftY) + Math.abs(diffRightY - diffLeftY);

            let deltaW = w1 - w2;
            let deltaH = h1 - h2;
            //没有重叠
            if (deltaW > 0 || deltaH > 0) {
                continue;
            } else {
                deltaH = Math.abs(deltaH) / 2 + 6;
                deltaW = Math.abs(deltaW) / 2 + 6;

                if (deltaW < deltaH) {
                    if (adjustLeftX < diffLeftX) { //在左侧
                        adjustRegion = [adjustLeftX, adjustLeftY, parseInt(adjustRegion[2]) - deltaW, adjustRegion[3]];
                        diffRegion = [diffLeftX + deltaW, diffLeftY, diffRegion[2], diffRegion[3]];
                        adjustRightX -= deltaW;
                        diffLeftX += deltaW;
                    } else { //在右侧
                        adjustRegion = [adjustLeftX + deltaW, adjustLeftY, adjustRegion[2], adjustRegion[3]];
                        diffRegion = [diffLeftX, diffLeftY, parseInt(diffRegion[2]) - deltaW, diffRegion[3]];
                        diffRightX -= deltaW;
                        adjustLeftX += deltaW;
                    }

                    dataArr[i].region = adjustRegion.join(',');
                    dataArr[j].region = diffRegion.join(',');
                } else {
                    if (adjustLeftY < diffLeftY) { //在上方
                        adjustRegion = [adjustLeftX, adjustLeftY, adjustRegion[2], parseInt(adjustRegion[3]) - deltaH];
                        diffRegion = [diffLeftX, diffLeftY + deltaH, diffRegion[2], diffRegion[3]];
                        adjustRightY -= deltaH;
                        diffLeftY += deltaH;
                    } else { //在下方
                        adjustRegion = [adjustLeftX, adjustLeftY + deltaH, adjustRegion[2], adjustRegion[3]];
                        diffRegion = [diffLeftX, diffLeftY, diffRegion[2], parseInt(diffRegion[3]) - deltaH];
                        diffRightY -= deltaH;
                        adjustLeftY += deltaH;
                    }
                    dataArr[i].region = adjustRegion.join(',');
                    dataArr[j].region = diffRegion.join(',');
                }
            }
        }
    }
    return dataArr;
}

export function getPixelRatio(context) {
    const backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    const result = (window.devicePixelRatio || 1) / backingStore;
    return result > 2 ? result : 2;
};

export function scaleContext(ctx, rw, rh) {
    const dpr = getPixelRatio(ctx);
    ctx.canvas.width = dpr * rw;
    ctx.canvas.height = dpr * rh;
    ctx.scale(dpr, dpr);
}

export async function showImage(imgObj, opt = {}) {
    const { maxWidth = defaultMaxWidth, maxHeight = defaultMaxHeight, minWidth, minHeight } = opt;
    const canvas = document.createElement('canvas');
    if (typeof canvas.getContext !== 'function') {
        return { errcode: 'unsport', description: '浏览器不支持canvas' };
    }

    const imgWidth = imgObj.width;
    const imgHeight = imgObj.height;
    const { rw, rh } = getRotateRect(0, imgWidth, imgHeight, maxWidth, maxHeight, 0, minWidth, minHeight);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    // 图像大小被压缩，通过放大像素优化图像清晰度
    if (imgWidth > maxWidth || imgHeight > maxHeight) {
        scaleContext(ctx, rw, rh);
    } else {
        canvas.width = rw;
        canvas.height = rh;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(imgObj, 0, 0, imgWidth, imgHeight, 0, 0, rw, rh);
    ctx.restore();
    return {
        errcode: '0000',
        description: 'success',
        data: canvas
    };
}


// 混贴图像区域标记
// areaInfo { rotateDeg: 90, pixel: '2976,3968', region: '[0,2067,1294,3920]' }
// orientation 为整个图像的旋转角度
export async function markImage(imgObj, {
    targetWidth,
    targetHeight,
    areaInfo = [],
    clearCanvas,
    orientation = 0,
    maxWidth = defaultMaxWidth,
    maxHeight = defaultMaxHeight
}) {
    let markSize = 12;
    let markFontSize = 16;
    let lineWidth = 2;
    let markRate = 1;
    const imgWidth = imgObj.width;
    const imgHeight = imgObj.height;

    if (areaInfo.length === 0) {
        return { errcode: 'argsErr', description: '标记区域为空' };
    }

    if (typeof clearCanvas === 'undefined') {
        clearCanvas = true;
    }

    const canvas = document.createElement('canvas');

    //画布对象找不到或者不支持画布
    if (!canvas || typeof canvas.getContext !== 'function') {
        return { errcode: 'unsport', description: '浏览器不支持canvas' };
    }

    const deg = Math.abs(orientation) % 360;
    const tempRwRh = getRotateRect(deg, imgWidth, imgHeight, maxWidth, maxHeight, 0);
    const rw = tempRwRh.rw;
    const rh = tempRwRh.rh;

    const ctx = canvas.getContext('2d');
    let rectX = 0;
    let rectY = 0;
    let rectWidth = 0;
    let rectHeight = 0;

    let originWidth = imgWidth;
    let originHeight = imgHeight;
    const pixel = areaInfo[0].pixel;

    if (pixel) {
        const pixelArr = pixel.split(',');
        if ((imgWidth > imgHeight && originWidth < originHeight) || (imgWidth < imgHeight && originWidth > originHeight)) {
            originWidth = parseInt(pixelArr[1]);
            originHeight = parseInt(pixelArr[0]);
        } else {
            originWidth = parseInt(pixelArr[0]);
            originHeight = parseInt(pixelArr[1]);
        }
    }

    if (deg === 90 || deg === 270) {
        canvas.width = rh;
        canvas.height = rw;
    } else {
        canvas.width = rw;
        canvas.height = rh;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-orientation * Math.PI / 180);
    const newWidthRate = parseFloat(rw / originWidth);
    const newHeightRate = parseFloat(rh / originHeight);
    ctx.translate(-rw / 2, -rh / 2);
    ctx.drawImage(imgObj, 0, 0, imgWidth, imgHeight, 0, 0, rw, rh);

    // 根据最终画布的大小计算字体等标志的缩放大小
    const tempRwRh2 = getRotateRect(0, canvas.width, canvas.height, targetWidth, targetHeight, 0);
    markRate = canvas.height / tempRwRh2.rh;
    markSize = markRate * markSize;
    markFontSize = markRate * markFontSize;
    lineWidth = markRate * lineWidth;

    const areaInfoList = adjuestRect(areaInfo);
    for (let i = 0; i < areaInfoList.length; i++) {
        let region = areaInfoList[i].region.replace(/[[\]]/g, '').split(',');
        if (!areaInfoList[i].region) {
            region = [0, 0, imgWidth, imgHeight];
        }
        const markColor = areaInfoList[i].markColor || '#487BFB';
        const lineColor = areaInfoList[i].lineColor || markColor;
        rectX = parseInt(region[0]) * newWidthRate;
        rectY = parseInt(region[1]) * newHeightRate;
        rectWidth = parseInt(region[2]) * newWidthRate - rectX;
        rectHeight = parseInt(region[3]) * newHeightRate - rectY;
        const rectRight = parseInt(region[2]) * newWidthRate;
        const rectBottom = parseInt(region[3]) * newHeightRate;

        if (rectWidth + rectX > rw) {
            rectWidth = rw - rectX;
        }
        if (rectHeight + rectY > rh) {
            rectHeight = rh - rectY;
        }

        ctx.save();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;

        if (typeof ctx.setLineDash === 'function') {
            ctx.setLineDash([10 * markRate, 10 * markRate]);
        }

        ctx.moveTo(rectX + lineWidth, rectY + lineWidth);
        ctx.beginPath();
        ctx.strokeRect(rectX + lineWidth, rectY + lineWidth, rectWidth - 2 * lineWidth, rectHeight - 2 * lineWidth);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        // 绘制圆圈
        ctx.save();
        ctx.strokeStyle = markColor;
        ctx.beginPath();
        let px = rectX + markSize + lineWidth + 2;
        let py = rectY + markSize + lineWidth + 2;

        if (orientation === -90 || orientation === 270) {
            py = rectBottom - markSize - lineWidth - 2;
        } else if (orientation === -180 || orientation === 180) {
            px = rectRight - markSize - lineWidth - 2;
            py = rectBottom - markSize - lineWidth - 2;
        } else if (orientation === 90 || orientation === -270) {
            px = rectRight - markSize - lineWidth - 2;
        }

        ctx.moveTo(px, py);
        ctx.arc(px, py, markSize, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = markColor;
        ctx.fill();
        ctx.restore();
    }

    //绘制序号
    for (let i = 0; i < areaInfoList.length; i++) {
        let region = areaInfoList[i].region.replace(/[[\]]/g, '').split(',');
        if (!areaInfoList[i].region) {
            region = [0, 0, imgWidth, imgHeight];
        }
        rectX = parseInt(region[0]) * newWidthRate;
        rectY = parseInt(region[1]) * newHeightRate;
        const rectRight = parseInt(region[2]) * newWidthRate;
        const rectBottom = parseInt(region[3]) * newHeightRate;
        let px = rectX + markSize + lineWidth + 2.3;
        let py = rectY + markSize + lineWidth + 2.3;

        ctx.save();
        ctx.font = markFontSize + 'px Times New Roman';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        // 设置垂直对齐方式
        ctx.textBaseline = 'middle';
        if (orientation === -90 || orientation === 270) {
            py = rectBottom - markSize - lineWidth - 2.3;
        } else if (orientation === -180 || orientation === 180) {
            px = rectRight - markSize - lineWidth - 2.3;
            py = rectBottom - markSize - lineWidth - 2.3;
        } else if (orientation === 90 || orientation === -270) {
            px = rectRight - markSize - lineWidth - 2.3;
        }

        if (orientation !== 0) {
            ctx.translate(px, py);
            ctx.rotate(orientation * Math.PI / 180);
            ctx.fillText(i + 1, 0, 0);
        } else {
            ctx.fillText(i + 1, px, py);
        }

        ctx.restore();
    }

    ctx.restore();
    return { errcode: '0000', description: 'success', data: canvas };
}
