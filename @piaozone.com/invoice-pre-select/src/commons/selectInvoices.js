
// 支持跨页勾选发票
export function selectInvoices(rows = [], selectedRows = [], listData = []) {
    const listDataKeys = listData.map((r) => {
        return r.invoiceCode + '-' + r.invoiceNo;
    });

    const newSelectRows = rows.map((r) => {
        return {
            serialNo: r.serialNo,
            invoiceCode: r.invoiceCode,
            invoiceNo: r.invoiceNo,
            invoiceDate: r.invoiceDate,
            invoiceAmount: r.invoiceAmount,
            taxAmount: r.taxAmount || r.totalTaxAmount,
            checkFlag: r.checkFlag,
            authenticateFlag: r.authenticateFlag,
            deductionPurpose: r.deductionPurpose,
            yxse: r.yxse,
            notDeductibleType: r.notDeductibleType
        };
    });

    const selectedRowsFilter = selectedRows.filter((r) => {
        const curKey = r.invoiceCode + '-' + r.invoiceNo;
        return listDataKeys.indexOf(curKey) === -1;
    });
    return selectedRowsFilter.concat(newSelectRows);
}