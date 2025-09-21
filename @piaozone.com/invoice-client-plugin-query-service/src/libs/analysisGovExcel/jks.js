/* eslint-disable no-inline-comments,no-undef*/
// import xlsx from 'node-xlsx';
// import fs from 'fs';
// import errcodeInfo from '$client/errcodeInfo';
import { trim } from '../tools';

// 缴款书excel解析
export default function jks(filePath, info = {}) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }

        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (error) {
        return errcodeInfo.parseExcelErr;
    }

    const invoiceList = [];
    let detailInfo = [];

    let tongjiTotalTaxAmount = 0.00;

    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        if (curData.name === '发票信息') {
            for (let j = 2; j < curData.data.length; j++) {
                const item = curData.data[j];
                const jkshm = trim(item[1]);
                if (!jkshm) {
                    break;
                }

                invoiceList.push({
                    invoiceType: 21,
                    jkshm, // 缴款书号码
                    tfrq: trim(item[2]), // 填发日期
                    jkdwmc1: trim(item[3]), // 缴款单位一名称
                    jkdwsh1: trim(item[4]), // 缴款单位一税号
                    jkdwmc2: trim(item[5]), // 缴款单位二名称
                    jkdwsh2: trim(item[6]), // 缴款单位二税号
                    jkkadm: trim(item[7]), // 进口口岸代码
                    skje: trim(item[8]), // 税款金额
                    srjg: trim(item[9]), // 收入机关
                    sqdwbm: trim(item[10]), // 申请单位编码
                    bgdbh: trim(item[11]), // 报关单编码
                    myfs: trim(item[12]), // 贸易方式
                    yskmdm: trim(item[13]), // 预算科目代码
                    skgkdm: trim(item[14]), // 收款国库代码
                    hth: trim(item[15]), // 合同号
                    ysgj: trim(item[16]), // 运输工具
                    jkqx: trim(item[17]), // 缴款期限
                    tydh: trim(item[18]), // 提运单号
                    sjly: trim(item[19]), // 数据来源
                    items: []
                });
            }
        } else if (curData.name === '货物信息') {
            detailInfo = curData.data;
        }
    }

    for (let j = 0; j < invoiceList.length; j++) {
        const item = invoiceList[j];
        const jkshm = trim(item.jkshm);
        for (let i = 2; i < detailInfo.length;) {
            const curDetail = detailInfo[i];
            const dJkshm = trim(curDetail[1]);
            if (jkshm === dJkshm) {
                item.items.push({
                    shxx: trim(curDetail[2]),
                    hwmc: trim(curDetail[3]),
                    wsjg: trim(curDetail[4]),
                    sl: trim(curDetail[5]),
                    dw: trim(curDetail[6]),
                    slv: trim(curDetail[7]), // 税率
                    skje: trim(curDetail[8]),
                    sjly: trim(curDetail[9])
                });
                detailInfo.splice(i, 1);
            } else {
                i += 1;
            }
        }
        tongjiTotalTaxAmount += parseFloat(item.skje);
    }

    return {
        errcode: '0000',
        data: invoiceList,
        tongjiInfo: {
            totalTaxAmount: tongjiTotalTaxAmount.toFixed(2),
            invoiceNum: invoiceList.length
        }
    };
}