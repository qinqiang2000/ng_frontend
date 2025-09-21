import React from 'react';
import { renderAmount, renderInvoiceInfo, renderOperate, renderDataSource, renderIndex, renderGlzt, renderBxInfo } from '../commons/renderTools';
import PropTypes from 'prop-types';
import { Table, Input, Select } from 'antd';
import createTableCols from './createTableCols';
const { Option } = Select;
const reson = [
    { text: '请选择不抵扣原因', value: 0 },
    { text: '用于非应税项目', value: 1 },
    { text: '用于免税项目', value: 2 },
    { text: '用于集体福利或者个人消费', value: 3 },
    { text: '遭受非正常损失', value: 4 },
    { text: '其他', value: 5 }
];

function DefaultInvoice(props) {
    const selectedRowKeys = props.rowSelection.selectedRowKeys || [];
    const { pageNo, pageSize, gxFlag, onChangeYxse, onSelectBdkGxReson } = props;
    const colsInfo = createTableCols([
        { title: '序号', key: 'indexNum', width: 50, render: (v, r, i) => renderIndex(i, pageNo, pageSize) },
        { title: '采集日期', key: 'collectDate', width: 100 },
        { title: '发票信息', key: 'checkStatus', render: renderInvoiceInfo, width: 220 },
        { title: '发票代码', key: 'invoiceCode', width: 120 },
        { title: '发票号码', key: 'invoiceNo', width: 100 },
        { title: '开票日期', key: 'invoiceDate', width: 120 },
        { title: '价税合计', key: 'totalAmount', type: 'number', width: 120 },
        { title: '税额', key: 'totalTaxAmount', type: 'number', width: 120 },
        {
            display: gxFlag === 'dkgx',
            title: '有效税额',
            key: 'effectiveTaxAmount',
            type: 'input',
            width: 120,
            render: (v, r) => {
                const checked = selectedRowKeys.indexOf(r.serialNo) !== -1;
                const effectiveTaxAmount = r.effectiveTaxAmount || r.effectiveTaxAmount === '' ? r.effectiveTaxAmount : r.totalTaxAmount;
                return (
                    <Input
                        value={effectiveTaxAmount}
                        className={checked && r.totalTaxAmount < effectiveTaxAmount ? 'err tableInput' : 'tableInput'}
                        disabled={!checked}
                        onChange={(e) => onChangeYxse(r, e.target.value.trim())}
                    />
                );
            }
        },
        {
            display: gxFlag === 'bdkgx',
            title: '不抵扣原因',
            key: 'notDeductibleType',
            width: 240,
            render: (v, r) => {
                const { authenticateFlag } = r;
                const disabled = !(authenticateFlag == 0 || authenticateFlag == 5);
                return (
                    <Select
                        value={v ? reson[v].text : reson[0].text}
                        disabled={disabled}
                        style={{ width: 220 }}
                        onChange={(e) => onSelectBdkGxReson(r, e)}
                    >
                        {
                            reson.map((item) => {
                                return (
                                    <Option value={item.value} key={item.value}>{item.text}</Option>
                                );
                            })
                        }
                    </Select>
                );

                // const checked = selectedRowKeys.indexOf(r.serialNo) !== -1;
                // const effectiveTaxAmount = r.effectiveTaxAmount || r.effectiveTaxAmount === '' ? r.effectiveTaxAmount : r.totalTaxAmount;
                // return (
                //     <Input
                //         value={effectiveTaxAmount}
                //         className={checked && r.totalTaxAmount < effectiveTaxAmount ? 'err tableInput' : 'tableInput'}
                //         disabled={!checked}
                //         onChange={(e) => onChangeYxse(r, e.target.value.trim())}
                //     />
                // );
            }
        },
        { title: '单据信息', key: 'isExpenseCorrelation', width: 100, render: (v, r) => renderBxInfo(v, r, props.showRelatedBill) },
        { title: '入账时间', key: 'accountTime', width: 100 },
        { title: '入账属期', key: 'accountDate', render: renderAmount, width: 120 },
        { title: '凭证号', key: 'vouchNo', type: 'string', width: 120 },
        { title: '抵扣税期', key: 'taxPeriod', type: 'string', width: 120, display: gxFlag === 'traffic' },
        { title: '销方名称', key: 'salerName', autoWidth: 300 },
        { title: '勾选时间', key: 'selectTime', width: 100, display: gxFlag !== 'traffic' },
        { title: '数据来源', key: 'resource', width: 120, render: renderDataSource },
        { title: '管理状态', key: 'manageStatus', width: 120, display: gxFlag !== 'traffic', render: renderGlzt },
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

DefaultInvoice.propTypes = {
    listData: PropTypes.array,
    className: PropTypes.string,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
    rowSelection: PropTypes.object,
    loading: PropTypes.bool,
    pageNo: PropTypes.number,
    pageSize: PropTypes.number,
    gxFlag: PropTypes.string,
    onChangeYxse: PropTypes.func,
    showRelatedBill: PropTypes.func,
    onSelectBdkGxReson: PropTypes.func
};

export default DefaultInvoice;