import React from 'react';
import async from 'async';
import { Button, Radio, message, Modal } from 'antd';
import ScrolWrapper from '@piaozone.com/scroll-wrapper';
import { pwyFetch } from '@piaozone.com/utils';
import ScanImage from '@piaozone.com/scan-image';
import { InvoiceTable, AttachTable } from './pureInvoiceTable';
// import { createInvoiceImg, deleteInvoiceAttach } from '../services/imported';
// import { importErp, checkInvoice, getAttachByFids } from '../services/selectInvoice';
// import { getSelectedInvoiceStandard } from '../services/selectInvoice';

import { confirmDialog } from './utils/tools';
import { createTable } from '../stateUtils/upload';

import EditInvoice from './editInvoice/';
import EditAttach from './editInvoice/attach';
import UnBindList from './invoiceUnlock/unbindList';

import './media/less/selectedInvoices.less';
const icon_invoiceIcon = require('./media/img/icon_invoice.png');
const icon_acountIcon = require('./media/img/icon_acount.png');
const errorIcon = require('./media/img/err_icon.png');
const tipIcon = require('./media/img/errorIcon.png');

const errorListDescription = {
    k0: { description: '将会导入的发票' },
    k1: { description: '错误原因：查验不通过，禁止导入' },
    k2: { description: '错误原因：重复报销，禁止导入' },
    k3: { description: '错误原因：电子发票未上传源文件，禁止导入' },
    k4: { description: '错误原因：发票抬头与企业名称不一致，禁止导入' },
    k5: { description: '错误原因：发票税号与企业税号不一致，禁止导入' },
    k6: { description: '错误原因：个人抬头的发票，禁止导入' },
    k7: { description: '错误原因：作废发票，禁止导入' },
    k8: { description: '错误原因：红冲发票，禁止导入' },
    k9: { description: '错误原因：手工修改，禁止导入' },
    k10: { description: '错误原因：串号发票，禁止导入' },
    k11: { description: '错误原因：无印章发票，禁止导入' },
    k12: { description: '错误原因：含敏感词发票，禁止导入' },
    k13: { description: '错误原因：销方名称在黑名单，禁止导入' },
    k14: { description: '错误原因：超过报销期限，禁止导入' },
    k15: { description: '错误原因：超过跨年期限，禁止导入' },
    k16: { description: '错误原因：发票连号，禁止导入' },
    k17: { description: '错误原因：个性化设置' },
    k18: { description: '错误原因：校验出租车监制章不通过，禁止导入' },
    k19: { description: '错误原因：销方企业处于黑名单，禁止导入' },
    k20: { description: '错误原因：专票地址电话与当前企业不一致，禁止导入' },
    k21: { description: '错误原因：专票开户行账号与当前企业不一致，禁止导入' },
    k22: { description: '错误原因：不允许导入的发票类型，禁止导入' }
};

