/* eslint-disable no-undef */
// 通过传入的勾选数据，生成税局的勾选模板
export function createDkgxExcelData(list = [], authenticateFlag, taxNo) {
    if (list.length === 0 || (authenticateFlag !== 0 && authenticateFlag !== 1)) {
        return errcodeInfo.argsErr;
    }

    const listResult = [];
    for (let i = 0; i < list.length; i++) {
        const curData = list[i];
        const manageStatus = parseInt(curData.manageStatus);
        const item = {
            '序号': i + 1,
            '是否勾选*': authenticateFlag === 0 ? '否' : '是',
            '转内销证明编号': '',
            '缴款书号码*': curData.customDeclarationNo || '',
            '购买方识别号*': curData.buyerTaxNo || taxNo,
            '填发日期*': curData.invoiceDate,
            '税款金额*': curData.totalTaxAmount,
            '有效抵扣税额*': curData.effectiveTaxAmount,
            '勾选时间': '',
            '管理状态*': manageStatus === 0 ? '正常' : '异常'
        };
        listResult.push(item);
    }
    return {
        list: listResult,
        cols: [
            { wch: 6 },
            { wch: 12 },
            { wch: 16 },
            { wch: 14 },
            { wch: 16 },
            { wch: 12 },
            { wch: 12 },
            { wch: 14 },
            { wch: 10 },
            { wch: 12 }
        ]
    };
}

const getGxFailResultInfo = (text) => {
    if (text.indexOf('不存在') !== -1) {
        return '2';
    }

    // 重复勾选税局返回已勾选，需要查询税局已勾选才能确定
    if (text.indexOf('已勾选') !== -1 && text.indexOf('不可重复勾选') !== -1) {
        return '8';
    }

    // 重复撤销勾选是可以的
    if (text.indexOf('未勾选') !== -1 && text.indexOf('不可撤销勾选') !== -1) {
        return '1';
    }

    if (text.indexOf('作废') !== -1) {
        return '11';
    }

    if (text.indexOf('红冲') !== -1) {
        return '12';
    }

    if (text.indexOf('失控') !== -1) {
        return '15';
    }

    if (text.indexOf('异常') !== -1) {
        return '3';
    }

    if (text.indexOf('请撤销统计表')) {
        return '20';
    }

    return '8-[001]';
};

export function getDkgxFailResult(filePath) {
    let workSheetsFromBuffer = null;
    try {
        if (!fs.existsSync(filePath)) {
            return errcodeInfo.excelNotFound;
        }
        workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error('文件解析异常：', filePath, err);
        return errcodeInfo.parseExcelErr;
    }

    const resultDict = {};
    const successDict = {};
    for (let i = 0; i < workSheetsFromBuffer.length; i++) {
        const curData = workSheetsFromBuffer[i];
        for (let j = 1; j < curData.data.length; j++) {
            const item = curData.data[j];
            const customDeclarationNo = item[6];
            let reason = item[1] || '';
            reason = reason.trim();
            const errType = getGxFailResultInfo(reason);
            const dKey = 'k' + customDeclarationNo;
            if (errType === '1') {
                successDict[dKey] = {
                    selectResult: errType,
                    description: 'success'
                };
            } else {
                resultDict[dKey] = {
                    selectResult: errType,
                    description: reason
                };
            }
        }
        fs.unlinkSync(filePath);
        return {
            ...errcodeInfo.success,
            data: {
                failInfo: resultDict,
                successInfo: successDict
            }
        };
    }
}