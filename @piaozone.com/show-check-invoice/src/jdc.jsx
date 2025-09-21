
import React from 'react';
import PropTypes from 'prop-types';

function JdcInvoice({ info }) {
    return (
        <div className='tab-page' id='tabPage-jdcfp' style={{ display: 'block' }}>
            <h1 id='fpcc_jdcfp'>{info.checkTitle}</h1>
            <table border='0' cellPadding='0' cellSpacing='0' style={{ width: '100%' }}>
                <tbody>
                    <tr height='30'>
                        <td className='align_left'>发票代码：<span className='content_td_blue' id='fpdm_jdcfp'>{info.invoiceCode}</span></td>
                        <td>&nbsp;</td>
                        <td className='align_left'>发票号码：<span className='content_td_blue' id='fphm_jdcfp'>{info.invoiceNo}</span></td>
                        <td>&nbsp;</td>
                        <td className='align_left'>开票日期：<span className='content_td_blue' id='kprq_jdcfp'>{info.invoiceDate}</span></td>
                        <td>&nbsp;</td>
                        <td className='align_left'>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr>
                </tbody>
            </table>
            <table style={{ width: '100%' }} border='0' cellSpacing='0' cellPadding='0' className='fppy_table'>
                <tbody>
                    <tr>
                        <td className='align_center'>
                            <p style={{ width: '99px' }}>机 打 代 码</p>
                            <p>机 打 号 码</p>
                            <p>机 器 编 号</p>
                        </td>
                        <td colSpan='3' nowrap='' className='align_left'>
                            <p className='content_td_blue' id='jddm_jdcfp'>{info.invoiceCode}</p>
                            <p className='content_td_blue' id='jdhm_jdcfp'>{info.invoiceNo}</p>
                            <p className='content_td_blue' id='jqbm_jdcfp'>{info.machineNo}</p>
                        </td>
                        <td className='align_center'>
                            <p>税</p>
                            <p>控</p>
                            <p>码</p>
                        </td>
                        <td colSpan='6' className='align_center' id='skm_jdcfp'>&nbsp;</td>
                    </tr>
                    <tr>
                        <td className='align_center'>
                            <p>购买方名称及</p>
                            <p>身份证号码/</p>
                            <p>组织机构代码</p>
                        </td>
                        <td colSpan='4' nowrap='' className='align_left'>
                            <p className='content_td_blue' id='ghdw_jdcfp'>{info.buyerName}</p>
                            <p className='content_td_blue' id='sfzhm_jdcfp'>{info.buyerTaxNo}</p>
                        </td>
                        <td className='align_center'>纳税人识别号</td>
                        <td colSpan='4' className='align_left'>
                            <p className='content_td_blue' id='gfsbh_jdcfp'>{info.buyerTaxNo}</p>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_center'><p>车 辆 类 型</p></td>
                        <td colSpan='2' nowrap='' className='align_left'>
                            <span className='content_td_blue' id='cllx_jdcfp'>{info.vehicleType}</span>
                        </td>
                        <td nowrap='' className='align_center'>厂牌型号</td>
                        <td colSpan='3' className='align_left'>
                            <p className='content_td_blue' id='cpxh_jdcfp'>{info.brandModel}</p>
                        </td>
                        <td className='align_center'>产地</td>
                        <td colSpan='2' className='align_left'><p className='content_td_blue' id='cd_jdcfp'>{info.producingArea}</p></td>
                    </tr>
                    <tr>
                        <td className='align_center'>合 格 证 号</td>
                        <td colSpan='2' nowrap='' className='align_left'>
                            <span className='content_td_blue' id='hgzs_jdcfp'>{info.certificateNum}</span>
                        </td>
                        <td colSpan='2' nowrap='' className='align_center'>进口证明书号</td>
                        <td colSpan='2' className='align_left'>
                            <span className='content_td_blue' id='jkzmsh_jdcfp'>{info.importCertificate || '无'}</span>
                        </td>
                        <td className='align_center'>商检单号</td>
                        <td colSpan='2' className='align_left content_td_blue' id='sjdh_jdcfp'>{info.commodityInspectionNum || '无'}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>发动机号码</td>
                        <td colSpan='4' nowrap='' className='align_left content_td_blue' id='fdjhm_jdcfp'>{info.engineNum}</td>
                        <td nowrap='' className='align_center'>车辆识别代号/车架号码</td>
                        <td colSpan='4' nowrap='' className='align_left content_td_blue' id='cjhm_jdcfp'>{info.vehicleIdentificationCode}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>价 税 合 计</td>
                        <td colSpan='5' nowrap='' className='borderLeft align_left'>
                            <span className='content_td_blue align_left' id='jshjdx_jdcfp'>⊗{info.totalAmountCn}</span>
                        </td>
                        <td colSpan='4' nowrap='' className='borderRight align_right'>
                            <span style={{ padding: '0 20px' }}>小写</span>
                            <span className='content_td_blue align_right' id='jshjxx_jdcfp'>￥{info.totalAmount}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_center'>销货单位名称</td>
                        <td colSpan='4' nowrap='' className='align_left content_td_blue' id='xhdwmc_jdcfp'>{info.salerName}</td>
                        <td className='align_center'>电话</td>
                        <td colSpan='4' className='align_left content_td_blue' id='dh_jdcfp'>{info.salerPhone}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>纳税人识别号</td>
                        <td colSpan='4' nowrap='' className='align_left content_td_blue' id='nsrsbh_jdcfp'>{info.salerTaxNo}</td>
                        <td className='align_center'>账号</td>
                        <td colSpan='4' className='align_left content_td_blue' id='zh_jdcfp'>{info.salerAccount}</td>
                    </tr>
                    <tr>
                        <td className='align_center'>地 址</td>
                        <td colSpan='3' className='align_left'>
                            <p className='content_td_blue' id='dz_jdcfp'>{info.salerAddress}</p>
                        </td>
                        <td nowrap='' className='align_center'>开户银行</td>
                        <td colSpan='5' className='align_left'>
                            <p className='content_td_blue' id='khyh_jdcfp'>{info.salerBankName}</p>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_center'>
                            <p>增值税税率</p>
                            <p>或 征 收 率</p>
                        </td>
                        <td nowrap='' width='20%'><p className='content_td_blue align_center' id='zzssl_jdcfp'>{info.taxRate}</p></td>
                        <td nowrap='' className='align_center'>
                            <p>增值税</p>
                            <p>税额</p>
                        </td>
                        <td nowrap='' className='align_center'><p className='content_td_blue' id='zzsse_jdcfp'>￥{info.taxAmount || info.totalTaxAmount}</p></td>
                        <td className='align_center'>
                            <p>主管税务</p>
                            <p>机关及代码</p>
                        </td>
                        <td colSpan='5' className='align_left'>
                            <p className='content_td_blue' id='swjg_dm_jdcfp'>
                                {info.taxAuthorityName}<br />{info.taxAuthorityCode}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td className='align_center' width='10%'>不 含 税 价</td>
                        <td colSpan='2' nowrap='' className='align_left' width='20%'>
                            小写<span className='content_td_blue' id='cjfy_jdcfp'>￥{info.amount || info.invoiceAmount || info.invoiceMoney}</span>
                        </td>
                        <td nowrap='' className='align_center' width='15%'>完税凭证号码</td>
                        <td colSpan='2' className='align_center' width='24%'><p className='content_td_blue' id='wspzhm_jdcfp'>{info.overTaxCode}</p></td>
                        <td className='align_center' width='5%'>吨位</td>
                        <td className='align_center' width='8%'><p className='content_td_blue' id='dw_jdcfp'>{info.totalTon}</p></td>
                        <td className='align_center' width='10%'>限乘人数</td>
                        <td className='align_center' width='8%'><p className='content_td_blue' id='xcrs_jdcfp'>{info.limitePeople}</p></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

JdcInvoice.propTypes = {
    info: PropTypes.object
};

export default JdcInvoice;