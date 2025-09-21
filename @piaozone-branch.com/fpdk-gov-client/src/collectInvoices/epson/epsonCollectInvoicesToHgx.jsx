import React from 'react';
import { Button, message, Upload, Modal, Tooltip } from 'antd';
import { cookieHelp, loadJs, pwyFetch } from '@piaozone.com/utils';
import { confirm } from '../../commons/antdModal';
import { inputResource, INPUT_INVOICE_TYPES } from '../../commons/constants';
import ShowCollectResult from '../showCollectResult';
import ShowWaitCollectResult from '../showWaitCollectResult';
import EditInvoice from '@piaozone.com/editInvoice-pc';
import { EpsAsyncScanFiles } from '@piaozone.com/scanFiles';
import { compressImgFile } from '@piaozone.com/process-image';
import PropTypes from 'prop-types';
const uploadIcon = require('../../commons/img/errorIcon.png');
const addedInvoiceTypes = INPUT_INVOICE_TYPES.filter((item) => {
    return item.isAddedTax;
}).map((item) => {
    return item.value;
});

class EpsonCollectInvoicesToHgx extends React.Component {
    constructor() {
        super(...arguments);
        this.batchNo = '';
        this.state = {
            curEditInfo: {},
            uploading: false,
            listData: [],
            waitListData: [],
            activeInvoiceType: '',
            activeWaitInvoiceType: '',
            activeTab: 1,
            mustBindInfo: false
        };
    }

    componentDidMount() {
        this.uploadNum = 0;
        this.uploaded = 0;
        this._isMounted = true;
        this.loadingLog = null;
        this.asyncScanFiles = new EpsAsyncScanFiles({
            version: 16,
            staticUrl: window.staticUrl, // 指定加载扫描仪库文件的根路径
            needRegonizeQr: false, // 开启识别二维码
            uploadUrl: this.props.onConformInvoiceUpload // 上传路径
        });
        this.getBindInfo();
    }

    componentWillUnmount() {
        if (window.DWObject) {
            window.DWObject.RemoveAllImages();
            window.DWObject.CloseSource();
        }
        this._isMounted = false;
    }

    getBindInfo = async() => {
        const res = await pwyFetch(this.props.getCurrentBindInfo, {
            method: 'post',
            contentType: 'file'
        });
        if (res.errcode == '0000') {
            const { scannerModelWhite, scannerModel } = res.data;
            this.setState({
                scannerModel,
                scannerModelWhite
            });
            if (!scannerModel) {
                this.noBindDevice();
            }
        } else {
            message.error(res.description);
        }
    }

    saveBindInfo = async(scannerModel, needReload) => {
        const res = await pwyFetch(this.props.saveCurrentBindInfo, {
            method: 'post',
            data: {
                scannerModel
            }
        });
        if (res.errcode == '0000') { 
            this.setState({
                mustBindInfo: false,
                scannerModel
            });
            message.success('绑定设备:' + scannerModel + '成功！');
            setTimeout(() => {
                if (needReload) {
                    window.location.reload();
                }
            }, 500);
        } else {
            message.error(res.description);
        }
    }

