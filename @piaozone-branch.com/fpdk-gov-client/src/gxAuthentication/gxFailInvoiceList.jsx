import React from 'react';
import { Table } from 'antd';
import PropTypes from 'prop-types';

function GxFailInvoiceList({ listData = [], successListData = [] }) {
    const dkGxInvoiceCols = [
        {
            title: '序号',
            dataIndex: 'indexNumber',
            align: 'center',
            width: 60,
            render: (v, r, i) => parseInt(i) + 1
        },
        {
            title: '发票代码',
            dataIndex: 'invoiceCode',
            align: 'left',
            width: 120
        },
        {
            title: '发票号码',
            dataIndex: 'invoiceNo',
            align: 'left',
            width: 160
        },
        {
            title: '开票日期',
            dataIndex: 'invoiceDate',
            align: 'left',
            width: 120
        },
        {
            title: '税期',
            dataIndex: 'taxPeriod',
            align: 'left',
            width: 120
        },
        {
            title: '有效抵扣税额',
            dataIndex: 'effectiveTaxAmount',
            align: 'left',
            width: 120,
            render: (v) => { return (<span style={{ color: '#e8b300' }}>{v}</span>); }
        },
        {
            title: '失败原因',
            dataIndex: 'description',
            align: 'left',
            width: 400
        }
    ];
    const failLen = listData.length;
    const successLen = successListData.length;
    const totalLen = parseInt(failLen) + parseInt(successLen);
    return (
        <div>
            <Table
                rowKey={(r) => { return r.invoiceCode + '-' + r.invoiceNo; }}
                dataSource={listData}
                columns={dkGxInvoiceCols}
                pagination={false}
                bordered={false}
                tableLayout='fixed'
                scroll={{ x: 1000, y: 600 }}
            />
            <div style={{ padding: '10px 0' }}>
                <span>勾选失败：</span><span style={{ color: '#e8b300', padding: '0 3px' }}>{failLen}</span>条，总共勾选：
                <span style={{ color: '#3598ff', padding: '0 3px' }}>{totalLen}</span>条发票
            </div>
        </div>
    );
}

GxFailInvoiceList.propTypes = {
    listData: PropTypes.array,
    successListData: PropTypes.array
};

export default GxFailInvoiceList;