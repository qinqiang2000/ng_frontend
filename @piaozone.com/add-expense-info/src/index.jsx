import React from 'react';
import PropTypes from 'prop-types';
import { Button, message, Input, DatePicker } from 'antd';
import Spin from '@piaozone.com/spin';
import ScrolWrapper from '@piaozone.com/scroll-wrapper';
import { pwyFetch } from '@piaozone.com/utils';
import { InvoiceTable } from './pureInvoiceTable';
import { confirmDialog } from './utils/tools';
import './media/less/selectedInvoices.less';
import moment from 'moment';
const icon_invoiceIcon = require('./media/img/icon_invoice.png');
const icon_acountIcon = require('./media/img/icon_acount.png');
const errorIcon = require('./media/img/err_icon.png');
const tipIcon = require('./media/img/errorIcon.png');

const errorListDescription = {
    k0: { description: '将会导入的发票' },
    k1: { description: '错误原因：查验不通过，禁止报销' },
    k2: { description: '错误原因：重复报销，禁止报销' },
    k3: { description: '错误原因：电子发票未上传源文件，禁止报销' },
    k4: { description: '错误原因：发票抬头与企业名称不一致，禁止报销' },
    k5: { description: '错误原因：发票税号与企业税号不一致，禁止报销' },
    k6: { description: '错误原因：个人抬头的发票，禁止报销' },
    k7: { description: '错误原因：作废发票，禁止报销' },
    k8: { description: '错误原因：红冲发票，禁止报销' },
    k9: { description: '错误原因：手工修改，禁止报销' },
    k10: { description: '错误原因：串号发票，禁止报销' },
    k11: { description: '错误原因：无印章发票，禁止报销' },
    k12: { description: '错误原因：含敏感词发票，禁止报销' },
    k13: { description: '错误原因：销方名称在黑名单，禁止报销' },
    k14: { description: '错误原因：超过报销期限，禁止报销' },
    k15: { description: '错误原因：超过跨年期限，禁止报销' },
    k16: { description: '错误原因：发票连号，禁止报销' }, 
    k17: { description: '错误原因：个性化设置' },
    k18: { description: '错误原因：校验出租车监制章不通过，禁止报销' },
    k19: { description: '错误原因：销方企业处于黑名单，禁止报销' },
    k20: { description: '错误原因：专票地址电话与当前企业不一致，禁止报销' },
    k21: { description: '错误原因：专票开户行账号与当前企业不一致，禁止报销' },
    k22: { description: '错误原因：不允许导入的发票类型，禁止报销' },
    k23:{description: '错误原因：经发票云风险评测，该销方评分较低'},
    k24:{description: '错误原因：发票销方信息不一致'}
};

class AddExpenseInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expenseUserName: props.expenseUserName,
            expenseReason: '',
            projectName: '',
            expenseTime: moment(),
            loading: true,
            saving: false,
            serialNo: '',
            listData: [],
            expenseId: props.expenseId,
            bxdNum: props.expenseId,
            foucsState: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.freshList = false;
        if (this.props.serialNos) {
            this.getInvoiceData(this.props.serialNos);
        }
    }

    componentDidUpdate() {
        this.scrollObj1.refresh();
    }

    getInvoiceData = async(fids) => {
        const { expenseId } = this.state;
        if (fids.length === 0) {
            this.setState({
                loading: false,
                listData: []
            });
            return;
        };
        message.loading('加载中...', 0);
        const res = await pwyFetch(this.props.queryInvoiceUrl, {
            method: 'post',
            data: {
                serialNos: fids.join(','),
                expenseNum: expenseId
            }
        });
        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description + '[' + res.errcode + ']');
        }

        this.setState({
            listData: res.datas || [],
            loading: false
        });
    }

    modifyExpenseId = async() => {
        return new Promise(async(resolve, reject)=>{
            const { expenseId, listData } = this.state;
            if (expenseId != this.props.expenseId && this.freshList) {
                const fids = [];
                if (listData.length > 0) {
                    for (const item of listData) {
                        fids.push(item.serialNo)
                    }
                }
                message.loading('加载中...', 0);
                const res = await pwyFetch(this.props.queryInvoiceUrl, {
                    method: 'post',
                    data: {
                        serialNos: fids.join(','),
                        expenseNum: expenseId.trim()
                    }
                });
                this.freshList = false;
                message.destroy();
                resolve(res);
                
            } else {
                resolve({ errcode: '0000', datas: this.state.listData })
            }
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
        confirmDialog('确定要移除该发票吗？', true, () => {
            const fplsh = r.serialNo || r.fplsh || r.fid;
            const newList = this.state.listData.filter((item) => {
                const curLsh = item.serialNo || item.fplsh || item.fid;
                return curLsh !== fplsh;
            });
            this.setState({
                listData: newList
            });
        });
    }

    onChangeTabType = (e) => {
        this.setState({
            tabType: e.target.value
        });
    }

    filterFids = (list) => {
        const { listData } = this.state;
        if (listData.length > 0 ) {
            const oldFids = [];
            for (const item of listData) {
                oldFids.push(item.serialNo);
            }
            if (list.length > 0 ) {
                for (const item of list) {
                    if (oldFids.indexOf(item.serialNo) == '-1') {
                        listData.push(item);
                    }
                }
            }
            return listData;
        } else {
            return list;
        }
    }

    onImportData = async() => {
        const { expenseId } = this.state;
        if (!expenseId.trim()) {
            message.info('报销单号不能为空');
            return;
        }
        const result = await this.modifyExpenseId();
        if(result.errcode == '0000'){
            this.setState({
                listData: result.datas || [],
                loading: false
            });
            const { expenseTime, expenseUserName, projectName, expenseReason, expenseId } = this.state;
            const fids = result.datas.map((item) => {
                return item.fplsh || item.serialNo || item.fid;
            });
            if (!expenseTime) {
                message.info('报销时间不能为空');
                return;
            }
            const datas = {
                serialNos: fids,
                expenseNum: expenseId.trim(),
                expenseTime: expenseTime.format('YYYY-MM-DD'),
                expenseName: expenseUserName.trim(),
                projectName: projectName.trim(),
                remark: expenseReason.trim()
            };
            this.setState({
                saving: true
            });
            setTimeout(async() => {
                try {
                    await this.props.onConfirmAddExpenseInfo(datas);
                } catch (error) {
                    console && console.error('提交报销单异常', error);
                }
                this.setState({
                    saving: false
                });
            }, 500);
        } else{
            message.info(result.description + '[' + result.errcode + ']');
        }
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
        const listData23 = [];
        const listData24 = [];
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
            } else if (errorLevel == 23) {
                listData23.push(curInvoice);
            } else if (errorLevel == 24) {
                listData24.push(curInvoice);
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
            listData23,
            listData24,
            totalTaxAmount,
            totalAmount
        };
    }

    getActiveType(curActiveType, listData) {
        if (!curActiveType) {
            return [1, 2, 3, 4, 5, 15].indexOf(parseInt(listData[0].invoiceType)) !== -1 ? 'addedTax' : 'k' + listData[0].invoiceType;
        } else {
            return curActiveType;
        }
    }

    createInvocieTable = (listData = [], index) => {
        if (listData.length === 0) {
            return null;
        }
        let tipClass = 'errTip';
        if (index === 0) {
            tipClass = 'successTip';
        }

        return (
            <div>
                <div className={tipClass}>
                    <span>{errorListDescription['k' + index].description}</span>
                </div>
                <InvoiceTable
                    listData={listData}
                    loading={false}
                    remove={this.onDelete}
                />
            </div>
        );
    }

    focusInput = () => {
        const { bxdNum } = this.state;
        if (bxdNum && bxdNum == this.props.expenseId) {
            this.setState({
                bxdNum: '',
                foucsState: true
            });
        }
    }

    blurInput = (val) => {
        if(!val){
            this.setState({
                bxdNum: this.state.expenseId,
                foucsState: false
            });
        }
    }

    onChangeBxd = (val) => {
        this.freshList = true;
        const { expenseId } = this.props;
        if (val) {
            this.setState({
                bxdNum: val,
                expenseId: val,
                foucsState: false
            });
        } else {
            this.setState({
                bxdNum: val,
                expenseId,
                foucsState: true
            });
        }
        
    } 

    render() {
        const { listData = [], expenseTime, projectName, expenseReason = '', expenseUserName, saving, expenseId, bxdNum, foucsState } = this.state;
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
            listData23,
            listData24,
            totalTaxAmount,
            totalAmount
        } = this.categoryInvoices(listData);

        const copies = listData.length;
        const { height, width, className, style } = this.props;
        const listHeight = height - 102;
        const wrapperCls = className ? 'selectInvoice categoryBox ' + className : 'selectInvoice categoryBox';
        return (
            <div className={wrapperCls} style={{ width, height, overflow: 'hidden', margin: '0 auto', ...style }}>
                <div className='expenseInfo'>
                    <div className='row'>
                        <div className='item'>
                            <label>报销单编号：</label>
                            <span style={{ display: 'inline-block', width: 267, position: 'relative' }}>
                                <Input
                                    type='text'
                                    value={bxdNum}
                                    maxLength={50}
                                    onFocus={() => { this.focusInput() }}
                                    onBlur={(e)=>{this.blurInput(e.target.value)}}
                                    onChange={(e) => { this.onChangeBxd(e.target.value) }}
                                />
                                {
                                    foucsState ? (
                                        <div className='stuffer'>{this.props.expenseId}</div>
                                    ) : null
                                }
                            </span>
                            
                        </div>
                        <div className='item'>
                            <label>报销人：</label>
                            <Input
                                type='text'
                                value={expenseUserName}
                                onChange={(e) => this.setState({
                                    expenseUserName: e.target.value
                                })}
                            />
                        </div>
                        <div className='item'>
                            <label>报销时间：</label>
                            <DatePicker
                                className='rangeDate searchInput'
                                style={{ width: '100%' }}
                                disabledDate={(current) => { return current > moment(); }}
                                placeholder='请输入报销时间'
                                type='text'
                                value={expenseTime}
                                onChange={(e) => this.setState({
                                    expenseTime: e
                                })}
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='item' style={{ verticalAlign: 'text-top' }}>
                            <label>项目：</label>
                            <Input
                                type='text'
                                value={projectName}
                                onChange={(e) => this.setState({
                                    projectName: e.target.value
                                })}
                            />
                        </div>
                        <div className='item' style={{ verticalAlign: 'text-top' }}>
                            <label>报销事由：</label>
                            <textarea
                                style={{ width: 622 }}
                                value={expenseReason}
                                onChange={(e) => this.setState({
                                    expenseReason: e.target.value
                                })}
                            />
                        </div>
                    </div>
                </div>
                <ScrolWrapper
                    className='selectInvoiceBox'
                    style={{ zIndex: '1', position: 'relative', height: listHeight - 60 }}
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
                                <div style={{ height: listHeight - 100 }}>
                                    <Spin />
                                </div>
                            ) : listData.length === 0 ? (
                                <div style={{ height: listHeight - 100 }}>
                                    <div className='noData' style={{ fontSize: 14, borderBottom: '1px solid #eee', paddingBottom: 20 }}>暂无数据</div>
                                </div>
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
                                    {this.createInvocieTable(listData23, 23)}
                                    {this.createInvocieTable(listData24, 24)}
                                </>
                            )
                        }
                    </div>
                </ScrolWrapper>

                <div className='bottomInfo clearfix'>
                    <div className='info floatLeft'>
                        <p className='row1'>
                            <img src={icon_invoiceIcon} width='16px' height='18px' />
                            已选取<span className='num copies'>{copies}</span>张发票
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
                            disabled={listData.length === 0 || !expenseId}
                            loading={saving}
                        >
                            提交
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

AddExpenseInfo.propTypes = {
    queryInvoiceUrl: PropTypes.string.isRequired, // 查询发票列表地址
    // queryInvoiceAttachUrl: PropTypes.string.isRequired, // 查询附件地址
    // deleteAttachUrl: PropTypes.string.isRequired, // 删除附件地址
    // checkInvoiceUrl: PropTypes.string.isRequired, // 查验发票地址
    // updateAttachInfoUrl: PropTypes.string.isRequired, // 更新附件信息地址
    onConfirmAddExpenseInfo: PropTypes.func.isRequired, // 保存报销信息接口地址
    // uploadAttachUrl: PropTypes.string.isRequired, // 上传发票附件接口地址
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    serialNos: PropTypes.array,
    style: PropTypes.object,
    className: PropTypes.string,
    expenseUserName: PropTypes.string,
    expenseId: PropTypes.string.isRequired
};

export default AddExpenseInfo;