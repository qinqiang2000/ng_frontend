import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { invoiceBaseInfo } from './util';
import more from './img/more.png';

export default function DetailInfo(props) {
    const [foldKey, setFoldKey] = useState([]);
    const { selectedInfo, getSelectedInfo } = props;

    const { signType = 'invoice', invoiceType, inputInvoices = [], snapshotUrl = '', attachSerialNoList = [] } = selectedInfo;
    useEffect(() => {
        setFoldKey([]);
    }, [snapshotUrl]);

    const coverInfo = [
        {
            name: '票据类型',
            key: 'type',
            value: '封面'
        },
        {
            name: '封面编号',
            key: 'coverNo'
        },
        {
            name: '采集渠道',
            key: 'fuploadModeStr'
        }
    ];

    const attachmentInfo = [
        {
            name: '文件名称',
            key: 'attachmentName'
        },
        // {
        //     name: '附件类型',
        //     key: ''
        // },
        {
            name: '文件格式',
            key: 'extName'
        },
        {
            name: '采集渠道',
            key: 'fuploadModeStr'
        }
        // {
        //     name: '文件页数',
        //     key: ''
        // }
    ];

    const saveFoldKey = (index) => {
        setFoldKey(key => [...key, index]);
    };

    if (!selectedInfo || !selectedInfo?.serialNo) {
        return (
            <div className='detail'>暂无数据</div>
        );
    }

    return (
        <div className='detail'>
            {
                signType === 'cover' && (
                    <>
                        <div className='detail-title'>封面信息</div>
                        {
                            coverInfo.map(item => (
                                <div className='detail-info' key={item.key}>
                                    <div className='name'>{item.name}</div>
                                    <div className='value'>{item?.value || selectedInfo[item.key] || '---'}</div>
                                </div>
                            ))
                        }
                    </>
                )
            }
            {
                signType === 'invoice' && (
                    <>
                        <div className='detail-title'>文件信息</div>
                        {
                            !inputInvoices.length ? (
                                <>
                                    {
                                        invoiceBaseInfo(invoiceType, selectedInfo).map(item => (
                                            <div className='detail-info' key={item.key}>
                                                <div className='name'>{item.name}</div>
                                                <div className='value'>{item?.value || selectedInfo[item.key] || '---'}</div>
                                            </div>
                                        ))
                                    }
                                    <div className='detail-info'>
                                        <div className='name'>文件标签：</div>
                                        <div className='value'>
                                            {
                                                selectedInfo.labelList && selectedInfo.labelList.length > 0 ? (
                                                    selectedInfo.labelList.map((item, i) => (
                                                        i != selectedInfo.labelList.length - 1 ? (
                                                            <>
                                                                <span key={i}>{item.labelName}</span><span>、</span>
                                                            </>
                                                        ) : (
                                                            <span key={i}>{item.labelName}</span>
                                                        )
                                                    ))
                                                ) : '--'
                                            }
                                        </div>
                                    </div>
                                </>
                            ) : (
                                inputInvoices.map((item, index) => (
                                    <div className='info-box' key={index}>
                                        <div className='count'>{index + 1}</div>
                                        <div className='info-box-item'>
                                            {invoiceBaseInfo(item.invoiceType, item).map((val, i) => (
                                                <div
                                                    className='info-list'
                                                    key={i}
                                                    style={{ display: i > 4 && !foldKey.includes(index) && inputInvoices.length > 1 ? 'none' : '' }}
                                                >
                                                    <div className='name'>{val.name}</div>
                                                    <div className='value'>{val?.value || item[val.key] || selectedInfo[val.key] || '---'}</div>
                                                </div>
                                            ))}
                                            <div className='info-list'>
                                                <div className='name'>文件标签：</div>
                                                <div className='value'>
                                                    {
                                                        selectedInfo.labelList && selectedInfo.labelList.length > 0 ? (
                                                            selectedInfo.labelList.map((item, i) => (
                                                                i != selectedInfo.labelList.length - 1 ? (
                                                                    <>
                                                                        <span key={i}>{item.labelName}</span><span>、</span>
                                                                    </>
                                                                ) : (
                                                                    <span key={i}>{item.labelName}</span>
                                                                )
                                                            ))
                                                        ) : '--'
                                                    }
                                                </div>
                                            </div>
                                            {invoiceBaseInfo(item.invoiceType, item).length > 5 && !foldKey.includes(index) && inputInvoices.length > 1 && (
                                                <img src={more} onClick={() => saveFoldKey(index)} className='icon' />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )
                        }
                        {
                            attachSerialNoList.length > 0 && (
                                <>
                                    <div className='detail-title'>关联文件（{attachSerialNoList.length}）</div>
                                    {
                                        attachSerialNoList.map((item, index) => (
                                            <div
                                                key={item.serialNo}
                                                className='detail-info link'
                                                onClick={() => getSelectedInfo({ ...item, signType: 'attachment' })}
                                            >
                                                {index + 1}. {item.originalFileName}
                                            </div>
                                        ))
                                    }
                                </>
                            )
                        }
                    </>
                )
            }
            {
                signType === 'attachment' && (
                    <>
                        <div className='detail-title'>附件信息</div>
                        {
                            attachmentInfo.map(item => (
                                <div className='detail-info' key={item.key}>
                                    <div className='name'>{item.name}</div>
                                    <div className='value'>{item?.value || selectedInfo[item.key] || '---'}</div>
                                </div>
                            ))
                        }
                        <div className='detail-info'>
                            <div className='name'>文件标签：</div>
                            <div className='value'>
                                {
                                    selectedInfo.labelList && selectedInfo.labelList.length > 0 ? (
                                        selectedInfo.labelList.map((item, i) => (
                                            i != selectedInfo.labelList.length - 1 ? (
                                                <>
                                                    <span key={i}>{item.labelName}</span><span>、</span>
                                                </>
                                            ) : (
                                                <span key={i}>{item.labelName}</span>
                                            )
                                        ))
                                    ) : '--'
                                }
                            </div>
                        </div>
                    </>
                )
            }
        </div>
    );
};

DetailInfo.propTypes = {
    selectedInfo: PropTypes.object,
    getSelectedInfo: PropTypes.func
};
