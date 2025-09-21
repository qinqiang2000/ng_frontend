export function getGxInfo(countInfos = []) {
    let successInfo = {};
    let unFinish = {};
    let failInfo = {};
    let totalInfo = {};
    for (let i = 0; i < countInfos.length; i++) {
        const curInfo = countInfos[i];
        if (curInfo.selectStatus === 0) {
            unFinish = {
                totalNum: curInfo.totalCount,
                invoiceAmount: curInfo.invoiceAmount,
                totalTaxAmount: curInfo.taxAmount,
                totalAmount: curInfo.totalAmount
            };
        } else if (curInfo.selectStatus === 1) {
            successInfo = {
                totalNum: curInfo.totalCount,
                invoiceAmount: curInfo.invoiceAmount,
                totalTaxAmount: curInfo.taxAmount,
                totalAmount: curInfo.totalAmount
            };
        } else if (curInfo.selectStatus === 2) {
            failInfo = {
                totalNum: curInfo.totalCount,
                invoiceAmount: curInfo.invoiceAmount,
                totalTaxAmount: curInfo.taxAmount,
                totalAmount: curInfo.totalAmount
            };
        } else if (curInfo.selectStatus === 3) {
            totalInfo = {
                totalNum: curInfo.totalCount,
                invoiceAmount: curInfo.invoiceAmount,
                totalTaxAmount: curInfo.taxAmount,
                totalAmount: curInfo.totalAmount
            };
        }
    }
    return {
        totalInfo,
        failInfo,
        successInfo,
        unFinish
    };
}

export const renderInvoiceType = function(v) {
    v = parseInt(v);
    if (v === 4) {
        return '增值税专用发票';
    } else if (v === 15) {
        return '通行费电子发票';
    } else if (v === 12) {
        return '机动车销售发票';
    } else {
        return '--';
    }
};