    getUUId = () => {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    
    getUploadProps = (accept) => {
        const csrfToken = cookieHelp.getCookie('csrfToken');
        return {
            name: 'checkFile',
            method: 'post',
            multiple: true,
            accept,
            showUploadList: false,
            withCredentials: true,
            data: {},
            headers: {
                'x-csrf-token': csrfToken
            },
            action: this.props.onConformInvoiceUpload,
            beforeUpload: (file, files) => {
                if (this.uploading) {
                    return false;
                }
                if (this.batchNo === '') {
                    // this.setState({
                    //     waitListData: []
                    // });
                    this.batchNo = this.getUUId();
                }
                this.handleFiles(files);
                return false;
            }
        };
    }

    handleFiles = async(files) => {
        const endLoading = message.loading('处理中...', 0);
        this.uploading = true;
        // 文件限制
        let overLimit = false;
        files = files.filter(o => {
            if (o.size > 6 * 1024 * 1024) {
                overLimit = true;
            } else {
                return true;
            }
        });
        if (overLimit) message.warning('单个文件大小最大允许6M，已自动过滤超出限制的文件，请检查！');
        for (let j = 0; j < files.length; j++) {
            const originFile = files[j];
            const type = originFile.type;
            const isExcel = (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            if (isExcel && typeof window.FileReader === 'function') {
                await loadJs.loadScripts(window.staticUrl + '/static/gallery/xlsx/xlsx.full.min.js');
                await this.handleSingleExcel(originFile);
            } else {
                const { fileQuality, fileLimitSize, fileLimitPixel } = window.__INITIAL_STATE__;
                const fileRes = await compressImgFile(files[j], { fileQuality, fileLimitSize, fileLimitPixel });
                const file = fileRes.file;
                const formData = new FormData();
                formData.append('batchNo', this.batchNo);
                formData.append('resource', inputResource.k2.value); //来源为PC端上传
                formData.append('RemoteFile', file);
                formData.append('originalFilename', file.name);
                const res = await pwyFetch(this.props.onConformInvoiceUpload, {
                    method: 'post',
                    data: formData,
                    contentType: 'file'
                });
                if (res.errcode === '0000') {
                    const { waitListData } = this.state;
                    const oldFids = waitListData.map((item) => {
                        return item.serialNo;
                    });
                    const data = res.data.map((item) => {
                        return {
                            ...item,
                            fileName: file.name
                        };
                    });
                    const { serialNo } = data[0];
                    if (serialNo) {
                        if (oldFids.indexOf(serialNo) == '-1') {
                            this.setState({
                                waitListData: waitListData.concat(data)
                            });
                        } else {
                            const index = oldFids.indexOf(serialNo);
                            waitListData[index] = data[0];
                            this.setState({
                                waitListData
                            });
                        }
                    } else {
                        this.setState({
                            waitListData: this.state.waitListData.concat(data)
                        });
                    }
                } else {
                    if (res.errcode != 'requestErr') {
                        // 查验不支持编辑 后端不方便修改，前端替换
                        const _description = res.description.replace('，请点编辑按钮检查必填字段是否正确', '');
                        this.setState({
                            waitListData: this.state.waitListData.concat({
                                errorFlag: true,
                                serialNo: +new Date() + '' + Math.random(),
                                fileName: file.name,
                                description: _description
                            })
                        });
                    } else {
                        message.error(res.description);
                    }
                }
            }
        }
        endLoading();
        this.uploading = false;
        const { activeTab } = this.state;
        if (activeTab == 2) {
            this.setState({
                activeTab: 1
            });
        }
        return false;
    }

    insertData = async() => { //确认上传
        const { waitListData } = this.state;
        const fids = [];
        for (let i = 0; i < waitListData.length; i++) {
            if (waitListData[i].isRepeat) {
                message.info('该列表存在重复采集发票，请先删除后再上传');
                return;
            }
            const { verifyResult, serialNo } = waitListData[i];
            if (serialNo) {
                if (verifyResult && verifyResult.length > 0) {
                    for (let j = 0; j < verifyResult.length; j++) {
                        if (verifyResult[j].config == '0') {
                            message.info('当前有些无法上传,请将鼠标移至提示 ！处查看原因');
                            return;
                        }
                    }
                }
            } else {
                message.info('存在必填字段缺失发票，请点击【编辑】检查*号项是否完整');
                return;
            }
            
            if (waitListData[i].serialNo) {
                fids.push(waitListData[i].serialNo);
            }
        }
        
        message.loading('处理中...', 0);
        const res = await this.props.onConformInvoiceInsert({
            serialNos: fids
        });
        message.destroy();
        if (res.errcode == '0000') {
            this.countListData(fids);
            message.info('上传成功');
        } else {
            message.info(res.description);
        }
    }

    countListData = (fids) => {
        const { waitListData } = this.state;
        const newList = waitListData.filter((item) => {
            return fids.indexOf(item.serialNo) != '-1';
        });
        this.setState({
            waitListData: [],
            listData: newList,
            activeTab: 2,
            activeWaitInvoiceType: ''
        });
    }

    onShowEditDialog = (r, i, disabledEdit) => {
        this.setState({
            curEditInfo: r,
            disabledEdit
        });
    }

    onConfirmEdit = (info = {}, invoiceData) => {
        const { activeTab } = this.state;
        if (activeTab == '1') { //待上传列表
            this.setState({
                curEditInfo: {},
                waitListData: this.state.waitListData.map((item) => {
                    let invoiceType = info.invoiceType || invoiceData.invoiceType;
                    const oldRecognitionSerialNo = invoiceData.recognitionSerialNo;
                    const recognitionSerialNo = info.recognitionSerialNo || oldRecognitionSerialNo;
                    invoiceType = parseInt(invoiceType);
                    if (oldRecognitionSerialNo === item.recognitionSerialNo) {
                        if (addedInvoiceTypes.indexOf(parseInt(invoiceType)) !== -1) {
                            return {
                                ...item,
                                ...invoiceData,
                                ...info,
                                checkStatus: 2,
                                invoiceType,
                                recognitionSerialNo // 流水号可能发生变化
                            };
                        } else {
                            return {
                                ...item,
                                serialNo: recognitionSerialNo,
                                ...invoiceData,
                                ...info,
                                invoiceType,
                                recognitionSerialNo // 流水号可能发生变化
                            };
                        }
                    } else {
                        return item;
                    }
                })
            });
        } else {
            this.setState({
                curEditInfo: {},
                listData: this.state.listData.map((item) => {
                    let invoiceType = info.invoiceType || invoiceData.invoiceType;
                    const oldRecognitionSerialNo = invoiceData.recognitionSerialNo;
                    const recognitionSerialNo = info.recognitionSerialNo || oldRecognitionSerialNo;
                    invoiceType = parseInt(invoiceType);
                    if (oldRecognitionSerialNo === item.recognitionSerialNo) {
                        if (addedInvoiceTypes.indexOf(invoiceType) !== -1) {
                            return {
                                ...item,
                                ...invoiceData,
                                ...info,
                                checkStatus: 2,
                                invoiceType,
                                recognitionSerialNo // 流水号可能发生变化
                            };
                        } else {
                            return {
                                ...item,
                                ...invoiceData,
                                ...info,
                                invoiceType,
                                recognitionSerialNo // 流水号可能发生变化
                            };
                        }
                    } else {
                        return item;
                    }
                })
            });
        }
    }

    onDeleteWaitInvoice = (r) => { //待上传列表删除
        message.info('删除成功');
        let hasFlag = false;
        const waitListData = [];
        for (let i = 0; i < this.state.waitListData.length; i++) {
            const curData = this.state.waitListData[i];
            if (curData.recognitionSerialNo !== r.recognitionSerialNo) {
                waitListData.push(curData);
                if (!hasFlag && 'k' + curData.invoiceType === this.state.activeWaitInvoiceType) { // 当前tab存在发票
                    hasFlag = true;
                }
            }
        }
        if (waitListData.length > 0) {
            this.setState({
                activeWaitInvoiceType: hasFlag ? this.state.activeWaitInvoiceType : 'k' + waitListData[0].invoiceType,
                waitListData
            });
        } else {
            this.setState({
                activeWaitInvoiceType: '',
                waitListData: []
            });
        }
    }

    onDeleteInvoice = (r) => { //采集列表删除
        confirm({
            title: '确定删除该发票？',
            onOk: async() => {
                message.loading('处理中...', 0);
                const res = await this.props.onDeleteInvoice({
                    batchNo: this.batchNo,
                    recognitionSerialNo: r.recognitionSerialNo
                });
                message.destroy();
                if (res.errcode === '0000') {
                    message.info('删除成功');
                    let hasFlag = false;
                    const listData = [];
                    for (let i = 0; i < this.state.listData.length; i++) {
                        const curData = this.state.listData[i];
                        if (curData.recognitionSerialNo !== r.recognitionSerialNo) {
                            listData.push(curData);
                            if (!hasFlag && 'k' + curData.invoiceType === this.state.activeInvoiceType) { // 当前tab存在发票
                                hasFlag = true;
                            }
                        }
                    }

                    if (listData.length > 0) {
                        this.setState({
                            activeInvoiceType: hasFlag ? this.state.activeInvoiceType : 'k' + listData[0].invoiceType,
                            listData
                        });
                    } else {
                        this.setState({
                            activeInvoiceType: '',
                            listData: []
                        });
                    }
                } else {
                    message.info(res.description);
                }
            }
        });
    }

    uploadTip() {
        return (
            <div>
                <span>发票上传失败时，请将鼠标移动至</span>
                <img src={uploadIcon} width='16px' height='16px' style={{ verticalAlign: 'top-text', marginLeft: 3, marginRight: 3 }} alt='' />
                <span>提示处查看原因</span>
            </div>
        );
    }

    editCheckInvoice = async(invoiceData) => {
        const { activeTab } = this.state;
        let verifyCollect = '';
        if (activeTab == 1) {
            verifyCollect = '1';
        }
        const res = await this.props.onCheckInvoice({
            ...invoiceData,
            verifyCollect
        });
        return res;
    }

    editSaveInvoice = async(invoiceData) => {
        const { activeTab } = this.state;
        let verifyCollect = '';
        let isRevise = '';
        if (activeTab == 1) {
            verifyCollect = '1';
            isRevise = '2';
        }
        const res = await this.props.onSaveInvoice({
            ...invoiceData,
            verifyCollect,
            isRevise
        });
        return res;
    }

    onReset = () => {
        confirm({
            content: '确定要清空吗？',
            onOk: async() => {
                message.destroy();
                this.setState({
                    listData: [],
                    waitListData: [],
                    invoiceImg: '',
                    serialNo: '',
                    activeInvoiceType: '',
                    activeWaitInvoiceType: ''
                });
                this.batchNo = '';
                this.uploading = false;
            }
        });
    };

    insertFileName(res, fileName) {
        if (res.errcode == '0000') {
            if (res.data && res.data.length > 0) {
                const newData = res.data.map((item) => {
                    return {
                        ...item,
                        fileName
                    };
                });
                res.data = newData;
            }
            return res;
        } else {
            return res;
        }
    }

    noBindDevice = async() => {
        const { scannerModelWhite, scannerModel } = this.state;
        localStorage.setItem('scannerModelSelect', '');
        this.setState({
            mustBindInfo: true
        });
        Modal.confirm({
            title: '绑定扫描仪',
            content: '检测到当前企业还未绑定指定扫描仪，请先绑定可用型号的扫描仪',
            onOk: async() => {
                this.asyncScanFiles.startScan({
                    filename: 'RemoteFile',
                    scannerModel,
                    data: '',
                    checkDeviceNo: async(name) => {
                        if (scannerModelWhite.indexOf(name) != -1) {
                            this.saveBindInfo(name, true);
                        } else {
                            message.info('请选择白名单中设置的扫描仪型号:' + scannerModelWhite.join('、'));
                        }
                    }
                });
            },
            onCancel: () => {
                console.log('取消绑定');
            }
        });
    }

    onScanFiles = () => {
        message.loading('处理中...');
        const { scannerModelWhite, scannerModel } = this.state;
        if (!scannerModel) { //没有绑定
            this.noBindDevice();
            return;
        }
        let uuid = this.batchNo || '';
        if (uuid === '') {
            uuid = this.getUUId();
            this.batchNo = uuid;
        }
        this.asyncScanFiles.startScan({
            filename: 'RemoteFile',
            scannerModel,
            data: {
                batchNo: uuid,
                resource: inputResource.k3.value
            },
            checkDeviceNo: async(name) => {
                const index = scannerModelWhite.indexOf(name);
                if (index != -1) { //存在白名单中
                    const res = await pwyFetch(this.props.saveCurrentBindInfo, {
                        method: 'post',
                        data: {
                            scannerModel: name
                        }
                    });
                    if (res.errcode == '0000') {
                        this.setState({
                            mustBindInfo: false,
                            scannerModel: name
                        });
                        message.success('绑定设备:' + scannerModel + '成功,请重新采集！');
                        localStorage.setItem('scannerModelSelect', name);
                    } else {
                        message.error(res.description);
                    }
                } else {
                    message.info('当前型号：' + name + '不在扫描仪白名单中,请选择其他型号！');
                }
            },
            stepUploadStart: async(info) => {
                this.setState({
                    uploading: true
                });
                return { errcode: '0000', descripton: 'success' };
            },
            stepUploadFinish: (res, fileInfo) => { // 每一步上传处理完成后的回调 formData.append('originalFilename', file.name);
                const result = this.insertFileName(res, fileInfo.file.name);
                this.handlerUploadRes(result, fileInfo.file);
            },
            uploadFinish: (res) => {
                this.loadingLog = null;
                message.destroy();
                if (res.errcode !== '0000') {
                    message.info(res.description);
                } else {
                    if (res.data.imagesNum != 0) {
                        message.info('扫描并上传处理完成');
                    }
                }
                this.setState({
                    uploading: false
                });
            }
        });
    }

    handlerUploadRes = (res, file) => {
        if (res.errcode === '0000') {
            const { waitListData } = this.state;
            const oldFids = waitListData.map((item) => {
                return item.serialNo;
            });
            const data = res.data.map((item) => {
                return {
                    ...item,
                    fileName: file.name
                };
            });
            const { serialNo } = data[0];
            if (serialNo) {
                if (oldFids.indexOf(serialNo) == '-1') {
                    this.setState({
                        waitListData: waitListData.concat(data)
                    });
                } else {
                    const index = oldFids.indexOf(serialNo);
                    waitListData[index] = data[0];
                    this.setState({
                        waitListData
                    });
                }
            } else {
                this.setState({
                    waitListData: this.state.waitListData.concat(data)
                });
            }
        } else {
            // 查验不支持编辑 后端不方便修改，前端替换
            const _description = res.description.replace('，请点编辑按钮检查必填字段是否正确', '');
            this.setState({
                waitListData: this.state.waitListData.concat({
                    errorFlag: true,
                    serialNo: +new Date() + '' + Math.random(),
                    fileName: file.name,
                    description: _description
                })
            });
        }
        const { activeTab } = this.state;
        if (activeTab == 2) {
            this.setState({
                activeTab: 1
            });
        }
    }

    render() {
        const {
            disabledEdit,
            curEditInfo, uploading, listData = [],
            activeInvoiceType, showImageDialog,
            activeWaitInvoiceType,
            imgSrc, curImgType,
            activeTab,
            waitListData = []
        } = this.state;
        if (uploading && !this.loadingLog) {
            this.loadingLog = message.loading('处理中...', 0);
        }
        return (
            <div className='plFpCheck'>
                <div className='clearfix btns' style={{ padding: '0 20px 10px 20px', boxSizing: 'border-box', marginBottom: 0 }}>
                    <div className='floatLeft'>
                        <Upload {...this.getUploadProps('.jpg,.JPG,.jpeg,.JPEG,.png,.PNG,.tif,.TIF,.pdf,.PDF,.ofd,.OFD')} className='inlineBlock'>
                            <Tooltip placement='topLeft' title='支持PNG、JPG格式的图片，文件不能大于12MB； 支持PDF、OFD文件，单文件不能超过10页'>
                                <Button type='primary' className='btn' style={{ marginRight: 16 }} disabled={uploading}>文件上传</Button>
                            </Tooltip>
                        </Upload>
                        <Button className='btn' style={{ marginRight: 16 }} disabled={uploading} onClick={this.onScanFiles}>扫描仪采集</Button>
                        <Button
                            className='btn'
                            type='primary'
                            style={{ marginRight: 16, display: 'none' }}
                            loading={this.props.exporting}
                            disabled={listData.length === 0 || uploading}
                            onClick={this.onExportExcel}
                        >导出EXCEL
                        </Button>
                    </div>
                    <div className='floatRight'>
                        <Tooltip placement='topLeft' title='仅清空当前页面，已采集的发票可到【台账管理】查看或删除'>
                            <Button onClick={this.onReset}>清空页面</Button>
                        </Tooltip>
                    </div>
                    {
                        this.state.mustBindInfo ? (
                            <div
                                className='mask'
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    zIndex: '9',
                                    left: 0
                                }}
                                onClick={this.noBindDevice}
                            />
                        ) : null
                    }
                </div>
                <div className='config' style={{ background: '#e2e7ef', padding: 10 }}>
                    <div style={{ background: '#fff', padding: 20 }}>
                        <div className='tabs'>
                            <span className={activeTab == 1 ? 'tabIcon checked' : 'tabIcon'} onClick={() => { this.setState({ activeTab: 1 }); }}>待上传列表</span>
                            <span className={activeTab == 2 ? 'tabIcon checked' : 'tabIcon'} onClick={() => { this.setState({ activeTab: 2 }); }}>采集成功列表</span>
                        </div>
                        {
                            activeTab == 1 ? (
                                <div className='tabItem'>
                                    <ShowWaitCollectResult
                                        activeInvoiceType={activeWaitInvoiceType}
                                        listData={waitListData}
                                        changeInvoiceTab={(info) => { this.setState({ activeWaitInvoiceType: info.key }); }}
                                        onShowEditDialog={this.onShowEditDialog}
                                        onDeleteInvoice={this.onDeleteWaitInvoice}
                                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                                        onInsertData={this.insertData}
                                        userSource={8}
                                    />
                                </div>
                            ) : (
                                <div className='tabItem'>
                                    <ShowCollectResult
                                        activeInvoiceType={activeInvoiceType}
                                        listData={listData}
                                        changeInvoiceTab={(info) => { this.setState({ activeInvoiceType: info.key }); }}
                                        onShowEditDialog={this.onShowEditDialog}
                                        onDeleteInvoice={this.onDeleteInvoice}
                                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                                        userSource={8}
                                    />
                                </div>
                            )
                        }
                    </div>
                </div>
                <Modal
                    visible={showImageDialog}
                    title='发票图像'
                    onCancel={() => this.setState({ showImageDialog: false })}
                    width={1000}
                    top={30}
                    footer={null}
                >
                    {
                        /pdf$/.test(curImgType) ? (
                            <div style={{ textAlign: 'center' }}>
                                <iframe src={imgSrc} width={900} height={600} />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={imgSrc} style={{ maxWidth: 980, maxHeight: 600 }} />
                            </div>
                        )
                    }
                </Modal>
                <Modal
                    visible={!!curEditInfo.recognitionSerialNo || !!curEditInfo.serialNo}
                    title='编辑发票信息'
                    onCancel={() => this.setState({ curEditInfo: {} })}
                    width={1000}
                    top={30}
                    footer={null}
                    className='fpyDialog'
                >
                    <EditInvoice
                        billData={curEditInfo || {}}
                        disabledEdit={disabledEdit}
                        onOk={this.onConfirmEdit}
                        onCheckInvoice={this.editCheckInvoice}
                        onSaveInvoice={this.editSaveInvoice}
                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                    />
                </Modal>
            </div>
        );
    }
}


EpsonCollectInvoicesToHgx.propTypes = {
    onConformInvoiceUpload: PropTypes.string.isRequired,
    onConformInvoiceInsert: PropTypes.func.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    scanFileStaticJs: PropTypes.array,
    exporting: PropTypes.bool,
    getCurrentBindInfo: PropTypes.string.isRequired,
    saveCurrentBindInfo: PropTypes.string.isRequired
};

export default EpsonCollectInvoicesToHgx;