class AddExpenseInfo extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onChangeTabType = this.onChangeTabType.bind(this);
        this.onImportData = this.onImportData.bind(this);
        this.showImage = this.showImage.bind(this);
        this.createTable = createTable.bind(this);
        this.optMode = window.pageData.optMode || 0;
        this.state = {
            loading: true,
            loadingAttach: true,
            tabType: '1',
            activeIndex: 0,
            curImage: '',
            invoiceType: '',
            serialNo: '',
            listData: [],
            listAttachData: [],
            applyUnBind: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.refreshList();
    }

    componentDidUpdate() {
        this.scrollObj1.refresh();
        this.scrollObj2.refresh();
    }

    componentWillReceiveProps(nextProps) {
        const { listData = [], listAttachData = [] } = this.state;
        const { invoices = [], attaches = [] } = nextProps;
        const { fids, attacheSerialNos, invoiceDictData } = this.getIds(invoices, attaches);

        // 新增的数据
        if (listData.length < fids.length || listAttachData.length < attacheSerialNos.length) {
            this.getInvoiceData(fids);
            this.getAttachData(attacheSerialNos);
        } else {
            const newListData = [];
            // 需要找出最新的发票列表并且包括里面的附件流水号
            for (let i = 0; i < listData.length; i++) {
                const item = listData[i];
                const billSerialNo = item.serialNo || item.fplsh || item.fid;
                const attachSerialNoList = invoiceDictData[billSerialNo] ? invoiceDictData[billSerialNo].attachSerialNoList || [] : [];
                if (fids.indexOf(billSerialNo) !== -1) {
                    newListData.push({
                        ...item,
                        attachSerialNoList: attachSerialNoList
                    });
                }
            }
            this.setState({
                listData: newListData
            });
            this.getAttachData(attacheSerialNos);
        }
    }

    refreshList = () => {
        const { invoices = [], attaches = [] } = this.props;
        const { fids, attacheSerialNos } = this.getIds(invoices, attaches);
        this.getInvoiceData(fids);
        this.getAttachData(attacheSerialNos);
    }

    getInvoiceData = async(fids) => {
        if (fids.length === 0) {
            this.setState({
                loading: false,
                listData: []
            });
            return;
        };

        const res = await getSelectedInvoiceStandard({
            serialNos: fids.join(',')
        });
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
        }

        this.setState({
            listData: res.datas || [],
            loading: false
        });
    }

    getAttachData = async(attacheSerialNos) => {
        if (attacheSerialNos.length === 0) {
            this.setState({
                loadingAttach: false,
                listAttachData: []
            });
            return;
        }

        const res = await getAttachByFids(attacheSerialNos);
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
        }

        this.setState({
            listAttachData: res.data || [],
            loadingAttach: false
        });
    }

    getIds = (invoices, attaches) => {
        const fids = [];
        const invoiceDictData = {};
        const attacheSerialNos = [];
        for (let i = 0; i < attaches.length; i++) {
            const item = attaches[i];
            const serialNo = item.attacheSerialNo || item.serialNo;
            attacheSerialNos.push(serialNo);
        }

        for (let i = 0; i < invoices.length; i++) {
            const item = invoices[i];
            const fid = item.serialNo || item.fplsh || item.fid;
            const attachSerialNoList = item.attachSerialNoList || [];
            if (attachSerialNoList.length > 0) {
                for (let j = 0; j < attachSerialNoList.length; j++) {
                    if (attacheSerialNos.indexOf(attachSerialNoList[j]) === -1) {
                        attacheSerialNos.push(attachSerialNoList[j]);
                    }
                }
            }
            fids.push(fid);
            invoiceDictData[fid] = item;
        }
        return {
            fids,
            attacheSerialNos,
            invoiceDictData
        };
    }

    onDelete = (i, r) => {
        confirmDialog('确定要删除该发票吗？', true, async() => {
            const fplsh = r.serialNo || r.fplsh || r.fid;
            // 只需要处理有附件的发票
            if (r.attachSerialNoList && r.attachSerialNoList.length > 0) {
                message.loading('处理中...', 0);
                const res = await deleteInvoiceAttach({
                    billSerialNos: fplsh
                });
                message.destroy();
                if (res.errcode !== '0000') {
                    message.info(res.description + '[' + res.errcode + ']');
                    return;
                }
            }

            this.props.dispatch({ type: 'selectedInvoice/deleteInvoice', payload: { serialNo: fplsh } });
        });
    }

    onCheckInvoice = async(i, r) => {
        message.loading('查验中...', 0);
        r.checkType = 1;
        const res = await checkInvoice(r);
        message.destroy();
        message.warning(res.description);
        if (res.errcode == '0000') {
            const { listData } = this.state;
            const currentFid = r.serialNo || r.fplsh || r.fid;
            const listOtherData = listData.filter((item) => {
                const itemSerialNo = item.serialNo || item.fplsh || item.fid;
                return itemSerialNo != currentFid;
            });
            this.setState({
                listData: listOtherData.concat(res.data)
            });
            this.props.dispatch({ type: 'selectedInvoice/deleteInvoice', payload: { serialNo: currentFid } });
            this.props.dispatch({ type: 'selectedInvoice/addInvoices', payload: { data: listOtherData.concat(res.data) } });
        }
    }

    onChangeTabType = (e) => {
        this.setState({ tabType: e.target.value });
    }

    onDeleteAttach = async(i, r) => {
        const attaches = this.props.attaches || [];
        const billSerialNoList = r.billSerialNoList || [];
        const serialNo = r.serialNo || r.attachSerialNo || r.fid;
        const attachesIds = attaches.map((item) => {
            return item.serialNo || item.attacheSerialNo || item.fid;
        });

        message.loading('处理中...', 0);
        const res = await deleteInvoiceAttach({
            attachSerialNos: serialNo
        });
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
            return;
        }

        // 是独立附件
        if (attachesIds.indexOf(serialNo) !== -1) {
            this.props.dispatch({ type: 'selectedInvoice/deleteAttach', payload: { ...r, serialNo } });
        } else { // 关联发票的附件
            if (billSerialNoList.length > 0) {
                this.props.dispatch({ type: 'selectedInvoice/deleteInvoiceAttach', payload: { billSerialNoList: billSerialNoList, serialNo } });
            } else {
                message.info('附件的关联发票不存在！');
            }
        }
    }

    onSaveAttach = (data) => {
        this.props.dispatch({ type: 'selectedInvoice/modifyAttach', payload: { data } });
    }

    onImportData() {
        const { userKeyInfo, attaches = [] } = this.props;
        const listData = this.state.listData;
        const fids = listData.map((item) => {
            return item.fplsh || item.serialNo || item.fid;
        });

        const attachmentFids = attaches.map((item) => {
            return item.serialNo;
        });
    }


    categoryInvoices(listData) {
        const listData0 = []; //允许导入的
        const listData1 = []; //查验不通过的
        const listData2 = [];
        const listData3 = [];
        const listData4 = [];
        const listData5 = [];
        const listData6 = [];
        const listData7 = [];
        const listData8 = [];
        const listData9 = [];
        const listData10 = [];
        const listData11 = [];
        const listData12 = [];
        const listData13 = [];
        const listData14 = [];
        const listData15 = [];
        const listData16 = [];
        const listData17 = [];
        const listData18 = [];
        const listData19 = [];
        const listData20 = [];
        const listData21 = [];
        const listData22 = [];
        let totalTaxAmount = 0.00;
        let totalAmount = 0.00;
        for (var i = 0; i < listData.length; i++) {
            const curInvoice = listData[i];
            let fplx = curInvoice.fplx || curInvoice.invoiceType;
            fplx = parseInt(fplx);
            const { errorLevel } = curInvoice;
            if (errorLevel == 0) {
                listData0.push(curInvoice);
            } else if (errorLevel == 1) {
                listData1.push(curInvoice);
            } else if (errorLevel == 2) {
                listData2.push(curInvoice);
            } else if (errorLevel == 3) {
                listData3.push(curInvoice);
            } else if (errorLevel == 4) {
                listData4.push(curInvoice);
            } else if (errorLevel == 5) {
                listData5.push(curInvoice);
            } else if (errorLevel == 6) {
                listData6.push(curInvoice);
            } else if (errorLevel == 7) {
                listData7.push(curInvoice);
            } else if (errorLevel == 8) {
                listData8.push(curInvoice);
            } else if (errorLevel == 9) {
                listData9.push(curInvoice);
            } else if (errorLevel == 10) {
                listData10.push(curInvoice);
            } else if (errorLevel == 11) {
                listData11.push(curInvoice);
            } else if (errorLevel == 12) {
                listData12.push(curInvoice);
            } else if (errorLevel == 13) {
                listData13.push(curInvoice);
            } else if (errorLevel == 14) {
                listData14.push(curInvoice);
            } else if (errorLevel == 15) {
                listData15.push(curInvoice);
            } else if (errorLevel == 16) {
                listData16.push(curInvoice);
            } else if (errorLevel == 17) {
                listData17.push(curInvoice);
            } else if (errorLevel == 18) {
                listData18.push(curInvoice);
            } else if (errorLevel == 19) {
                listData19.push(curInvoice);
            } else if (errorLevel == 20) {
                listData20.push(curInvoice);
            } else if (errorLevel == 21) {
                listData21.push(curInvoice);
            } else if (errorLevel == 22) {
                listData22.push(curInvoice);
            }
            let se = listData[i].totalTaxAmount || listData[i].se;
            se = parseFloat(se);
            let jshjje = listData[i].totalAmount || listData[i].jshjje;
            jshjje = parseFloat(jshjje);
            if (!isNaN(se)) {
                totalTaxAmount += se;
            }
            if (!isNaN(jshjje)) {
                totalAmount += jshjje;
            }
        }
        return {
            listData0, //允许导入的
            listData1, //查验不通过的
            listData2, //重复报销的
            listData3, //未上传源文件
            listData4, //抬头不一致的
            listData5, //税号不一致
            listData6, //个人
            listData7, //作废
            listData8, //红冲
            listData9, //手工修改
            listData10, //串号
            listData11, //无印章
            listData12, //敏感词
            listData13, //销方黑名单
            listData14, //报销过期
            listData15, //报销跨年
            listData16, //连号
            listData17, //个性化配置
            listData18, //的士票监制章
            listData19, //第三方黑名单
            listData20,
            listData21,
            listData22,
            totalTaxAmount,
            totalAmount
        };
    }

    showImage(v, invoiceType, serialNo) {
        this.setState({
            curImage: v,
            invoiceType,
            serialNo
        });
    }

    onShowEdit = (i, r, activeKey = '1', activeIndex = 0) => {
        this.setState({
            activeIndex,
            activeKey,
            curEditInfo: r
        });
    }

    getActiveType(curActiveType, listData) {
        if (!curActiveType) {
            return [1, 2, 3, 4, 5, 15].indexOf(parseInt(listData[0].invoiceType)) !== -1 ? 'addedTax' : 'k' + listData[0].invoiceType;
        } else {
            return curActiveType;
        }
    }

    onConfirmEdit = (info, invoiceData) => {
        const curSerialNo = invoiceData.recognitionSerialNo || invoiceData.serialNo;
        this.setState({
            curEditInfo: false,
            listData: this.state.listData.map((item) => {
                if (item.recognitionSerialNo === curSerialNo || item.serialNo === curSerialNo) {
                    const serialNo = info.recognitionSerialNo || info.serialNo;
                    this.props.dispatch({ type: 'selectedInvoice/deleteInvoice', payload: { serialNo: curSerialNo } }); //编辑完更新model
                    const data = {
                        ...item,
                        ...invoiceData,
                        ...info,
                        kprq: invoiceData.invoiceDate || invoiceData.kprq,
                        isExist: true,
                        fid: serialNo, //发票流水号
                        serialNo: serialNo,
                        fplsh: serialNo,
                        description: invoiceData.description
                    };
                    this.props.dispatch({ type: 'selectedInvoice/addInvoices', payload: { data: [data] } });
                    return data;
                }
                return item;
            })
        });
        message.destroy();
        message.info('保存成功');
    }

    beforeUpload = (entryFiles, invoiceData) => {
        if (this.uploading) {
            return false;
        }
        message.loading('附件上传中...', 0);
        const files = [].concat(entryFiles);
        this.uploading = true;
        const url = window.pageData.basePath + 'm4/fpzs/attachBill/upload?userKey=' + userKey;
        this.setState({
            uploading: true
        });
        async.mapLimit(files, 1, async(file, callback) => {
            const billSerialNo = invoiceData.serialNo || invoiceData.recognitionSerialNo;
            const formData = new FormData();
            formData.append('userKey', userKey);
            formData.append('file', file, file.name);
            formData.append('billSerialNo', billSerialNo);
            const res = await pwyFetch(url, {
                method: 'post',
                body: formData,
                contentType: 'file'
            });
            if (res.errcode === '0000') {
                this.props.dispatch({ type: 'selectedInvoice/addInvoiceAttach', payload: { billSerialNo, serialNo: res.data.attachSerialNo } });
            } else {
                message.info(res.description + '[' + res.errcode + ']');
            }
            callback(null);
        }, () => {
            message.destroy();
            this.uploading = false;
            message.info('附件上传成功');
        });
        return false;
    }

    getUploadProps = (r) => {
        return {
            name: 'exceltxt',
            method: 'post',
            multiple: true,
            accept: 'image/*, application/pdf',
            showUploadList: false,
            withCredentials: true,
            data: {},
            action: window.pageData.basePath + 'm4/fpzs/expense/upload/attachment',
            beforeUpload: (file, files) => {
                return this.beforeUpload(files, r);
            }
        };
    };

    unlockClick = () => {
        const helpModal = document.getElementsByClassName('helpShow');
        helpModal[0].style.display = 'block';
    }

    createInvocieTable = (listData = [], index) => {
        if (listData.length === 0) {
            return null;
        }
        const { ghf_mc, tin } = this.props;
        let tipClass = 'errTip';
        if (index === 0) {
            tipClass = 'successTip';
        }

        return (
            <div>
                <div className={tipClass}>
                    <span>{errorListDescription['k' + index].description}</span>
                    {
                        index == 2 ? (
                            <a className='unLock' onClick={this.unlockClick}>申请解绑</a>
                        ) : null
                    }
                </div>
                <InvoiceTable
                    listData={listData}
                    loading={false}
                    remove={this.onDelete}
                    onShowEdit={this.onShowEdit}
                    ghf_mc={ghf_mc}
                    ghf_tin={tin}
                    checkInvoice={this.onCheckInvoice}
                    getUploadProps={this.getUploadProps}
                />
            </div>
        );
    }

    onDeleteInvoiceAttach = (invoiceSerialNo, serialNo) => {
        this.props.dispatch({
            type: 'selectedInvoice/deleteInvoiceAttach',
            payload: {
                billSerialNoList: [invoiceSerialNo],
                serialNo
            }
        });
    }

    render() {
        const { socketConnected } = this.props;
        const { curImage, serialNo, invoiceType, listData = [], curEditInfo, activeIndex, activeKey, listAttachData = [] } = this.state;
        const {
            listData0, //允许导入的
            listData1, //查验不通过的
            listData2, //重复报销的
            listData3, //未上传源文件
            listData4, //抬头不一致的
            listData5, //税号不一致
            listData6, //个人
            listData7, //作废
            listData8, //红冲
            listData9, //手工修改
            listData10, //串号
            listData11, //无印章
            listData12, //敏感词
            listData13, //销方黑名单
            listData14, //报销过期
            listData15, //报销跨年
            listData16, //连号
            listData17, // 个性化配置
            listData18,
            listData19, // 第三方黑名单
            listData20,
            listData21,
            listData22,
            totalTaxAmount,
            totalAmount
        } = this.categoryInvoices(listData);
        const copies = listData.length;
        const { clientHeight, clientWidth } = this.props;
        const linkKeyStr = window.linkKey ? '&linkKey=' + window.linkKey : '';
        const tabType = parseInt(this.state.tabType);
        return (
            <div className='selectInvoice categoryBox' style={{ width: clientWidth, height: clientHeight, overflow: 'hidden', margin: '0 auto' }}>
                <Radio.Group onChange={this.onChangeTabType} value={this.state.tabType} className='tabs'>
                    <Radio.Button key={1} value='1' className='tab'>已选择的发票列表</Radio.Button>
                    <Radio.Button key={2} value='2' className='tab'>附件列表</Radio.Button>
                </Radio.Group>
                <ScrolWrapper
                    className='selectInvoiceBox'
                    style={{ zIndex: '1', position: 'relative', height: clientHeight - 100, display: tabType === 1 ? 'block' : 'none' }}
                    onMounted={(s, o) => {
                        this.scrollObj1 = o;
                    }}
                >
                    <div className='category' style={{ position: 'relative' }}>
                        {
                            listData.length > 0 ? (
                                <div className='careful'>
                                    <span className='col'>注：请鼠标移动到</span>
                                    “<img src={errorIcon} className='imgCls' alt='' />”,“<img width={16} className='imgCls' src={tipIcon} alt='' />”
                                    <span className='col'> 处查看发票预警信息!</span>
                                </div>
                            ) : null
                        }
                        {
                            this.state.loading ? (
                                <div style={{ height: clientHeight - 100 }}><div className='noData' style={{ fontSize: 14, borderBottom: '1px solid #eee', paddingBottom: 20 }}>获取数据中...</div></div>
                            ) : listData.length === 0 ? (
                                <div style={{ height: clientHeight - 100 }}><div className='noData' style={{ fontSize: 14, borderBottom: '1px solid #eee', paddingBottom: 20 }}>暂无数据</div></div>
                            ) : (
                                <>
                                    {this.createInvocieTable(listData0, 0)}
                                    {this.createInvocieTable(listData1, 1)}
                                    {this.createInvocieTable(listData2, 2)}
                                    {this.createInvocieTable(listData3, 3)}
                                    {this.createInvocieTable(listData4, 4)}
                                    {this.createInvocieTable(listData5, 5)}
                                    {this.createInvocieTable(listData6, 6)}
                                    {this.createInvocieTable(listData7, 7)}
                                    {this.createInvocieTable(listData8, 8)}
                                    {this.createInvocieTable(listData9, 9)}
                                    {this.createInvocieTable(listData10, 10)}
                                    {this.createInvocieTable(listData11, 11)}
                                    {this.createInvocieTable(listData12, 12)}
                                    {this.createInvocieTable(listData13, 13)}
                                    {this.createInvocieTable(listData14, 14)}
                                    {this.createInvocieTable(listData15, 15)}
                                    {this.createInvocieTable(listData16, 16)}
                                    {this.createInvocieTable(listData17, 17)}
                                    {this.createInvocieTable(listData18, 18)}
                                    {this.createInvocieTable(listData19, 19)}
                                    {this.createInvocieTable(listData20, 20)}
                                    {this.createInvocieTable(listData21, 21)}
                                    {this.createInvocieTable(listData22, 22)}
                                </>
                            )
                        }
                    </div>
                </ScrolWrapper>

                <ScrolWrapper
                    className='selectInvoiceBox'
                    style={{ zIndex: '1', position: 'relative', height: clientHeight - 100, display: tabType === 2 ? 'block' : 'none' }}
                    onMounted={(s, o) => {
                        this.scrollObj2 = o;
                    }}
                >

                    {
                        this.state.loadingAttach ? (
                            <div style={{ height: clientHeight - 100 }}><div className='noData' style={{ fontSize: 14, borderBottom: '1px solid #eee', paddingBottom: 20 }}>获取数据中...</div></div>
                        ) : (
                            <div>
                                <AttachTable listData={listAttachData} remove={this.onDeleteAttach} onShowEdit={this.onShowEdit} />
                            </div>
                        )
                    }
                </ScrolWrapper>
                <div className='bottomInfo clearfix'>
                    <div className='info floatLeft'>
                        <p className='row1'>
                            <img src={icon_invoiceIcon} width='16px' height='18px' />
                            已选取<span className='num copies'>{copies}</span>张发票&nbsp;&nbsp;
                            <span className='num attachmentCopies'>{listAttachData.length}</span>张附件
                        </p>
                        <p className='amount'>
                            <img src={icon_acountIcon} width='17px' height='17px' />
                            价税合计<span className='jshj num'>{parseFloat(totalAmount).toFixed(2)}</span>元&nbsp;&nbsp;
                            税额合计<span className='se num'>{parseFloat(totalTaxAmount).toFixed(2)}</span>元
                        </p>
                    </div>
                    <div className='floatRight'>
                        <Button
                            type='primary'
                            className='homeImportBtn'
                            onClick={this.onImportData}
                            style={{ width: 120, height: 38, marginRight: 20, marginTop: 10 }}
                            disabled={!socketConnected || (listData.length + listAttachData.length) === 0}
                        >
                            发票导入单据
                        </Button>
                    </div>
                </div>

                <Modal
                    visible={!!curEditInfo}
                    title={false}
                    width={clientWidth}
                    onCancel={() => { this.setState({ curEditInfo: false }); }}
                    wrapClassName='noBoxShadow'
                    mask={false}
                    style={{ top: 0, overflow: 'hidden', padding: 0 }}
                    closable={false}
                    footer={false}
                    maskClosable={false}
                    destroyOnClose={true}
                >
                    {
                        tabType === 1 ? (
                            <EditInvoice
                                billData={curEditInfo}
                                attachList={activeKey === '3' ? curEditInfo.attachList : null}
                                onDelete={this.onDeleteInvoiceAttach}
                                onOk={this.onConfirmEdit}
                                onSaveAttach={this.onSaveAttach}
                                activeKey={activeKey}
                                activeIndex={activeIndex}
                                onClose={() => {
                                    message.destroy();
                                    this.setState({ curEditInfo: false });
                                }}
                            />
                        ) : (
                            <EditAttach
                                billData={curEditInfo}
                                visbile={true}
                                clientWidth={clientWidth}
                                scrollHeight={clientHeight - 134}
                                clientHeight={clientHeight}
                                onClose={() => {
                                    message.destroy();
                                    this.setState({ curEditInfo: false });
                                }}
                                onOk={this.onSaveAttach}
                            />
                        )
                    }
                </Modal>

                <Modal
                    visible={curImage !== ''}
                    width={clientWidth}
                    wrapClassName='noBoxShadow'
                    mask={false}
                    style={{ top: 0, overflow: 'hidden', padding: 0 }}
                    closable={false}
                    footer={false}
                    maskClosable={false}
                >
                    <div style={{ width: '100%', height: clientHeight }}>
                        <div style={{ height: clientHeight - 50, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', verticalAlign: 'middle' }}>
                            <ScanImage
                                src={curImage}
                                style={{ maxHeight: clientHeight - 80, maxWidth: clientWidth }}
                                invoiceType={invoiceType}
                                serialNo={serialNo}
                                onCreateInvoiceImg={this.onCreateInvoiceImg}
                                createInvoiceImg={createInvoiceImg}
                            />
                        </div>
                        <div style={{ textAlign: 'right', borderTop: '1px solid #ccc', height: 50, lineHeight: '50px', verticalAlign: 'middle' }}>
                            <Button type='primary' onClick={() => this.setState({ curImage: '' })} style={{ marginRight: 15 }}>关闭</Button>
                        </div>

                    </div>
                </Modal>
                {
                    listData2.length > 0 ? (
                        <UnBindList listData={listData2} refreshList={this.refreshList} />
                    ) : null
                }

            </div>
        );
    }
}



export default AddExpenseInfo;