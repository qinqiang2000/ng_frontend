import React from 'react';
import PropTypes from 'prop-types';
import { Button, message, Tabs } from 'antd';
import AddedTaxBill from './addedTaxBill';
import UsedCarBill from './usedCarBill';
import MotorBill from './motorBill';
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
import TrainRefundBill from './trainRefundBill';
import CustomsBill from './customsBill';
import FinanceBill from './financeBill';
import OtherBill from './otherBill';
import ScanImage from '@piaozone.com/scan-image';
import ShowImage from './showImage';
import { saveEditInvoice, saveModifyInfo, checkInvoice } from '../../services/selectInvoice';
import DDInvoiceInfo from '../ddTripList';
import BottomBtn from './bottomBtn';
import { changeKingdeeUrl } from '../utils/tools';
import AttachList from './attachList';

const { TabPane } = Tabs;

class EditInvoice extends React.Component {
    constructor(props) {
        super(...arguments);
        this.createEditBox = this.createEditBox.bind(this);
        this.state = {
            activeKey: props.activeKey || '1',
            activeIndex: props.activeIndex || 0,
            invoiceType: parseInt(props.billData.invoiceType || props.billData.fplx),
            recognitionSerialNo: props.billData.recognitionSerialNo
        };
    }

    componentDidMount() {
        this._isAmounted = true;
    }

    componentWillUnmount() {
        this._isAmounted = false;
    }

    componentWillReceiveProps(nextProps) {
        if (!this._isAmounted) {
            return false;
        }
    }

    onChangeBillType = (invoiceType) => {
        this.setState({
            invoiceType
        });
    }


    checkBill = async(billData) => {
        message.loading('保存中...', 0);
        const { localUrl, snapshotUrl, rotationAngle = 0, region = '', pixel = '', warningCode, recognitionSerialNo, serialNo, fileType } = this.props.billData;
        let curFileType = 'jpg';
        if (fileType == 1) {
            curFileType = 'pdf';
        }
        const invoiceData = {
            ...billData,
            fileType: curFileType,
            recognitionSerialNo: recognitionSerialNo || serialNo,
            localUrl,
            snapshotUrl,
            rotationAngle,
            region,
            pixel,
            invoiceType: this.state.invoiceType,
            companyId: '',
            warningCode
        };
        const res = await checkInvoice(invoiceData, billData);

        if (res.errcode !== '0000') {
            message.destroy();
            message.info(res.description);
            this.setState({
                saving: false
            });
        } else {
            const logRes = await saveModifyInfo({ serialNo: res.data.recognitionSerialNo });
            const isRevise = logRes.errcode === '0000' ? 2 : 1;
            this._isAmounted = false;
            this.setState({
                saving: false
            });
            this.props.onOk(res.data || {}, {
                ...invoiceData,
                isRevise: isRevise,
                invoiceType: res.data.invoiceType || billData.invoiceType,
                description: res.description
            });
        }
    }


    saveBillInfo = async(billData) => {
        message.loading('保存中...', 0);
        const { localUrl, snapshotUrl, rotationAngle, region, pixel, warningCode, recognitionSerialNo, serialNo, fileType } = this.props.billData;
        let curFileType = 'jpg';
        if (fileType == 1) {
            curFileType = 'pdf';
        }
        const invoiceData = {
            ...billData,
            fileType: curFileType,
            recognitionSerialNo: recognitionSerialNo || serialNo,
            invoiceType: this.state.invoiceType,
            localUrl,
            snapshotUrl,
            rotationAngle,
            region,
            oldSerialNo: serialNo,
            pixel,
            warningCode
        };
        const res = await saveEditInvoice({ ...invoiceData });
        if (res.errcode !== '0000') {
            message.destroy();
            message.info(res.description + '[' + res.errcode + ']');
            this.setState({
                saving: false
            });
        } else {
            if (res.data && res.data.isExpend) {
                message.warning(res.description);
                setTimeout(() => {
                    this.props.onOk(res.data || {}, { ...invoiceData, isRevise: 2 });
                }, 2000);
            } else {
                const logRes = await saveModifyInfo({ serialNo: res.data.recognitionSerialNo });
                const isRevise = logRes.errcode === '0000' ? 2 : 1;
                this.props.onOk(res.data || {}, { ...invoiceData, isRevise: isRevise });
            }
            this._isAmounted = false;
            this.setState({
                saving: false
            });
        }
    }

