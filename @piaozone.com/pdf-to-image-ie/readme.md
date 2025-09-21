# pdf转换为图像

```js

import { pdfToImage, pdfRenderToCanvas, getPdfDocument } from '@piaozone.com/pdf-to-image';

// 使用时注意

// 目前只兼容google、火狐、IE Edge版本，360急速模式，及兼容模式高IE Edge内核

// 首先获取pdf文档对象, 文档对象里面有pdf的页数及pdf的一些信息

const res = await getPdfDocument({
    file: '', // 支持File对象和访问地址url
    // 字体的url路径，如果pdf只是图像可以不传
    CMAP_URL: 'http://localhost/static/gallery/pdfjs-dist/cmaps/', // pdfjs字体地址
    // pdfjs的worker地址
    workerSrc: 'http://localhost/static/gallery/pdfjs-dist/build/pdf.worker.min.js', // pdfjs的worker地址
});

// 返回errcode为0000时表示获取成功，data为获取的对象

const pdfDoc = res.data;

// pdf转换为图像
pdfToImage(pdfDoc, {
    scale: 1.5, // pdf的放大系数, 默认1.5, 最大3.5
    quality: 0.95, // 图像的质量，默认0.95
    viewportProportion: 1, // (可选)网页dpi与实际dpi比例,默认1. 默认以72dpi显示.
    onFinish: (res) => {
        // res.data.totalNum // errcode为0000时表示成功，totalNum会返回中页数
    },
    onStepFinish: (res) => { // pdf每页转换完后的回调
        if (res.errcode === '0000') { // 0000表示处理成功
            const {
                width, // 图像的长度
                height, // 图像的宽度
                name, // 图像名称
                localUrl, // 图像的本地访问地址
                file, // 返回的文件对象
                pageNo, // 在pdf中的页值
                totalNum // pdf的总页数
            } = res.data;
        }
    }
});

// 直接将pdf绘制到canvas中
pdfRenderToCanvas(pdfDoc, {
    scale: 1.5, // pdf的放大系数, 默认1.5
    canvasId: 'canvasTest' //画布的id
});

```

