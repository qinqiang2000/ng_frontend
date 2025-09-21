
// 支持跨页勾选发票
export function selectInvoices(rows = [], selectedRows = [], listData = []) {
    const listDataKeys = listData.map((r) => {
        return r.invoiceCode + '-' + r.invoiceNo;
    });

    const newSelectRows = rows.map((r) => {
        return {
            serialNo: r.serialNo,
            invoiceType: r.invoiceType,
            invoiceCode: r.invoiceCode,
            invoiceNo: r.invoiceNo,
            invoiceDate: r.invoiceDate,
            invoiceAmount: r.invoiceAmount,
            totalAmount: r.totalAmount,
            taxAmount: r.taxAmount || r.totalTaxAmount,
            authenticateFlag: r.authenticateFlag,
            deductionPurpose: r.deductionPurpose,
            effectiveTaxAmount: r.effectiveTaxAmount,
            notDeductibleType: r.notDeductibleType || null
        };
    });

    const selectedRowsFilter = selectedRows.filter((r) => {
        const curKey = r.invoiceCode + '-' + r.invoiceNo;
        return listDataKeys.indexOf(curKey) === -1;
    });
    return selectedRowsFilter.concat(newSelectRows);
}