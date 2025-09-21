import React from 'react';
import PropTypes from 'prop-types';
import pwyConstants from '@piaozone.com/pwyConstants';
const { invoiceTypes } = pwyConstants;
const allowCheckes = invoiceTypes.ADDED_INVOICE_TYPES;
const invoiceTypesDict = invoiceTypes.INPUT_INVOICE_TYPES_DICT;
const allowCheckInvoice = [1, 2, 3, 4, 5, 12, 13, 15, 26, 27];
const signStatus = {
    k1: '未签收',
    k2: '未签收',
    k3: '已签收',
    k4: '已签收'
};

const checkStatus = {
    k1: '已验',
    k2: '未验',
    k3: '--',
    k: '--'
};

export default function InvoiceInfo({ list = [], onEditInvoice }) {
    return (
        <div className='invoice-info'>
            {
                list.map((item, index) => {
                    const { invoiceType, matchStatus, fileid, serialNo } = item;
                    let fileTypeName = '';
                    if (invoiceTypesDict['k' + invoiceType]) {
                        fileTypeName = invoiceTypesDict['k' + invoiceType].text;
                    } else {
                        fileTypeName = '未知发票';
                    }
                    return (
                        <div className='info-box' key={index}>
                            <div><label>文件大类：</label><span>发票</span></div>
                            <div><label>文件类型：</label><span>{fileTypeName}</span></div>
                            {onText(parseInt(invoiceType), item)}
                            <div className='edit-box'>
                                <div />
                                {
                                    matchStatus == 1 || matchStatus == 2 ? (
                                        <div className='edit' onClick={() => onEditInvoice({ fileid, serialNo })}>编辑</div>
                                    ) : null
                                }
                            </div>
                            {siginStatusTxt(matchStatus)}
                        </div>
                    );
                })
            }

        </div>
    );
};

function siginStatusTxt(matchStatus) {
    let txt = '';
    if (matchStatus == 1 || matchStatus == 2) {
        txt = (
            <div className='signStatus error'>
                {signStatus['k' + matchStatus]}
            </div>
        );
    } else if (matchStatus == 3 || matchStatus == 4) {
        txt = (
            <div className='signStatus success'>
                {signStatus['k' + matchStatus]}
            </div>
        );
    }
    return txt;
}

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return '--';
    }
    const date = new Date(timestamp);
    const year = date.getFullYear(); // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // 拼接成格式化的字符串
    return `${year}-${month}-${day}`;
}

