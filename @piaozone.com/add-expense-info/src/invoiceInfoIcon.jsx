import React from 'react';
import PropTypes from 'prop-types';
import { message, Tooltip } from 'antd';
import { invocieTypeIconDict, allowCheckInvoice, noInvoiceTitle, checkStatusDict } from './constants';
import { getWaringCodesResult } from '@piaozone.com/pwyConstants';
import './media/less/invoiceIcon.less';
const forbidIcon = require('./media/img/forbid_icon.png');
const errorIcon = require('./media/img/err_icon.png');
const warnIcon = require('./media/img/waring_icon.png');
const tipIcon = require('./media/img/errorIcon.png');

const bxStatusDict = {
    k0: ['unbx.png', '未报销'],
    k1: ['unbx.png', '未报销'],
    k30: ['bxing.png', '报销中'],
    k60: ['bxed.png', '已报销'],
    k65: ['bxing.png', '等待付款'],
    k70: ['bxed.png', '已付款'],
    k27: ['unbx.png', '已废弃'],
    k40: ['bxing.png', '审核不通过'],
    k80: ['bxed.png', '已关闭']
};

const invoiceStatusDict = { //0:正常、1：失控、2：作废、3：红冲、4：异常
    k2: ['cancelIcon.png', '已作废'],
    k3: ['hcIcon.png', '已红冲']
};

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
}

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
    let msg = errStr.msg;
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
                        <p style={{ marginLeft: 3 }}>
                            企业名称: {inequality('end', extFields)}
                            <span style={{ color: '#f00', fontWeight: 'bold', marginLeft: 10 }}>不一致</span>
                        </p>
                    </>
                ) : (
                    key == 'verifyBuyerTaxNo' ? (
                        <>
                            <p style={{ marginLeft: 3 }}>发票税号: {extFields[0]}</p>
                            <p style={{ marginLeft: 3 }}>
                                企业税号: {extFields[1]}
                                <span style={{ color: '#f00', fontWeight: 'bold', marginLeft: 10 }}>不一致</span>
                            </p>
                        </>
                    ) : (
                        <>
                            {
                                msg.indexOf('单据报销') > -1 ? (
                                    <p key={index} style={{ marginLeft: 3 }}>
                                        <span>{msg}</span>
                                    </p>
                                ) : (
                                    <p key={index} style={{ marginLeft: 3 }}>{msg}</p>
                                )
                            }
                        </>
                    )
                )
            }
        </div>
    );
}


function TipTitle({ forbidList = [], errorList = [], warnList = [], index }) {
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
                                <img src={errorIcon} width='16px' height='16px' />&nbsp;&nbsp;中度警示：
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
}