    createEditBox = () => {
        let disabledEdit = this.props.disabledEdit;
        const fplx = parseInt(this.props.billData.invoiceType);
        const billData = { ...this.props.billData, invoiceType: fplx };
        const invoiceType = this.state.invoiceType;
        const clientHeight = this.props.clientHeight;
        const scrollHeight = clientHeight - 125;
        let cyjg = billData.fcyjg || billData.cyjg || billData.checkStatus;
        cyjg = parseInt(cyjg);

        if ([1, 2, 3, 4, 5, 12, 13, 15].indexOf(fplx) !== -1 && cyjg === 1) {
            disabledEdit = true;
        }
        const selectInvoiceType = (cls) => (
            <div className={'inputItem floatLeft ' + cls}>
                <label>发票种类：</label>
                <ChangeBillType billType={invoiceType} onChangeBillType={this.onChangeBillType} disabled={disabledEdit} />
            </div>
        );
        let EditInvoiceCom = null;
        let selectClass = '';
        let isTaxedInvoice = false;
        if ([1, 2, 3, 4, 5, 15].indexOf(invoiceType) !== -1) {
            EditInvoiceCom = AddedTaxBill;
            selectClass = 'paddLeft90';
            isTaxedInvoice = true;
        } else if (invoiceType === 12) { //机动车
            selectClass = 'paddLeft90';
            isTaxedInvoice = true;
            EditInvoiceCom = MotorBill;
        } else if (invoiceType === 13) { //二手车
            selectClass = 'paddLeft90';
            isTaxedInvoice = true;
            EditInvoiceCom = UsedCarBill;
        } else if (invoiceType === 7 || invoiceType === 23) {
            EditInvoiceCom = GeneralMachineBill;
        } else if (invoiceType === 8) {
            EditInvoiceCom = TaxBill;
            selectClass = 'paddLeft90';
        } else if (invoiceType === 9) {
            EditInvoiceCom = TrainBill;
        } else if (invoiceType == 10) {
            EditInvoiceCom = AirBill;
            selectClass = 'paddLeft110';
        } else if (invoiceType === 11) {
            EditInvoiceCom = OtherBill;
        } else if (invoiceType === 14) {
            EditInvoiceCom = QuotaBill;
        } else if (invoiceType === 16) {
            EditInvoiceCom = TrafficBill;
        } else if (invoiceType === 17) {
            EditInvoiceCom = RoadBridgeBill;
        } else if (invoiceType === 19) {
            EditInvoiceCom = PurchaseTaxBill;
            selectClass = 'paddLeft90';
        } else if (invoiceType === 20) {
            EditInvoiceCom = ShipBill;
        } else if (invoiceType === 21) { // 海关缴款书
            EditInvoiceCom = CustomsBill;
        } else if (invoiceType === 24) { // 火车票退票凭证
            EditInvoiceCom = TrainRefundBill;
        } else if (invoiceType === 25) { // 财务票据
            EditInvoiceCom = FinanceBill;
            selectClass = 'paddLeft90';
        }
        const ShowImage = () => {
            const fileType = billData.fileType || 'jpg';
            const imgHeight = clientHeight - 150;
            if (fileType === 'pdf') {
                return (
                    <div className='outImg' style={{ height: imgHeight, marginBottom: 10 }}>
                        <iframe src={changeKingdeeUrl(billData.snapshotUrl || billData.snapshoturl)} width='100%' height={imgHeight} />
                    </div>
                );
            }
            return (
                <div className='outImg' style={{ height: imgHeight, marginBottom: 10 }}>
                    {
                        imgHeight > 0 ? (
                            <ScanImage
                                imgSrc={changeKingdeeUrl(billData.snapshotUrl || billData.snapshoturl)}
                                rotateDeg={billData.orientation}
                                areaInfo={{ pixel: billData.pixel, region: billData.region }}
                                renderInBody={false}
                                disabledBtns={false}
                                disabledMouseWheel={true}
                                width={document.body.clientWidth - 20}
                                height={scrollHeight}
                                displayFlag='cuteImage'
                            />
                        ) : null
                    }
                </div>
            );
        };

        return (
            <EditInvoiceCom
                billData={billData}
                invoiceType={invoiceType}
                disabledEdit={disabledEdit}
                onClose={this.props.onClose}
                scrollHeight={scrollHeight}
                clientHeight={clientHeight}
                onOk={isTaxedInvoice ? this.checkBill : this.saveBillInfo}
                ShowImage={ShowImage}
                SelectType={() => selectInvoiceType(selectClass)}
            />
        );
    }


