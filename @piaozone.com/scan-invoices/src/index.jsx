import React from 'react';
import { Button, message, Tabs } from 'antd';
import AddedTaxBill from './addedTaxBill';
import AllEleInvoice from './allEleInvoice';
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
import ShowImage from './showImage';
import DDInvoiceInfo from './ddTripList';
import { changeKingdeeUrl } from './tools';
import AttachList from './attachList';
import ScanImage from '@piaozone.com/scan-image';
import PropTypes from 'prop-types';
import { invoiceTypes } from '@piaozone.com/pwyConstants';
import { pwyFetch } from '@piaozone.com/utils';
import CustomsBill from './customsBill';
import FinanceBill from './financeBill';
import TrainRefundBill from './trainRefundBill';
import EleAirBill from './eleAirBill';
import EleTrainBill from './eleTrainBill';
import EleBulletTrainBill from './eleBulletTrainBill';
import EleSecondHandCarBill from './eleSecondHandCarBill';

const inputInvoiceDict = invoiceTypes.INPUT_INVOICE_TYPES_DICT;
const { TabPane } = Tabs;

class EditInvoice extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            imgSrc: props.billData.snapshotUrl,
            currentOperate: 'original',
            activeKey: props.activeKey || '1',
            activeIndex: props.activeIndex || 0,
            invoiceType: parseInt(props.billData.invoiceType || props.billData.fplx),
            recognitionSerialNo: props.billData.recognitionSerialNo,
            tripOrdersCount: null,
            attachSerialNoList: []
        };
    }

    async componentDidMount() {
        this._isAmounted = true;
        const queryOtherInfoUrl = this.props.queryOtherInfoUrl;
        if (queryOtherInfoUrl) {
            message.loading('数据加载中...', 0);
            const res = await pwyFetch(queryOtherInfoUrl, {
                method: 'post',
                data: {
                    billSerialNo: this.props.billData.serialNo
                }
            });
            message.destroy();
            if (res.errcode !== '0000') {
                message.info(res.description + '[' + res.errcode + ']');
                return;
            }
            const resData = res.data || {};
            this.setState({
                tripOrdersCount: resData.tripOrdersCount,
                attachSerialNoList: resData.attachSerialNoList
            });
        }
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
        const { localUrl, snapshotUrl, rotationAngle = 0, region = '', pixel = '', warningCode, recognitionSerialNo, serialNo } = this.props.billData;
        const invoiceData = {
            ...billData,
            invoiceDate: billData.issueDate ? billData.issueDate : billData.invoiceDate,
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
        const res = await this.props.onCheckInvoice(invoiceData);
        if (res.errcode !== '0000') {
            message.destroy();
            message.info(res.description);
        } else {
            this.props.onOk(res.data || {}, {
                ...invoiceData,
                invoiceType: res.data.invoiceType || billData.invoiceType,
                description: res.description
            });
        }
    }

    saveBillInfo = async(billData) => {
        message.loading('保存中...', 0);
        const { localUrl, snapshotUrl, rotationAngle, region, pixel, warningCode, recognitionSerialNo, serialNo } = this.props.billData;
        const invoiceData = {
            ...billData,
            recognitionSerialNo: recognitionSerialNo || serialNo,
            invoiceType: this.state.invoiceType,
            localUrl,
            snapshotUrl,
            rotationAngle,
            region,
            pixel,
            warningCode
        };
        const res = await this.props.onSaveInvoice(invoiceData);
        if (res.errcode !== '0000') {
            message.destroy();
            message.info(res.description + '[' + res.errcode + ']');
        } else {
            if (res.data.isExpend) {
                message.warning(res.description);
                setTimeout(() => {
                    this.props.onOk(res.data || {}, { ...invoiceData, isRevise: 2 });
                }, 2000);
            } else {
                this.props.onOk(res.data || {}, invoiceData);
            }
        }
    }

    startPrintInvoice = () => {
        const { snapshotUrl } = this.props.billData;
        let printImgs = '';
        if (snapshotUrl != '') {
            printImgs = [snapshotUrl];
        } else {
            message.warning('当前原图为空无法打印');
            return false;
        }
        if (printImgs.length > 0) {
            this.props.onPrintInvoice(printImgs);
        }
    }

    onShowLedgerdata = async() => {
        const { currentOperate } = this.state;
        const billData = this.props.billData;
        this.setState({
            disabledClick: true
        });
        message.loading('加载中...', 0);
        if (currentOperate == 'original') {
            const res = await this.props.onShowLedgerdata({
                serialNo: billData.serialNo
            });
            message.destroy();
            if (res.errcode == '0000') {
                const { snapshotUrl } = res.data;
                if (snapshotUrl && snapshotUrl != '') {
                    this.setState({
                        imgSrc: snapshotUrl,
                        currentOperate: 'dzState'
                    });
                } else {
                    message.info('获取底账数据失败');
                }
            } else {
                message.info(res.description);
            }
        } else {
            message.destroy();
            this.setState({
                imgSrc: billData.snapshotUrl,
                currentOperate: 'original'
            });
        }

        this.setState({
            disabledClick: false
        });
    }

    onSaveAttach = async(opt) => {
        message.loading('处理中...', 0);
        const res = await pwyFetch(this.props.updateAttachUrl, {
            method: 'post',
            data: opt
        });
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            return;
        }
        message.info('保存成功');
    }

    createEditBox = () => {
        let disabledEdit = this.props.disabledEdit;
        const fplx = parseInt(this.props.billData.invoiceType);
        const billData = { ...this.props.billData, invoiceType: fplx };
        const invoiceType = this.state.invoiceType;
        const clientHeight = this.props.height;
        const clientWidth = this.props.width;
        const scrollHeight = clientHeight - 220;
        let cyjg = billData.fcyjg || billData.cyjg || billData.checkStatus;
        cyjg = parseInt(cyjg);
        const invoiceInfo = inputInvoiceDict['k' + fplx] || {};
        const isTaxedInvoice = invoiceInfo.isAddedTax || invoiceType == 28 || invoiceType == 29;
        if (isTaxedInvoice && cyjg === 2) {
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
        if ([1, 2, 3, 4, 5, 12, 13, 15].indexOf(invoiceType) !== -1) {
            EditInvoiceCom = AddedTaxBill;
            selectClass = 'paddLeft90';
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
        } else if (invoiceType === 21) {
            EditInvoiceCom = CustomsBill;
        } else if (invoiceType === 24) {
            EditInvoiceCom = TrainRefundBill;
        } else if (invoiceType === 25) {
            EditInvoiceCom = FinanceBill;
            selectClass = 'paddLeft90';
        } else if (invoiceType === 26 || invoiceType === 27) {
            EditInvoiceCom = AllEleInvoice;
            selectClass = 'paddLeft90';
        } else if (invoiceType === 28) {
            EditInvoiceCom = EleAirBill;
            selectClass = 'paddLeft90';
        } else if (invoiceType === 29) {
            EditInvoiceCom = EleTrainBill;
            selectClass = 'paddLeft90';
        } else if (invoiceType === 83) {
            EditInvoiceCom = EleBulletTrainBill;
            selectClass = 'paddLeft90';
        } else if (invoiceType === 84) {
            EditInvoiceCom = EleSecondHandCarBill;
            selectClass = 'paddLeft90';
        }
        const ShowImage = () => {
            const fileType = 1;
            const imgSrc = this.state.imgSrc; // fileType === 1 ? billData.snapshotUrl : billData.pdfurl;
            const imgHeight = clientHeight - 220;
            const currentOperate = this.state.currentOperate;
            const invoiceType = this.state.invoiceType;
            let orientation = '';
            let pixel = '';
            let region = '';
            if (currentOperate != 'dzState') {
                orientation = billData.orientation;
                pixel = billData.pixel;
                region = billData.region;
            }
            if (fileType === 2) {
                return (
                    <div className='outImg' style={{ height: imgHeight, marginBottom: 10 }}>
                        <iframe src={changeKingdeeUrl(imgSrc)} width='100%' height={imgHeight} />
                    </div>
                );
            }
            if (!imgSrc && (invoiceType == 28 || invoiceType == 29)) {
                return (
                    <div className='outImg' style={{ height: imgHeight, marginBottom: 10 }}>
                        该类发票暂不支持生成底账数据图像
                    </div>
                );
            }
            return (
                <div className='outImg' style={{ height: imgHeight, marginBottom: 10 }}>
                    {
                        imgHeight > 0 ? (
                            <ScanImage
                                imgSrc={changeKingdeeUrl(imgSrc)}
                                rotateDeg={orientation}
                                areaInfo={{ pixel, region }}
                                renderInBody={false}
                                disabledBtns={false}
                                disabledMouseWheel={false}
                                width={clientWidth - 20}
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
                checkCount={this.props.checkCount}
                lastCheckTime={this.props.lastCheckTime}
                onShowLedgerdata={this.onShowLedgerdata}
                currentOperate={this.state.currentOperate}
                billData={billData}
                onPrintInvoice={this.startPrintInvoice}
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
            imgSrc,
            pixel = '',
            region = '',
            orientation = 0,
            errorFlag,
            invoiceCode,
            invoiceNo,
            invoiceType,
            serialNo
        } = this.props.billData;
        const clientHeight = this.props.height;
        const clientWidth = this.props.width;
        const { activeIndex, activeKey, attachSerialNoList = [], tripOrdersCount } = this.state;
        return (
            <div id='editBoxWapper' style={{ height: clientHeight, overflow: 'hidden', position: 'relative' }} className='editScanInvoice'>
                {
                    //错误，或者其它票
                    errorFlag ? (
                        <div className='noneAddedBillForm'>
                            <div className='inputItems' style={{ textAlign: 'right', height: 50 }}>
                                <Button onClick={this.props.onClose} style={{ marginLeft: 15, marginRight: 50 }}>返回</Button>
                            </div>
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
                                    tripOrdersCount && tripOrdersCount.totalTrip > 0 ? (
                                        <TabPane tab='滴滴行程单' key='2'>
                                            <div>
                                                <DDInvoiceInfo
                                                    invoiceCode={invoiceCode}
                                                    invoiceNo={invoiceNo}
                                                    invoiceType={invoiceType}
                                                    tripOrdersCount={tripOrdersCount}
                                                    showCountInfo={true}
                                                    clientHeight={clientHeight}
                                                    queryTripUrl={this.props.queryTripUrl}
                                                />
                                            </div>
                                        </TabPane>
                                    ) : null
                                }
                                {
                                    attachSerialNoList.length > 0 ? (
                                        <TabPane tab='附件信息' key='3'>
                                            <AttachList
                                                queryAttachUrl={this.props.queryAttachUrl}
                                                invoiceSerialNo={serialNo}
                                                listData={this.props.attachList}
                                                onDelete={this.props.onDelete}
                                                clientWidth={clientWidth}
                                                clientHeight={clientHeight}
                                                onClose={this.props.onClose}
                                                onOk={this.onSaveAttach}
                                                activeIndex={activeIndex}
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
    activeKey: PropTypes.object.isRequired,
    activeIndex: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    disabledEdit: PropTypes.bool,
    billData: PropTypes.object.isRequired,
    onDelete: PropTypes.func,
    onClose: PropTypes.func,
    onOk: PropTypes.func,
    onCheckInvoice: PropTypes.func,
    onSaveInvoice: PropTypes.func,
    onPrintInvoice: PropTypes.func,
    onShowLedgerdata: PropTypes.func,
    updateAttachUrl: PropTypes.string,
    checkCount: PropTypes.number,
    lastCheckTime: PropTypes.string,
    queryAttachUrl: PropTypes.string,
    queryTripUrl: PropTypes.string,
    queryOtherInfoUrl: PropTypes.string,
    attachList: PropTypes.array
};
export default EditInvoice;