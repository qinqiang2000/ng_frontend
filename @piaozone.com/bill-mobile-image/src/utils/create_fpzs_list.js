import { getSubStr, isExist, getDateSplit, fileSuffix } from './tools';
const invoice_piao_icon = require('../media/img/clip/fp_slt.png');
const unbxIcon = require('../media/img/clip/unbx.png');
const bxingIcon = require('../media/img/clip/bxing.png');
const bxedIcon = require('../media/img/clip/bxed.png');
const kypIcon = require('../media/img/clip/busIcon.png');
const carIcon = require('../media/img/clip/deshiIcon2x.png');
const shipIcon = require('../media/img/clip/shipIcon.png');
const airIcon = require('../media/img/clip/airIcon2x.png');
const trainIcon = require('../media/img/clip/carIcon2x.png');
const data_xfIcon = require('../media/img/clip/data_xf.png');
const data_xfailIcon = require('../media/img/clip/data_xf_fail.png');
const dzfp_icon = require('../media/img/clip/dianpiao.png');
const ptfp_icon = require('../media/img/clip/zhipiao.png');
const zyfp_icon = require('../media/img/clip/zhuanpiao.png');
const jsfp_icon = require('../media/img/clip/jpIcon.png');
const tyfp_icon = require('../media/img/clip/jidaIcon.png');
const dsfp_icon = require('../media/img/clip/deshiIcon.png');
const jksIcon = require('../media/img/clip/jksIcon2x.png');
const hcfp_icon = require('../media/img/clip/carIcon.png');
const fjfp_icon = require('../media/img/clip/airIcon.png');
const qtfp_icon = require('../media/img/clip/otherIcon.png');
const jdcfp_icon = require('../media/img/clip/vehicleIcon.png');
const gzf_icon = require('../media/img/clip/gzFp_icon.png');
const escfp_icon = require('../media/img/clip/secondIcon.png');
const defp_icon = require('../media/img/clip/dinge.png');
const txfp_icon = require('../media/img/clip/current.png');
const hyfp_icon = require('../media/img/clip/transport.png');
const glfp_icon = require('../media/img/clip/pass.png');
const ship_icon = require('../media/img/clip/ship.png');
const standardMark = require('../media/img/clip/mark.png');
const attachIcon = require('../media/img/clip/attachIcon.png');
const jks_icon = require('../media/img/clip/jksIcon.png');
const czpj_icon = require('../media/img/clip/czpjIcon.png');
const alldpIcon = require('../media/img/clip/alldp.png');
const alldzIcon = require('../media/img/clip/alldz.png');
const allAirIcon = require('../media/img/clip/allAir.png');
const allTrainIcon = require('../media/img/clip/allTrain.png');
const allEleTrainIcon = require('../media/img/clip/alldjdc.png');
const allEleEscTrainIcon = require('../media/img/clip/alldesc.png');
const imgIcon = require('../media/img/clip/fail_icon.png');
const cancelIcon = require('../media/img/invoiceState/cancelIcon.png');
const redIcon = require('../media/img/invoiceState/redIcon.png');
const partRedIcon = require('../media/img/invoiceState/partRedIcon.png');
const fullRedIcon = require('../media/img/invoiceState/fullRedIcon.png');
const toBeConfirmedIcon = require('../media/img/invoiceState/toBeConfirmedIcon.png');
const outOfControlIcon = require('../media/img/invoiceState/outOfControlIcon.png');
const anomalousIcon = require('../media/img/invoiceState/anomalousIcon.png');
const abnormalIcon = require('../media/img/invoiceState/abnormalIcon.png');

const pdfIcon = require('../media/img/attachIcon/icon_pdf.png');
const ofdIcon = require('../media/img/attachIcon/icon_ofd.png');
const docIcon = require('../media/img/attachIcon/icon_doc.png');
const docxIcon = require('../media/img/attachIcon/icon_docx.png');
const xlsIcon = require('../media/img/attachIcon/icon_xls.png');
const xlsxIcon = require('../media/img/attachIcon/icon_xlsx.png');
const rarIcon = require('../media/img/attachIcon/icon_rar.png');
const zipIcon = require('../media/img/attachIcon/icon_zip.png');


