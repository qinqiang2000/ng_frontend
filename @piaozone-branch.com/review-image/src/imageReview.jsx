/* eslint-disable */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import FileRview from '@piaozone.com/file-review';
import { getFileType, clientCheck } from './util';
import './index.less';
const JobDesc = {
    k: '',
    k1: '提单人文件：',
    k2: '影像采集文件：'
}
const clientInfo = clientCheck();
export default function ImageReview(props) {
    const {
        selectedInfo,
        platDataList,
        getSelectedInfo,
        dataList,
        selectNo,
        btnsRender,
        changeDataListAngle,
        otherHeight,
        modeConfig,
        from,
        display,
        showOriginFileCallBack,
        setPageRotate,
        visible,
        method,
        // officeUrl,
        leftWidth,
        topHeight,
        showCutImage,
        imageViewOriginal,
        onReviewFileUrl,
        isShowWaterMark
    } = props;
    const { inputInvoices = [], extName = 'jpg', region = '', signType = '', snapshotUrl, rotationAngle = 0, localUrl, serialNo, ffileType = '' } = selectedInfo;
    const { fscanBillNos, invoiceCount, attachmentCount, fetchSource } = dataList.find(item => item.fscanBillNos === selectNo);
    const isCutImage = !!(signType !== 'cover' && (inputInvoices.length > 1 || region)) && showCutImage; // 是否用混贴展示

    const isImage = !!(signType === 'invoice' && (inputInvoices.length > 0 || region)); // 是否混贴
    let showFileType = ffileType === 2 || getFileType(extName) === 'image' || isImage ? 'jpg' : extName;
    if (imageViewOriginal) { //私有客户定制
        showFileType = extName;
    }
    if (extName === 'XML') {
        showFileType = 'xml';
    } else if (extName === 'OFD') {
        // if (clientInfo.browser.ie) {
        //     showFileType = 'jpg';
        // } else {
        //     showFileType = 'ofd';
        // }
        showFileType = 'jpg';
    }
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const [reviewBox, setReviewBox] = useState({ width: clientWidth, height: clientHeight });

    const resizeUpdate = () => {
        const reviewDom = document.getElementById('fileReview');
        setReviewBox({
            width: visible ? clientWidth - 266 - 280 : clientWidth - 266,
            height: reviewDom.clientHeight
        });
    };

    useEffect(() => {
        resizeUpdate();
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', resizeUpdate);
        return () => {
            window.removeEventListener('resize', resizeUpdate);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, clientWidth, selectedInfo]);

    // 切换发票
    const changeIndex = (type) => {
        const curIndex = platDataList.map(item => item.serialNo).indexOf(selectedInfo.serialNo);
        const nextInfo = platDataList[curIndex === platDataList.length - 1 ? curIndex : curIndex + 1];
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
        return arr.map(item => {
            if (item.childNode && Array.isArray(item.childNode)) {
                return {
                    ...item,
                    childNode: handleTree(item.childNode, angle),
                    storageList: item?.storageList?.length > 0 && item.storageList.map(o => {
                        return {
                            ...o,
                            rotationAngle: o.serialNo === serialNo ? angle : o.rotationAngle
                        }
                    })
                };
            }
            if (item.storageList && Array.isArray(item.storageList)) {
                return {
                    ...item,
                    storageList: item.storageList.map(o => {
                        return {
                            ...o,
                            rotationAngle: o.serialNo === serialNo ? angle : o.rotationAngle
                        }
                    })
                };
            }
            return item;
        });
    };

    const handleData = (arr, angle) => {
        return arr.map(item => {
            if (item.fscanBillNos === selectNo) {
                modeConfig.forEach(o => {
                    if (item[o.key]?.length && item[o.key].some(i => i.serialNo === serialNo)) {
                        item[o.key] = item[o.key].map(i => {
                            return i.serialNo === serialNo ? { ...i, rotationAngle: angle } : i
                        })
                    }
                });
                return item;
            } else {
                return item;
            }
        });
    };

    const handlePdfData = (arr, angle, page) => {
        return arr.map(item => {
            if (item.fscanBillNos === selectNo) {
                modeConfig.forEach(o => {
                    if (item[o.key]?.length && item[o.key].some(i => i.serialNo === serialNo)) {
                        item[o.key] = item[o.key].map(i => {
                            return i.serialNo === serialNo ? { ...i, rotationAngle: { ...i.rotationAngle, [page]: angle } } : i
                        })
                    }
                });
                return item;
            } else {
                return item;
            }
        });
    };

    const handlePdfTree = (arr, angle, page) => {
        return arr.map(item => {
            if (item.childNode && Array.isArray(item.childNode)) {
                return {
                    ...item,
                    childNode: this.handleTree(item.childNode, angle, page),
                    storageList: item?.storageList?.length > 0 && item.storageList.map(o => {
                        return {
                            ...o,
                            rotationAngle: o.serialNo === serialNo ? { ...o.rotationAngle, [page]: angle } : o.rotationAngle
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
                            rotationAngle: o.serialNo === serialNo ? { ...o.rotationAngle, [page]: angle } : o.rotationAngle
                        }
                    })
                }
            }
            return item;
        })
    };

    // 保存角度
    const changeAngle = (deg, page) => {
        setPageRotate && setPageRotate(deg, page);
        if (getFileType(showFileType) === 'pdf') {
            changeDataListAngle && changeDataListAngle(from === 'document' ? handlePdfTree(dataList, deg, page) : handlePdfData(dataList, deg, page));
            return;
        }
        if (getFileType(extName) === 'image') {
            getSelectedInfo({ ...selectedInfo, rotationAngle: deg });
        }
        changeDataListAngle && changeDataListAngle(from === 'document' ? handleTree(dataList, deg) : handleData(dataList, deg));
    };

     // 方向键上下控制文件切换
    const handleKeyDown = (e) => {
        const { keyCode } = e;
        if (keyCode == 40) {
            changeIndex('backward');
        } else if (keyCode == 38) {
            changeIndex('forward');
        }
    };
    const setWaterMark = (snapshotUrl) => {
        return snapshotUrl + `&needWaterMark=1&hash=${isShowWaterMark}`;
    }
    const showFileUrl = snapshotUrl && showFileType === 'jpg' ? setWaterMark(snapshotUrl) : localUrl;
    return (
        <div className='file-review' onKeyDown={(e) => handleKeyDown(e)}>
            <div className='top'>
                <div className='title'>
                    {fscanBillNos}
                    {
                        fetchSource && <span className='source' style={{ marginLeft: 10 }}>{JobDesc['k' + fetchSource]}</span>
                    }
                    {invoiceCount > 0 && <span>共<span className='count'>{invoiceCount}</span>份发票</span>}
                    {attachmentCount > 0 && <span>，共<span className='count'>{attachmentCount}</span>份附件</span>}
                </div>
                {btnsRender}
            </div>
            {
                selectedInfo && (
                    <div style={{ height: `calc(100vh - ${otherHeight}px - 50px)` }} id='fileReview'>
                        <FileRview
                            fileUrl={showFileUrl}
                            extName={showFileType}
                            angle={rotationAngle}
                            changeAngle={changeAngle}
                            changeIndex={changeIndex}
                            isCutImage={isCutImage}
                            inputInvoices={inputInvoices.length ? inputInvoices : [selectedInfo]}
                            showOriginFile={showOriginFileCallBack}
                            reviewBoxWidth={reviewBox.width}
                            reviewBoxHeight={reviewBox.height}
                            method={method}
                            // officeUrl={officeUrl}
                            leftWidth={leftWidth}
                            topHeight={topHeight}
                            display={display}
                            onReviewFileUrl={onReviewFileUrl}
                        />
                    </div>
                )
            }
        </div>
    )
};

ImageReview.propTypes = {
    selectedInfo: PropTypes.object,
    platDataList: PropTypes.array,
    getSelectedInfo: PropTypes.func,
    dataList: PropTypes.array,
    selectNo: PropTypes.string,
    setPageRotate: PropTypes.func,
    showOriginFileCallBack: PropTypes.func,
    btnsRender: PropTypes.any,
    changeDataListAngle: PropTypes.func,
    otherHeight: PropTypes.number,
    modeConfig: PropTypes.array,
    form: PropTypes.string,
    visible: PropTypes.bool,
    method: PropTypes.number,
    // officeUrl: PropTypes.string,
    leftWidth: PropTypes.number, // 画布距离屏幕左侧的距离
    topHeight: PropTypes.number, // 画布距离屏幕上侧的距离
    display: PropTypes.string, // 中间画布自适应方式
    showCutImage: PropTypes.bool,
    imageViewOriginal: PropTypes.bool, //私有化定制
    onReviewFileUrl: PropTypes.func,
    isShowWaterMark: PropTypes.number
};
