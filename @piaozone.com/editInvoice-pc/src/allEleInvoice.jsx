import React from 'react';
import { Button, Input, DatePicker, message } from 'antd';
import moment from 'moment';
import ShowImage from './showImage';
import './noneAddedBillForm.css';
import PropTypes from 'prop-types';
//全电票
class AllEleInvoice extends React.Component {
    constructor(props) {
        super(...arguments);
        const billData = props.billData || {};
        const checkCount = props.checkCount || null;
        const lastCheckTime = props.lastCheckTime || null;
        this.recognitionSerialNo = billData.recognitionSerialNo;
        const { snapshotUrl, invoiceNo = '', invoiceDate, totalAmount = '', serialNo } = billData;
        const cyjg = billData.checkStatus;  //跟标准的查验结果描述一样，这里2 代表已查验；
        this.state = {
            imgSrc: snapshotUrl,
            invoiceNo,
            invoiceDate: invoiceDate ? moment(invoiceDate, 'YYYY-MM-DD') : null,
            checkCount,
            lastCheckTime,
            serialNo,
            cyjg,
            totalAmount,
            saving: false,
            disabledClick:false,
            imgTxt:'查看底账数据',
            currentOperate:'original'
        };
    }

    onSave = async() => {
        const {
            invoiceNo,
            invoiceDate,
            totalAmount
        } = this.state;

        this.setState({
            saving: true
        });

        await this.props.onOk({
            ...this.props.billData,
            invoiceNo,
            invoiceDate: invoiceDate.format('YYYY-MM-DD'),
            totalAmount
        });

        this.setState({
            saving: false
        });
    }
    showLedgerdata = async() => {
        const { serialNo,currentOperate } = this.state;
        const billData = this.props.billData;
        this.setState({
            disabledClick:true
        })
        message.loading('加载中...', 0);
        if (currentOperate == 'original') {
            const res = await this.props.onShowLedgerdata({
                serialNo
            });
            message.destroy();
            if(res.errcode == '0000'){
                const {snapshotUrl} = res.data;
                if (snapshotUrl && snapshotUrl != ''){
                    this.setState({
                        imgSrc: snapshotUrl,
                        imgTxt:'查看原图',
                        currentOperate:'dzState'
                    })
                }else{
                    message.info('获取底账数据失败');
                }

            }else{
                message.info(res.description);
            }
        } else {
            message.destroy();
            this.setState({
                imgTxt:'查看底账数据',
                imgSrc:billData.snapshotUrl,
                currentOperate:'original'
            })
        }


        this.setState({
            disabledClick:false
        })
    }

    imgShow = () => {
        let {currentOperate, imgSrc = ''} = this.state;
        const { invoiceType } = this.props;
        let html = '';
        if (!imgSrc && (invoiceType == 28 || invoiceType == 29)) {
            html = <div>该类发票暂不支持生成底账数据图像</div>
        }else if(imgSrc == ''){
            html = <div>未加载到发票图片</div>
        }else{
            if(currentOperate == 'original'){
                html = <ShowImage src={imgSrc} pixel={this.props.billData.pixel} region={this.props.billData.region} orientation={this.props.billData.orientation} />
            }else{
                html = <ShowImage src={imgSrc}  />
            }
        }
        return (
            html
        );
    }


    reset = () => {
        const billData = this.props.billData;
        this.setState({
            invoiceNo: billData.invoiceNo || '',
            invoiceDate: billData.invoiceDate ? moment(billData.invoiceDate, 'YYYY-MM-DD') : null,
            totalAmount: billData.totalAmount || ''
        });
    }

    startPrintInvoice = () => {
        const { imgSrc } = this.state;
        let printImgs = '';
        if(imgSrc != ''){
            printImgs = [imgSrc];
        }else{
            message.warning('当前原图为空无法打印');
            return false
        }
        if(printImgs.length > 0){
            this.props.onPrintInvoice(printImgs);
        }

    }

    render() {
        const { invoiceNo, invoiceDate, saving, totalAmount, checkCount, lastCheckTime, cyjg, imgTxt,disabledClick } = this.state;
        const { invoiceType, disabledEdit,AccountManageState } = this.props;
        const todayTimestamp = moment().format('X');
        const disabled = !invoiceNo || !invoiceDate || !totalAmount
        const addState = [1, 2, 3, 4, 12, 13, 15, 26, 27].indexOf(invoiceType);

        return (
            <div className='noneAddedBillForm'>
                <div className='inputItems'>
                    <div className='tip'>
                        备注：修改发票种类后，请到对应票种下面查看对应的发票数据。
                        {
                            cyjg == 2 && checkCount ? (
                                <span>查验次数：{checkCount}次</span>
                            ) : null

                        }
                        {
                            cyjg == 2 && lastCheckTime ? (
                                <span style={{paddingLeft:10}}>查询时间：{lastCheckTime}</span>
                            ) : null

                        }

                    </div>
                    {
                        !disabledEdit ? (
                            <div className='clearfix'>
                                {this.props.children}
                                <div className='inputItem floatLeft'>
                                    <Button type='primary' onClick={this.onSave} loading={saving} disabled={disabled}>确定修改</Button>
                                </div>
                            </div>
                        ) : null
                    }
                    <div className='clearfix' style={{ marginTop: 10 }}>
                        <div className='inputItem floatLeft col1'>
                            <label><span className='require'>*</span>发票号码：</label>
                            <Input maxLength={20} disabled={disabledEdit} type='text' value={invoiceNo} onChange={(e) => this.setState({ invoiceNo: e.target.value.trim() })} />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>开票日期：</label>
                            <DatePicker
                                disabled={disabledEdit}
                                disabledDate={(d) => { return moment(d.format('YYYY-MM-DD')).format('X') > todayTimestamp; }}
                                onChange={(e) => this.setState({ invoiceDate: e })}
                                value={invoiceDate}
                                format='YYYY-MM-DD'
                            />
                        </div>
                        <div className='inputItem floatLeft'>
                            <label className='alignRight width70'><span className='require'>*</span>{(invoiceType === 83 || invoiceType === 84) ? '车价合计': '价税合计'}：</label>
                            <Input
                                disabled={disabledEdit}
                                type='text'
                                value={totalAmount}
                                onChange={(e) => this.setState({ totalAmount: e.target.value.trim() })}
                            />
                        </div>
                    </div>
                    <div className='clearfix'>
                        {
                            cyjg == 2 && addState> -1 && AccountManageState? (
                                <div className='inputItem floatLeft'>
                                    {
                                        typeof this.props.onShowLedgerdata === 'function' ? (
                                            <Button
                                                style={{ marginRight: 15 }}
                                                type='primary'
                                                onClick={this.showLedgerdata}
                                                loading={disabledClick}
                                                disabled={disabledClick}
                                            >
                                                {imgTxt}
                                            </Button>
                                        ) : null
                                    }
                                    <Button type='primary' onClick={() => this.startPrintInvoice()} disabled={disabledClick}>打印发票</Button>
                                </div>
                            ) : null
                        }

                    </div>
                </div>
                <div className='outImg'>
                    {this.imgShow()}
                </div>
            </div>
        );
    }
}

AllEleInvoice.propTypes = {
    billData: PropTypes.object.isRequired,
    disabledEdit: PropTypes.bool,
    onOk: PropTypes.func.isRequired,
    invoiceType: PropTypes.number.isRequired,
    children: PropTypes.object.isRequired,
    onShowLedgerdata: PropTypes.object.isRequired
};

export default AllEleInvoice;