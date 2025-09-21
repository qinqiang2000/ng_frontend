import React from 'react';
import moment from 'moment';
import { Tag, Icon, DatePicker, Button, Input } from 'antd';
import './style.less';
import PropTypes from 'prop-types';
import { getRecomentChecked } from './searchTools';

const { RangePicker } = DatePicker;
const { CheckableTag } = Tag;

class SearchBox extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            page: 1,
            pageSize: 15,
            searchValue: '',
            sensitiveWords: [],
            showMore: false,
            moreInvoiceTypes: false
        };
    }

    onChangeSearchValue = (e) => {
        this.setState({
            searchValue: e.target.value.trim()
        });
    }

    onChangeOpt = async(k, v) => {
        await this.props.onChangeOpt(k, v);
        this.setState({
            searchValue: ''
        });
    }

    getSearchWords = (searchOpt) => {
        const sensitiveWords = [];
        const checkTitle = [
            '入账属期', '发票类型', '发票状态', '报销状态', '签收状态', '旅客运输税额是否已抵扣',
            '发票代码', '发票号码', '销方名称', '采集人', '报销单号'
        ];
        const checkKeys = [
            'accountDate', 'invoiceTypes', 'invoiceStatus', 'expendStatus', 'originalState', 'transportDeduction',
            'invoiceCode', 'invoiceNo', 'salerName', 'collectUser', 'expenseNum'
        ];

        for (let i = 0; i < checkKeys.length; i++) {
            const curOpt = searchOpt[checkKeys[i]];
            if (typeof curOpt === 'undefined') {
                continue;
            }
            if (typeof curOpt === 'string' && curOpt !== '') {
                sensitiveWords.push({
                    type: 'string',
                    titleCn: checkKeys[i],
                    title: checkTitle[i],
                    text: curOpt
                });
            } else if (curOpt[0] && curOpt[0].checked === false && curOpt[0].value === '') { // 全部的查询为false
                const checked = [];
                for (let i = 1; i < curOpt.length; i++) {
                    if (curOpt[i].checked) {
                        checked.push(curOpt[i].text);
                    }
                }
                if (checked.length > 0) {
                    sensitiveWords.push({
                        type: 'select',
                        titleCn: checkKeys[i],
                        title: checkTitle[i],
                        text: checked.join('，')
                    });
                }
            }
        }
        return sensitiveWords;
    }

    deletTag = async(item) => {
        if (item.type === 'select') {
            await this.props.onChangeOpt(item.titleCn, {
                value: '',
                text: '全部',
                checked: false
            });
        } else {
            await this.props.onChangeOpt(item.titleCn, '');
        }
    }

    recommend = (opt) => {
        const checkKeys = [
            'accountDate', 'invoiceTypes', 'invoiceStatus', 'expendStatus', 'authenticateFlags', 'originalState', 'transportDeduction'
        ];
        const newSearchOpt = {
            ...this.props.searchOpt,
            invoiceCode: '',
            invoiceNo: '',
            salerName: '',
            collectUser: '',
            expenseNum: ''
        };
        const optKeys = Object.keys(opt);
        for (let i = 0; i < checkKeys.length; i++) {
            const curKey = checkKeys[i];
            if (optKeys.indexOf(curKey) !== -1) {
                newSearchOpt[curKey] = newSearchOpt[curKey].map((item) => {
                    return {
                        ...item,
                        checked: opt[curKey].indexOf(item.value) !== -1
                    };
                });
            } else {
                newSearchOpt[curKey] = newSearchOpt[curKey].map((item) => {
                    return {
                        ...item,
                        checked: curKey === 'authenticateFlags' ? item.checked : item.value === '' // 勾选条件没有全部
                    };
                });
            }
        }
        this.props.onRecommend(newSearchOpt);
    }

    renderGxSelect = (searchOpt) => {
        return (
            <>
                <label className='tagName'>勾选状态：</label>
                <div className='tags'>
                    <div className='region'>
                        {
                            searchOpt.authenticateFlags.map((item, i) => {
                                return (
                                    <CheckableTag
                                        key={item.value ? item.value : '-1'}
                                        checked={item.checked}
                                        className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                        onChange={(e) => this.props.onChangeOpt('authenticateFlags', item, 'single')}
                                    >
                                        {item.text}
                                    </CheckableTag>
                                );
                            })
                        }
                    </div>
                </div>
            </>
        );
    }

    render() {
        const {
            showMore,
            moreInvoiceTypes,
            searchValue
        } = this.state;
        const {
            exporting,
            gxAllInvoices,
            exportData,
            skssq = '',
            onChangeOpt,
            searchOpt,
            selectedRowKeys = [],
            fpdkType,
            isEntryVoucher,
            disabledGxAll,
            disabledGx,
            gxInvoices,
            qxGxInvoices,
            trafficDkInvoices,
            cancelTrafficDkInvoices,
            gxFlag,
            clientType
        } = this.props;
        const sensitiveWords = this.getSearchWords(searchOpt);
        const ssq = skssq.substr(0, 6);
        const deadLineDate = skssq.substr(7, 8);
        return (
            <div className='dkSearchBox'>
                <div className='topBtns'>
                    {
                        gxFlag !== 'traffic' ? (
                            <div style={{ fontSize: 12, marginBottom: 5, color: '#aaa' }}>
                                <span>当前税控所属期：<span className='ssq'>{skssq ? moment(ssq, 'YYYYMM').format('YYYY年MM月') : '--'}</span></span>
                                <span className='gray'>(当前可进行勾选操作的截止日期为：{skssq ? moment(deadLineDate, 'YYYYMMDD').format('YYYY年MM月DD日') : '--'})</span>
                            </div>
                        ) : null
                    }

                    <div className='tags' style={{ paddingRight: 100, minHeight: 22 }}>
                        <span className='title'>筛选条件</span>
                        {
                            sensitiveWords.length > 0 ? (
                                <>
                                    {
                                        sensitiveWords.map((item, index) => {
                                            return (
                                                <Tag
                                                    key={item.titleCn}
                                                    className='tag'
                                                    width={180}
                                                    closable
                                                    onClose={() => this.deletTag(item)}
                                                >
                                                    {item.title + '：' + item.text}
                                                </Tag>
                                            );
                                        })
                                    }
                                </>
                            ) : null
                        }
                    </div>
                    <div className='moreTip'>
                        {
                            showMore ? (
                                <span onClick={() => this.setState({ showMore: !showMore })}>收起过滤<Icon className='arrowUp' type='up' /></span>
                            ) : (
                                <span onClick={() => this.setState({ showMore: !showMore })}>展开过滤<Icon className='arrowDown' type='down' /></span>
                            )
                        }
                    </div>
                </div>
                <div className={showMore ? 'moreBox' : 'moreBox hidden'}>
                    <div className='row bottomLine'>
                        <label className='tagName'>推荐筛选方案：</label>
                        <CheckableTag
                            checked={getRecomentChecked({ originalState: [0], expendStatus: [1, 30, 60] }, searchOpt)}
                            onChange={() => this.recommend({ originalState: [0], expendStatus: [1, 30, 60] })}
                        >
                            未签收未入账
                        </CheckableTag>
                        <CheckableTag
                            checked={getRecomentChecked({ originalState: [1], expendStatus: [1, 30, 60] }, searchOpt)}
                            onChange={() => this.recommend({ originalState: [1], expendStatus: [1, 30, 60] })}
                        >
                            已签收未入账
                        </CheckableTag>
                        {
                            gxFlag === 'traffic' ? (
                                <>
                                    <CheckableTag
                                        checked={getRecomentChecked({ expendStatus: [65], transportDeduction: [0] }, searchOpt)}
                                        onChange={() => this.recommend({ expendStatus: [65], transportDeduction: [0] })}
                                    >
                                        已入账未抵扣
                                    </CheckableTag>
                                    <CheckableTag
                                        checked={getRecomentChecked({ expendStatus: [65], transportDeduction: [1] }, searchOpt)}
                                        onChange={() => this.recommend({ expendStatus: [65], transportDeduction: [1] })}
                                    >
                                        已入账已抵扣
                                    </CheckableTag>
                                </>
                            ) : (
                                <>
                                    <CheckableTag
                                        checked={getRecomentChecked({ expendStatus: [65], authenticateFlags: [0] }, searchOpt)}
                                        onChange={() => this.recommend({ expendStatus: [65], authenticateFlags: [0] })}
                                    >
                                        已入账未勾选
                                    </CheckableTag>
                                    <CheckableTag
                                        checked={getRecomentChecked({ expendStatus: [65], authenticateFlags: [1] }, searchOpt)}
                                        onChange={() => this.recommend({ expendStatus: [65], authenticateFlags: [1] })}
                                    >
                                        已入账已勾选
                                    </CheckableTag>
                                </>
                            )
                        }

                    </div>
                    <div className='row bottomLine'>
                        <label className='tagName'>入账属期：</label>
                        <div className='tags'>
                            <div className='region'>
                                {
                                    searchOpt.accountDate.map((item, i) => {
                                        return (
                                            <CheckableTag
                                                key={i}
                                                checked={item.checked}
                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                onChange={() => onChangeOpt('accountDate', item)}
                                            >
                                                {item.text}
                                            </CheckableTag>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className='row bottomLine'>
                        <label className='tagName'>发票种类：</label>
                        <div className='tags'>
                            <div className='region'>
                                {
                                    searchOpt.invoiceTypes.map((item, i) => {
                                        let showFlag = 'inline-block';
                                        if (!moreInvoiceTypes && i >= 7) {
                                            showFlag = 'none';
                                        }
                                        return (
                                            <CheckableTag
                                                key={i}
                                                checked={item.checked}
                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                onChange={(e) => onChangeOpt('invoiceTypes', item)}
                                                style={{ display: showFlag }}
                                            >
                                                {item.text}
                                            </CheckableTag>
                                        );
                                    })
                                }
                                {
                                    searchOpt.invoiceTypes.length > 7 ? (
                                        <label
                                            className='more'
                                            onClick={() => { this.setState({ moreInvoiceTypes: !moreInvoiceTypes }); }}
                                        >
                                            {moreInvoiceTypes ? '收起' : '更多'}
                                        </label>
                                    ) : null
                                }
                            </div>
                        </div>
                    </div>
                    <div className='row bottomLine'>
                        <div className='rowItem'>
                            <label className='tagName'>发票状态：</label>
                            <div className='tags'>
                                <div className='region'>
                                    {
                                        searchOpt.invoiceStatus.map((item, i) => {
                                            return (
                                                <CheckableTag
                                                    key={i}
                                                    checked={item.checked}
                                                    className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                    onChange={(e) => onChangeOpt('invoiceStatus', item)}
                                                >
                                                    {item.text}
                                                </CheckableTag>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='rowItem'>
                            <label className='tagName'>签收状态：</label>
                            <div className='tags'>
                                <div className='region'>
                                    {
                                        searchOpt.originalState.map((item, i) => {
                                            return (
                                                <CheckableTag
                                                    key={i}
                                                    checked={item.checked}
                                                    className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                    onChange={(e) => onChangeOpt('originalState', item, 'single')}
                                                >
                                                    {item.text}
                                                </CheckableTag>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='row bottomLine'>
                        <div className='rowItem'>
                            <label className='tagName'>使用状态：</label>
                            <div className='tags'>
                                <div className='region'>
                                    {
                                        searchOpt.expendStatus.map((item, i) => {
                                            return (
                                                <CheckableTag
                                                    key={i}
                                                    checked={item.checked}
                                                    className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                    onChange={(e) => onChangeOpt('expendStatus', item)}
                                                >
                                                    {item.text}
                                                </CheckableTag>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            gxFlag === 'traffic' ? (
                                <div className='rowItem'>
                                    <label className='trivelTagName'>旅客运输税额是否已抵扣：</label>
                                    <div className='tags'>
                                        <div className='region'>
                                            {
                                                searchOpt.transportDeduction.map((item, i) => {
                                                    return (
                                                        <CheckableTag
                                                            key={i}
                                                            checked={item.checked}
                                                            className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                            onChange={(e) => onChangeOpt('transportDeduction', item, 'single')}
                                                        >
                                                            {item.text}
                                                        </CheckableTag>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='rowItem'>
                                    {this.renderGxSelect(searchOpt)}
                                </div>
                            )
                        }
                    </div>
                    {
                        gxFlag === 'dkgx' ? (
                            <div className='row bottomLine'>
                                {this.renderGxSelect(searchOpt)}
                            </div>
                        ) : null
                    }

                    <div className='row'>
                        <div className='searchItem inlineBlock' style={{ marginRight: 55 }}>
                            <label className='tagName'>采集日期：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate' style={{ width: 220 }}
                                onChange={(d) => onChangeOpt('belongDate', d)}
                                value={searchOpt.belongDate}
                                placeholder={['开始时间', '结束时间']}
                                allowClear={true}
                            />
                        </div>
                        <div className='searchItem inlineBlock' style={{ marginRight: 55 }}>
                            <label className='tagName'>开票时间：</label>
                            <RangePicker
                                disabledDate={(current) => {
                                    if (gxFlag === 'traffic') {
                                        return current < moment('2019-04-01', 'YYYY-MM-DD') || current > moment();
                                    }
                                    return current > moment();
                                }}
                                className='rangeDate' style={{ width: 220 }}
                                onChange={(d) => onChangeOpt('invoiceTime', d)}
                                value={searchOpt.invoiceTime}
                                placeholder={['开始时间', '结束时间']}
                                allowClear={true}
                            />
                        </div>
                        <div className='searchItem inlineBlock' style={{ marginRight: 55 }}>
                            <label className='tagName'>入账时间：</label>
                            <RangePicker
                                disabledDate={(current) => { return current > moment(); }}
                                className='rangeDate'
                                style={{ width: 220 }}
                                onChange={d => onChangeOpt('accountTime', d)}
                                placeholder={['开始时间', '结束时间']}
                                value={searchOpt.accountTime}
                                allowClear={true}
                            />
                        </div>
                    </div>
                </div>
                <div className='middleOperateBtns clearfix'>
                    {
                        typeof gxInvoices === 'function' ? (
                            <Button
                                className='btn btnCol'
                                disabled={selectedRowKeys.length === 0 || disabledGx}
                                onClick={() => gxInvoices()}
                            >
                                勾选发票
                            </Button>
                        ) : null
                    }
                    {
                        typeof qxGxInvoices === 'function' ? (
                            <Button
                                className='btn btnCol'
                                disabled={selectedRowKeys.length === 0 || disabledGx}
                                onClick={() => this.props.qxGxInvoices()}
                            >
                                撤销勾选
                            </Button>
                        ) : null
                    }

                    {
                        fpdkType === 2 && isEntryVoucher === 1 && typeof gxAllInvoices === 'function' ? (
                            <Button
                                className='btn'
                                disabled={disabledGxAll}
                                onClick={gxAllInvoices}
                            >
                                全部勾选
                            </Button>
                        ) : null
                    }
                    {
                        typeof trafficDkInvoices === 'function' ? (
                            <Button
                                className='btn btnCol'
                                disabled={selectedRowKeys.length === 0}
                                onClick={() => trafficDkInvoices()}
                            >
                                旅客运输税额抵扣
                            </Button>
                        ) : null
                    }
                    {
                        clientType == 1 ? (
                            <Button
                                className='btn btnCol'
                                disabled={selectedRowKeys.length === 0}
                                onClick={() => cancelTrafficDkInvoices()}
                            >
                                撤销抵扣
                            </Button>
                        ) : null
                    }

                    {
                        typeof exportData === 'function' ? (
                            <Button
                                className='btn'
                                loading={exporting}
                                onClick={exportData}
                            >
                                数据导出
                            </Button>
                        ) : null
                    }

                    {
                        typeof this.props.onSearch === 'function' ? (
                            <Button
                                className='btn'
                                onClick={() => this.props.onSearch(searchOpt)}
                            >
                                搜索
                            </Button>
                        ) : null
                    }


                    <div className='search floatRight'>
                        <Input
                            placeholder='搜索发票代码/发票号码/销方名称/采集人/报销单号'
                            style={{ width: 260 }}
                            prefix={<Icon type='search' />}
                            value={searchValue}
                            onChange={this.onChangeSearchValue}
                        />
                        {
                            searchValue ? (
                                <div className='searchList'>
                                    <div
                                        className='searchListRow'
                                        onClick={(e) => this.onChangeOpt('invoiceCode', searchValue)}
                                    >
                                        <label className='searchName'>发票代码：</label>{searchValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={(e) => this.onChangeOpt('invoiceNo', searchValue)}
                                    >
                                        <label className='searchName'>发票号码：</label>{searchValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={(e) => this.onChangeOpt('salerName', searchValue)}
                                    >
                                        <label className='searchName'>销方名称：</label>{searchValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={(e) => this.onChangeOpt('collectUser', searchValue)}
                                    >
                                        <label className='searchName'>采集人：</label>{searchValue}
                                    </div>
                                    <div
                                        className='searchListRow'
                                        onClick={(e) => this.onChangeOpt('expenseNum', searchValue)}
                                    >
                                        <label className='searchName'>报销单号：</label>{searchValue}
                                    </div>
                                </div>
                            ) : null
                        }

                    </div>
                </div>
            </div>
        );
    }
}


SearchBox.propTypes = {
    skssq: PropTypes.string,
    onRecommend: PropTypes.func,
    onChangeOpt: PropTypes.func,
    onSearch: PropTypes.func,
    exporting: PropTypes.bool,
    gxAllInvoices: PropTypes.func,
    selectedRowKeys: PropTypes.array,
    fpdkType: PropTypes.number,
    isEntryVoucher: PropTypes.number,
    disabledGxAll: PropTypes.bool,
    disabledGx: PropTypes.bool,
    gxInvoices: PropTypes.func,
    qxGxInvoices: PropTypes.func,
    trafficDkInvoices: PropTypes.func,
    cancelTrafficDkInvoices: PropTypes.func,
    gxFlag: PropTypes.string,
    searchOpt: PropTypes.object,
    clientType: PropTypes.object,
    exportData: PropTypes.func
};

export default SearchBox;