export const fplxDict = {
    k1: {
        name: '电子普通发票',
        icon: dzfp_icon,
        piao_icon: invoice_piao_icon,
        className: 'ele'
    },
    k2: {
        name: '电子发票专票',
        icon: dzfp_icon,
        piao_icon: invoice_piao_icon,
        className: 'ele'
    },
    k3: {
        name: '普通纸质发票',
        icon: ptfp_icon,
        piao_icon: invoice_piao_icon,
        className: 'pap'
    },
    k4: {
        name: '专用纸质发票',
        icon: zyfp_icon,
        piao_icon: invoice_piao_icon,
        className: 'exp'
    },
    k5: {
        name: '普通纸质卷票',
        icon: jsfp_icon,
        piao_icon: invoice_piao_icon,
        className: 'jp'
    },
    k7: {
        name: '通用机打',
        icon: tyfp_icon,
        piao_icon: '',
        className: 'typ'
    },
    k8: {
        name: '出租车票',
        icon: dsfp_icon,
        piao_icon: carIcon,
        className: 'car_photo'
    },
    k9: {
        name: '火车票',
        icon: hcfp_icon,
        piao_icon: trainIcon,
        className: 'train_photo'
    },
    k10: {
        name: '飞机票',
        icon: fjfp_icon,
        piao_icon: airIcon,
        className: 'air_photo'
    },
    k11: {
        name: '其他',
        icon: qtfp_icon,
        piao_icon: '',
        className: 'qtp'
    },
    k12: {
        name: '机动车销售票',
        icon: jdcfp_icon,
        piao_icon: '',
        className: 'car_photo'
    },
    k13: {
        name: '二手车发票',
        icon: escfp_icon,
        piao_icon: '',
        className: 'car_photo'
    },
    k14: {
        name: '定额票',
        icon: defp_icon,
        piao_icon: '',
        className: 'dep'
    },
    k15: {
        name: '通行费',
        icon: txfp_icon,
        piao_icon: invoice_piao_icon,
        className: 'txp'
    },
    k16: {
        name: '客运票',
        icon: hyfp_icon,
        piao_icon: kypIcon,
        className: 'kyp'
    },
    k17: {
        name: '过路票',
        icon: glfp_icon,
        piao_icon: kypIcon,
        className: 'glp'
    },
    k19: {
        name: '完税证明',
        icon: gzf_icon,
        piao_icon: '',
        className: 'glp'
    },
    k20: {
        name: '轮船票',
        icon: ship_icon,
        piao_icon: shipIcon,
        className: 'ship'
    },
    k21: {
        name: '海关缴款书',
        icon: jks_icon,
        piao_icon: jksIcon,
        className: 'jks'
    },
    k23: {
        name: '通用机电',
        icon: tyfp_icon,
        piao_icon: '',
        className: 'typ'
    },
    k24: {
        name: '火车票退票凭证',
        icon: hcfp_icon,
        piao_icon: trainIcon,
        className: 'train_photo'
    },
    k25: {
        name: '财政电子票据',
        icon: czpj_icon,
        piao_icon: '',
        className: 'typ'
    },
    k26: {
        name: '数电普票',
        icon: alldpIcon,
        piao_icon: invoice_piao_icon,
        className: 'txp'
    },
    k27: {
        name: '数电专票',
        icon: alldzIcon,
        piao_icon: invoice_piao_icon,
        className: 'txp'
    },
    k28: {
        name: '数电航空',
        icon: allAirIcon,
        piao_icon: airIcon,
        className: 'air_photo'
    },
    k29: {
        name: '数电铁路',
        icon: allTrainIcon,
        piao_icon: trainIcon,
        className: 'train_photo'
    },
    k83: {
        name: '数电机动车',
        icon: allEleTrainIcon,
        piao_icon: '',
        className: 'train_photo'
    },
    k84: {
        name: '数电二手车',
        icon: allEleEscTrainIcon,
        piao_icon: '',
        className: 'train_photo'
    }
};

