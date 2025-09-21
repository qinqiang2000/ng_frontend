# 文件预览组件

```js

import React, { useState } from 'react';
import fileRview from '@piaozone.com/new-file-review';

// 单张图片
const fileInfo1 = {
    fileUrl: 'https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368720902/x8ppbbto68.jpg',
    extName: 'jpg',
    angle: 0
};

export default function Test() {
    const [fileInfo, setFileInfo] = useState(fileInfo1);

    const changeAngle = (angle, page) => {
        setFileInfo({
            ...fileInfo,
            angle
        })
        console.log(angle, page);
    };

    const changeIndex = (type) => {
        console.log(type);
    };

    return (
        <div style={{ height: '800px' }}>
            <FileReview
                { ...fileInfo }
                changeAngle={changeAngle}
                changeIndex={changeIndex}
            />
        </div>
    )
};

FileReview.propTypes = {
    fileUrl: PropTypes.string, // 文件地址
    extName: PropTypes.string, // 文件类型
    angle: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]), // 旋转角度
    changeAngle: PropTypes.func, // 旋转后的回调
    changeIndex: PropTypes.func, // 向左向右切换的回调
    isCutImage: PropTypes.bool, // 是否是混贴
    showOriginFile: PropTypes.func // 查看源文件函数
    reviewBoxWidth: PropTypes.number, // 对于混贴组件固定宽高特殊处理
    reviewBoxHeight: PropTypes.number, // 对于混贴组件固定宽高特殊处理
    method: PropTypes.number, // office组件是否用微软，仅公有云能用
    showChangePageBtn: ProTypes.bool, // 是否展示切换文件的按钮
    officeUrl: PropTypes.string // office文件预览服务地址
};

```

