import React, { useState } from 'react';
import FileReview from '../src/index';

// 单张图片
const fileInfo1 = {
    fileUrl: 'https://api-sit.piaozone.com/doc/free/fileInfo/preview/f12660873076631470088569210856.pdf',
    extName: 'pdf',
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
        <div style={{ height: '800px', width: '1000px', marginLeft: '200px'}}>
            <FileReview
                { ...fileInfo }
                changeAngle={changeAngle}
                changeIndex={changeIndex}
                showChangePageBtn={false}
                reviewBoxWidth={1040}
                reviewBoxHeight={759}
                leftWidth={200}
                display='height'
            />
        </div>
    )
};
