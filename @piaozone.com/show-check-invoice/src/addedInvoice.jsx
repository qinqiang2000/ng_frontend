import React from 'react';
import PropTypes from 'prop-types';

function formatValue(data) {
    const result = parseFloat(data);
    return result || '';
}

function saveFloatVal(data) {
    if (data) {
        return parseFloat(data).toFixed(2);
    } else {
        return 0;
    }
}

function countTaxRate(taxRate) {
    if(taxRate.indexOf('%') !== -1) {
        return taxRate
    } else {
        taxRate = parseFloat(taxRate);
        if (!taxRate) {
            return '0%';
        } else {
            taxRate = (taxRate * 100).toFixed(1);
            taxRate = taxRate.toString();
            const lastValue = taxRate.charAt(taxRate.length - 1);
            if (lastValue == '0') {
                taxRate = parseInt(taxRate);
            }
            return taxRate + '%';
        }
    }
}

function AddedInvoice({ info }) {
    const items = info.items || [];
    return (
        <div className='tab-page' style={{ display: 'block' }}>
            <h1 style={{ fontSize: '18px', padding: '5px 0px 5px 0px', marginTop: '5px' }}>{info.checkTitle}</h1>
            <table border='0' cellPadding='0' cellSpacing='0' style={{ width: '100%' }}>
                <tbody>
                    <tr height='30'>
                        <td colSpan='2' className='align_left'>
                            发票代码：<span className='content_td_blue'>{info.invoiceCode}</span>
                        </td>
                        <td colSpan='2' className='align_left'>
                            发票号码：<span className='content_td_blue'>{info.invoiceNo}</span>
                        </td>
                        <td colSpan='2' className='align_left'>
                            开票日期：<span className='content_td_blue'>{info.invoiceDate}</span>
                        </td>
                        <td colSpan='2' className='align_left'>
                            校验码：<span className='content_td_blue'>{info.checkCode}</span>
                        </td>
                        <td colSpan='2' className='align_left'>
                            机器编号：<span className='content_td_blue'>{info.machineNo}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table style={{ width: '100%' }} border='1' cellSpacing='0' cellPadding='0' className='fppy_table'>
                <tbody>
                    <tr>
                        <td rowSpan='4' className='align_center' width='20'>
                            <p>购</p>
                            <p>买</p>
                            <p>方</p>
                        </td>
                        <td className='align_left borderNo' width='105'>名称：</td>
                        <td nowrap='' className='align_left borderNo bgcolorWhite'>
                            <span className='content_td_blue'>{info.buyerName}</span>
                        </td>
                        <td rowSpan='4' className='align_center' width='20'>
                            <p>密</p>
                            <p>码</p>
                            <p>区</p>
                        </td>
                        <td rowSpan='4' nowrap='' className='align_left ' width='350'>{info.cipherArea}</td>
                    </tr>
                    <tr>
                        <td className='align_left borderNo'>纳税人识别号：</td>
                        <td nowrap='' className='align_left borderNo'>
                            <span className='content_td_blue'>{info.buyerTaxNo}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_left borderNo' valign='top'>地址、电话：</td>
                        <td className='align_left borderNo' valign='top'>
                            <span className='content_td_blue' id='gfdzdh_dzfp'>{info.buyerAddressPhone}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_left borderNo' valign='top'>开户行及账号：</td>
                        <td className='align_left borderNo' valign='top'>
                            <span className='content_td_blue'>{info.buyerAccount}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan='5'>
                            <table
                                border='1'
                                cellSpacing='0'
                                cellPadding='0'
                                style={{ width: '100%' }}
                                className='fppy_table_box'
                            >
                                <tbody>
                                    <tr id='tab_head_dzfp'>
                                        <td className='align_center borderRight' width='30%'>货物或应税劳务、服务名称</td>
                                        <td className='align_center borderRight' width='10%'>规格型号</td>
                                        <td className='align_center borderRight' width='5%'>单位</td>
                                        <td className='align_center borderRight' width='10%'>数量</td>
                                        <td className='align_center borderRight' width='10%'>单价</td>
                                        <td className='align_center borderRight' width='15%'>金额</td>
                                        <td className='align_center borderRight' width='5%'>税率</td>
                                        <td className='align_center' width='15%'>税额</td>
                                    </tr>
                                    {
                                        items.map((item, i) => {
                                            return (
                                                <tr height='40px' key={i}>
                                                    <td className='align_left borderRight'>
                                                        <span className='content_td_blue'>{item.goodsName}</span>
                                                    </td>
                                                    <td className='align_left borderRight'>
                                                        <span className='content_td_blue'>{item.specModel || '无'}</span>
                                                    </td>
                                                    <td className='align_left borderRight'>
                                                        <span className='content_td_blue'>{item.unit}</span>
                                                    </td>
                                                    <td className='align_right borderRight'>
                                                        <span className='content_td_blue'>{formatValue(item.num)}</span>
                                                    </td>
                                                    <td className='align_right borderRight'>
                                                        <span className='content_td_blue'>{formatValue(item.unitPrice)}</span>
                                                    </td>
                                                    <td className='align_right borderRight'>
                                                        <span className='content_td_blue'>{saveFloatVal(item.detailAmount)}</span>
                                                    </td>
                                                    <td className='align_right borderRight'>
                                                        <span className='content_td_blue'>{countTaxRate(item.taxRate)}</span>
                                                    </td>
                                                    <td className='align_right'>
                                                        <span className='content_td_blue'>{saveFloatVal(item.taxAmount)}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                    <tr>
                                        <td className='align_center borderRight'>合计</td>
                                        <td className='align_center borderRight'>&nbsp;</td>
                                        <td className='align_center borderRight'>&nbsp;</td>
                                        <td className='align_center borderRight'>&nbsp;</td>
                                        <td className='align_center borderRight'>&nbsp;</td>
                                        <td className='align_right borderRight'>
                                            <span className='content_td_blue'>￥{saveFloatVal(info.invoiceMoney || info.invoiceAmount)}</span>
                                        </td>
                                        <td className='align_center borderRight'>&nbsp;</td>
                                        <td className='align_right'>
                                            <span className='content_td_blue'>￥{saveFloatVal(info.totalTaxAmount || info.taxAmount)}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='align_center borderRight borderTop'>价税合计（大写）</td>
                                        <td colSpan='4' className='align_left borderTop'>
                                            <span className='align_left'>
                                                <span className='content_td_blue'>⊗{info.totalAmountCn}</span>
                                            </span>
                                        </td>
                                        <td colSpan='3' className='align_left borderTop'>
                                            <span style={{ padding: '0 20px' }}>（小写）</span>
                                            <span className='content_td_blue'>￥{parseFloat(info.totalAmount).toFixed(2)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td rowSpan='4' className='align_center'>
                            <p>销</p>
                            <p>售</p>
                            <p>方</p>
                        </td>
                        <td className='align_left borderNo'>名称：</td>
                        <td className='align_left borderNo'>
                            <span className='content_td_blue'>{info.salerName}</span>
                        </td>
                        <td rowSpan='4' className='align_center' width='20'>
                            <p>备</p>
                            <p>注</p>
                        </td>
                        <td rowSpan='4' className='align_left content_td_blue' width='350' valign='top'>
                            <p className='warp' style={{ maxWidth: "350px", wordBreak: "keep-all", overflow: 'hidden' }}>{info.remark}</p>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_left borderNo'>纳税人识别号：</td>
                        <td className='align_left borderNo'>
                            <span className='content_td_blue'>{info.salerTaxNo}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_left borderNo'>地址、电话：</td>
                        <td className='align_left borderNo'>
                            <span className='content_td_blue'>{info.salerAddressPhone}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_left borderNo'>开户行及账号：</td>
                        <td className='align_left borderNo'>
                            <span className='content_td_blue'>{info.salerAccount}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

AddedInvoice.propTypes = {
    info: PropTypes.object
};

export default AddedInvoice;