const onText = (fplx, info) => {
    let creatHtml = '';
    if (allowCheckInvoice.indexOf(fplx) != -1 || [7, 23].indexOf(fplx) != -1) {
        creatHtml = (
            <>
                <div><label>发票代码：</label><span>{info.invoiceCode}</span></div>
                <div><label>发票号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>价税合计：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>开票日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                {
                    allowCheckes.indexOf(fplx) !== -1 ? (
                        <div>
                            <label>查验结果：</label>
                            <span style={{ color: info.checkStatus == '1' ? '#3598ff' : '#fb2323' }}>{checkStatus['k' + info.checkStatus]}</span>
                        </div>
                    ) : null
                }
            </>
        );
    } else if (fplx === 14) { //定额发票
        creatHtml = (
            <>
                <div><label>发票代码：</label><span>{info.invoiceCode}</span></div>
                <div><label>发票号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>价税合计：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>开票日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
            </>
        );
    } else if (fplx === 8) { //的士票
        creatHtml = (
            <>
                <div><label>乘车日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                <div><label>打车金额：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>打车里程：</label><span>{info.mileage}</span></div>
                <div><label>发票代码：</label><span>{info.invoiceCode}</span></div>
                <div><label>发票号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>上车时间：</label><span>{info.timeGetOn}</span></div>
                <div><label>下车时间：</label><span>{info.timeGetOff}</span></div>
            </>
        );
    } else if (fplx === 9 || fplx === 29) { //火车票
        creatHtml = (
            <>
                <div><label>乘车日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                <div>
                    <span className='linkColor'>{info.stationGetOn || '--'}</span>
                    <span style={{ margin: '0 15px' }}>到</span>
                    <span className='linkColor'>{info.stationGetOff || '--'}</span>
                </div>
                <div><label>车票编码：</label><span>{info.printingSequenceNo || '--'}</span></div>
                <div><label>发票金额：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>车次：</label><span>{info.trainNum || '--'}</span></div>
                {
                    fplx === 29 ? (
                        <div>
                            <label>查验结果：</label>
                            <span style={{ color: info.checkStatus == '1' ? '#3598ff' : '#fb2323' }}>{checkStatus['k' + info.checkStatus]}</span>
                        </div>
                    ) : null
                }
            </>
        );
    } else if (fplx === 10 || fplx === 28) { //飞机票
        const infoItems = info.items || [];
        creatHtml = (
            <>
                <div><label>航班号：</label><span>{info.flightNum}</span></div>
                <div><label>发票金额：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>乘机日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                {
                    infoItems.length < 2 ? (
                        <div>
                            行程：<span className='linkColor'>{info.placeOfDeparture || '--'}</span>
                            <span style={{ margin: '0 8px' }}>到</span>
                            <span className='linkColor'>{info.destination || '--'}</span>
                        </div>
                    ) : (
                        infoItems.map((subInfo, i) => {
                            return (
                                <div style={{ display: 'inline-block', lineHeight: '24px' }} key={i}>
                                    {(i == 0) ? '' : '-'}（{subInfo.invoiceDate}：
                                    <span>{subInfo.seatGrade}&nbsp;&nbsp;从</span>
                                    <span className='linkColor'>{subInfo.placeOfDeparture || '--'}</span>
                                    <span style={{ margin: '0 8px' }}>到</span>
                                    <span className='linkColor'>{subInfo.destination || '--'}</span>
                                    ）
                                </div>
                            );
                        })
                    )
                }
                {
                    fplx === 28 ? (
                        <div>
                            <label>查验结果：</label>
                            <span style={{ color: info.checkStatus == '1' ? '#3598ff' : '#fb2323' }}>{checkStatus['k' + info.checkStatus]}</span>
                        </div>
                    ) : null
                }
            </>
        );
    } else if (fplx === 20) { //轮船票
        creatHtml = (
            <>
                <div><label>乘船人：</label><span>{info.passengerName}</span></div>
                <div><label>金额：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>乘船日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                <div><label>发票代码：</label><span>{info.invoiceCode}</span></div>
                <div><label>发票号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>出发地：</label><span>{info.stationGetOn}</span></div>
                <div><label>到达地：</label><span>{info.stationGetOff}</span></div>
            </>
        );
    } else if (fplx === 21) { // 海关缴款书
        creatHtml = (
            <>
                <div><label>填发日期</label>：<span>{info.invoiceDate}</span></div>
                <div><label>缴款单位一名称：</label><span>{info.deptName || '--'}</span></div>
                <div><label>缴款书号码：</label><span>{info.customDeclarationNo || '--'}</span></div>
                <div><label>合计金额：</label><span className='money'>{info.totalAmount}</span></div>
                <div><label>缴款单位二名称：</label><span>{info.secondDeptName || '--'}</span></div>
            </>
        );
    } else if (fplx === 24) { // 火车退票
        creatHtml = (
            <>
                <div><label>收据号码：</label><span>{info.number}</span></div>
                <div><label>金额：</label><span className='money'>{info.totalAmount}元</span></div>
            </>
        );
    } else if (fplx === 25) { //财政电子票据
        creatHtml = (
            <>
                <div><label>票据代码：</label><span>{info.invoiceCode}</span></div>
                <div><label>票据号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>开票日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                <div><label>交款人代码：</label><span>{info.payerPartyCode || '--'}</span></div>
                <div><label>交款人名称：</label><span>{info.payerPartyName || '--'}</span></div>
                <div><label>总金额：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>开票单位代码：</label><span>{info.invoicingPartyCode || '--'}</span></div>
                <div><label>开票单位名称：</label><span>{info.invoicingPartyName || '--'}</span></div>
            </>
        );
    } else if (fplx === 17) { //过路过桥费
        creatHtml = (
            <>
                <div><label>所在地：</label><span>{info.taxAuthorityName}</span></div>
                <div><label>金额：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>开票日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                <div><label>发票代码：</label><span>{info.invoiceCode}</span></div>
                <div><label>发票号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>入口：</label><span>{info.entrance}</span></div>
                <div><label>出口：</label><span>{info.exit}</span></div>
            </>
        );
    } else if (fplx === 19) { //完税证明
        creatHtml = (
            <>
                <div><label>税务机关名称：</label><span>{info.taxAuthorityName}</span></div>
                <div><label>完税证明号码：</label><span>{info.taxPaidProofNo}</span></div>
                <div><label>纳税人识别号：</label><span>{info.buyerTaxNo}</span></div>
                <div><label>填发日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                <div><label>金额：</label><span className='money'>{info.totalAmount}元</span></div>
            </>
        );
    } else if (fplx === 16) { //客运发票
        creatHtml = (
            <>
                <div><label>票价：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>开票日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
                <div><label>时间：</label><span>{info.time}</span></div>
                <div><label>发票代码：</label><span>{info.invoiceCode}</span></div>
                <div><label>发票号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>出发站：</label><span>{info.stationGetOn}</span></div>
                <div><label>到达站：</label><span>{info.stationGetOff}</span></div>
            </>
        );
    } else if (fplx === 83 || fplx === 84) { //数电（二手车，机动车）
        creatHtml = (
            <>
                <div><label>发票号码：</label><span>{info.invoiceNo}</span></div>
                <div><label>价税合计：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>开票日期：</label><span>{formatTimestamp(info.invoiceDate)}</span></div>
            </>
        );
    } else if (fplx === 11) { //其他发票
        creatHtml = (
            <>
                <div><label>价税合计：</label><span className='money'>{info.totalAmount}元</span></div>
                <div><label>备注：</label><span>{info.remark}</span></div>
            </>
        );
    }
    return creatHtml;
};

InvoiceInfo.propTypes = {
    list: PropTypes.array, //发票信息
    onEditInvoice: PropTypes.func
};