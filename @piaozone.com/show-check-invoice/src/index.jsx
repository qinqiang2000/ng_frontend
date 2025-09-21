import React from 'react';
import PropTypes from 'prop-types';
import { loadJs } from '@piaozone.com/utils';
import moment from 'moment';
import { Globalstyle } from './style';
import AddedInvoice from './addedInvoice';
import JDCInvoice from './jdc';
import ESCInvoice from './esc';
import TXFInvoice from './txf';
import { invoiceTypes } from '@piaozone.com/pwyConstants';

const { INPUT_INVOICE_TYPES_DICT } = invoiceTypes;
class ShowCheckInvoice extends React.Component {
    constructor() {
        super(...arguments);
        this.contentId = 'pwyCheckInvoicesBox' + Math.random();
    }

    componentDidMount() {
        const staticUrl = this.props.staticUrl;
        const styleId = 'printPwyCheckInvoices';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = Globalstyle;
            style.id = styleId;
            document.getElementsByTagName('head')[0].appendChild(style);
        }

        loadJs.syncUse([staticUrl + '/static/gallery/jquery.min-normal.js', staticUrl + '/static/gallery/jquery.printArea.js'], () => {
            this.$ = window.$;
        });
    }

    onPrint = () => {
        const $ = this.$;
        $('#printfp').hide();
        $('#closebt').hide();
        $('#printArea').printArea({ popTitle: '发票查验明细' });
        $('#closebt').show();
        $('#printfp').show();
    }

    createInvoiceInfo = (info) => {
        const invoiceType = parseInt(info.invoiceType);
        const invoiceTypeInfo = INPUT_INVOICE_TYPES_DICT['k' + invoiceType];
        if (invoiceType === 12) { // 机动车
            return (
                <JDCInvoice info={{ ...info, checkTitle: '机动车销售统一发票' }} />
            );
        } else if (invoiceType === 13) { // 二手车
            return (
                <ESCInvoice info={{ ...info, checkTitle: '二手车销售统一发票' }} />
            );
        } else if (invoiceType === 15) { // 二手车
            return (
                <TXFInvoice info={{ ...info, checkTitle: '通行费电子发票' }} />
            );
        } else if (invoiceTypeInfo) {
            return (
                <AddedInvoice info={{ ...info, checkTitle: invoiceTypeInfo.text }} />
            );
        }
    }

    render() {
        let defaultCls = ['pwyCheckInvoices'];
        if (this.props.className) {
            defaultCls = defaultCls.concat(this.props.className.split(' '));
        }
        const info = this.props.checkInvoiceInfo || {};
        let invoiceDate = info.invoiceDate || '';
        if (invoiceDate) {
            invoiceDate = invoiceDate.substr(0, 10);
            invoiceDate = moment(invoiceDate, 'YYYY-MM-DD').format('YYYY年MM月DD日');
        }
        const lastCheckTime = moment(parseInt(info.lastCheckTime)).format('YYYY-MM-DD HH:mm:ss');
        return (
            <>
                <div id='printArea' className={defaultCls.join(' ')}>
                    <div style={{ position: 'relative' }}>
                        <div className='title' style={{ display: 'none' }}>发票查验明细</div>
                        <div className='cms_r_main'>
                            <div className='chayan_div'>
                                <div className='printdiv'>
                                    {
                                        this.props.checkInfo ? (
                                            <table border='0' className='comm_table2' width='100%'>
                                                <tbody>
                                                    <tr>
                                                        <td colSpan='4' style={{ backgroundColor: '#015293', color: '#fff', lineHeight: '40px' }}>
                                                            <span id='cycs'>查验次数：第{info.checkCount}次</span>
                                                            <span style={{ paddingLeft: 50 }}>查验时间：{lastCheckTime}</span>
                                                            <span style={{ float: 'right' }}>
                                                                <button id='printfp' className='white_button' onClick={this.onPrint}>打印</button>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        ) : null
                                    }
                                    <div className='invoiceBox'>
                                        {
                                            info.invoiceStatus === 2 ? (
                                                <img src={require('./icon_zf.png')} className='ycIcon' />
                                            ) : null
                                        }
                                        {
                                            info.invoiceStatus === 3 ? (
                                                <img src={require('./icon_hc.png')} className='ycIcon' />
                                            ) : null
                                        }
                                        {
                                            this.createInvoiceInfo({ ...info, invoiceDate })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

ShowCheckInvoice.propTypes = {
    checkInfo: PropTypes.bool,
    className: PropTypes.string,
    staticUrl: PropTypes.string,
    checkInvoiceInfo: PropTypes.object
};

export default ShowCheckInvoice;