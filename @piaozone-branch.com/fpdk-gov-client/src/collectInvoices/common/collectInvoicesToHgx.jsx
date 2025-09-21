import React from 'react';
import { Button, message, Upload, Modal, Tooltip, Icon } from 'antd';
import { cookieHelp, loadJs, pwyFetch, tools } from '@piaozone.com/utils';
import { confirm } from '../../commons/antdModal';
import ShowCollectResult from '../showCollectResult';
import ShowWaitCollectResult from '../showWaitCollectResult';
import EditInvoice from '@piaozone.com/editInvoice-pc';
import moment from 'moment';
import PropTypes from 'prop-types';
import { inputResource, INPUT_INVOICE_TYPES } from '../../commons/constants';
import { PwyAsyncScanFiles } from '@piaozone.com/scanFiles';
import CheckInvocieByInput from '@piaozone.com/checkInvoiceByInput';
import { compressImgFile } from '@piaozone.com/process-image';
const uploadIcon = require('../../commons/img/errorIcon.png');
const addedInvoiceTypes = INPUT_INVOICE_TYPES.filter((item) => {
    return item.isAddedTax;
}).map((item) => {
    return item.value;
});

class CollectInvoicesToHgx extends React.Component {
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
            activeTab: 1
        };
    }

    componentDidMount() {
        this.uploadNum = 0;
        this.uploaded = 0;
        this._isMounted = true;
        this.loadingLog = null;
        this.qrInput = document.getElementById('qrStrInput');
        window.clearTimeout(this.tick);
        this.asyncScanFiles = new PwyAsyncScanFiles({
            version: 16,
            staticUrl: window.staticUrl, //, // 指定加载扫描仪库文件的根路径
            needRegonizeQr: false, // 开启识别二维码
            uploadUrl: this.props.onConformInvoiceUpload // 上传路径
        });
    }

    componentWillUnmount() {
        window.DWObject && window.DWObject.RemoveAllImages();
        this._isMounted = false;
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

    getUploadProps = (accept, type) => {
        const csrfToken = cookieHelp.getCookie('csrfToken');
        return {
            name: 'checkFile',
            method: 'post',
            multiple: true,
            accept,
            showUploadList: false,
            withCredentials: true,
            data: {
                recogType: 1
            },
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
                this.handleFiles(files, type);
                return false;
            }
        };
    }

    handleFiles = async(files, uploadType) => {
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
                if (uploadType && uploadType === 'allEle') {
                    formData.append('recogType', 1);
                }
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
                    if (res.description.indexOf('许可已到期') != '-1' || res.description.indexOf('无票量') != '-1') {
                        Modal.confirm({
                            title: '权益许可到期提醒',
                            content: res.description,
                            cancelText: '关闭',
                            okText: '更多',
                            onOk: () => {
                                window.open(window.staticUrl + '/static/stoptaking/index.html');
                            }
                        });
                        break;
                    };
                    if (res.errcode != 'requestErr') {
                        if (res.data) {
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
                            message.error(res.description, 3);
                        }
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

    checkSingleInvoice = async(opt) => { //手工录入
        message.loading('处理中...', 0);
        const res = await this.props.onCheckInvoice({
            ...opt,
            billTypeCode: 'FPY-MOP',
            isCreateUrl: 1,
            verifyCollect: 1
        });
        message.destroy();
        if (res.errcode !== '0000') {
            if (res.description.indexOf('许可已到期') != '-1' || res.description.indexOf('无票量') != '-1') {
                Modal.confirm({
                    title: '权益许可到期提醒',
                    content: res.description,
                    cancelText: '关闭',
                    okText: '更多',
                    onOk: () => {
                        window.open(window.staticUrl + '/static/stoptaking/index.html');
                    }
                });
            } else {
                message.info(res.description);
            }
            return res;
        }
        let uuid = this.batchNo || '';
        if (uuid === '') {
            uuid = this.getUUId();
            this.batchNo = uuid;
        }
        const resData = res.data;
        // 检测重复
        if (resData.isRepeat) {
            message.warning('该影像文件已采集，请不要重复采集！');
            return res;
        }
        const waitListData = this.state.waitListData.map((item) => {
            return item.serialNo;
        });
        if (waitListData.indexOf(resData.serialNo) !== -1) {
            message.info('该发票已存在待采集列表中！');
            return res;
        }
        const checkCode = resData.checkCode || '';
        this.setState({
            waitListData: this.state.waitListData.concat({
                ...resData,
                checkCode: checkCode.substr(0, 6),
                invoiceAmount: resData.invoiceAmount || resData.amount,
                totalTaxAmount: resData.totalTaxAmount || resData.taxAccount,
                status: 1,
                checkStatus: 2
            })
        });
        message.info('查验成功');
        return res;
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
            const nextWaitListData = this.state.waitListData.map((item) => {
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
            });
            let nextActiveWaitInvoiceType = this.state.activeWaitInvoiceType;
            const currentActiveWaitInvoiceTypeData = nextWaitListData.find(item => 'k' + item.invoiceType === this.state.activeWaitInvoiceType);
            if ((!currentActiveWaitInvoiceTypeData || currentActiveWaitInvoiceTypeData.length === 0) && nextWaitListData.length > 0) {
                nextActiveWaitInvoiceType = 'k' + nextWaitListData[0].invoiceType;
            }
            this.setState({
                curEditInfo: {},
                waitListData: nextWaitListData,
                activeWaitInvoiceType: nextActiveWaitInvoiceType
            });
        } else {
            const nextListDate = this.state.listData.map((item) => {
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
            });
            let nextActiveInvoiceType = this.state.activeInvoiceType;
            const currentActiveInvoiceTypeeData = nextListDate.find(item => 'k' + item.invoiceType === this.state.activeInvoiceType);
            if ((!currentActiveInvoiceTypeeData || currentActiveInvoiceTypeeData.length === 0) && nextListDate.length > 0) {
                nextActiveInvoiceType = 'k' + nextListDate[0].invoiceType;
            }
            this.setState({
                curEditInfo: {},
                listData: nextListDate,
                activeInvoiceType: nextActiveInvoiceType
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
            billTypeCode: 'FPY-MOP',
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
            billTypeCode: 'FPY-MOP',
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

    startScanQr = () => {
        if (this._isMounted) {
            this.tick = setTimeout(() => {
                if (this.state.showInput) {
                    if (this.qrInput) {
                        this.qrInput.click();
                        this.qrInput.focus();
                    }
                }
                this.startScanQr();
                return false;
            }, 200);
        }
    }

    hideScanQr = () => {
        this.qrInput.value = '';
        this.setState({
            showQrInput: false
        });
        window.clearTimeout(this.tick);
    }

    toggleScanQr = () => {
        this.qrInput.value = '';
        const newStatus = !this.state.showQrInput;
        this.setState({
            showQrInput: newStatus
        });

        if (newStatus) {
            this.startScanQr();
        } else {
            window.clearTimeout(this.tick);
        }
    }

    blockChain = async(result) => {
        message.loading('处理中...', 0);
        const { bill_num, total_amount, hash } = result;
        const res = await pwyFetch(this.props.checkBlockChainUrl, {
            method: 'post',
            data: {
                invoiceNo: bill_num,
                totalAmount: total_amount,
                txHash: hash,
                billTypeCode: 'FPY-MOP',
                isCreateUrl: 1,
                verifyCollect: 1
            }
        });
        message.destroy();
        if (res.errcode !== '0000') {
            if (res.description.indexOf('许可已到期') != '-1' || res.description.indexOf('无票量') != '-1') {
                Modal.confirm({
                    title: '权益许可到期提醒',
                    content: res.description,
                    cancelText: '关闭',
                    okText: '更多',
                    onOk: () => {
                        window.open(window.staticUrl + '/static/stoptaking/index.html');
                    }
                });
            } else {
                message.info(res.description);
            }
            return res;
        }
        let uuid = this.batchNo || '';
        if (uuid === '') {
            uuid = this.getUUId();
            this.batchNo = uuid;
        }
        const resData = res.data;
        // 检测重复
        if (resData.isRepeat) {
            message.warning('该影像文件已采集，请不要重复采集！');
            return res;
        }
        const waitListData = this.state.waitListData.map((item) => {
            return item.serialNo;
        });
        if (waitListData.indexOf(resData.serialNo) !== -1) {
            message.info('该发票已存在待采集列表中！');
            return res;
        }
        const checkCode = resData.checkCode || '';
        this.setState({
            waitListData: this.state.waitListData.concat({
                ...resData,
                checkCode: checkCode.substr(0, 6),
                invoiceAmount: resData.invoiceAmount || resData.amount,
                totalTaxAmount: resData.totalTaxAmount || resData.taxAccount,
                status: 1,
                checkStatus: 2
            })
        });
        message.info('查验成功');
        return res;
    }

    onQrInputKeyUp = async(e) => {
        if (e.keyCode === 13) {
            this.disabledInput = true;
            const v = this.qrInput.value;
            this.qrInput.value = '';
            const scanResult = tools.getInvoiceQrInfoNew(v);
            if (scanResult.errcode === '0000') {
                if (scanResult.qrcodeType === 'web') {
                    const { bill_num, total_amount, hash } = scanResult.data;
                    this.blockChain({ bill_num, total_amount, hash });
                } else {
                    const { fpdm, fphm, amount, jym, kprq } = scanResult.data;
                    if (!fpdm.trim() && fphm.length === 20) {
                        await this.checkSingleInvoice({
                            billTypeCode: 'FPY-MOP',
                            invoiceCode: fpdm.trim(),
                            invoiceNo: fphm,
                            totalAmount: amount,
                            checkCode: jym.trim(),
                            invoiceDate: moment(kprq, 'YYYYMMDD').format('YYYY-MM-DD')
                        });
                    } else {
                        await this.checkSingleInvoice({
                            billTypeCode: 'FPY-MOP',
                            invoiceCode: fpdm,
                            invoiceNo: fphm,
                            invoiceMoney: amount,
                            checkCode: jym,
                            invoiceDate: moment(kprq, 'YYYYMMDD').format('YYYY-MM-DD')
                        });
                    }
                }
            } else {
                message.info(scanResult.description);
            }
            this.qrInput.focus();
            this.qrInput.value = '';
        }
    }

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

    onScanFiles = () => {
        message.loading('处理中...');
        let uuid = this.batchNo || '';
        if (uuid === '') {
            uuid = this.getUUId();
            // this.setState({
            //     listData: []
            // });
            this.batchNo = uuid;
        }
        let serviceOverModal = false;
        let description = '';
        this.asyncScanFiles.startScan({
            filename: 'RemoteFile',
            data: {
                batchNo: uuid,
                resource: inputResource.k3.value
            },
            stepUploadStart: async(info) => {
                this.setState({
                    uploading: true
                });
                return { errcode: '0000', descripton: 'success' };
            },
            stepUploadFinish: (res, fileInfo) => { // 每一步上传处理完成后的回调 formData.append('originalFilename', file.name);
                const result = this.insertFileName(res, fileInfo.file.name);
                if (result.description.indexOf('许可已到期') != -1 || result.description.indexOf('无票量') != -1) {
                    serviceOverModal = true;
                    description = result.description;
                }
                this.handlerUploadRes(result, fileInfo.file);
            },
            uploadFinish: (res) => {
                this.loadingLog = null;
                message.destroy();
                if (serviceOverModal) {
                    Modal.confirm({
                        title: '权益许可到期提醒',
                        content: description,
                        cancelText: '关闭',
                        okText: '更多',
                        onOk: () => {
                            window.open(window.staticUrl + '/static/stoptaking/index.html');
                        }
                    });
                } else {
                    message.info(res.description);
                }
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
            imgSrc, curImgType, showInput, showQrInput,
            activeTab,
            waitListData = []
        } = this.state;
        if (uploading && !this.loadingLog) {
            this.loadingLog = message.loading('处理中...', 0);
        }
        const { userSource } = this.props;
        const allAccept = '.pdf,.PDF,.ofd,.OFD,.xml,.XML,.zip,.ZIP';
        return (
            <div className='plFpCheck'>
                <div className='clearfix btns' style={{ padding: '0 20px 10px 20px', boxSizing: 'border-box', marginBottom: 0 }}>
                    <div className='floatLeft'>
                        <Upload {...this.getUploadProps('.jpg,.JPG,.jpeg,.JPEG,.png,.PNG,.tif,.TIF,.pdf,.PDF,.ofd,.OFD')} className='inlineBlock'>
                            <Tooltip placement='topLeft' title='支持PNG、JPG格式的图片，文件不能大于12MB； 支持PDF、OFD文件，单文件不能超过10页'>
                                <Button type='primary' className='btn' style={{ marginRight: 16 }} disabled={uploading}>文件上传</Button>
                            </Tooltip>
                        </Upload>
                        <Upload {...this.getUploadProps(allAccept, 'allEle')} className='inlineBlock' style={{ position: 'relative' }}>
                            <Tooltip placement='bottomLeft' title='支持只有20位发票号码且无发票代码的数电票版式PDF、OFD、XML、含单个XML的ZIP文件，不支持图片或扫描PDF'>
                                <Button type='primary' style={{ marginRight: 16, fontSize: 12, padding: '0 8px' }}>上传数电票PDF/OFD/XML</Button>
                            </Tooltip>
                        </Upload>
                        <Tooltip placement='topLeft' title='支持增值税发票、机动车销售发票、二手车销售发票、数电票'>
                            <Button onClick={() => this.setState({ showInput: true, showQrInput: false })} style={{ marginRight: 16 }}>手工录入</Button>
                        </Tooltip>
                        <Button style={{ marginRight: 16 }} onClick={this.toggleScanQr}>
                            扫码枪采集
                            <Icon type={showQrInput ? 'up' : 'down'} />
                        </Button>
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
                </div>
                <div
                    className='scanQrBox clearfix'
                    style={{
                        display: showQrInput ? 'block' : 'none',
                        border: '1px solid #d9d9d9',
                        padding: '10px',
                        margin: '0px 0 10px',
                        background: '#fbfbfb',
                        minWidth: 1178
                    }}
                >
                    <label>扫描枪录入：</label>
                    <input
                        type='text'
                        autoFocus
                        id='qrStrInput'
                        defaultValue=''
                        className='ant-input'
                        onKeyUp={this.onQrInputKeyUp}
                        placeholder='请当光标在输入框后开始扫码'
                        style={{ width: 220 }}
                        autoComplete='off'
                    />
                    <span style={{ fontSize: 12, margin: '0 15px', color: '#FF9524' }}>注意：使用扫码枪时需要把结束符设置为回车, 不要开启中文输入法，否则可能出现异常</span>
                    <a href='https://jingyan.baidu.com/article/363872ec3b3a3a6e4ba16fc0.html' target='_blank' rel='noopener noreferrer'>扫码枪设置方法</a>
                    <Button style={{ float: 'right' }} onClick={this.hideScanQr}>收起</Button>
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
                                        userSource={userSource}
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
                                        userSource={userSource}
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
                    visible={showInput}
                    title='手工录入采集发票'
                    onCancel={() => this.setState({ showInput: false })}
                    width={600}
                    top={30}
                    footer={null}
                >
                    <CheckInvocieByInput onCheckInvoice={this.checkSingleInvoice} />
                </Modal>

                <Modal
                    visible={!!curEditInfo.recognitionSerialNo || !!curEditInfo.serialNo}
                    title='编辑发票信息'
                    onCancel={() => this.setState({ curEditInfo: {} })}
                    width={1000}
                    top={30}
                    footer={null}
                    className='fpyDialogx'
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


CollectInvoicesToHgx.propTypes = {
    onConformInvoiceUpload: PropTypes.string,
    checkBlockChainUrl: PropTypes.string,
    onConformInvoiceInsert: PropTypes.func,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    scanFileStaticJs: PropTypes.array,
    exporting: PropTypes.bool,
    userSource: PropTypes.number
};

export default CollectInvoicesToHgx;