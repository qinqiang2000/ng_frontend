import React from 'react';
import PropTypes from 'prop-types';
import { Input, DatePicker, Button, message } from 'antd';
import { checkInvoiceType, blockchain_filter } from '@piaozone.com/utils';
import './style.css';
import moment from 'moment';

class CheckInvoiceByInput extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {};
    }

    getOtherRow = (flag) => {
        const { jym = '', kpje = '', totalAmount = '' } = this.state;
        // 区块链发票
        if (flag) {
            return (
                <>
                    <div className='fpje jym row'>
                        <label>校验码:</label>
                        <Input
                            type='text'
                            placeholder='请输入区块链电子发票校验码'
                            className='inlineBlock text jym isDigital'
                            value={jym}
                            maxLength={5}
                            onChange={(e) => this.setState({
                                jym: e.target.value.trim()
                            })}
                        />
                    </div>
                    <div className='fpje kpje row'>
                        <label>不含税金额:</label>
                        <Input
                            type='text'
                            placeholder='请输入不含税金额'
                            className='inlineBlock text kpje'
                            value={kpje}
                            onChange={(e) => this.setState({
                                kpje: e.target.value.trim()
                            })}
                        />
                    </div>
                </>
            );
        } else {
            const { fpdm = '', fphm = '' } = this.state;
            if (fphm.length === 20 && !fpdm) {
                return (
                    <div className='fpje kpje row'>
                        <label>价税合计:</label>
                        <Input
                            type='text'
                            placeholder='请输入价税合计金额'
                            className='inlineBlock text kpje'
                            value={totalAmount}
                            onChange={(e) => this.setState({
                                totalAmount: e.target.value.trim()
                            })}
                        />
                    </div>
                );
            } else {
                const invoiceType = checkInvoiceType(fpdm, fphm);
                if (invoiceType === 2 || invoiceType === 4) {
                    return (
                        <div className='fpje kpje row'>
                            <label>不含税金额:</label>
                            <Input
                                type='text'
                                placeholder='请输入不含税金额'
                                className='inlineBlock text kpje'
                                value={kpje}
                                onChange={(e) => this.setState({
                                    kpje: e.target.value.trim()
                                })}
                            />
                        </div>
                    );
                } else if (invoiceType === 12 || invoiceType === 13) {
                    let disTxt = '请输入不含税金额';
                    if (invoiceType === 13) {
                        disTxt = '请输入车价合计';
                    }
                    return (
                        <div className='fpje jym row'>
                            <label>开具金额:</label>
                            <Input
                                type='text'
                                placeholder={disTxt}
                                className='inlineBlock text jym isDigital'
                                value={kpje}
                                onChange={(e) => this.setState({
                                    kpje: e.target.value.trim()
                                })}
                            />
                        </div>
                    );
                } else {
                    return (
                        <div className='fpje jym row'>
                            <label>校验码:</label>
                            <Input
                                type='text'
                                placeholder='请输入校验码后六位'
                                className='inlineBlock text jym isDigital'
                                value={jym}
                                maxLength={6}
                                onChange={(e) => this.setState({
                                    jym: e.target.value.trim()
                                })}
                            />
                        </div>
                    );
                }
            }
        }
    }

    onCheckInvoice = async() => {
        const { fpdm = '', fphm = '', kprq = null, jym, kpje = '', totalAmount } = this.state;
        const invoiceType = checkInvoiceType(fpdm, fphm);
        if (fphm.length === 20) {
            if (fpdm) {
                message.info('数电票不需输入代码!');
                return;
            }
            if (!kprq || !totalAmount) {
                message.info('开票日期和价税合计金额不能为空!');
                return;
            }
        } else {
            if (fpdm && !(fpdm.length === 10 || fpdm.length === 12)) {
                message.info('发票代码不正确!');
                return;
            }
            if (!fphm) {
                message.info('发票号码不能为空!');
                return;
            }
            if (!kprq) {
                message.info('开票日期不能为空!');
                return;
            }
            if (invoiceType === 11) {
                if (!kpje || !jym) {
                    message.info('不含税金额和校验码都不能为空!');
                    return;
                }
            } else if (invoiceType === 2 || invoiceType === 4) {
                if (!kpje) {
                    message.info('不含税金额不能为空!');
                    return;
                }
            } else if (invoiceType === 12 || invoiceType === 13) {
                if (!kpje) {
                    message.info('开票金额不能为空!');
                    return;
                }
            } else {
                if (!jym) {
                    message.info('校验码不能为空!');
                    return;
                }
            }
        }

        if (typeof this.props.onCheckInvoice === 'function') {
            const res = await this.props.onCheckInvoice({
                invoiceCode: fpdm,
                invoiceNo: fphm,
                invoiceDate: kprq.format('YYYY-MM-DD'),
                checkCode: jym,
                invoiceMoney: kpje,
                totalAmount
            });
            return res;
        }
    }

    onEmpty = () => {
        this.setState({
            fpdm: '',
            fphm: '',
            kprq: null,
            jym: '',
            kpje: '',
            totalAmount: ''
        });
    }

    render() {
        let defaultCls = ['checkInvoiceByInput'];
        if (this.props.className) {
            defaultCls = defaultCls.concat(this.props.className.split(' '));
        }
        const style = this.props.style || {};
        const { fpdm = '', fphm = '', kprq = null, jym, kpje, totalAmount } = this.state;
        const flag = blockchain_filter({ invoiceCode: fpdm, invoiceNo: fphm }); //深圳区块链
        const todayTimestamp = moment(moment().format('YYYY-MM-DD')).format('X');
        return (
            <div className={defaultCls.join(' ')} style={style}>
                <div className='row'>
                    <label>发票代码:</label>
                    <Input
                        type='text'
                        placeholder='请输入发票代码'
                        className='inlineBlock text fpdm isDigital'
                        autoFocus
                        maxLength={12}
                        value={fpdm}
                        onChange={(e) => this.setState({
                            fpdm: e.target.value.trim().replace(/[^0-9]/, '')
                        })}
                    />
                </div>
                <div className='row'>
                    <label>发票号码:</label>
                    <Input
                        type='text'
                        placeholder='请输入发票号码'
                        className='inlineBlock text fphm isDigital'
                        maxLength={20}
                        value={fphm}
                        onChange={(e) => this.setState({
                            fphm: e.target.value.trim().replace(/[^0-9]/, '')
                        })}
                    />
                </div>

                <div className='row'>
                    <label>开票日期:</label>
                    <DatePicker
                        value={kprq}
                        format='YYYY-MM-DD'
                        className='inlineBlock text kprq date'
                        disabledDate={(d) => {
                            return (moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp);
                        }}
                        onChange={(e) => this.setState({
                            kprq: e
                        })}
                    />
                </div>
                {this.getOtherRow(flag)}
                <div className='row' style={{ textAlign: 'left', margin: '10px 0', color: '#999', fontSize: 12 }}>
                    <span>温馨提示：手工录入采集的发票没有发票原图，建议上传图像。</span>
                </div>
                <div className='row'>
                    <Button onClick={this.onCheckInvoice} type='primary'>发票查验</Button>
                    <Button
                        style={{ marginLeft: 30 }}
                        onClick={this.onEmpty}
                        type='primary'
                        disabled={!fpdm && !fphm && !kprq && !jym && !kpje && !totalAmount}
                    >
                        清空
                    </Button>
                </div>
            </div>
        );
    }
}

CheckInvoiceByInput.propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    onCheckInvoice: PropTypes.func.isRequired
};

export default CheckInvoiceByInput;