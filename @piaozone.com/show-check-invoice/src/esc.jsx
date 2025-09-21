import React from 'react';
import PropTypes from 'prop-types';

function ESCInvoice({ info }) {
    return (
        <div className='tab-page' id='tabPage-escfp' style={{ display: 'block' }}>
            <h1 id='fpcc_escfp'>二手车销售统一发票</h1>
            <table border='0' cellPadding='0' cellSpacing='0' style={{ width: '100%' }}>
                <tbody>
                    <tr height='30'>
                        <td className='align_left'>发票代码：<span className='content_td_blue' id='fpdm_escfp'>{info.invoiceCode}</span></td>
                        <td>&nbsp;</td>
                        <td className='align_left'>发票号码：<span className='content_td_blue' id='fphm_escfp'>{info.invoiceNo}</span></td>
                        <td>&nbsp;</td>
                        <td className='align_left'>开票日期：<span className='content_td_blue' id='kprq_escfp'>{info.invoiceDate}</span></td>
                        <td>&nbsp;</td>
                        <td className='align_left'>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr>
                </tbody>
            </table>
            <table style={{ width: '100%' }} border='0' cellSpacing='0' cellPadding='0' className='fppy_table'>
                <tbody>
                    <tr>
                        <td width='15%' className='align_center'>
                            <p style={{ width: '99px' }}>机 打 代 码</p>
                            <p style={{ width: '99px' }}>机 打 号 码</p>
                            <p style={{ width: '99px' }}>机 器 编 号</p>
                        </td>
                        <td colSpan='2' nowrap='' className='align_left'>
                            <p className='content_td_blue' id='jddm_escfp'>{info.invoiceCode}</p>
                            <p className='content_td_blue' id='jdhm_escfp'>{info.invoiceNo}</p>
                            <p className='content_td_blue' id='jqbm_escfp'>{info.machineNo}</p>
                        </td>
                        <td width='5%' className='align_center'>
                            <p>税</p>
                            <p>控</p>
                            <p>码</p>
                        </td>
                        <td width='12%' colSpan='6' className='align_center' id='skm_escfp'>&nbsp;</td>
                    </tr>
                    <tr>
                        <td className='align_center'>买方单位/个人</td>
                        <td colSpan='3' className='align_left content_td_blue' id='mfmc_escfp'>{info.buyerName}</td>
                        <td width='12%' className='align_center'>单位代码/身份证号码</td>
                        <td colSpan='4' className='align_left content_td_blue' id='mfdm_escfp'>{info.buyerIdNo}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>买方单位/个人住址</td>
                        <td colSpan='4' className='align_left content_td_blue' id='mfdz_escfp'>{info.buyerAddress}</td>
                        <td colSpan='3' className='align_left'>电话</td>
                        <td width='27%' className='align_left content_td_blue' id='mfdh_escfp'>{info.buyerPhoneNumber}</td>
                    </tr>
                    <tr>
                        <td className='align_center'><p>卖方单位/个人</p></td>
                        <td colSpan='3' className='align_left content_td_blue' id='xfmc_escfp'>{info.salerName}</td>
                        <td nowrap='' className='align_left'>单位代码/身份证号码</td>
                        <td colSpan='4' nowrap='' className='align_left content_td_blue' id='xfdm_escfp'>{info.salerIdNo}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>卖方单位/个人住址</td>
                        <td colSpan='4' className='align_left content_td_blue' id='xfdz_escfp'>{info.salerAddress}</td>
                        <td colSpan='3' nowrap='' className='align_left'>电话</td>
                        <td nowrap='' className='align_left content_td_blue' id='xfdh_escfp'>{info.salerPhoneNumber}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>车牌照号</td>
                        <td width='19%' nowrap='' className='align_left content_td_blue' id='cpzh_escfp'>{info.licensePlateNumber}</td>
                        <td width='9%' nowrap='' className='align_center'>登记证号</td>
                        <td colSpan='2' nowrap='' className='align_left content_td_blue' id='djzhm_escfp'>{info.registrationNumber}</td>
                        <td colSpan='3' nowrap='' className='align_center'>车辆类型</td>
                        <td nowrap='' className='align_left content_td_blue' id='cllx_escfp'>{info.vehicleType}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>车架号/车辆识别代码</td>
                        <td nowrap='' className='align_left content_td_blue' id='clsbdm_escfp'>{info.vehicleIdentificationNo}</td>
                        <td nowrap='' className='align_center'>厂牌型号</td>
                        <td colSpan='2' nowrap='' className='align_left content_td_blue' id='cpxh_escfp'>{info.bandModel}</td>
                        <td colSpan='3' nowrap='' className='align_center'>转入地车辆管理所名称</td>
                        <td nowrap='' className='align_left content_td_blue' id='zrcgs_escfp'>{info.vehicleManagementName}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>车价合计（大写）</td>
                        <td colSpan='4' nowrap='' className='align_left'>
                            <span className='content_td_blue align_left' id='cjhjdx_escfp'>⊗{info.totalAmountCn}</span>
                        </td>
                        <td colSpan='3' nowrap='' className='align_right'>小写</td>
                        <td nowrap='' className='align_right content_td_blue' id='cjhjxx_escfp'>￥{info.totalAmount}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>经营、拍卖单位</td>
                        <td colSpan='8' nowrap='' className='align_left content_td_blue' id='jydw_escfp'>{info.auctionName}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>经营、拍卖单位地址</td>
                        <td colSpan='3' className='align_left content_td_blue' id='jydwdz_escfp'>{info.auctionAddress}</td>
                        <td className='align_center'>纳税人识别号</td>
                        <td colSpan='4' className='align_left content_td_blue' id='jydwsbh_escfp'>{info.auctionTaxpayerId}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>开户银行、账号</td>
                        <td colSpan='4' className='align_left content_td_blue' id='jydwyh_escfp'>{info.auctionBankAccout}</td>
                        <td colSpan='3' className='align_left'>电话</td>
                        <td className='align_left content_td_blue' id='jydwdh_escfp'>{info.auctionPhoneNumber}</td>
                    </tr>
                    <tr>
                        <td rowSpan='2' className='align_center'>二手车市场</td>
                        <td colSpan='3' rowSpan='2' className='align_left content_td_blue' id='escsc_escfp'>{info.marketName}</td>
                        <td className='align_left'>纳税人识别号</td>
                        <td colSpan='4' className='align_left content_td_blue' id='escscsbh_escfp'>{info.marketTaxpayerId}</td>
                    </tr>
                    <tr>
                        <td className='align_left'>地址</td>
                        <td colSpan='4' className='align_left content_td_blue' id='escscdz_escfp'>{info.marketAddress}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>开户银行、账号</td>
                        <td colSpan='4' className='align_left content_td_blue' id='escscyh_escfp'>{info.marketBankAccout}</td>
                        <td colSpan='3' className='align_left'>电话</td>
                        <td className='align_left content_td_blue' id='escscdh_escfp'>{info.marketPhoneNumber}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>备注</td>
                        <td colSpan='8' className='align_left content_td_blue' id='bz_escfp'>
                            <p className='warp'>{info.remark}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}


ESCInvoice.propTypes = {
    info: PropTypes.object
};

export default ESCInvoice;