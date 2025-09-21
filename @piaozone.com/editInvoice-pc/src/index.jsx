import React from 'react';
import AddedTaxBill from './addedTaxBill';
import TaxBill from './taxBill';
import ChangeBillType from './changeBillType';
import TrainBill from './trainBill';
import AirBill from './airBill';
import QuotaBill from './quotaBill';
import TrafficBill from './trafficBill';
import RoadBridgeBill from './roadBridgeBill';
import ShipBill from './shipBill';
import PurchaseTaxBill from './purchaseTaxBill';
import GeneralMachineBill from './generalMachineBill';
import OtherBill from './otherBill';
import CustomsBill from './customsBill';
import FinanceBill from './financeBill';
import TrainRefundBill from './trainRefundBill';
import AllEleInvoice from './allEleInvoice';
import PropTypes from 'prop-types';
import { message } from 'antd';

class EditInvoice extends React.Component {
    constructor(props) {
        super(...arguments);
        this.recognitionSerialNo = props.billData.recognitionSerialNo;
        this.state = {
            invoiceType: parseInt(props.billData.invoiceType)
        };
    }

    componentWillReceiveProps(nextProps) {
        if (parseInt(nextProps.billData.invoiceType) !== parseInt(this.state.invoiceType)) {
            this.setState({
                invoiceType: parseInt(nextProps.billData.invoiceType)
            });
            this.recognitionSerialNo = nextProps.billData.recognitionSerialNo;
        }
    }

    onChangeBillType = (invoiceType) => {
        this.setState({
            invoiceType
        });
    }

    checkBill = async(billData) => {
        const invoiceData = { ...billData, recognitionSerialNo: this.recognitionSerialNo, invoiceType: this.state.invoiceType };
        message.loading('保存中...', 0);
        const res = await this.props.onCheckInvoice(invoiceData);
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
        } else {
            message.success('保存成功!');
            this.props.onOk(res.data || {}, invoiceData);
        }
    }

    saveBillInfo = async(billData) => {
        const invoiceData = { ...billData, recognitionSerialNo: this.recognitionSerialNo, invoiceType: this.state.invoiceType };
        message.loading('保存中...', 0);
        const res = await this.props.onSaveInvoice(invoiceData);
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
        } else {
            if (res.data && res.data.isExpend) {
                message.info('该发票在发票云已存在,并且报销状态为"已报销"');
            } else {
                message.success('保存成功!');
            }
            this.props.onOk(res.data || {}, invoiceData);
        }
    }

    render() {
        const disabledEdit = !!this.props.disabledEdit;
        const billData = this.props.billData;
        const invoiceType = this.state.invoiceType;
        const checkCount= this.props.checkCount;
        const lastCheckTime= this.props.lastCheckTime;
        const selectInvoiceType = (
            <div className='inputItem floatLeft col1'>
                <label>发票种类：</label>
                <ChangeBillType billType={invoiceType} onChangeBillType={this.onChangeBillType} />
            </div>
        );

        const dictInvoice = {
            'k1': AddedTaxBill,
            'k2': AddedTaxBill,
            'k3': AddedTaxBill,
            'k4': AddedTaxBill,
            'k5': AddedTaxBill,
            'k12': AddedTaxBill,
            'k13': AddedTaxBill,
            'k15': AddedTaxBill,
            'k7': GeneralMachineBill,
            'k23': GeneralMachineBill,
            'k8': TaxBill,
            'k9': TrainBill,
            'k10': AirBill,
            'k14': QuotaBill,
            'k16': TrafficBill,
            'k17': RoadBridgeBill,
            'k19': PurchaseTaxBill,
            'k20': ShipBill,
            'k11': OtherBill,
            'k21': CustomsBill,
            'k24': TrainRefundBill,
            'k25': FinanceBill,
            'k26': AllEleInvoice,
            'k27': AllEleInvoice,
            'k28': AllEleInvoice,
            'k29': AllEleInvoice,
            'k83': AllEleInvoice,
            'k84': AllEleInvoice

        };
        const InvoiceCom = dictInvoice['k' + invoiceType];
        if (InvoiceCom) {
            if ([1, 2, 3, 4, 5, 12, 13, 15, 26, 27, 28, 29, 83, 84].indexOf(invoiceType) !== -1) { // 需要查验的发票类型
                return (
                    <InvoiceCom
                        billData={billData}
                        invoiceType={invoiceType}
                        onOk={this.checkBill}
                        onShowLedgerdata={this.props.onShowLedgerdata}
                        checkCount={checkCount}
                        lastCheckTime={lastCheckTime}
                        disabledEdit={disabledEdit}
                        AccountManageState={this.props.AccountManageState}
                        onPrintInvoice={this.props.onPrintInvoice}
                    >
                        {selectInvoiceType}
                    </InvoiceCom>
                );
            } else {
                return (
                    <InvoiceCom
                        billData={billData}
                        invoiceType={invoiceType}
                        onOk={this.saveBillInfo}
                        disabledEdit={disabledEdit}
                    >
                        {selectInvoiceType}
                    </InvoiceCom>
                );
            }
        } else {
            return null;
        }
    }
}


EditInvoice.propTypes = {
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onPrintInvoice: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired
};

export default EditInvoice;