import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './style.less';
import ScanImage from '@piaozone.com/mobile-scan-image';
import MobileCarouse from '@piaozone.com/mobile-carouse';

function ImageList({ list, width, height, ...props }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const changeIndex = (e, i, direct) => {
        const listLen = list.length;
        if (activeIndex === 0 && direct === 'prev') {
            props.changeTabIndex(0);
        } else if (activeIndex === listLen - 1 && direct === 'next') {
            props.changeTabIndex(2);
        } else {
            setActiveIndex(i);
        }
    };

    const checkImgBtn = (index) => {
        const item = list[index];
        if (item) {
            openUrl(item);
        } else {
            alert('获取原图失败!');
            return false;
        }
    };

    const openUrl = (item) => {
        const tempUrl = item.pdfUrl || '';
        if (tempUrl === '') {
            alert('该票据不存在原图，请先上传');
            return false;
        } else {
            props.onCheckPdf(item);
        }
    };

    const item = list[activeIndex];
    const { fileType, attachmentType } = item;
    const len = list.length;
    let failDescription = '';
    if (attachmentType && attachmentType != 1 && attachmentType != 2) {
        failDescription = '该类型文件不支持预览';
    }
    return (
        <div className='paperInvoices'>
            <p className='count'>{activeIndex + 1}/{len}</p>
            <div className='innerContent'>
                <MobileCarouse
                    index={activeIndex}
                    itemWidth={width}
                    onSwiperEnd={changeIndex}
                    style={{ width: width, height: height, background: '#ccc' }}
                    disabledDots={true}
                >
                    {
                        list.map((item, index) => {
                            return (
                                <ScanImage
                                    key={index}
                                    id={index}
                                    width={width}
                                    height={height}
                                    areaInfo={item.areaInfo}
                                    displayFlag='markImage'
                                    visible={activeIndex === index}
                                    failDescription={failDescription}
                                    rotateDeg={item.rotateDeg}
                                    imgSrc={item.url}
                                />
                            );
                        })
                    }
                </MobileCarouse>
            </div>
            {
                fileType == 1 || attachmentType == 1 ? (
                    <div className='checkImg' onClick={() => checkImgBtn(activeIndex)}>
                        <button className='checkImgBtn'>查看原文件</button>
                    </div>
                ) : null
            }
        </div>
    );
}

ImageList.propTypes = {
    list: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    changeTabIndex: PropTypes.func.isRequired,
    onCheckPdf: PropTypes.func.isRequired
};

export default ImageList;