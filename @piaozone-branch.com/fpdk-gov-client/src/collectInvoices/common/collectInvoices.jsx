import React from 'react';
import { Button, message, Upload, Icon, Modal, Tooltip, Dropdown, Menu } from 'antd';
import { pwyFetch, tools } from '@piaozone.com/utils';
import async from 'async';
import moment from 'moment';
import { confirm } from '../../commons/antdModal';
import ShowCollectResult from '../showCollectResult';
import EditInvoice from '@piaozone.com/editInvoice-pc';
import PropTypes from 'prop-types';
import { inputResource, INPUT_INVOICE_TYPES } from '../../commons/constants';
import { PwyAsyncScanFiles } from '@piaozone.com/scanFiles';
import CheckInvocieByInput from '@piaozone.com/checkInvoiceByInput';
import ImportGovJxxZip from '../../importGovJxxZip/';
const iconTp = require('../../commons/img/icon_tp.png');
const addedInvoiceTypes = INPUT_INVOICE_TYPES.filter((item) => {
    return item.isAddedTax;
}).map((item) => {
    return item.value;
});

const limit = 1;
class CollectInvoices extends React.Component {
    constructor(props) {
        super(...arguments);
        this.uploadingUids = [];
        this.uploadingScanUids = [];
        this.uploading = 'init';
        this.batchNo = '';
        this.maxUploadSize = 10 * 1024 * 1024;
        this.invoiceTabsData = {};
        this.state = {
            miniQrSrc: '',
            curEditInfo: {},
            uploading: false,
            listData: [],
            scanInfoList: [],
            fileInfoList: [],
            repeatInfoList: [],
            activeInvoiceType: '',
            userSource: props.userSource || 1, //8:epson的配置，1通用
            recodeList: [], //待记录文件 来源：文件上传，全电票上传
            recodeUploadedList: [], //记录上传成功的数据
            recodeUploadFailList: [], //记录上传失败的数据
            showMiniProgramQr: false,
            oldUserKey: ''
        };
        //文件：
        // const recodeList = []; //待记录文件 来源：文件上传，全电票上传
        // const recodeUploadedList= [
        //     {uploadFileName:'文件名称.png', des: '', uploadDate: '2022-01-23', successNum: 2, status: '1'}
        // ];
        // const recodeUploadFailList= [
        //     {uploadFileName:'文件名称.jep', des: '失败原因', uploadDate: '2022-01-23', successNum: 0, status: '2'}
        // ];
    }