export const bxlxDict = {
    k0: {
        status: '未用',
        bx_icon: unbxIcon,
        bx_className: 'unbx nobx'
    },
    k1: {
        status: '未用',
        bx_icon: unbxIcon,
        bx_className: 'unbx nobx'
    },
    k20: {
        status: '未用',
        bx_icon: unbxIcon,
        bx_className: 'unbx nobx'
    },
    k25: {
        status: '在用',
        bx_icon: bxingIcon,
        bx_className: 'bxing'
    },
    k30: {
        status: '在用',
        bx_icon: bxingIcon,
        bx_className: 'bxing'
    },
    k60: {
        status: '已用',
        bx_icon: bxedIcon,
        bx_className: 'bxed'
    }
};

//发票状态
export const invoiceDict = {
    k: {
        invoiceState: false,
        stateIcon: ''
    },
    k0: {
        invoiceState: '正常',
        stateIcon: ''
    },
    k1: {
        invoiceState: '失控',
        stateIcon: outOfControlIcon
    },
    k2: {
        invoiceState: '作废',
        stateIcon: cancelIcon
    },
    k3: {
        invoiceState: '红冲',
        stateIcon: redIcon
    },
    k4: {
        invoiceState: '异常',
        stateIcon: anomalousIcon
    },
    k5: {
        invoiceState: '非正常',
        stateIcon: abnormalIcon
    },
    k6: {
        invoiceState: '待确认',
        stateIcon: toBeConfirmedIcon
    },
    k7: {
        invoiceState: '部分红冲',
        stateIcon: partRedIcon
    },
    k8: {
        invoiceState: '全额红冲',
        stateIcon: fullRedIcon
    }
};

function tripFun(data) {
    var trip = '--';
    const { invoiceType } = data;
    if ([9, 16, 20].indexOf(parseInt(invoiceType)) > -1) { //火车票,客运票，轮船票
        const { stationGetOn, stationGetOff } = data;
        trip = stationGetOn + ' - ' + stationGetOff;
    } else if (invoiceType == 10) { //飞机票
        const { placeOfDeparture, destination } = data;
        trip = placeOfDeparture + ' - ' + destination;
    } else if (invoiceType == 28 || invoiceType == 29) {
        const stationGetOn = data.stationGetOn || data.placeOfDeparture || '--';
        const stationGetOff = data.stationGetOff || data.destination || '--';
        trip = stationGetOn + '-' + stationGetOff;
    }
    return trip;
}

export const checkStatusDict = {
    k1: {
        checkImg: data_xfIcon,
        checkText: '数据相符'
    },
    k2: {
        checkImg: data_xfailIcon,
        checkText: '未查验或查验失败'
    },
    k3: {
        checkImg: data_xfailIcon,
        checkText: '数据不相符'
    },
    k99: {
        checkImg: '',
        checkText: '数据不相符'
    },
    k: {
        checkImg: data_xfailIcon,
        checkText: '数据不相符'
    }
};

