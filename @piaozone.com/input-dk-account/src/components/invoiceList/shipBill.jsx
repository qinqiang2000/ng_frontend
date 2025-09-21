import React from 'react';
import { renderAmount, renderInvoiceInfo, renderOperate, renderDataSource, renderIndex, renderBxInfo } from '../commons/renderTools';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import createTableCols from './createTableCols';

function ShipBill(props) {
    const { pageNo, pageSize } = props;
    const colsInfo = createTableCols([
        { title: '序号', key: 'indexNum', width: 50, render: (v, r, i) => renderIndex(i, pageNo, pageSize) },
        { title: '采集日期', key: 'collectDate', width: 100 },
        { title: '发票信息', key: 'checkStatus', render: renderInvoiceInfo, width: 220 },
        { title: '发票代码', key: 'invoiceCode', width: 100 },
        { title: '发票号码', key: 'invoiceNo', width: 100 },
        { title: '价税合计', key: 'totalAmount', type: 'number', width: 120 },
        { title: '乘船日期', key: 'invoiceDate', width: 100 },
        { title: '报销信息', key: 'isExpenseCorrelation', width: 100, render: (v, r) => renderBxInfo(v, r, props.showRelatedBill) },
        { title: '入账时间', key: 'accountTime', width: 100 },
        { title: '入账属期', key: 'accountDate', render: renderAmount, width: 120 },
        { title: '凭证号', key: 'vouchNo', type: 'string', width: 120 },
        { title: '抵扣税期', key: 'taxPeriod', type: 'string', width: 120 },
        { title: '税额', key: 'totalTaxAmount', type: 'number', width: 100 },
        { title: '出发点', key: 'stationGetOn', width: 120 },
        { title: '目的地', key: 'stationGetOff', width: 120 },
        { title: '姓名', dataIndex: 'passengerName', width: 120 },
        { title: '数据来源', key: 'resource', width: 120, render: renderDataSource },
        { title: '操作', key: 'operate', render: (v, r, i) => renderOperate(r, i, props.onEdit, props.onRemove), fixed: 'right', width: 60 }
    ]);
    return (
        <Table
            loading={props.loading}
            className={props.className}
            columns={colsInfo.cols}
            rowKey='serialNo'
            dataSource={props.listData}
            pagination={false}
            scroll={colsInfo.scroll}
            rowSelection={props.rowSelection}
        />
    );
}

ShipBill.propTypes = {
    listData: PropTypes.array,
    className: PropTypes.string,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
    rowSelection: PropTypes.object,
    loading: PropTypes.bool,
    pageNo: PropTypes.number,
    pageSize: PropTypes.number,
    showRelatedBill: PropTypes.func
};

export default ShipBill;