/* eslint-disable */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ImgMode from './imgMode/index';
import TreeMode from './treeMode';
import taxIcon from './img/tax.png';
import totalIcon from './img/total.png';
import countIcon from './img/count.png';

function SnapshotTree (props) {
    const { modeKey, defaultModeKey, from, dataList, selectNo, otherHeight, isShowStatistics } = props;

    const [activeTab, setActiveTab] = useState(defaultModeKey);

    useEffect(() => {
        setActiveTab(defaultModeKey);
    }, [defaultModeKey]);

    const modeList = [
        {
            key: 'img',
            name: '图片模式',
            render: from === 'document' ? <TreeMode {...props} mode='img' /> : <ImgMode {...props} mode='img' />
        },
        {
            key: 'list',
            name: '列表模式',
            render: from === 'document' ? <TreeMode {...props} mode='list' /> : <ImgMode {...props} mode='list' />
        },
        {
            key: 'match',
            name: '匹配模式',
            render: from === 'document' ? <TreeMode {...props} mode='img' /> : <ImgMode {...props} mode='img' />
        }
    ];

    const { totalAmount = 0, totalTaxAmount = 0, invoiceCount = 0, attachmentCount = 0 } = dataList.find(item => item.fscanBillNos === selectNo);
    return (
        <div>
            <div className='tabs'>
                {
                    modeList.filter(item => modeKey.some(o => o === item.key)).map(item => (
                        <div
                            className={activeTab === item.key ? 'tabs-item tabs-active' : 'tabs-item'}
                            onClick={() => setActiveTab(item.key)}
                            key={item.key}
                        >
                            <div key={item.key}>{item.name}</div>
                        </div>
                    ))
                }
            </div>
            <div className='tabs-render' style={{ height: `calc(100vh - ${otherHeight}px - 38px - ${isShowStatistics ? 70 : 0}px)` }}>{modeList.find(item => item.key === activeTab).render}</div>
            {isShowStatistics && (
                <div className='footer'>
                    <div>
                        <img src={totalIcon} className='footer-icon' />价税合计<span className='footer-text'>{totalAmount || '--'}</span>元
                    </div>
                    <div>
                        <img src={taxIcon} className='footer-icon' />税额 <span className='footer-text'>{totalTaxAmount || '--'}</span>元
                    </div>
                    <div>
                        <img src={countIcon} className='footer-icon' />发票共<span className='footer-text'>{invoiceCount}</span>份，附件共
                        <span className='footer-text'>{attachmentCount}</span>份
                    </div>
                </div>
            )}
        </div>
    )
};

SnapshotTree.propTypes = {
    modeKey: PropTypes.array,
    dataList: PropTypes.array,
    modeConfig: PropTypes.array,
    getSelectedInfo: PropTypes.func,
    selectedInfo: PropTypes.object,
    otherHeight: PropTypes.number,
    getSelectNo: PropTypes.func,
    selectNo: PropTypes.string,
    defaultModeKey: PropTypes.string,
    from: PropTypes.string,
    isShowStatistics: PropTypes.bool,
    platDataList: PropTypes.array
};

export default SnapshotTree;