    render() {
        const {
            imgSrc = '',
            pixel = '',
            region = '',
            orientation = 0,
            fileType = 'jpg',
            errorFlag,
            tripOrdersCount,
            invoiceCode,
            invoiceNo,
            invoiceType,
            attachSerialNoList = [],
            serialNo
        } = this.props.billData;
        const clientHeight = this.props.clientHeight;
        const clientWidth = this.props.clientWidth;
        const { activeIndex, activeKey } = this.state;
        return (
            <div id='editBoxWapper' style={{ height: clientHeight, overflow: 'hidden', position: 'relative' }}>
                {
                    //错误，或者其它票
                    errorFlag ? (
                        <div className='noneAddedBillForm'>
                            <div className='inputItems' style={{ textAlign: 'right', height: 50 }}>
                                <Button onClick={this.props.onClose} style={{ marginLeft: 15, marginRight: 50 }}>返回</Button>
                            </div>
                            {
                                fileType === 'pdf' ? (
                                    <div className='outImg' style={{ height: clientHeight - 60 }}>
                                        <iframe src={changeKingdeeUrl(imgSrc)} width={clientWidth} height={clientHeight - 60} />
                                    </div>
                                ) : (
                                    <div className='outImg' style={{ height: clientHeight - 60 }}>
                                        <ShowImage
                                            src={changeKingdeeUrl(imgSrc)}
                                            clientWidth={clientWidth}
                                            height={clientHeight - 80}
                                            pixel={pixel}
                                            region={region}
                                            orientation={orientation}
                                            onlyShowImg={true}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    ) : (
                        <div>
                            <Tabs
                                className='pwyTabs'
                                activeKey={activeKey}
                                onChange={(v) => this.setState({ activeKey: v })}
                                animated={false}
                                style={{ marginTop: 10 }}
                            >
                                <TabPane tab='发票信息' key='1' style={{ marginRight: 5 }}>
                                    {this.createEditBox()}
                                </TabPane>
                                {
                                    tripOrdersCount ? (
                                        <TabPane tab='滴滴行程单' key='2'>
                                            <div>
                                                <DDInvoiceInfo
                                                    invoiceCode={invoiceCode}
                                                    invoiceNo={invoiceNo}
                                                    invoiceType={invoiceType}
                                                    tripOrdersCount={tripOrdersCount}
                                                    showCountInfo={true}
                                                    clientHeight={clientHeight - 40}
                                                />
                                                <BottomBtn
                                                    onClose={this.props.onClose}
                                                />
                                            </div>
                                        </TabPane>
                                    ) : null
                                }
                                {
                                    attachSerialNoList.length > 0 ? (
                                        <TabPane tab='附件信息' key='3'>
                                            <AttachList
                                                invoiceSerialNo={serialNo}
                                                listData={this.props.attachList}
                                                onDelete={this.props.onDelete}
                                                clientWidth={clientWidth}
                                                clientHeight={clientHeight}
                                                onClose={this.props.onClose}
                                                onOk={this.props.onSaveAttach}
                                                activeIndex={activeIndex}
                                                disabledEdit={this.props.disabledEdit}
                                            />
                                        </TabPane>
                                    ) : null
                                }
                            </Tabs>
                        </div>
                    )
                }
            </div>
        );
    }
}

EditInvoice.propTypes = {
    billData: PropTypes.object.isRequired,
    activeKey: PropTypes.string,
    activeIndex: PropTypes.number,
    onOk: PropTypes.func,
    onClose: PropTypes.func,
    onDelete: PropTypes.func,
    onSaveAttach: PropTypes.func,
    disabledEdit: PropTypes.bool,
    attachList: PropTypes.array,
    clientWidth: PropTypes.number,
    clientHeight: PropTypes.number
};

export default EditInvoice;