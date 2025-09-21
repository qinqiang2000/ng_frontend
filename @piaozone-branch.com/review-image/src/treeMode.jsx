import React, { useState } from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import './index.less';
import TreeItem from './treeItem';

export default function ImgMode(props) {
    const { dataList, mode, getSelectedInfo, selectedInfo, otherHeight, getSelectNo } = props;
    const [foldList, setFoldList] = useState([]); // 存储折叠的key

    const changeFoldList = (key) => {
        if (foldList.includes(key)) {
            setFoldList(foldList => foldList.filter(item => item !== key));
        } else {
            setFoldList(foldList => foldList.concat([key]));
        }
    };

    const handleRender = (fscanBillNos, arr, count = 0) => {
        return arr.map(item => {
            return (
                <React.Fragment key={item.fd}>
                    <div className='mode-subtitle' onClick={() => changeFoldList(`${fscanBillNos}${item.fd}`)} style={{ marginLeft: `${16 * count}px` }}>
                        <div className={!foldList.includes(`${fscanBillNos}${item.fd}`) ? 'icon activate' : 'icon'} />
                        {item.titleName}
                    </div>
                    <div style={{ display: foldList.includes(`${fscanBillNos}${item.fd}`) ? 'none' : '' }}>
                        <div>
                            {
                                item?.storageList?.length > 0 && item.storageList.map((val, index) => (
                                    <TreeItem
                                        key={val.fd}
                                        info={val}
                                        count={index + 1}
                                        selectedInfo={selectedInfo}
                                        getSelectedInfo={getSelectedInfo}
                                        getSelectNo={getSelectNo}
                                        fscanBillNos={fscanBillNos}
                                        mode={mode}
                                    />
                                ))
                            }
                        </div>
                        {item.childNode && handleRender(fscanBillNos, item.childNode, count + 1)}
                    </div>
                </React.Fragment>
            );
        });
    };
    return (
        <div
            className='mode-content'
        >
            {
                dataList.map(item => (
                    <div
                        className='mode-box'
                        key={item.fscanBillNos}
                        style={{
                            minHeight: dataList.length === 1 && !foldList.includes(item.fscanBillNos)
                                ? `calc(100vh - ${otherHeight}px - 38px - 70px - 10px)`
                                : 0
                        }}
                    >
                        <div className='mode-title' onClick={() => changeFoldList(item.fscanBillNos)}>
                            <div className={!foldList.includes(item.fscanBillNos) ? 'icon activate' : 'icon'} />
                            <Tooltip
                                placement='top'
                                title={<div className='tooltip'>{item.fscanBillNos}</div>}
                                getPopupContainer={() => document.getElementById('title')} autoAdjustOverflow arrowPointAtCenter={true}
                            >
                                <div className='text' id='title'>{item.fscanBillNos}</div>
                            </Tooltip>
                        </div>
                        <div style={{ display: foldList.includes(item.fscanBillNos) ? 'none' : '' }}>
                            {
                                item?.storageList?.length > 0 && item.storageList.map((val, index) => {
                                    return (
                                        <TreeItem
                                            key={val.fd}
                                            info={val}
                                            count={index + 1}
                                            selectedInfo={selectedInfo}
                                            getSelectedInfo={getSelectedInfo}
                                            getSelectNo={getSelectNo}
                                            fscanBillNos={item.fscanBillNos}
                                            mode={mode}
                                        />
                                    );
                                })
                            }
                            {
                                handleRender(item.fscanBillNos, item.childNode)
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    );
};

ImgMode.propTypes = {
    dataList: PropTypes.array,
    // modeConfig: PropTypes.array,
    mode: PropTypes.string,
    getSelectedInfo: PropTypes.func,
    selectedInfo: PropTypes.object,
    otherHeight: PropTypes.number,
    getSelectNo: PropTypes.func
};