TipTitle.propTypes = {
    forbidList: PropTypes.array,
    errorList: PropTypes.array,
    warnList: PropTypes.array,
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

function invoiceConfig(verifyResult) {
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
}

function InvoiceInfoIcon({
    bx,
    suspectedErrorData,
    fplx,
    invoiceStatus,
    checkStatus,
    info = {},
    notEqualsName,
    notEqualsTaxNo,
    buyerName = '',
    buyerTaxNo = '',
    size = 'normal',
    isRevise = 1,
    userKeyInfo,
    index
}) {
    const { warningCode = '', relevancy, expenseNumRelevancy, continuousNos = [], verifyResult } = info;
    invoiceStatus = invoiceStatus || info.invoiceStatus;
    let titleErr = [];
    fplx = parseInt(fplx);
    const invocieTypeIcon = invocieTypeIconDict['k' + fplx] && invocieTypeIconDict['k' + fplx][0];
    isRevise = parseInt(isRevise);
    let chTip = '';
    if (typeof suspectedErrorData !== 'undefined' && suspectedErrorData.length > 0 && [3, 4, 5].indexOf(fplx) !== -1) {
        chTip = '该票可能出现了串号[' + suspectedErrorData[0] + ']';
    }

    if (noInvoiceTitle.indexOf(parseInt(fplx)) === -1) { //非增值税发票
        if (notEqualsName) {
            const buyerNameTip = buyerName ? '(' + buyerName + ')' : '';
            const ghf_mcTip = userKeyInfo.ghf_mc ? '(' + userKeyInfo.ghf_mc + ')' : '';
            titleErr.push('发票抬头' + buyerNameTip + '与当前企业名称' + ghf_mcTip + '不一致');
        }

        if (notEqualsTaxNo) {
            const buyerTaxNoTip = buyerTaxNo ? '(' + buyerTaxNo + ')' : '';
            const tinTip = userKeyInfo.tin ? '(' + userKeyInfo.tin + ')' : '';
            titleErr.push('购方税号' + buyerTaxNoTip + '与当前企业税号' + tinTip + '不一致');
        }
    }

    const warningTxt = getWaringCodesResult(warningCode);

    if (warningTxt.length > 0) {
        titleErr = titleErr.concat(warningTxt);
    }

    if (relevancy == '2') {
        const relevanum = expenseNumRelevancy.join(',');
        titleErr.push('关联的其他单号：' + relevanum);
    }

    if (continuousNos && continuousNos.length > 0) {
        // 的士票连号提示
        if (fplx === 8) {
            titleErr.push('的士票连号，连号号码' + continuousNos.join(','));
        }
    }

    const { forbidList, errorList, warnList, checkFail } = invoiceConfig(verifyResult || []);
    index = index + '';
    const { errorLevel } = info;
    let slognIcon = '';
    if (!errorLevel || errorLevel == 0) {
        slognIcon = errorIcon;
    } else {
        slognIcon = tipIcon;
    }
    let checkStatusInfo = checkStatusDict['k' + 1];
    if (checkStatusDict['k' + checkStatus]) {
        checkStatusInfo = checkStatusDict['k' + checkStatus];
        if (checkStatus != 1) {
            checkStatusInfo[1] = checkFail;
        }
    }

    return (
        <div>
            <span className='icons'>
                {
                    fplx ? (
                        <Tooltip placement='bottom' title={invocieTypeIconDict['k' + fplx][1]}>
                            <img
                                src={require('./media/img/invoiceIcons/' + invocieTypeIcon)}
                                alt=''
                                style={{ width: 'auto' }}
                                height={size === 'normal' ? 20 : 16}
                            />
                        </Tooltip>
                    ) : null
                }
                {
                    typeof bx !== 'undefined' ? (
                        <Tooltip placement='bottom' title={bxStatusDict['k' + bx][1]}>
                            <img
                                src={require('./media/img/' + bxStatusDict['k' + bx][0])}
                                alt=''
                                style={{ width: 'auto' }}
                                height={size === 'normal' ? 20 : 16}
                            />
                        </Tooltip>
                    ) : null
                }

                {
                    typeof checkStatus !== 'undefined' && (allowCheckInvoice.indexOf(fplx) !== -1) ? (
                        <Tooltip placement='bottom' title={checkStatusInfo[1]}>
                            <img
                                src={require('./media/img/' + checkStatusInfo[0])}
                                alt='' style={{ width: 'auto' }}
                                height={size === 'normal' ? 20 : 16}
                            />
                        </Tooltip>
                    ) : null
                }

                {
                    (allowCheckInvoice.indexOf(fplx) !== -1 && invoiceStatusDict['k' + invoiceStatus]) ? (
                        <Tooltip placement='bottom' title={invoiceStatusDict['k' + invoiceStatus][1]}>
                            <img
                                src={require('./media/img/' + invoiceStatusDict['k' + invoiceStatus][0])}
                                alt='' style={{ width: 'auto' }}
                                height={size === 'normal' ? 20 : 16}
                            />
                        </Tooltip>
                    ) : null
                }

                {
                    allowCheckInvoice.indexOf(fplx) === -1 && isRevise === 2 ? (
                        <Tooltip placement='bottom' title='发票信息已手动修改'>
                            <img
                                src={require('./media/img/invoiceIcons/yxg.png')}
                                alt=''
                                style={{ width: 'auto', marginRight: 10 }}
                                height={size === 'normal' ? 20 : 16}
                            />
                        </Tooltip>
                    ) : null
                }

                {
                    chTip !== '' ? (
                        <Tooltip placement='bottom' title={chTip}>
                            <img
                                src={require('./media/img/invoiceIcons/ch_icon.png')}
                                alt=''
                                style={{ width: 'auto' }}
                                height={size === 'normal' ? 22 : 16}
                            />
                        </Tooltip>
                    ) : null
                }

                {
                    forbidList.length > 0 || errorList.length > 0 || warnList.length > 0 ? (
                        <Tooltip
                            placement='bottom'
                            overlayClassName='fpzsInvoiceIcon'
                            title={
                                <TipTitle forbidList={forbidList} errorList={errorList} warnList={warnList} index={index} />
                            }
                        >
                            <img src={slognIcon} alt='' style={{ width: 'auto' }} height={size === 'normal' ? 20 : 16} />
                        </Tooltip>
                    ) : null
                }
            </span>
        </div>
    );
}


InvoiceInfoIcon.propTypes = {
    bx: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    suspectedErrorData: PropTypes.array,
    fplx: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    invoiceStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    checkStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    info: PropTypes.object,
    notEqualsName: PropTypes.bool,
    notEqualsTaxNo: PropTypes.bool,
    buyerName: PropTypes.string,
    buyerTaxNo: PropTypes.string,
    size: PropTypes.string,
    isRevise: PropTypes.number,
    userKeyInfo: PropTypes.object,
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default InvoiceInfoIcon;