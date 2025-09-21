import React from 'react';
import data from './data3.json';
import ReviewImage from '../src/index';

export default function Test() {

    const handleData = (arr) => {
        return arr.map(item => {
            if (item.childNode && Array.isArray(item.childNode)) {
                return {
                    ...item,
                    childNode: handleData(item.childNode),
                    storageList: item?.storageList?.length > 0 && item.storageList.map(o => {
                        return {
                            ...o,
                            snapshotUrl: 'https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368720902/9x1qramb8a.jpg',
                            localUrl: 'https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368720902/9x1qramb8a.jpg',
                            originalFileName: o.fileName,
                            extName: 'jpg',
                            serialNo: o.fd
                        }
                    })
                }
            }
            if (item.storageList && Array.isArray(item.storageList)) {
                return {
                    ...item,
                    storageList: item.storageList.map(o => {
                        return {
                            ...o,
                            snapshotUrl: 'https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368720902/9x1qramb8a.jpg',
                            localUrl: 'https://api-sit.piaozone.com/test/base/download/files/tenant-files/5368720902/9x1qramb8a.jpg',
                            originalFileName: o.fileName,
                            extName: 'jpg',
                            serialNo: o.fd
                        }
                    })
                }
            }
            return item;
        })
    };

    const dataList = {
        fscanBillNos: data.data.titleName,
        ...data.data,
        childNode: handleData(data.data.childNode)
    };
    
    const modeKey = ['img', 'list'];

    const rotationAngleSet = (angle, page) => {
        // console.log(angle, page, '===========================');
    };

    const handleSelectedInfo = (info) => {
        console.log(info, 'info');
    };

    const showOriginFile = (selected) => {
        // console.log(selected, 'selected');
    };

    return (
        <ReviewImage
            dataList={[dataList]}
            modeKey={modeKey}
            visible={false}
            setPageRotate={rotationAngleSet}
            handleSelectedInfo={handleSelectedInfo}
            showOriginFile={showOriginFile}
            from='document'
        />
    )
};
