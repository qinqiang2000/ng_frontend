import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { INPUT_INVOICE_TYPES } from '../commons/constants';
const { CheckableTag } = Tag;
const recommendFuns = [ //推荐方案
    { checked: false, value: '1', text: '未签收未报销' },
    { checked: false, value: '2', text: '未签收报销中' },
    { checked: false, value: '3', text: '已签收未入账' },
    { checked: false, value: '4', text: '已签收未勾选' },
    { checked: false, value: '5', text: '已勾选未确认' }
];

const invoiceTypesArr = INPUT_INVOICE_TYPES.map((item) => {
    const { text, value } = item;
    return {
        text,
        value,
        checked: false
    };
});
invoiceTypesArr.unshift({ text: '全部', value: 0, checked: false });

const fpStatus = [ //发票状态
    { checked: false, value: '', text: '全部' },
    { checked: false, value: '0', text: '正常' },
    { checked: false, value: '1', text: '红冲' },
    { checked: false, value: '2', text: '作废' },
    { checked: false, value: '3', text: '失控' },
    { checked: false, value: '4', text: '异常' },
    { checked: false, value: 6, text: '红字发票待确认' },
    { checked: false, value: 7, text: '部分红冲' },
    { checked: false, value: 8, text: '全额红冲' }
];


const bxStatus = [ //报销状态
    { checked: false, value: '', text: '全部' },
    { checked: false, value: '1', text: '未报销' },
    { checked: false, value: '30', text: '审核中' },
    { checked: false, value: '60', text: '已报销未入账' },
    { checked: false, value: '65', text: '已报销已入账' }
];

const gxConfirm = [ //勾选状态
    { checked: false, value: '', text: '全部' },
    { checked: false, value: '0', text: '未勾选' },
    { checked: false, value: '1', text: '已勾选未确认' },
    { checked: false, value: '2', text: '已勾选已确认' }
];

const originalStateArr = [ //签名状态
    { checked: false, value: '1', text: '是' },
    { checked: false, value: '0', text: '否' }
];

const transportDeductionArr = [ //旅客运输状态
    { checked: false, value: '1', text: '是' },
    { checked: false, value: '0', text: '否' }
];

const chooseBuyName = [ //抬头是否一致
    { checked: false, value: '1', text: '是' },
    { checked: false, value: '0', text: '否' }
];

class RecommendFun extends React.Component {
    componentDidMount = async() => {
        this._isMounted = true;
        this.chooseFun('');
    }

    noSignNoBx = () => { //未报销未签收
        return {
            invoiceTypesArr: this.mapData(invoiceTypesArr, [0]),
            invoiceTypes: '0',
            fpStatus: this.mapData(fpStatus, [0]),
            invoiceStatus: fpStatus[0].value,
            bxStatus: this.mapData(bxStatus, [1]),
            expendStatus: bxStatus[1].value,
            gxConfirm: this.mapData(gxConfirm, [1]),
            authenticateFlags: gxConfirm[1].value,
            originalStateArr: this.mapData(originalStateArr, [1]),
            originalState: originalStateArr[1].value,
            transportDeductionArr: this.mapData(transportDeductionArr, [1]),
            transportDeduction: transportDeductionArr[1].value,
            chooseBuyName: this.mapData(chooseBuyName, [0]),
            equalNameValue: chooseBuyName[0].value,
            programme: '未报销未签收'
        };
    };

    noSignBxing = () => { //未报销签收中
        return {
            invoiceTypesArr: this.mapData(invoiceTypesArr, [0]),
            invoiceTypes: '0',
            fpStatus: this.mapData(fpStatus, [0]),
            invoiceStatus: '',
            bxStatus: this.mapData(bxStatus, [2]),
            expendStatus: bxStatus[2].value,
            gxConfirm: this.mapData(gxConfirm, [1]),
            authenticateFlags: gxConfirm[1].value,
            originalStateArr: this.mapData(originalStateArr, [1]),
            originalState: originalStateArr[1].value,
            transportDeductionArr: this.mapData(transportDeductionArr, [1]),
            transportDeduction: transportDeductionArr[1].value,
            chooseBuyName: this.mapData(chooseBuyName, [0]),
            equalNameValue: chooseBuyName[0].value,
            programme: '未报销签收中'
        };
    }

    signNoEntry = () => { //已签收未入账
        return {
            invoiceTypesArr: this.mapData(invoiceTypesArr, [0]),
            invoiceTypes: '0',
            fpStatus: this.mapData(fpStatus, [0]),
            invoiceStatus: '',
            bxStatus: this.mapData(bxStatus, [1, 2, 3]),
            expendStatus: [bxStatus[1].value, bxStatus[2].value, bxStatus[3].value].join(','),
            gxConfirm: this.mapData(gxConfirm, [1]),
            authenticateFlags: gxConfirm[1].value,
            originalStateArr: this.mapData(originalStateArr, [0]),
            originalState: originalStateArr[0].value,
            transportDeductionArr: this.mapData(transportDeductionArr, [1]),
            transportDeduction: transportDeductionArr[1].value,
            chooseBuyName: this.mapData(chooseBuyName, [0]),
            equalNameValue: chooseBuyName[0].value,
            programme: '已签收未入账'
        };
    }

