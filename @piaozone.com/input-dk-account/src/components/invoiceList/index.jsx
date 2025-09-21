import React, { useState } from 'react';
import { Modal, message, Empty, Spin } from 'antd';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import PropTypes from 'prop-types';
import './style.less';
import DefaultInvoice from './defaultInvoice';
import ScanImage from '@piaozone.com/scan-image';
import TrainBill from './trainBill';
import AirBill from './airBill';
import TrafficBill from './trafficBill';
import ShipBill from './shipBill';
import ShowRelateBill from './showRelateBill';

const INPUT_INVOICE_TYPES_DICT = invoiceTypes.INPUT_INVOICE_TYPES_DICT;
function InvoiceList(props) {
    const listData = props.listData || [];
    let activeInvoiceType = props.activeInvoiceType;
    const [curEditInfo, setCurEditInfo] = useState(false);
    const [showRelateBillSerialNo, setShowRelateBillSerialNo] = useState(false);
    const showDetail = (r) => {
        if (!r.snapshotUrl) {
            message.info('该发票没有图像地址');
            return;
        }
        setCurEditInfo(r);
    };
    if (listData.length === 0) {
        if (props.loading) {
            return (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin />
                </div>
            );
        }
        return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        );
    }

    let BillCom = DefaultInvoice;
    if (!isNaN(parseInt(activeInvoiceType))) {
        activeInvoiceType = parseInt(activeInvoiceType);
    }

    const invoiceInfo = INPUT_INVOICE_TYPES_DICT['k' + activeInvoiceType] || {};
    if (activeInvoiceType === 0 || (invoiceInfo.isAddedTax && activeInvoiceType !== 12 && activeInvoiceType !== 13)) {
        BillCom = DefaultInvoice;
    } else if (activeInvoiceType === 9) {
        BillCom = TrainBill;
    } else if (activeInvoiceType === 10) {
        BillCom = AirBill;
    } else if (activeInvoiceType === 16) {
        BillCom = TrafficBill;
    } else if (activeInvoiceType === 20) {
        BillCom = ShipBill;
    }
    return (
        <>
            <BillCom
                gxFlag={props.gxFlag}
                onChangeYxse={props.onChangeYxse}
                pageNo={props.pageNo}
                pageSize={props.pageSize}
                loading={props.loading}
                listData={listData}
                rowSelection={props.rowSelection}
                className='invoiceTabList'
                showRelatedBill={(v) => setShowRelateBillSerialNo(v)}
                onEdit={(r) => showDetail(r)}
                onCancelEdit={() => setCurEditInfo(false)}
                onRemove={props.onRemove}
                onSelectBdkGxReson={props.onSelectBdkGxReson}
            />
            {
                curEditInfo ? (
                    <Modal
                        visible={!!curEditInfo}
                        title={false}
                        width={1000}
                        height={760}
                        onCancel={() => { setCurEditInfo(false); }}
                        style={{ overflow: 'hidden', padding: 0 }}
                        footer={false}
                        maskClosable={false}
                        destroyOnClose={true}
                    >
                        <ScanImage
                            disabledMouseWheel={true}
                            imgSrc={curEditInfo.snapshotUrl}
                            displayFlag={curEditInfo.fileType === 2 ? (curEditInfo.region ? 'markImage' : 'showImage') : 'showImage'}
                            areaInfo={[{ pixel: curEditInfo.pixel, region: curEditInfo.region, markColor: '#267dee' }]}
                            width={960}
                            height={700}
                            id={curEditInfo.serialNo}
                        />
                    </Modal>
                ) : null
            }
            <Modal
                visible={!!showRelateBillSerialNo}
                title='发票报销信息'
                onCancel={() => setShowRelateBillSerialNo('')}
                width={600}
                top={10}
                footer={null}
                bodyStyle={{ padding: 12 }}
                destroyOnClose={true}
            >
                <ShowRelateBill
                    serialNo={showRelateBillSerialNo}
                    getRelateBillInfo={(opt) => props.getRelateBillInfo(opt)}
                />
            </Modal>
        </>
    );
}

InvoiceList.propTypes = {
    listData: PropTypes.array,
    onRemove: PropTypes.func,
    rowSelection: PropTypes.object,
    loading: PropTypes.loading,
    activeInvoiceType: PropTypes.string,
    gxFlag: PropTypes.string,
    onChangeYxse: PropTypes.func,
    onSelectBdkGxReson: PropTypes.func,
    pageNo: PropTypes.number,
    pageSize: PropTypes.number,
    getRelateBillInfo: PropTypes.func
};

export default InvoiceList;