    componentDidMount() {
        this.uploadNum = 0;
        this.uploaded = 0;
        this._isMounted = true;
        this.qrInput = document.getElementById('qrStrInput');
        window.clearTimeout(this.tick);
        this.asyncScanFiles = new PwyAsyncScanFiles({
            version: 16,
            staticUrl: window.staticUrl, // 指定加载扫描仪库文件的根路径
            needRegonizeQr: false, // 开启识别二维码
            uploadUrl: this.props.recognizeUrl // 上传路径
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

    removeFile = (f, flag = 'scan') => {
        confirm({
            title: '确认提示',
            content: '确定删除？',
            onOk: async() => {
                if (flag === 'scan') {
                    this.setState({
                        scanInfoList: this.state.scanInfoList.map((item) => {
                            if (item.uid === f.uid) {
                                return { ...item, errcode: '0000' };
                            } else {
                                return item;
                            }
                        })
                    });
                } else if (flag === 'repeat') {
                    this.setState({
                        repeatInfoList: this.state.repeatInfoList.filter((item) => {
                            return item.uid !== f.uid;
                        })
                    });
                } else {
                    this.setState({
                        fileInfoList: this.state.fileInfoList.filter((item) => {
                            return item.uid !== f.uid;
                        })
                    });
                }
            }
        });
    }

    getUploadProps(accept, type) {
        return {
            beforeUpload: (file, files) => {
                this.uploading = 'init';
                const nameArr = file.name.split('.');
                const extName = nameArr[nameArr.length - 1];
                console.log('extName------', extName);
                const acceptArr = accept.split(',');
                if (acceptArr.indexOf('.' + extName) === -1) {
                    message.info('文件格式不支持!');
                    return false;
                } else {
                    if (this.batchNo === '') {
                        this.setState({
                            listData: []
                        });
                        this.batchNo = this.getUUId();
                    }

                    const items = files.map((item) => {
                        if (type && type === 'allEle') {
                            return { file: item, uid: this.getUUId(), name: item.name, size: item.size, errcode: 'init', type };
                        } else {
                            return { file: item, uid: this.getUUId(), name: item.name, size: item.size, errcode: 'init' };
                        }
                    });
                    this.setState({
                        fileInfoList: this.state.fileInfoList.concat(items),
                        recodeList: this.state.recodeList.concat(items) //待记录上传数据 （EXCEL导出需要）
                    });

                    return false;
                }
            },
            accept: accept,
            showUploadList: false,
            multiple: true
        };
    }

    uploadFile = async(postData, uid) => {
        const res = await pwyFetch(this.props.recognizeUrl, {
            method: 'post',
            data: postData,
            contentType: 'file'
        });
        return res;
    }

    delCommon = (list) => {
        var obj = {};
        var result = list.reduce((item, next) => {
            if (!obj[next.uploadFileName]) {
                obj[next.uploadFileName] = true;
                item.push(next);
            }
            return item;
        }, []);
        return result;
    }

    handlerUploadRes = (res, uid, uploadType = 'upload') => {
        //res:{errcode: '0365', description: '该影像文件已采集，请不要重复采集', data: null}
        const errcode = res.errcode || 'error';
        const description = res.description || '服务端异常，请重试！';
        const resData = res.data || [];
        let newFileInfoList = this.state.fileInfoList;
        let newFileScanInfoList = this.state.scanInfoList;
        let recodeUploadedList = [];
        let recodeUploadFailList = [];
        let uploadedList = [];
        if (uploadType === 'upload') {
            newFileInfoList = this.state.fileInfoList.map((item) => { //修改进度条状态，errcode为0000自动消失，并不再处理
                if (item.uid === uid) {
                    return { ...item, errcode, description };
                } else {
                    return item;
                }
            }).filter((info) => {
                return info.errcode !== '0000';
            });
            let uploadedLen = 0;
            if (resData.length > 0) {
                for (const item of resData) {
                    const { serialNo } = item;
                    if (serialNo) {
                        uploadedLen += 1;
                    }
                }
                uploadedList = [
                    {
                        uploadFileName: resData[0].fileName,
                        des: '文件上传成功',
                        uploadDate: moment().format('YYYY-MM-DD'),
                        successNum: uploadedLen,
                        status: '1'
                    }
                ];
            }
            recodeUploadedList = this.state.recodeUploadedList.concat(uploadedList);
            recodeUploadedList = this.delCommon(recodeUploadedList); //去重
            const uploadFailList = newFileInfoList.filter((item) => {
                return item.errcode != 'init' && item.errcode != '0000';
            });
            recodeUploadFailList = uploadFailList.map((item) => { //导入失败的数据
                return {
                    uploadFileName: item.name,
                    des: item.description,
                    uploadDate: moment().format('YYYY-MM-DD'),
                    successNum: 0,
                    status: '2'
                };
            });
            recodeUploadFailList = this.delCommon(recodeUploadFailList);
        } else if (uploadType === 'scan') {
            newFileScanInfoList = this.state.scanInfoList.map((item) => { //修改进度条状态，errcode为0000自动消失，并不再处理
                if (item.uid === uid) {
                    return { ...item, errcode, description };
                } else {
                    return item;
                }
            }).filter((info) => {
                return info.errcode !== '0000';
            });
        }

        this.uploadingUids.splice(this.uploadingUids.indexOf(uid), 1);
        this.setState({
            fileInfoList: newFileInfoList,
            recodeUploadedList: recodeUploadedList,
            recodeUploadFailList, //采集失败的列表
            scanInfoList: newFileScanInfoList,
            listData: resData.filter((item) => { //添加数据时，检测是否重复
                let flag = -1;
                for (let i = 0; i < this.state.listData.length; i++) {
                    if (this.state.listData[i].recognitionSerialNo === item.recognitionSerialNo) {
                        flag = i;
                        break;
                    }
                    //文件上传的非增值发票serialNo字段为空
                    // const { invoiceType = '' } = item;
                    // if (addedInvoiceTypes.indexOf(invoiceType) == '-1') {
                    //     if (!item.serialNo) {
                    //         item.serialNo = item.recognitionSerialNo;
                    //         //item.saveErr = true; //临时加的
                    //     }

                    // } // 扫码枪和手工录入的发票没有识别流水号，
                }

                if (flag === -1) {
                    return true;
                } else {
                    return false;
                }
            }).concat(this.state.listData)
        });


        if (errcode === '0000') {
            if (resData.length > 0) {
                this.checkInvoices(resData);
                for (let i = 0; i < resData.length; i++) {
                    if (resData[i].isRepeat) {
                        this.hasRepeatInvoice++;
                    }
                }
            }
        }
    }

    createUploadStatus = (info) => {
        const { errcode, description } = info;
        if (errcode === '0000') {
            return (
                <span>
                    <Icon type='check-circle' />
                </span>
            );
        } else if (errcode === 'uploading') {
            return (
                <span>
                    <span>处理中... </span>
                    <Icon type='loading' />
                </span>
            );
        } else if (errcode === 'init') {
            return (
                <span>
                    <span>等待中... </span>
                </span>
            );
        } else {
            const openUrl = () => {
                window.open(window.staticUrl + '/static/stoptaking/index.html');
            };
            if (description.indexOf('许可已到期') != '-1' || description.indexOf('无票量') != '-1') {
                return (
                    <div
                        title={description}
                        style={{ wordSpacing: 'normal', display: 'inline-block', wordBreak: 'break-all', width: 300, verticalAlign: 'text-top' }}
                    >
                        <div style={{ maxWidth: 300 }}>
                            {description}, 操作详情请点击:
                            <span onClick={openUrl} style={{ color: '#3598ff', cursor: 'pointer' }}>
                                {window.staticUrl + '/static/stoptaking/index.html'}
                            </span>
                        </div>
                    </div>
                );
            } else {
                return (
                    <span style={{ color: 'red' }}>
                        <span>{description}</span>
                    </span>
                );
            }
        }
    }

    //检测查验是否完成
    startCheckTime = (initNum) => {
        if (typeof initNum === 'undefined') {
            initNum = 0;
        }

        this.incTick = setTimeout(() => {
            const filterList = this.state.listData.filter((item) => {
                if (typeof item.status === 'undefined') {
                    return false;
                } else {
                    return item.status != 1; //为1表示不需要处理
                }
            });

            if (filterList.length === 0) {
                message.destroy();
                message.success('处理完成');
                if (this.hasRepeatInvoice > 0) {
                    this.hasRepeatInvoice = 0;
                    message.warning('影像文件包含已采集发票，请注意查看', 3);
                }
                this.uploading = 'init';
            } else {
                this.startCheckTime(initNum + 1);
            }
            return false;
        }, 1000);
    }

    onUpload = () => {
        const scanInfoList = this.state.scanInfoList.filter((item) => {
            const description = item.description || '';
            return item.errcode !== '0000' && description.indexOf('已采集') === -1;
        });
        const waitFileList = this.state.fileInfoList.filter((item) => {
            const description = item.description || '';
            return item.errcode !== '0000' && description.indexOf('已采集') === -1;
        }).concat(scanInfoList);
        if (waitFileList.length === 0) {
            message.info('没有需要处理的发票');
            return;
        }

        message.loading('处理中...', 0);

        if (window.DWObject) {
            window.DWObject.IfShowProgressBar = false;
            window.DWObject.IfShowCancelDialogWhenImageTransfer = false;
        }

        this.setState({
            uploading: true
        });
        async.mapLimit(waitFileList, limit, async(fileInfo, callback) => {
            let res;
            const fileResource = fileInfo.resource || 'upload';

            this.uploadingUids.push(fileInfo.uid);
            if (fileResource === 'upload') {
                this.setState({
                    fileInfoList: this.state.fileInfoList.map((info, idx) => {
                        if (this.uploadingUids.indexOf(info.uid) !== -1) {
                            return { ...info, errcode: 'uploading' };
                        } else {
                            return info;
                        }
                    })
                });
                const formData = new FormData();
                formData.append('batchNo', this.batchNo);
                formData.append('resource', inputResource.k2.value); //来源为PC端上传
                formData.append('RemoteFile', fileInfo.file);
                formData.append('originalFilename', fileInfo.file.name);
                const type = fileInfo.type;
                if (type === 'allEle') {
                    formData.append('recogType', 1);
                }
                res = await this.uploadFile(formData, fileInfo.uid);
                res = this.insertFileName(res, fileInfo.file.name);
                this.handlerUploadRes(res, fileInfo.uid);
            } else {
                this.setState({
                    scanInfoList: this.state.scanInfoList.map((info, idx) => {
                        if (this.uploadingUids.indexOf(info.uid) !== -1) {
                            return { ...info, errcode: 'uploading' };
                        } else {
                            return info;
                        }
                    })
                });
                res = await this.asyncScanFiles.uploadFile(fileInfo, {
                    batchNo: this.batchNo,
                    resource: inputResource.k3.value
                }, 'RemoteFile');
                res = this.insertFileName(res, fileInfo.file.name);
                this.handlerUploadRes(res, fileInfo.uid, 'scan');
            }

            callback(null, res);
        }, (err) => {
            if (err) {
                console.error(err);
            }
            this.startCheckTime();
            this.uploading = 'uploaded';
            this.setState({
                uploading: false
            });
        });
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

    async checkInvoices(listData, startTime, checkIng) {
        checkIng = typeof checkIng === 'undefined' ? true : checkIng;
        if (typeof startTime === 'undefined') {
            startTime = +new Date();
        }

        const curDate = +new Date();
        if (curDate - startTime > 15 * 1000) {
            checkIng = false;
        }

        for (let i = 0; i < listData.length; i++) {
            const curData = listData[i];
            const { invoiceMoney = '', invoiceAmount = '', invoiceCode = '', invoiceNo = '', checkCode = '', totalAmount = '' } = curData;
            let invoiceType = curData.invoiceType || '';
            let invoiceDate = curData.invoiceDate || '';

            if (invoiceType !== '' && curData.status !== 1) {
                invoiceType = parseInt(invoiceType);
                //可以查验的发票
                const addedTax = [
                    1, //电子普通发票, jym
                    2, // 电子专票 je
                    3, //普通纸质发票 jym
                    4, //专用纸质发票 je
                    5, //普通纸质卷票  jym
                    12, //机动车发票 je
                    13, //二手车发票 je
                    15, //通行费 jym
                    26, //数电普票
                    27, //数电专票
                    28, // 数电飞机票
                    29, // 数电火车票
                    83, // 数电机动车
                    84, // 数电二手车
                ];
                if (addedTax.indexOf(invoiceType) !== -1) {
                    if ((invoiceMoney !== '' || invoiceAmount !== '' || checkCode !== '' || totalAmount !== '') && invoiceNo !== '' && invoiceDate != '') {
                        invoiceDate = moment(invoiceDate, 'YYYYmmDD').format('YYYY-mm-DD');
                        let tempKpje = parseFloat(invoiceMoney || invoiceAmount);
                        if (tempKpje !== '' && !isNaN(tempKpje)) {
                            tempKpje = tempKpje.toFixed(2);
                        } else {
                            tempKpje = '';
                        }
                        const kpjeJy = (invoiceType === 2 || invoiceType === 4 || invoiceType === 12 || invoiceType === 13) &&
                        invoiceCode !== '' &&
                        tempKpje !== '';
                        const checkCodeJy =
                        (invoiceType === 1 || invoiceType === 3 || invoiceType === 5 || invoiceType === 15) &&
                        invoiceCode !== '' &&
                        checkCode !== '';
                        const allEleJy = (invoiceType === 26 || invoiceType === 27|| invoiceType === 28|| invoiceType === 29|| invoiceType === 83|| invoiceType === 84) && totalAmount !== '';
                        if (kpjeJy || checkCodeJy || allEleJy) {
                            const res = await this.props.onCheckInvoice({
                                dataSource: 1,
                                batchNo: this.batchNo,
                                ...curData,
                                recognitionSerialNo: curData.recognitionSerialNo,
                                invoiceCode,
                                invoiceNo,
                                invoiceDate: invoiceDate,
                                invoiceMoney: tempKpje,
                                invoiceAmount: tempKpje,
                                checkCode,
                                formType: curData.formType, //第几联
                                companySeal: curData.companySeal,
                                snapshotUrl: curData.snapshotUrl, // 解决卷票不显示图片的问题
                                ofdUrl: curData.ofdUrl || '' // 支持查验ofd发票
                            }) || {};

                            this.setState({
                                listData: this.state.listData.map((info) => {
                                    if (info.recognitionSerialNo === curData.recognitionSerialNo) {
                                        if (res.errcode === '0000') {
                                            curData.status = 1; // 已调用查验接口
                                            const resData = res.data || {};
                                            return {
                                                ...info,
                                                invoiceType: resData.invoiceType || invoiceType || '',
                                                buyerName: resData.buyerName || info.buyerName || '',
                                                buyerTaxNo: resData.buyerTaxNo || info.buyerTaxNo || '',
                                                salerName: resData.salerName || info.salerName || '',
                                                salerTaxNo: resData.salerTaxNo || info.salerTaxNo || '',
                                                checkCode: resData.checkCode || info.checkCode || '',
                                                taxRate: resData.taxRate || info.taxRate || '',
                                                taxAccount: resData.taxAccount || info.taxAccount || '',
                                                invoiceStatus: resData.invoiceStatus || info.invoiceStatus || '',
                                                status: 1,
                                                checkStatus: 2,
                                                invoiceAmount: resData.invoiceAmount || info.invoiceAmount || '', // 查验覆盖识别,
                                                totalTaxAmount: resData.totalTaxAmount || info.totalTaxAmount || '', // 查验覆盖识别
                                                totalAmount: resData.totalAmount || info.totalAmount || '',
                                                invoiceDate: moment(resData.invoiceDate, 'YYYYmmDD').format('YYYY-mm-DD') || info.invoiceDate || ''
                                            };
                                        } else {
                                            curData.status = 1;
                                            return {
                                                ...info,
                                                checkDescription: res.description || '查验异常',
                                                status: checkIng === false ? 1 : info.status //查验超时结束，标识为结束状态
                                            };
                                        }
                                    } else {
                                        return info;
                                    }
                                })
                            });
                        } else {
                            curData.status = 1;
                            this.setState({
                                listData: this.state.listData.map((info) => {
                                    if (info.recognitionSerialNo === curData.recognitionSerialNo) {
                                        return {
                                            ...info,
                                            status: 1
                                        };
                                    } else {
                                        return info;
                                    }
                                })
                            });
                        }
                    } else {
                        curData.status = 1;
                        this.setState({
                            listData: this.state.listData.map((info) => {
                                if (info.recognitionSerialNo === curData.recognitionSerialNo) {
                                    return {
                                        ...info,
                                        status: 1
                                    };
                                } else {
                                    return info;
                                }
                            })
                        });
                    }
                }
            }
        }


        const filterList = listData.filter((item) => {
            return item.status != 1;
        });

        if (checkIng && filterList.length > 0) {
            setTimeout(() => {
                this.checkInvoices(filterList, startTime, checkIng);
            }, 3000);
        }
    }

    onExportExcel = () => {
        this.props.onExportExcel(this.batchNo, this.state.listData.map((item) => {
            return item.serialNo;
        }));
    }

    onExportRecodeExcel = () => {
        confirm({
            title: '温馨提示',
            content: '确认导出？',
            onOk: async() => {
                const { recodeUploadFailList, recodeUploadedList } = this.state;
                const result = recodeUploadFailList.concat(recodeUploadedList);
                this.props.onExportRecodeExcel(result);
            }
        });
    }

    onReset = () => {
        confirm({
            content: '确定要清空吗？',
            onOk: async() => {
                message.destroy();
                this.setState({
                    listData: [],
                    scanInfoList: [],
                    fileInfoList: [],
                    repeatInfoList: [],
                    curIndex: '',
                    invoiceImg: '',
                    serialNo: '',
                    activeInvoiceType: '',
                    visible: false
                });
                this.batchNo = '';
                this.uploading = 'init';
                this.stop = true;
                this.uploadingUids = [];
                this.uploadingScanUids = [];
            }
        });
    };

    changeInvoiceTab = (info) => {
        this.setState({
            activeInvoiceType: info.key
        });
    }

    onShowEditDialog = (r, i, disabledEdit) => {
        this.setState({
            curEditInfo: r,
            disabledEdit
        });
    }

    onScanFiles = () => {
        message.loading('处理中...');
        let uuid = this.batchNo || '';
        if (uuid === '') {
            uuid = this.getUUId();
            this.setState({
                listData: []
            });
            this.batchNo = uuid;
        }
        this.asyncScanFiles.startScan({
            filename: 'RemoteFile',
            data: {
                batchNo: uuid,
                resource: inputResource.k3.value
            },
            addUploadProgress: async(item) => {
                this.setState({
                    scanInfoList: this.state.scanInfoList.concat({ ...item, uid: item.id, errcode: 'init', description: '等待处理', resource: 'scan' })
                });
            },
            stepUploadStart: async(info) => {
                this.setState({
                    uploading: true,
                    scanInfoList: this.state.scanInfoList.map((item) => {
                        if (item.uid === info.id) {
                            return { ...item, uid: item.id, errcode: 'uploading', description: '处理中...', resource: 'scan' };
                        } else {
                            return item;
                        }
                    })
                });
                return { errcode: '0000', descripton: 'success' };
            },
            stepUploadFinish: (res, fileInfo) => { // 每一步上传处理完成后的回调
                const result = this.insertFileName(res, fileInfo.file.name);
                this.handlerUploadRes(result, fileInfo.id, 'scan');
            },
            uploadFinish: (res) => {
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


    showImage = (info) => {
        if (info.imgSrc) { // 扫描仪获取的图像
            this.setState({
                curImgType: 'image/jpeg',
                showImageDialog: true,
                imgSrc: info.imgSrc
            });
        } else if (!info.file) {
            message.warning('该发票无文件');
        } else if (window.FileReader) {
            var reader = new FileReader();
            // 创建文件读取相关的变量
            var imgFile;

            reader.onload = (e) => {
                imgFile = e.target.result;
                this.setState({
                    curImgType: info.file.type,
                    showImageDialog: true,
                    imgSrc: imgFile
                });
            };
            reader.readAsDataURL(info.file);
        } else {
            message.warning('该浏览器不支持本地文件查看，请使用火狐或者Google浏览器');
        }
    }

    onConfirmEdit = (info = {}, invoiceData) => {
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
                            recoErrorMsg: null,
                            recognitionSerialNo // 流水号可能发生变化
                        };
                    } else {
                        if (info.serialNo) {
                            return {
                                ...item,
                                ...invoiceData,
                                ...info,
                                invoiceType,
                                recoErrorMsg: null,
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
                    }
                } else {
                    return item;
                }
            })
        });
    }

    onDeleteInvoice = (r) => {
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
                            listData: []
                        });
                    }
                } else {
                    message.info(res.description);
                }
            }
        });
    }

    getWxQr = async() => {
        const { oldUserKey } = this.state;
        this.setState({
            showMiniProgramQr: true,
            showMiniProgramQrErr: ''
        });

        // if (this.state.miniQrSrc) {
        //     return;
        // }

        const res = await this.props.onGetWxQr({ oldUserKey });
        let errMsg;
        if (res.errcode === '0000') {
            const resData = res.data;
            if (resData.qrCodeBase64) {
                const { repeat, userKey } = resData;
                this.setState({
                    miniQrSrc: 'data:image/png;base64,' + resData.qrCodeBase64,
                    repeat,
                    oldUserKey: userKey
                });
            } else {
                errMsg = '获取二维码数据为空';
                this.setState({
                    showMiniProgramQrErr: errMsg + '，点击重试！',
                    miniQrSrc: ''
                });
            }
        } else {
            errMsg = res.description + '[' + res.errcode + ']';
            this.setState({
                showMiniProgramQrErr: errMsg + '，点击重试！',
                miniQrSrc: ''
            });
        }
    }

    checkSingleInvoice = async(opt) => {
        message.loading('处理中...', 0);
        const res = await this.props.onCheckInvoice({
            ...opt,
            isCreateUrl: 1
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
            const uid = resData.invoiceCode + resData.invoiceNo;
            const info = {
                uid,
                errcode: '1999',
                description: '该影像文件已采集，请不要重复采集！',
                name: `发票代码 ${resData.invoiceCode} 发票号码 ${resData.invoiceNo}`,
                imgSrc: resData.snapshotUrl
            };
            let alreadyExist = false;
            for (const o of this.state.repeatInfoList) {
                if (o.uid === uid) {
                    alreadyExist = true;
                    break;
                }
            }
            // 避免重复添加
            if (!alreadyExist) this.setState({ repeatInfoList: this.state.repeatInfoList.concat(info) });
            return res;
        }

        const listDataNos = this.state.listData.map((item) => {
            return item.serialNo;
        });

        if (listDataNos.indexOf(resData.serialNo) !== -1) {
            message.info('该发票已存在列表中！');
            return res;
        }
        const checkCode = resData.checkCode || '';

        this.setState({
            listData: this.state.listData.concat({
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
                isCreateUrl: 1
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
            const uid = resData.invoiceCode + resData.invoiceNo;
            const info = {
                uid,
                errcode: '1999',
                description: '该影像文件已采集，请不要重复采集！',
                name: `发票代码 ${resData.invoiceCode} 发票号码 ${resData.invoiceNo}`,
                imgSrc: resData.snapshotUrl
            };
            let alreadyExist = false;
            for (const o of this.state.repeatInfoList) {
                if (o.uid === uid) {
                    alreadyExist = true;
                    break;
                }
            }
            // 避免重复添加
            if (!alreadyExist) this.setState({ repeatInfoList: this.state.repeatInfoList.concat(info) });
            return res;
        }

        const listDataNos = this.state.listData.map((item) => {
            return item.serialNo;
        });

        if (listDataNos.indexOf(resData.serialNo) !== -1) {
            message.info('该发票已存在列表中！');
            return res;
        }
        const checkCode = resData.checkCode || '';

        this.setState({
            listData: this.state.listData.concat({
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
                            invoiceCode: fpdm.trim(),
                            invoiceNo: fphm,
                            totalAmount: amount,
                            checkCode: jym.trim(),
                            invoiceDate: moment(kprq, 'YYYYMMDD').format('YYYY-MM-DD')
                        });
                    } else {
                        await this.checkSingleInvoice({
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

    uploadGovJxxFiles = async(uploadUrl, fileList) => {
        if (this.uploadJxx) {
            return false;
        }

        message.loading('处理中...', 0);
        this.uploadJxx = true;
        const formData = new FormData();
        let successList = [];
        let failList = [];
        let totalNum = 0;
        let description = '';
        for (let i = 0; i < fileList.length; i++) {
            formData.append('files', fileList[i], fileList[i].name);
            const res = await pwyFetch(uploadUrl, {
                method: 'post',
                contentType: 'file',
                data: formData
            });
            description = res.description || '服务端异常，请稍后再试！';
            const resData = res.data || {};
            const curSuccessList = resData.successFiles || [];
            successList = successList.concat(curSuccessList);
            failList = failList.concat(resData.failFiles || []);
            if (curSuccessList.length > 0) {
                totalNum += curSuccessList[0].num;
            }
        }
        message.destroy();
        if (failList.length === 0 && successList.length > 0) {
            message.info('处理成功, 共添加' + totalNum + '张发票');
        } else {
            if (description.indexOf('许可已到期') != '-1' || description.indexOf('无票量') != '-1') {
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
                message.info(description);
            }
        }
        this.uploadJxx = false;
    }

    render() {
        const {
            disabledEdit, showMiniProgramQrErr, showMiniProgramQr,
            miniQrSrc, curEditInfo, uploading, listData = [],
            fileInfoList = [], scanInfoList = [], repeatInfoList = [],
            activeInvoiceType, showImageDialog,
            imgSrc, curImgType, showInput, showQrInput,
            showUploadJxx,
            userSource,
            recodeUploadedList,
            recodeUploadFailList
        } = this.state;
        const tempScanInfoList = scanInfoList.filter((item) => {
            return item.errcode !== '0000';
        });
        const allAccept = '.pdf,.PDF,.ofd,.OFD,.xml,.XML,.zip,.ZIP';
        const menu = (
            <Menu onClick={this.uploadGovFiles}>
                <Menu.Item key='1'>
                    <span onClick={() => this.setState({ showUploadJxx: true })}>进销项压缩包导入</span>
                </Menu.Item>
                <Menu.Item key='2'>
                    <Upload
                        className='inlineBlock'
                        accept='.zip'
                        showUploadList={false}
                        multiple={true}
                        beforeUpload={(info, list) => { this.uploadGovJxxFiles(this.props.uploadGxFileUrl, list); return false; }}
                    >
                        批量勾选压缩包导入
                    </Upload>
                </Menu.Item>
            </Menu>
        );

        return (
            <div className='plFpCheck'>
                <div className='clearfix btns' style={{ padding: '0 20px 10px 20px', boxSizing: 'border-box', marginBottom: 0 }}>
                    <div className='floatLeft'>
                        <Upload {...this.getUploadProps('.jpg,.JPG,.jpeg,.JPEG,.png,.PNG,.tif,.TIF,.pdf,.PDF,.ofd,.OFD')} className='inlineBlock'>
                            <Tooltip placement='topLeft' title='支持PNG、JPG格式的图片，文件不能大于12MB； 支持PDF、OFD文件，单文件不能超过10页'>
                                <Button type='primary' className='btn' style={{ marginRight: 16 }} disabled={uploading}>文件上传</Button>
                            </Tooltip>
                        </Upload>
                        <Upload
                            {...this.getUploadProps(allAccept, 'allEle')}
                            className='inlineBlock'
                            style={{ position: 'relative' }}
                        >
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
                        <Button onClick={this.getWxQr} style={{ marginRight: 16 }}>小程序采集</Button>
                        {
                            this.props.uploadJxxUrl && this.props.uploadGxFileUrl ? (
                                <Dropdown overlay={menu} onClick={this.uploadGovFiles}>
                                    <Button>税局文件导入&nbsp;<Icon type='down' /></Button>
                                </Dropdown>
                            ) : null
                        }
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
                        <Button
                            type='primary'
                            onClick={this.onUpload}
                            style={{ marginRight: 16 }}
                            disabled={uploading || (fileInfoList.length === 0 && tempScanInfoList.length === 0)}
                        >开始上传
                        </Button>
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
                <div className='waitUploadBox'>
                    <div className='waitUploadList'>
                        {
                            fileInfoList.map((info) => {
                                if (info.errcode === '0000') {
                                    return null;
                                } else {
                                    return (
                                        <div className='waitUploadItem clearfix' key={info.uid}>
                                            <div className='floatLeft'>{info.name}</div>
                                            <div className='floatRight'>
                                                {
                                                    info.errcode !== 'uploading' ? (
                                                        <a href='javascript:;' onClick={() => this.removeFile(info, 'file')} style={{ marginRight: 10 }}>删除</a>
                                                    ) : null
                                                }

                                                <a href='javascript:;' onClick={() => this.showImage(info)} style={{ marginRight: 10 }}>查看</a>
                                                {
                                                    this.createUploadStatus(info)
                                                }

                                            </div>
                                        </div>
                                    );
                                }
                            })
                        }
                        {
                            scanInfoList.map((info) => {
                                if (info.errcode === '0000') {
                                    return null;
                                } else {
                                    return (
                                        <div className='waitUploadItem clearfix' key={info.uid}>
                                            <div className='floatLeft'>{info.name}</div>
                                            <div className='floatRight'>
                                                {
                                                    info.errcode !== 'uploading' ? (
                                                        <a href='javascript:;' onClick={() => this.removeFile(info, 'scan')} style={{ marginRight: 10 }}>删除</a>
                                                    ) : null
                                                }

                                                <a href='javascript:;' onClick={() => this.showImage(info)} style={{ marginRight: 10 }}>查看</a>
                                                {
                                                    this.createUploadStatus(info)
                                                }

                                            </div>
                                        </div>
                                    );
                                }
                            })
                        }
                        {
                            repeatInfoList.map((info) => {
                                return (
                                    <div className='waitUploadItem clearfix' key={info.uid}>
                                        <div className='floatLeft'>{info.name}</div>
                                        <div className='floatRight'>
                                            <a href='javascript:;' onClick={() => this.removeFile(info, 'repeat')} style={{ marginRight: 10 }}>删除</a>
                                            <a href='javascript:;' onClick={() => this.showImage(info)} style={{ marginRight: 10 }}>查看</a>
                                            {
                                                this.createUploadStatus(info)
                                            }
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    {
                        recodeUploadedList.length != 0 || recodeUploadFailList.length != 0 ? (
                            <div style={{ height: 40, lineHeight: '40px', position: 'relative' }}>
                                <label style={{ paddingLeft: 10 }}>
                                    文件：采集成功<span style={{ color: '#3598ff', padding: '0 3px' }}>{recodeUploadedList.length}</span>份，
                                    采集失败<span style={{ color: 'red', padding: '0 3px' }}>{recodeUploadFailList.length}</span>份
                                </label>
                                <Tooltip placement='topLeft' title='仅限于文件上传和上传数电票PDF'>
                                    <Button
                                        type='primary'
                                        onClick={this.onExportRecodeExcel}
                                        disabled={uploading}
                                        style={{ position: 'absolute', right: 10 }}
                                    >
                                        EXCEL导出采集结果
                                    </Button>
                                </Tooltip>
                            </div>
                        ) : null
                    }
                    <ShowCollectResult
                        activeInvoiceType={activeInvoiceType}
                        listData={listData}
                        changeInvoiceTab={this.changeInvoiceTab}
                        onShowEditDialog={this.onShowEditDialog}
                        onDeleteInvoice={this.onDeleteInvoice}
                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                        userSource={userSource}
                    />
                </div>

                <Modal
                    visible={showMiniProgramQr}
                    className='fpyDialog'
                    title='小程序采集发票'
                    width={590}
                    onCancel={() => this.setState({ showMiniProgramQr: false, miniQrSrc: '' })}
                    footer={null}
                >
                    {
                        this.state.repeat ? (
                            <p className='tipTop'><img className='iconTp' src={iconTp} />已绑定微信号，一人一码，请勿将二维码提供给其他人使用</p>
                        ) : null
                    }
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 260, height: 260, border: '1px solid #f2f2f2', borderRadius: '4px', margin: '45px auto' }}>
                            <p style={{ lineHeight: '260px' }}>
                                {
                                    miniQrSrc ? (
                                        <img src={miniQrSrc} style={{ width: 240 }} />

                                    ) : showMiniProgramQrErr ? (
                                        <p
                                            style={{ fontSize: 12, color: 'red', textAlign: 'center', padding: '15px 0', cursor: 'pointer' }}
                                            onClick={this.getWxQr}
                                        >
                                            {showMiniProgramQrErr}
                                        </p>
                                    ) : (
                                        <Icon type='loading' style={{ fontSize: 30, color: '#aaa' }} />
                                    )
                                }
                            </p>
                            <p style={{ color: '#999', fontSize: 14 }}>微信扫一扫</p>
                        </div>
                        <div className='tipCont'>
                            <p style={{ textIndent: '-6px' }}>【说明】</p>
                            <p>1、小程序采集的发票将自动收录到进项台账中</p>
                            <p>2、一人一码，请勿将二维码提供给其他人使用。</p>
                        </div>
                    </div>
                </Modal>

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
                        onCheckInvoice={this.props.onCheckInvoice}
                        onSaveInvoice={this.props.onSaveInvoice}
                        INPUT_INVOICE_TYPES={INPUT_INVOICE_TYPES}
                    />
                </Modal>
                <Modal
                    visible={showUploadJxx}
                    title='上传税局进销项压缩包文件'
                    onCancel={() => this.setState({ showUploadJxx: false })}
                    width={790}
                    footer={false}
                >
                    <ImportGovJxxZip
                        uploadJxxUrl={this.props.uploadJxxUrl}
                    />
                </Modal>
            </div>
        );
    }
}


CollectInvoices.propTypes = {
    onGetWxQr: PropTypes.func.isRequired,
    recognizeUrl: PropTypes.string.isRequired,
    checkBlockChainUrl: PropTypes.string.isRequired,
    onCheckInvoice: PropTypes.func.isRequired,
    onSaveInvoice: PropTypes.func.isRequired,
    onDeleteInvoice: PropTypes.func.isRequired,
    onExportExcel: PropTypes.func.isRequired,
    onExportRecodeExcel: PropTypes.func.isRequired,
    scanFileStaticJs: PropTypes.array,
    exporting: PropTypes.bool,
    uploadGxFileUrl: PropTypes.string,
    uploadJxxUrl: PropTypes.string,
    userSource: PropTypes.number
};

export default CollectInvoices;