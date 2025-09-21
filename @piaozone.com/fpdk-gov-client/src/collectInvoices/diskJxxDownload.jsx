import React from 'react';
import { Button, Table, message, Pagination, Modal, Radio, DatePicker, Checkbox, Tooltip } from 'antd';
import moment from 'moment';
import './style.less';
import PropTypes from 'prop-types';
import { kdRequest } from '@piaozone.com/utils';
const tipIcon = require('../commons/img/tips.png');

const { RangePicker, MonthPicker } = DatePicker;
const statusDict = {
    k1: '申请失败',
    k2: '税局处理中',
    k3: '税局处理完成',
    k4: '没有符合条件的发票',
    k5: '申请成功但是下载失败',
    k6: '处理失败',
    k7: '下载成功',
    k8: '税盘端操作失败',
    k9: '正在处理中' // 后台有任务正在处理
};

class DiskJxxDownload extends React.Component {
    constructor(props) {
        super(...arguments);
        this.fplxOptions = [{
            label: '增值税专用发票',
            value: 4,
            width: 140
        }, {
            label: '机动车销售统一发票',
            value: 12,
            width: 170
        }, {
            label: '增值税普通发票',
            value: 3,
            width: 140
        }, {
            label: '增值税普通发票（电子）',
            value: 1,
            width: 224
        }, {
            label: '二手车销售统一发票',
            value: 13,
            width: 170
        }, {
            label: '增值税普通发票（卷票）',
            value: 5,
            width: 190
        }, {
            label: '通行费电子发票',
            value: 15,
            width: 140
        }];

        this.fplxOptionsDict = [];
        for (let i = 0; i < this.fplxOptions.length; i++) {
            this.fplxOptionsDict['k' + this.fplxOptions[i].value] = this.fplxOptions[i];
        }

        this.allFplxs = this.fplxOptions.map((item) => {
            return item.value;
        });

        this.state = {
            handlerErrorIng: false,
            showApplyDialog: false,
            applyErrDescription: [{
                description: '错误'
            }],
            listData: [],
            dataIndex: 0,
            loading: false,
            fplxs: [4, 12, 3, 1, 5, 13, 15],
            jxxFlag: '',
            rangeDate: [moment(), moment()],
            mode: 'time',
            searchOpt: { // 查询列表的参数
                fplxs: [4, 12, 3, 1, 5, 13, 15],
                page: 1,
                pageSize: 10,
                rangeDate: [moment().startOf('month'), moment()],
                invoiceType: '',
                jxx: ''
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.onSearch();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onStartApply = async(opt) => {
        const isLogin = await this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo);
        if (!isLogin) {
            this.props.showLogin();
        } else {
            this.setState({
                applyErrDescription: [],
                showApplyDialog: true
            });
        }
    }


    startApply = async() => {
        if (!this._isMounted) {
            return;
        }

        message.loading('处理中...', 0);
        this.setState({
            loading: true,
            applyErrDescription: []
        });

        const { rangeDate, fplxs, jxxFlag } = this.state;
        const rq_q = rangeDate[0].format('YYYY-MM-01');
        const rq_z = rangeDate[1].format('YYYY-MM');
        const curDateStr = moment().format('YYYY-MM-DD');
        const searchOpt = {
            clientType: this.props.clientType || 4,
            categories: jxxFlag === '' ? [1, 2] : [jxxFlag],
            invoiceTypes: fplxs,
            startDate: rq_q,
            endDate: rq_z === curDateStr.substr(0, 7) ? curDateStr : moment(rq_z, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        };

        let url = this.props.downloadApplyUrl;

        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }

        const applyErrDescriptionArr = [];
        await this.props.govOperate.jxxDownloadApply(url, {
            searchOpt,
            stepFinish: (res) => { // 如果跨月，需要分步显示异常的申请
                if (res.errcode !== '0000') {
                    applyErrDescriptionArr.push(res);
                }

                if (res.endFlag) {
                    message.destroy();
                    if (applyErrDescriptionArr.length === 0) {
                        message.info('申请提交成功！');
                        this.onSearch(1);
                        this.setState({
                            showApplyDialog: false,

                            loading: false
                        });
                    } else {
                        this.setState({
                            applyErrDescription: applyErrDescriptionArr,
                            loading: false
                        });
                    }
                }
            }
        });
    }

    onReset = () => {
        this.setState({
            searchOpt: {
                jxx: '',
                fplxs: this.allFplxs,
                rangeDate: [moment().startOf('month'), moment()],
                invoiceType: '',
                page: 1,
                pageSize: 10
            }
        });
    }

    onChangeOptFplx = (e, type) => {
        const newFplx = e.target.checked ? this.state.searchOpt.fplxs.concat(type) : this.state.searchOpt.fplxs.filter((item) => {
            return item !== type;
        });
        this.setState({
            searchOpt: {
                ...this.state.searchOpt,
                fplxs: newFplx
            }
        });
    }

    onChangeFplx = (e, type) => {
        const newFplx = e.target.checked ? this.state.fplxs.concat(type) : this.state.fplxs.filter((item) => {
            return item !== type;
        });
        this.setState({
            fplxs: newFplx
        });
    }

    onCheckAllOptFplx = (e) => {
        this.setState({
            searchOpt: {
                ...this.state.searchOpt,
                fplxs: e.target.checked ? this.allFplxs : []
            }
        });
    }

    onCheckAllFplx = (e) => {
        this.setState({
            fplxs: e.target.checked ? this.allFplxs : []
        });
    }

    onSearch = async(page = this.state.searchOpt.page, pageSize = this.state.searchOpt.pageSize) => {
        if (!this._isMounted) {
            return;
        }

        const oldSearchOpt = this.state.searchOpt;
        if (oldSearchOpt.fplxs.length === 0) {
            message.warn('至少选择一种发票类型');
            return;
        }

        this.setState({
            searchLoading: true
        });

        const rangeDate = oldSearchOpt.rangeDate;
        const rq_q = rangeDate[0].format('YYYY-MM-DD');
        const rq_z = rangeDate[1].format('YYYY-MM-DD');
        const searchOpt = {
            categories: !oldSearchOpt.jxx ? [1, 2] : [oldSearchOpt.jxx],
            invoiceTypes: oldSearchOpt.fplxs,
            pageNo: parseInt(page),
            pageSize,
            startDate: rq_q,
            endDate: rq_z
        };

        let url = this.props.downloadAccountQueryUrl;

        if (this.props.access_token) {
            url += '?access_token=' + this.props.access_token;
        }


        const res = await kdRequest({
            url,
            timeout: 60000,
            data: searchOpt,
            method: 'POST'
        });

        message.destroy();
        if (res.errcode !== '0000') {
            message.info(res.description);
            this.setState({
                searchLoading: false
            });
        } else {
            const searchOpt = {
                ...this.state.searchOpt,
                page,
                pageSize
            };
            this.setState({
                searchOpt,
                totalNum: res.totalElement,
                listData: res.data,
                searchLoading: false
            });
        }
    }

    handlerErrorApply = async() => {
        const isLogin = await this.props.govOperate.checkIsLogin(this.props.fpdkType, this.props.loginGovInfo);
        if (!isLogin) {
            this.props.showLogin();
        } else {
            this.setState({
                handlerErrorIng: true
            });
            message.loading('请求处理中...', 0);
            const res = await this.props.govOperate.commonRequest(this.props.handlerErrApplyUrl);
            message.destroy();
            if (res.errcode === '0000') {
                message.info('失败记录提交处理成功');
                this.onSearch();
            } else {
                message.info(res.description);
            }
            this.setState({
                handlerErrorIng: false
            });
        }
    }

    render() {
        const {
            totalNum, listData, loading,
            rangeDate, fplxs, jxxFlag,
            searchOpt, showApplyDialog,
            applyErrDescription, searchLoading, handlerErrorIng
        } = this.state;
        const optIndeterminate = searchOpt.fplxs.length > 0 && searchOpt.fplxs.length < this.fplxOptions.length;
        const indeterminate = fplxs.length > 0 && fplxs.length < this.fplxOptions.length;
        const renderDate = (dateStr) => {
            return dateStr.substr(0, 10);
        };

        const tabCols = [
            {
                title: '序号',
                align: 'left',
                render: (v, r, i) => {
                    return i + 1 + searchOpt.pageSize * (searchOpt.page - 1);
                }
            },
            {
                title: '申请时间',
                dataIndex: 'fapplyDate',
                align: 'left',
                render: (v) => {
                    return v.substr(0, 19);
                }
            },
            {
                title: '发票类型',
                dataIndex: 'finvoiceType',
                align: 'left',
                render: (v) => {
                    if (v) {
                        return this.fplxOptionsDict['k' + v].label || '--';
                    } else {
                        return '--';
                    }
                }
            },
            { title: '开票日期起', dataIndex: 'fstartDate', align: 'left', render: renderDate },
            { title: '开票日期止', dataIndex: 'fendDate', align: 'left', render: renderDate },
            {
                title: '进销项',
                dataIndex: 'fdownloadType',
                align: 'left',
                render: (v) => {
                    if (v) {
                        v = parseInt(v);
                        if (v === 1) {
                            return '进项票';
                        } else if (v === 2) {
                            return '销项票';
                        }
                        return '--';
                    }
                    return '--';
                }
            },
            { title: '份数', dataIndex: 'finvoiceNumber', align: 'left' },
            { title: '价税合计', dataIndex: 'ftotalAmount', align: 'left' },
            {
                title: '税额合计',
                dataIndex: 'ftotalTaxAmount',
                align: 'left',
                render: (v, r) => {
                    if (r.finvoiceType === 5) {
                        return '--';
                    } else {
                        return v;
                    }
                }
            },
            {
                title: '处理状态',
                dataIndex: 'fapplyStatus',
                align: 'left',
                render: (v, r) => {
                    if (r.ffailDescription && [1, 5, 6, 8].indexOf(v) !== -1) {
                        return (
                            <div>
                                <Tooltip placement='bottom' title={r.ffailDescription}>
                                    <img src={tipIcon} alt='' height={16} style={{ marginRight: 3 }} />
                                </Tooltip>
                                {statusDict['k' + v] || '--'}
                            </div>
                        );
                    } else {
                        return statusDict['k' + v] || '--';
                    }
                }
            }
        ];

        return (
            <div className='collectInvoices clearfix'>
                <div className='searchArea jxxDownload'>
                    <div className='row'>
                        <div className='inputItem'>
                            <label>申请日期：</label>
                            <RangePicker
                                allowClear={false}
                                value={searchOpt.rangeDate}
                                format='YYYY-MM-DD'
                                onChange={(d) => this.setState({ searchOpt: { ...searchOpt, rangeDate: d } })}
                            />
                        </div>
                        <div className='inputItem'>
                            <label style={{ verticalAlign: 0 }}>进销项：</label>
                            <Radio.Group onChange={(e) => this.setState({ searchOpt: { ...searchOpt, jxx: e.target.value } })} value={searchOpt.jxx}>
                                <Radio value=''>全部</Radio>
                                <Radio value={1}>进项</Radio>
                                <Radio value={2}>销项</Radio>
                            </Radio.Group>
                        </div>
                        <Button type='primary' style={{ marginRight: 10 }} disabled={searchLoading} onClick={() => this.onSearch(1)}>查询</Button>
                        <Button style={{ marginRight: 10 }} disabled={searchLoading || handlerErrorIng} onClick={this.onStartApply}>申请</Button>
                        <Button disabled={searchLoading || handlerErrorIng} style={{ marginRight: 10 }} onClick={this.onReset}>重置条件</Button>
                        <Button disabled={searchLoading || handlerErrorIng} onClick={this.handlerErrorApply}>处理异常记录</Button>
                    </div>

                    <div className='row fplxRow' style={{ marginTop: 17, marginBottom: -15 }}>
                        <div className='inputItem'>
                            <label style={{ verticalAlign: 9 }}>发票类型：</label>
                            <Checkbox
                                indeterminate={optIndeterminate}
                                onChange={this.onCheckAllOptFplx}
                                checked={searchOpt.fplxs.length === this.fplxOptions.length}
                                style={{ textAlign: 'left', marginBottom: 15 }}
                            >
                                全部
                            </Checkbox>
                            {
                                this.fplxOptions.map((item, i) => {
                                    return (
                                        <>
                                            <Checkbox
                                                key={item.value}
                                                onChange={(e) => this.onChangeOptFplx(e, item.value)}
                                                checked={searchOpt.fplxs.indexOf(item.value) !== -1}
                                                style={{ textAlign: 'left', width: item.width, marginLeft: i === 3 ? 82 : 0, marginBottom: 15 }}
                                            >
                                                {item.label}
                                            </Checkbox>
                                            {
                                                i === 2 ? (
                                                    <br />
                                                ) : null
                                            }
                                        </>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>


                <Table
                    rowKey='fid'
                    dataSource={listData}
                    columns={tabCols}
                    pagination={false}
                    bordered={false}
                    loading={searchLoading}
                />

                <Pagination
                    size='small'
                    current={searchOpt.page}
                    total={totalNum}
                    showSizeChanger
                    showQuickJumper
                    className='floatRight'
                    pageSize={searchOpt.pageSize}
                    pageSizeOptions={['10', '20', '40']}
                    onShowSizeChange={(c, size) => this.onSearch(c, size)}
                    onChange={(c, size) => this.onSearch(c, size)}
                />
                <Modal
                    className='collectInvoices'
                    visible={showApplyDialog}
                    onCancel={() => this.setState({ showApplyDialog: false })}
                    title='下载申请'
                    footer={false}
                    width={800}
                    height={700}
                >
                    <div className='searchArea jxxDownload' style={{ borderBottom: 0 }}>
                        <div className='row' style={{ marginBottom: 20 }}>
                            <div className='inputItem'>
                                <label style={{ verticalAlign: 0 }}>进销项：</label>
                                <Radio.Group onChange={(e) => this.setState({ jxxFlag: e.target.value })} value={jxxFlag}>
                                    <Radio value=''>全部</Radio>
                                    <Radio value={1}>进项</Radio>
                                    <Radio value={2}>销项</Radio>
                                </Radio.Group>
                            </div>
                        </div>
                        <div className='row' style={{ marginBottom: 25 }}>
                            <div className='inputItem'>
                                <label>开票月份：</label>
                                <MonthPicker
                                    allowClear={false}
                                    value={rangeDate[0]}
                                    format='YYYY-MM'
                                    style={{ width: 150 }}
                                    disabledDate={(d) => {
                                        return d > rangeDate[1] || d > moment();
                                    }}
                                    onChange={(d) => {
                                        this.setState({
                                            rangeDate: [d, rangeDate[1]]
                                        });
                                    }}
                                />
                                -
                                <MonthPicker
                                    allowClear={false}
                                    value={rangeDate[1]}
                                    format='YYYY-MM'
                                    style={{ width: 150 }}
                                    disabledDate={(d) => {
                                        return d < rangeDate[0] || d > moment();
                                    }}
                                    onChange={(d) => {
                                        this.setState({
                                            rangeDate: [rangeDate[0], d]
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className='row fplxRow'>
                            <div className='inputItem'>
                                <label style={{ verticalAlign: 9 }}>发票类型：</label>
                                <Checkbox
                                    indeterminate={indeterminate}
                                    onChange={this.onCheckAllFplx}
                                    checked={fplxs.length === this.fplxOptions.length}
                                    style={{ textAlign: 'left', marginBottom: 15 }}
                                >
                                    全部
                                </Checkbox>
                                {
                                    this.fplxOptions.map((item, i) => {
                                        let marginLeft = 0;
                                        if (i === 3 || i === 6) {
                                            marginLeft = 82;
                                        }
                                        return (
                                            <>
                                                <Checkbox
                                                    key={item.value}
                                                    onChange={(e) => this.onChangeFplx(e, item.value)}
                                                    checked={fplxs.indexOf(item.value) !== -1}
                                                    style={{
                                                        textAlign: 'left',
                                                        width: item.width,
                                                        marginLeft,
                                                        marginBottom: 15
                                                    }}
                                                >
                                                    {item.label}
                                                </Checkbox>
                                                {
                                                    i === 2 ? (
                                                        <br />
                                                    ) : null
                                                }
                                            </>
                                        );
                                    })
                                }
                            </div>
                        </div>

                        <div className='applyTip'>
                            <p style={{ marginBottom: 4 }}>1、同一个开票月份的每一类发票每24小时申请下载请求不超过1次；</p>
                            <p>2、当前开票月份的每一类发票最多申请5次发票下载，历史开票月份的每一类发票每30天可申请一次发票下载</p>
                        </div>

                        {
                            applyErrDescription.length > 0 ? applyErrDescription.map((item, i) => {
                                return (
                                    <p
                                        key={i}
                                        className='red'
                                        style={{ marginBottom: 10 }}
                                    >
                                        {item.description}
                                    </p>
                                );
                            }) : null
                        }

                        <div className='row' style={{ textAlign: 'center', marginTop: 30 }}>
                            <Button type='primary' style={{ marginRight: 15 }} disabled={loading} onClick={this.startApply}>提交申请</Button>
                            <Button disabled={loading} onClick={() => this.setState({ showApplyDialog: false })}>取消</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}


DiskJxxDownload.propTypes = {
    clientType: PropTypes.number,
    govOperate: PropTypes.object.isRequired,
    showLogin: PropTypes.func.isRequired,
    loginGovInfo: PropTypes.object,
    access_token: PropTypes.string,
    downloadAccountQueryUrl: PropTypes.string.isRequired,
    downloadApplyUrl: PropTypes.string.isRequired,
    handlerErrApplyUrl: PropTypes.string.isRequired,
    fpdkType: PropTypes.number
};

export default DiskJxxDownload;