//创建专票，普票，卷票列表行
export function createNormalInvoiceRow(data) {
    const {
        invoiceType = 1,
        checkStatus,
        serialNo,
        totalAmount = 0.00,
        taxAmount = 0.00,
        titleError,
        invoiceStatus,
        billCreateTime
    } = data;
    let expenseStatus = data.expenseStatus || data.expendStatus || '1';
    if (expenseStatus >= 60) {
        expenseStatus = '60';
    } else if (expenseStatus < '25') {
        expenseStatus = '1';
    }
    let {
        buyerName = '--',
        salerName = '--',
        invoiceDate = ''
    } = data;
    buyerName = getSubStr(buyerName, 14);
    salerName = getSubStr(salerName, 14);
    const { checkImg, checkText } = checkStatusDict['k' + checkStatus];
    if (invoiceDate != '') {
        if (invoiceDate.indexOf('-') == '-1') {
            invoiceDate = getDateSplit(invoiceDate);
        }
    } else {
        invoiceDate = '--';
    }
    const {
        name,
        icon,
        piao_icon
    } = fplxDict['k' + invoiceType];
    const {
        status,
        bx_icon
    } = bxlxDict['k' + expenseStatus];
    const { invoiceState, stateIcon } = invoiceDict['k' + invoiceStatus];
    const result = {
        itemBz: '1',
        serialNo,
        billCreateTime,
        invoiceDate,
        totalAmount,
        taxAmount,
        buyerName,
        salerName,
        icon,
        name,
        bx_icon,
        status,
        checkImg,
        checkText,
        invoiceState,
        stateIcon,
        piao_icon,
        titleError,
        invoiceStatus,
        standardMark,
        isInvoice: true,
        errorInfo: data.errorInfo,
        errorMark: data.errorMark,
        warningCode: data.warningCode,
        attachSerialNoList: data.attachSerialNoList || [],
        attachIcon
    };
    return result;
};

export function createOtherInvoiceRow(data) { //创建火车票，飞机票，其他票列表行
    let {
        remark = '--',
        invoiceType = 1,
        serialNo,
        totalAmount = '--',
        taxAmount = '--',
        invoiceStatus,
        buyerName = '--',
        salerName = '--',
        invoiceNo = '--',
        checkStatus,
        isCheckType = false,
        taxAuthorityName = '--'
    } = data;
    if (invoiceType == 25) {
        buyerName = data.payerPartyName;
        salerName = data.invoicingPartyName;
    }
    buyerName = getSubStr(buyerName, 14);
    salerName = getSubStr(salerName, 14);
    let trip = '';
    let expenseStatus = data.expenseStatus || data.expendStatus || '1';
    if (expenseStatus >= 60) {
        expenseStatus = '60';
    } else if (expenseStatus < '25') {
        expenseStatus = '1';
    }
    const {
        invoiceDate,
        billCreateTime
    } = data;
    let name = '';
    let icon = '';
    let piao_icon = '';
    let className = '';
    const fplxObj = fplxDict['k' + invoiceType];
    const {
        status,
        bx_icon
    } = bxlxDict['k' + expenseStatus];
    if (fplxObj) {
        name = fplxObj.name;
        icon = fplxObj.icon;
        piao_icon = fplxObj.piao_icon;
        className = fplxObj.className;
    }
    let bzState = false;
    let tripState = false;
    let comState = false;

    let ridePoint = false;
    let exitMark = false;
    let purchase = false;
    let czState = false;
    let place = '';
    let exit = '';
    if (invoiceType == 11 || invoiceType == 24) {
        bzState = true;
        if (invoiceType == 24) {
            remark = '火车票退票凭证';
        } else {
            if (remark.trim() != '') {
                const len = remark.length;
                if (len > 12) {
                    remark = remark.substr(0, 2) + '···';
                }
            } else {
                remark = ' -- ';
            }
        }
    } else if (invoiceType == 8 || invoiceType == 14) {
        ridePoint = true;
        place = data.place || '--';
    } else if ([9, 10, 16, 20, 28, 29].indexOf(parseInt(invoiceType)) != -1) {
        tripState = true;
        trip = tripFun(data);
    } else if (invoiceType == 17) {
        exit = data.exit || '--';
        exitMark = true;
    } else if (invoiceType == 19) {
        purchase = true;
    } else if (invoiceType == 7 || invoiceType == 23) {
        comState = true;
    } else if (invoiceType == 25) {
        czState = true;
    }

    if (taxAuthorityName != '--') {
        taxAuthorityName = getSubStr(taxAuthorityName, 16);
    }

    let checkImg = ''; let checkText = '';
    if (invoiceType == 23) {
        if (isCheckType) {
            checkImg = checkStatusDict['k' + checkStatus].checkImg;
            checkText = checkStatusDict['k' + checkStatus].checkText;
        }
    } else {
        checkImg = checkStatusDict['k' + checkStatus].checkImg;
        checkText = checkStatusDict['k' + checkStatus].checkText;
    }

    const result = {
        itemBz: '2',
        serialNo,
        invoiceDate,
        invoiceNo,
        billCreateTime,
        totalAmount,
        remark,
        bx_icon,
        status,
        taxAmount,
        icon,
        name,
        ridePoint,
        exit,
        exitMark,
        place,
        purchase,
        czState,
        bzState,
        comState,
        piao_icon,
        className,
        tripState,
        buyerName,
        salerName,
        checkImg,
        checkText,
        isCheckType,
        checkStatus,
        invoiceStatus,
        invoiceType,
        trip: trip,
        isInvoice: true,
        errorInfo: data.errorInfo,
        errorMark: data.errorMark,
        warningCode: data.warningCode,
        taxAuthorityName,
        attachSerialNoList: data.attachSerialNoList || [],
        attachIcon
    };
    return result;
}

