import React from 'react';
import { message } from 'antd';
import PropTypes from 'prop-types';
const forbidIcon = require('../commons/img/forbid_icon.png');
const warnIcon = require('../commons/img/waring_icon.png');
const middleTipsIcon = require('../commons/img/err_icon.png');

function strSub(index, curTxt) {
    return (
        <>
            {
                index == 0 ? (
                    <>
                        <span style={{ color: 'red' }}>{curTxt.substr(0, 1)}</span>{curTxt.substr(1)}
                    </>
                ) : (
                    index == curTxt.length - 1 ? (
                        <>
                            {curTxt.substring(0, index)}<span style={{ color: 'red' }}>{curTxt.substr(index, 1)}</span>
                        </>
                    ) : (
                        <>
                            {curTxt.substring(0, index)}<span style={{ color: 'red' }}>{curTxt.substr(index, 1)}</span>{curTxt.substr(index + 1)}
                        </>
                    )
                )
            }
        </>
    );
}

function inequality(position, arr) {
    const text1 = arr[0];
    const text2 = arr[1];
    if (text1.length != text2.length) {
        return (
            <>
                {
                    position == 'start' ? (
                        <span>{text1}</span>
                    ) : (
                        <span>{text2}</span>
                    )
                }
            </>
        );
    } else {
        let index = '';
        let errorLen = 0;
        for (var i = 0; i < text1.length; i++) {
            const currentTxt1 = text1.substring(i, i + 1);
            const currentTxt2 = text2.substring(i, i + 1);
            if (currentTxt1 != currentTxt2) {
                index = i;
                errorLen += 1;
            }
        }
        if (errorLen == 1) {
            return (
                <>
                    {
                        position == 'start' ? (
                            strSub(index, text1)
                        ) : (
                            strSub(index, text2)
                        )
                    }
                </>
            );
        } else {
            return (
                <>
                    {
                        position == 'start' ? (
                            <span>{text1}</span>
                        ) : (
                            <span>{text2}</span>
                        )
                    }
                </>
            );
        }
    }
};

function copyClick(index) {
    const currentNode = document.getElementById('tipTxt' + index);
    const tipTxt = currentNode.innerText;
    const copyTxt = document.getElementById('copyTxt' + index);
    copyTxt.value = tipTxt;
    copyTxt.select();
    document.execCommand('copy');
    message.success('复制成功！');
}

function errorTxt(errStr, index) {
    const { extFields, key } = errStr;
    const extendInfo = errStr.extendInfo || [];
    let msg = errStr.msg || '';
    if (key == 'change' && extendInfo.length > 0) {
        if (msg == '存在手工修改记录') {
            msg = '存在手工修改记录，原识别信息为：';
        } 
        let info = '';
        for (var i = 0; i < extendInfo.length; i++) {
            const index = parseInt(i) + 1;
            info += '\n  ' + index + '、' + extendInfo[i].columnChineseName + '：' + extendInfo[i].beforeValue;
        }
        msg = msg + info;
    }
    return (
        <div style={{ marginLeft: 20, marginBottom: 6 }} key={index}>
            {
                key == 'verifyBuyerName' ? (
                    <>
                        <p style={{ marginLeft: 3 }}>发票抬头: {inequality('start', extFields)}</p>
                        <p style={{ marginLeft: 3 }}>企业名称: {inequality('end', extFields)}</p>
                        <p style={{ marginLeft: 3 }}>
                            <span style={{ color: '#f00' }}>发票抬头与企业名称不一致</span>
                        </p>
                    </>
                ) : (
                    key == 'verifyBuyerTaxNo' ? (
                        <>
                            <p style={{ marginLeft: 3 }}>发票税号: {extFields[0]}</p>
                            <p style={{ marginLeft: 3 }}>企业税号: {extFields[1]}</p>
                            <p style={{ marginLeft: 3 }}>
                                <span style={{ color: '#f00' }}>发票税号与企业税号不一致</span>
                            </p>
                        </>
                    ) : (
                        key == 'errorNumber' ? (
                            <p style={{ marginLeft: 3 }}>发票疑似串号，串号号码为:{extFields[0]}</p>
                        ) : (
                            <>
                                {
                                    msg.indexOf('单据报销') > -1 ? (
                                        <p key={index} style={{ marginLeft: 3 }}>
                                            <span>{msg}</span>
                                            {/* <span style={{ marginLeft: 10, color: '#3598ff', cursor: 'pointer' }}>了解更多</span> */}
                                        </p>
                                    ) : (
                                        <p key={index} style={{ marginLeft: 3 }}>{msg}</p>
                                    )
                                }
                            </>
                        )
                    )
                )
            }
        </div>
    );
}

export const TipTitle = function({ forbidList = [], errorList = [], warnList = [], index }) {
    return (
        <div className='fpzsTipBox'>
            <textarea name='copy' id={'copyTxt' + index} cols='30' rows='10' className='copyTxt' />
            <div className='title'>
                <span>提示信息</span>
                <a style={{ position: 'absolute', right: '15px' }} onClick={() => { copyClick(index); }}>复制</a>
            </div>
            <div className='content' id={'tipTxt' + index}>
                {
                    forbidList.length > 0 ? (
                        <div className='tipBox'>
                            <div className='subTitle'>
                                <img src={forbidIcon} width='16px' height='16px' />&nbsp;&nbsp;错误提示（禁止导入）：
                            </div>
                            {
                                forbidList.map((errStr, index) => {
                                    return (
                                        errorTxt(errStr, index)
                                    );
                                })
                            }
                        </div>
                    ) : null
                }
                {
                    errorList.length > 0 ? (
                        <div className='tipBox'>
                            <div className='subTitle'>
                                <img src={middleTipsIcon} width='16px' height='16px' />&nbsp;&nbsp;中度警示：
                            </div>
                            {
                                errorList.map((errStr, index) => {
                                    return (
                                        errorTxt(errStr, index)
                                    );
                                })
                            }
                        </div>
                    ) : null
                }
                {
                    warnList.length > 0 ? (
                        <div className='tipBox'>
                            <div className='subTitle'>
                                <img src={warnIcon} width='16px' height='16px' />&nbsp;&nbsp;轻度提醒：
                            </div>
                            {
                                warnList.map((errStr, index) => {
                                    return (
                                        errorTxt(errStr, index)
                                    );
                                })
                            }
                        </div>
                    ) : null
                }
            </div>
        </div>
    );
};

TipTitle.propTypes = {
    forbidList: PropTypes.array,
    errorList: PropTypes.array,
    warnList: PropTypes.array,
    index: PropTypes.string
};

export const invoiceConfig = function(verifyResult) {
    const forbidList = []; //禁止导入 0
    const errorList = []; //错误警告 2
    const warnList = []; //轻度提示 3
    let checkFail = ''; //查验失败描述
    if (verifyResult && verifyResult.length > 0) {
        for (const item of verifyResult) {
            const { config, msg, key, extFields, extendInfo, name } = item;
            if (config == 0) {
                forbidList.push({ msg, key, extFields, extendInfo, name });
            } else if (config == 2) {
                errorList.push({ msg, key, extFields, extendInfo, name });
            } else if (config == 3) {
                warnList.push({ msg, key, extFields, extendInfo, name });
            }
            if (key == 'checkStatus') {
                checkFail = msg;
            }
        }
    }
    return {
        forbidList,
        errorList,
        warnList,
        checkFail
    };
};