    entryNoGx = () => { //已入账未勾选
        return {
            invoiceTypesArr: this.mapData(invoiceTypesArr, [2, 4, 11, 13]),
            invoiceTypes: [invoiceTypesArr[2].value, invoiceTypesArr[4].value, invoiceTypesArr[11].value, invoiceTypesArr[13].value].join(','),
            fpStatus: this.mapData(fpStatus, [0]),
            invoiceStatus: '',
            bxStatus: this.mapData(bxStatus, [4]),
            expendStatus: bxStatus[4].value,
            gxConfirm: this.mapData(gxConfirm, [1]),
            authenticateFlags: gxConfirm[1].value,
            originalStateArr: this.mapData(originalStateArr, [0]),
            originalState: originalStateArr[0].value,
            transportDeductionArr: this.mapData(transportDeductionArr, [1]),
            transportDeduction: transportDeductionArr[1].value,
            chooseBuyName: this.mapData(chooseBuyName, [0]),
            equalNameValue: chooseBuyName[0].value,
            programme: '已入账未勾选'
        };
    }

    gxNoConfirm = () => { //已勾选未确认
        return {
            invoiceTypesArr: this.mapData(invoiceTypesArr, [2, 4, 11, 13]),
            invoiceTypes: [invoiceTypesArr[2].value, invoiceTypesArr[4].value, invoiceTypesArr[11].value, invoiceTypesArr[13].value].join(','),
            fpStatus: this.mapData(fpStatus, [0]),
            invoiceStatus: '',
            bxStatus: this.mapData(bxStatus, [4]),
            expendStatus: bxStatus[4].value,
            gxConfirm: this.mapData(gxConfirm, [2]),
            authenticateFlags: gxConfirm[2].value,
            originalStateArr: this.mapData(originalStateArr, [0]),
            originalState: originalStateArr[0].value,
            transportDeductionArr: this.mapData(transportDeductionArr, [1]),
            transportDeduction: transportDeductionArr[1].value,
            chooseBuyName: this.mapData(chooseBuyName, [0]),
            equalNameValue: chooseBuyName[0].value,
            programme: '已勾选未确认'
        };
    }

    defaultFun = () => { //默认方案
        return {
            invoiceTypesArr: this.mapData(invoiceTypesArr, []),
            invoiceTypes: '0',
            fpStatus: this.mapData(fpStatus, []),
            invoiceStatus: '',
            bxStatus: this.mapData(bxStatus, []),
            expendStatus: '',
            gxConfirm: this.mapData(gxConfirm, []),
            authenticateFlags: '',
            originalStateArr: this.mapData(originalStateArr, []),
            originalState: '',
            transportDeductionArr: this.mapData(transportDeductionArr, []),
            transportDeduction: '',
            chooseBuyName: this.mapData(chooseBuyName, []),
            equalNameValue: '',
            programme: null
        };
    }

    chooseFun = (i) => {
        let opt = '';
        if (i != '') {
            if (recommendFuns[i].checked) { //不选择默认方案
                recommendFuns.forEach(item => { item.checked = false; });
                opt = this.defaultFun();
            } else { //当前选中
                recommendFuns.forEach(item => { item.checked = false; });
                recommendFuns[i].checked = true;
                if (i == 0) {
                    opt = this.noSignNoBx();
                } else if (i == 1) {
                    opt = this.noSignBxing();
                } else if (i == 2) {
                    opt = this.signNoEntry();
                } else if (i == 3) {
                    opt = this.entryNoGx();
                } else if (i == 4) {
                    opt = this.gxNoConfirm();
                }
            }
            this.setState({
                recommendFuns
            });
        } else {
            opt = this.defaultFun();
        }
        this.props.onChooseFun(opt);
    }

    mapData = (data, arr) => {
        data.forEach((item) => { item.checked = false; });
        const result = data.map((item, i) => {
            if (arr.length > 0) {
                for (const j in arr) {
                    const index = arr[j];
                    if (i == index) {
                        item.checked = true;
                    }
                }
            } else {
                item.checked = false;
            }
            return {
                ...item
            };
        });
        return result;
    }

    render() {
        return (
            <div className='row bottomLine'>
                <label className='tagName'>推荐筛选方案：</label>
                <div className='tags'>
                    {
                        recommendFuns.length > 0 ? (
                            <div className='region'>
                                {
                                    recommendFuns.map((item, i) => {
                                        return (
                                            <CheckableTag
                                                key={i}
                                                checked={item.checked}
                                                className={item.checked ? 'invoicesTag checked' : 'invoicesTag'}
                                                onChange={(e) => this.chooseFun(i + '', 'recommendFuns')}
                                                style={{ backgroundColor: 'none' }}
                                            >
                                                {item.text}
                                            </CheckableTag>
                                        );
                                    })
                                }
                            </div>
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

RecommendFun.propTypes = {
    onChooseFun: PropTypes.func.isRequired
};

export default RecommendFun;