export const createAttachRow = function(data) {
    const { id, serialNo, gatherTime, snapshotUrl, attachmentType } = data;
    let { remark = '' } = data;
    let imgUrl = '';
    const pdfStatus = fileSuffix(snapshotUrl);
    if (pdfStatus == 'pdf') {
        imgUrl = pdfIcon;
    } else if (pdfStatus == 'ofd') {
        imgUrl = ofdIcon;
    } else if (pdfStatus == 'doc') {
        imgUrl = docIcon;
    } else if (pdfStatus == 'docx') {
        imgUrl = docxIcon;
    } else if (pdfStatus == 'xls') {
        imgUrl = xlsIcon;
    } else if (pdfStatus == 'xlsx') {
        imgUrl = xlsxIcon;
    } else if (pdfStatus == 'rar') {
        imgUrl = rarIcon;
    } else if (pdfStatus == 'zip') {
        imgUrl = zipIcon;
    } else {
        imgUrl = snapshotUrl || imgIcon;
    }
    const attachmentName = getSubStr(data.attachmentName || '', 14);
    if (remark) {
        remark = remark.trim();
        const remarkLen = remark.length;
        if (remark == '') {
            remark = '无备注内容';
        } else {
            if (remarkLen > 14) {
                remark = remark.substr(0, 14) + '···';
            }
        }
    } else {
        remark = '无备注内容';
    }
    return {
        id,
        serialNo,
        gatherTime,
        attachmentType,
        attachmentName,
        remark,
        snapshotUrl,
        imgUrl,
        isInvoice: false
    };
};

export const createListRow = function(name, data) {
    const { invoiceType = 1, isInvoice, errorResult, waringResult } = data;
    let errorInfo = '';
    let errorMark = '';
    if (errorResult.length > 0) {
        errorMark = 'errorMark';
        for (const item of errorResult) {
            errorInfo += item + ';';
        };
    } else {
        if (waringResult.length > 0) {
            errorMark = 'errorWarn';
            for (const item of waringResult) {
                errorInfo += item + ';';
            }
        };
    };
    data.errorInfo = errorInfo;
    data.errorMark = errorMark;
    if (name == 'eleList') { //电票tab
        if ([23, 25, 28, 29].indexOf(parseInt(invoiceType)) != -1) {
            return createOtherInvoiceRow(data);
        } else {
            return createNormalInvoiceRow(data);
        }
    } else {
        if (isInvoice) { // 纸票
            if (isExist([2, 3, 4, 5, 12, 13], invoiceType) !== -1) { //属于正常发票,itemBz==1
                try {
                    return createNormalInvoiceRow(data);
                } catch (e) {
                    console.log(e);
                }
            } else { //机打、出租、飞机、其他，火车 itemBz==2
                try {
                    return createOtherInvoiceRow(data);
                } catch (e) {
                    console.log(e);
                }
            }
        } else { //附件
            return createAttachRow(data);
        }
    }
};
