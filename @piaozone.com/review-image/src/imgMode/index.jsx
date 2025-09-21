/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import Classification from './classification';
import ScanOrder from './scanOrder';
import PropTypes from 'prop-types';
import '../index.less';

export default function ImgMode (props) {
    const {  platDataList, selectedInfo, showLeftViewModel } = props;
    const [sign, setSign] = useState(false); // 判断是否是从左侧树切换
    const scrollRef = useRef(null);

    useEffect(() => {
        const curIndex = platDataList?.map(item => item.serialNo).indexOf(selectedInfo.serialNo);
        if (!sign) {
            scrollRef.current.scrollTop = 70 * curIndex;
        }
        setSign(false);
    }, [selectedInfo]);
    return (
        <div
            className='mode-content'
            ref={scrollRef}
        >
            {
                showLeftViewModel === 2 ? (
                    <ScanOrder {...props} />
                ) : (
                    <Classification {...props} />
                )
            }
        </div>
    )
};

ImgMode.propTypes = {
    dataList: PropTypes.array,
    modeConfig: PropTypes.array,
    mode: PropTypes.string,
    getSelectedInfo: PropTypes.func,
    selectedInfo: PropTypes.object,
    otherHeight: PropTypes.number,
    getSelectNo: PropTypes.func,
    platDataList: PropTypes.array,
    showLeftViewModel: PropTypes.number
};