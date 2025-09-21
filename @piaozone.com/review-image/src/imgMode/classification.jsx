/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import SnapshotItem from '../snapshotItem';

export default function Classification (props) {
    const { dataList, modeConfig, mode, getSelectedInfo, selectedInfo, otherHeight, getSelectNo, isShowStatistics } = props;
    const [foldList, setFoldList] = useState([]); // 存储折叠的key
    const [sign, setSign] = useState(false); // 判断是否是从左侧树切换
    const changeFoldList = (key) => {
        if (foldList.includes(key)) {
            setFoldList(foldList => foldList.filter(item => item !== key));
        } else {
            setFoldList(foldList => foldList.concat([key]));
        }
    };

    const changeSign = () => {
        setSign(true);
    };
    return (
        <>
            {
                dataList.map(item => (
                    <div
                        className='mode-box'
                        key={item.fscanBillNos}
                        style={{ minHeight: dataList.length === 1 && !foldList.includes(item.fscanBillNos) ? `calc(100vh - ${otherHeight}px - 38px - ${isShowStatistics ? 70 : 0}px - 10px)` : 0 }}
                    >
                        <div className='mode-title' onClick={() => changeFoldList(item.fscanBillNos)}>
                            <div className={!foldList.includes(item.fscanBillNos) ? 'icon activate' : 'icon'} />
                            <Tooltip placement='top' title={<div className='tooltip'>{item.fscanBillNos}</div>} getPopupContainer={() => document.getElementById('title')} autoAdjustOverflow arrowPointAtCenter={true}>
                                <div className='text' id='title'>{item.fscanBillNos}</div>
                            </Tooltip>
                        </div>
                        <div style={{ display: foldList.includes(item.fscanBillNos) ? 'none' : ''}}>
                            {
                                modeConfig.filter(o => item[o.key]?.length).map(o => (
                                    item[o.key].length > 0 && (
                                        <React.Fragment key={o.key}>
                                            <div className='mode-subtitle' onClick={() => changeFoldList(`${item.fscanBillNos}${o.key}`)}>
                                                <div className={!foldList.includes(`${item.fscanBillNos}${o.key}`) ? 'icon activate' : 'icon'} />
                                                {o.name}
                                                {o.sign === 'invoice' && item.invoiceCount > 0 && <span>（{item.invoiceCount}份）</span>}
                                                {o.sign === 'invoice' && item.invoiceCount <= 0 && null}
                                                {o.sign !== 'invoice' && <span>（{item[o.key].length}份）</span>}
                                            </div>
                                            {
                                                <div style={{ display: foldList.includes(`${item.fscanBillNos}${o.key}`) ? 'none' : ''}}>
                                                    {
                                                        item[o.key].map((val, index) => (
                                                            <SnapshotItem
                                                                key={val.serialNo}
                                                                mode={mode}
                                                                info={val}
                                                                count={index + 1}
                                                                sign={o.sign}
                                                                selectedInfo={selectedInfo}
                                                                getSelectedInfo={getSelectedInfo}
                                                                getSelectNo={getSelectNo}
                                                                fscanBillNos={item.fscanBillNos}
                                                                changeSign={changeSign}
                                                            />
                                                        ))
                                                    }
                                                </div>
                                            }
                                        </React.Fragment>
                                    )
                                ))
                            }
                        </div>
                    </div>
                ))
            }
        </>
    )
};

Classification.propTypes = {
    dataList: PropTypes.array,
    modeConfig: PropTypes.array,
    mode: PropTypes.string,
    getSelectedInfo: PropTypes.func,
    selectedInfo: PropTypes.object,
    otherHeight: PropTypes.number,
    getSelectNo: PropTypes.func,
    platDataList: PropTypes.array
};