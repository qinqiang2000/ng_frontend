import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import FileRview from '@piaozone.com/file-review';
import { getFileType } from './util';
import './index.less';

export default function ImageReview(props) {
    const {
        selectedInfo,
        platDataList,
        getSelectedInfo,
        dataList,
        selectNo,
        btnsRender,
        changeDataListAngle,
        from,
        showOriginFile,
        otherHeight
    } = props;
    const {
        extName = 'jpg',
        snapshotUrl,
        rotationAngle = 0,
        localUrl
    } = selectedInfo;
    const { fscanBillNos } = dataList.find(
        (item) => item.fscanBillNos === selectNo
    );

    // 切换发票
    const changeIndex = (type) => {
        const curIndex = platDataList
            .map((item) => item.serialNo)
            .indexOf(selectedInfo.serialNo);
        const nextInfo =
            platDataList[
                curIndex === platDataList.length - 1 ? curIndex : curIndex + 1
            ];
        const preInfo = platDataList[curIndex === 0 ? 0 : curIndex - 1];
        if (type === 'backward' && curIndex === platDataList.length - 1) {
            message.info('已经是最后一页了');
        }
        if (type === 'forward' && curIndex === 0) {
            message.info('已经是第一页了');
        }
        getSelectedInfo(type === 'backward' ? nextInfo : preInfo);
    };

    const handleTree = (arr, angle) => {
        return arr.map((item) => {
            if (item.childNode && Array.isArray(item.childNode)) {
                return {
                    ...item,
                    childNode: handleTree(item.childNode, angle),
                    storageList:
                        item?.storageList?.length > 0 &&
                        item.storageList.map((o) => {
                            return {
                                ...o,
                                rotationAngle:
                                    o.serialNo === serialNo
                                        ? angle
                                        : o.rotationAngle
                            };
                        })
                };
            }
            if (item.storageList && Array.isArray(item.storageList)) {
                return {
                    ...item,
                    storageList: item.storageList.map((o) => {
                        return {
                            ...o,
                            rotationAngle:
                                o.serialNo === serialNo
                                    ? angle
                                    : o.rotationAngle
                        };
                    })
                };
            }
            return item;
        });
    };

    const handleData = (arr, angle) => {
        return arr.map((item) => {
            if (item.fscanBillNos === selectNo) {
                modeConfig.forEach((o) => {
                    if (
                        item[o.key]?.length &&
                        item[o.key].some((i) => i.serialNo === serialNo)
                    ) {
                        item[o.key] = item[o.key].map((i) => {
                            return i.serialNo === serialNo
                                ? { ...i, rotationAngle: angle }
                                : i;
                        });
                    }
                });
                return item;
            } else {
                return item;
            }
        });
    };

    // 保存角度
    const changeAngle = (deg, page) => {
        changeDataListAngle &&
            changeDataListAngle(
                from === 'document'
                    ? handleTree(dataList, deg)
                    : handleData(dataList, deg)
            );
    };

    return (
        <div className='file-review'>
            <div className='top'>
                <div className='title'>{fscanBillNos}</div>
                {btnsRender}
            </div>
            {selectedInfo && (
                <div
                    style={{
                        width: '100%',
                        height: `calc(100vh - ${otherHeight}px - 50px)`
                    }}
                >
                    <FileRview
                        fileUrl={
                            getFileType(extName) === 'image'
                                ? snapshotUrl
                                : localUrl
                        }
                        extName={extName}
                        angle={rotationAngle}
                        changeAngle={changeAngle}
                        changeIndex={changeIndex}
                        showOriginFile={showOriginFile}
                    />
                </div>
            )}
        </div>
    );
}

ImageReview.propTypes = {
    selectedInfo: PropTypes.object,
    platDataList: PropTypes.array,
    getSelectedInfo: PropTypes.func,
    dataList: PropTypes.array,
    selectNo: PropTypes.string,
    // setPageRotate: PropTypes.func,
    showOriginFile: PropTypes.func,
    btnsRender: PropTypes.any,
    changeDataListAngle: PropTypes.func,
    otherHeight: PropTypes.number,
    from: PropTypes.string
};
