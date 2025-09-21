

# es6语法导入

```js

// import 方式引入
import { adjustSize, loadImage, base64ToFile, normalize } from '@piaozone.com/process-image';

// 等比例缩放图像尺寸
adjustSize(width, height, maxWidth, maxHeight);

// 加载图像, promise对象返回
const res = await loadImage(imgSrc);

// base64转换为file对象，filename为文件名称，不传则默认生成临时文件名
const res = await base64ToFile(base64Str, filename);

// 压缩并规范图像文件为jpg格式，file为file对象
const res = await normalize(file, {
    maxWidth = 1920, // 默认1920，可不传
    maxHeight = 1080, // 默认1080，可不传
    quality = 0.95, // 默认图像质量为0.95，可不传
    toType = 'base64', // 默认base64, 非base64当file处理
    filename = '' // 默认会生成临时文件名，如果需要用自己的文件名可以传
});

```

# script标签引入

```html

<!-- 也可以通过script标签引入, 注意需要相关的pollyfile，可以使用gallery公共的pollyfile文件 -->

<script type='text/javascript' src='./dist/processImage.min.js'></script>
<script type='text/javascript'>
    processImage.normalize(file, { toType: 'base64', filename: '' }).then((res) => {
        console.log(res);
    });
</script>

```