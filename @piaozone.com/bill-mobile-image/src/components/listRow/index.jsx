import React from 'react';
import PropTypes from 'prop-types';
import { createListRow } from '../../utils/create_fpzs_list';
import './style.less';

export default function ListRow({ data, name, index, serialNo, onDetailClick }) {
    const onRowClick = () => {
        if (name == 'attachList' && !data.isInvoice) {
            onDetailClick({ index, serialNo, item: data, name, type: 'attach' });
        } else {
            onDetailClick({ index, serialNo, item: data, name, type: 'invoice' });
        }
    };
    const item = createListRow(name, data);
    const showCheckLog = (item.invoiceType == 25 && item.checkStatus == 1) ||
    (item.invoiceType == 23 && item.isCheckType) ||
    ([28, 29].indexOf(parseInt(item.invoiceType)) != -1);
    return (
        <li className='itemContainer'>
            <div className='content' onClick={onRowClick}>
                {
                    item.errorMark == 'errorMark' ? (
                        <div className='errorInfo markError'><span>错误提示：{item.errorInfo}</span></div>
                    ) : null

                }
                {
                    item.errorMark == 'errorWarn' ? (
                        <div className='errorInfo markWarn'><span>警告提示：{item.errorInfo}</span></div>
                    ) : null

                }
                {
                    item.isInvoice ? (
                        <div className='ListTotext flex'>
                            <div className='date'>{item.invoiceDate || item.billCreateTime}</div>
                            <div className='cost'>
                                <span className='number jshj'>{item.totalAmount}</span>
                                <span className='hidden se'>{item.taxAmount}</span>
                            </div>
                        </div>
                    ) : (
                        <div className='ListTotext flex'>
                            <div className='date'>{item.gatherTime}</div>
                        </div>
                    )
                }
                {
                    item.isInvoice ? (
                        item.itemBz == '1' ? (
                            <div className='LisBom'>
                                <div className='companyInfo'>
                                    <>
                                        <div className='tx'><span className='tx col3'>购方：{item.buyerName || '--'}</span></div>
                                        <div className='tx'><span className='tx col3'>销方：{item.salerName || '--'}</span></div>
                                    </>
                                </div>
                                <div className='icon'>
                                    <img className='fpIcon' src={item.icon} alt='' />
                                    <img className='bxIcon' src={item.bx_icon} alt='' />
                                    <img className='checkIcon' src={item.checkImg} alt='' />
                                    {
                                        item.attachSerialNoList && item.attachSerialNoList.length > 0 ? (
                                            <>
                                                <img className='attachIcon' src={item.attachIcon} alt='关联附件' />
                                                <span className='attachTxt'>{item.attachSerialNoList.length}</span>
                                            </>
                                        ) : null
                                    }
                                </div>
                                {
                                    [1, 2, 3, 4, 5, 6, 7, 8].indexOf(parseInt(item.invoiceStatus)) != -1 ? (
                                        <div className='otherAddIcon'>
                                            <img className='stateIcon' src={item.stateIcon} alt='fpzt' />
                                        </div>
                                    ) : null
                                }
                            </div>
                        ) : (
                            <div className='LisBom noAdd'>
                                <div className='noAddContent'>
                                    <div className='companyInfo'>
                                        {
                                            item.comState ? (
                                                <>
                                                    <div className='tx'><span className='tx col3'>购方：{item.buyerName || '--'}</span></div>
                                                    <div className='tx'><span className='tx col3'>销方：{item.salerName || '--'}</span></div>
                                                </>
                                            ) : null
                                        }
                                        {
                                            item.bzState ? (
                                                <div className='tx'><span className='tx col3'>备注：{item.remark || '--'}</span></div>
                                            ) : null
                                        }
                                        {
                                            item.tripState ? (
                                                <div className='tx'><span className='tx col3'>行程：{item.trip}</span></div>
                                            ) : null
                                        }
                                        {
                                            item.ridePoint ? (
                                                <div className='tx'><span className='tx col3'>所在地：{item.place}</span></div>
                                            ) : null
                                        }
                                        {
                                            item.exitMark ? (
                                                <div className='tx'><span className='tx col3'>出口：{item.exit}</span></div>
                                            ) : null
                                        }
                                        {
                                            item.purchase ? (
                                                <div className='tx'><span className='tx col3'>税务机关：{item.taxAuthorityName}</span></div>
                                            ) : null
                                        }
                                        {
                                            item.czState ? (
                                                <>
                                                    <div className='tx'><span className='tx col3'>开票单位名：{item.salerName || '--'}</span></div>
                                                    <div className='tx'><span className='tx col3'>交款人：{item.buyerName || '--'}</span></div>
                                                </>
                                            ) : null
                                        }
                                    </div>
                                    <div className='other_icon'>
                                        <img className='fpIcon' src={item.icon} alt='' />
                                        <img className='bxIcon' src={item.bx_icon} alt='' />
                                        {
                                            showCheckLog ? (
                                                <img className='checkIcon' style={{ width: 'auto' }} src={item.checkImg} alt={item.checkText} />
                                            ) : null
                                        }
                                        {
                                            item.attachSerialNoList && item.attachSerialNoList.length > 0 ? (
                                                <>
                                                    <img className='attachIcon' src={item.attachIcon} alt='关联附件' />
                                                    <span className='attachTxt'>{item.attachSerialNoList.length}</span>
                                                </>
                                            ) : null
                                        }
                                    </div>
                                </div>
                                {
                                    item.piao_icon != '' ? (
                                        <div className='billEdit'>
                                            <img className={item.className} src={item.piao_icon} alt={item.piao_icon} />
                                        </div>
                                    ) : (
                                        <div className='billEdit'><div className='noIcon' /></div>
                                    )
                                }
                            </div>
                        )
                    ) : (
                        <div className='LisBom'>
                            <span className='attachTit'>{item.attachmentName}</span>
                            <span className='tx remark'>{item.remark}</span>
                            <div className='textphoto border'>
                                <img className='photoIcon' src={item.imgUrl} alt='' />
                            </div>
                        </div>
                    )
                }
            </div>
        </li>
    );
}

ListRow.propTypes = {
    data: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    serialNo: PropTypes.string.isRequired,
    onDetailClick: PropTypes.func.isRequired
};