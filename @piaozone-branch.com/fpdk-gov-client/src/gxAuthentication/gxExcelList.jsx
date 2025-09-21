import React, { useState } from 'react';
import { Button, Upload, Tooltip, message, Modal } from 'antd';
import { compressImgFile } from '@piaozone.com/process-image';
import { confirm, modalError } from '../commons/antdModal';
import { tools, cookieHelp, pwyFetch } from '@piaozone.com/utils';
import PropTypes from 'prop-types';

const GxExcelList = (
    {
        displayCls,
        gxExportUrl,
        gxImportUrl,
        deductionPurpose,
        searchOpt,
        onImportExcelInvoices,
        importExcelResult,
        onCloseResult,
        onClickGxLog
    }) => {
    const [showExcel, setShowExcel] = useState(false);
    const [gxExporting, setGxExporting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [totalNum, setTotalInvoices] = useState(0);
    const [cancelList, setCancelList] = useState([]);
    const [selectList, setSelectList] = useState([]);
    const dkgxSeach = (searchOpt) => { //发票勾选界面我的发票查询
        const pageSize = searchOpt.pageSize || 50;
        let fplx = searchOpt.fplx;
        //-1全部，01增值税专用发票，02货运专用发票，03机动车发票，14通行费发票
        if (fplx === '-1') {
            fplx = '';
        } else if (fplx === '01') {
            fplx = '4';
        } else if (fplx === '03') {
            fplx = '12';
        } else if (fplx === '10') {
            fplx = '2';
        } else if (fplx === '14') {
            fplx = '15';
        }
        let gxzt = searchOpt.gxzt || '';
        gxzt = gxzt.toString();
        let param = {
            accountDate: searchOpt.accountDate,
            preSelector: searchOpt.preSelector,
            moduleType: '1', //通过勾选模块去查询，减少票种范围
            deductionPurpose: searchOpt.deductionPurpose || '', //抵扣用途
            collectUser: searchOpt.collectUser || '', //采集人
            createEndTime: searchOpt.createEndTime || '',
            createStartTime: searchOpt.createStartTime || '',
            startTime: searchOpt.rq_q || '',
            endTime: searchOpt.rq_z || '',
            startSelectTime: gxzt === '1' ? searchOpt.gxStartTime : '',
            endSelectTime: gxzt === '1' ? searchOpt.gxEndTime : '',
            preSelectTimeStart: gxzt === '5' ? searchOpt.gxStartTime : '',
            preSelectTimeEnd: gxzt === '5' ? searchOpt.gxEndTime : '',
            startAuthTime: searchOpt.startAuthTime || '',
            endAuthTime: searchOpt.endAuthTime || '',
            equalNameValue: searchOpt.equalNameValue || '',
            expendStatus: searchOpt.expendStatus || '',
            invoiceCode: searchOpt.fpdm || '',
            invoiceNo: searchOpt.fphm || '',
            invoiceStatus: searchOpt.fpzt == -1 ? '' : searchOpt.fpzt,
            isEqualsName: searchOpt.isEqualsName || '', //发票抬头是否一致， 1是，2否
            isSign: searchOpt.isSign || '', //纸票是否签收 1是，2否
            pageNo: searchOpt.page || 1,
            pageSize: pageSize,
            expenseReviewer: searchOpt.expenseReviewer === '筛选有审核人的发票' ? '' : searchOpt.expenseReviewer,
            expenseReviewerNotNull: searchOpt.expenseReviewer === '筛选有审核人的发票' ? 1 : '',
            expenseSystemSource: searchOpt.expenseSystemSource === '筛选有来源系统的发票' ? '' : searchOpt.expenseSystemSource,
            expenseSystemSourceNotNull: searchOpt.expenseSystemSource === '筛选有来源系统的发票' ? 1 : '',
            salerName: searchOpt.salerName || '', //销方名称
            isFauthenticate: gxzt === '-1' ? '4' : gxzt, // 0:未勾选，1勾选，2勾选认证，3扫描认证  4 未勾选和勾选合并数据
            type: fplx
        };

        // 海关缴款书参数
        if (fplx === '21') {
            param = {
                customDeclarationNo: searchOpt.customDeclarationNo || '',
                deptName: searchOpt.deptName || '',
                declareNo: searchOpt.declareNo || '',
                accountDate: searchOpt.accountDate,
                preSelector: searchOpt.preSelector,
                deductionPurpose: searchOpt.deductionPurpose || '', //抵扣用途
                collectUser: searchOpt.collectUser || '', //采集人
                createEndTime: searchOpt.createEndTime || '',
                createStartTime: searchOpt.createStartTime || '',
                startTime: gxzt === '0' ? searchOpt.rq_q : '',
                endTime: gxzt === '0' ? searchOpt.rq_z : '',
                startSelectTime: gxzt === '1' ? searchOpt.rq_q : '',
                endSelectTime: gxzt === '1' ? searchOpt.rq_z : '',
                preSelectTimeStart: gxzt === '5' ? searchOpt.rq_q : '',
                preSelectTimeEnd: gxzt === '5' ? searchOpt.rq_z : '',
                startAuthTime: searchOpt.startAuthTime || '',
                endAuthTime: searchOpt.endAuthTime || '',
                equalNameValue: searchOpt.equalNameValue || '',
                expendStatus: searchOpt.expendStatus || '',
                invoiceStatus: searchOpt.fpzt == -1 ? '' : searchOpt.fpzt,
                isEqualsName: searchOpt.isEqualsName || '', //发票抬头是否一致， 1是，2否
                expenseReviewer: searchOpt.expenseReviewer === '筛选有审核人的发票' ? '' : searchOpt.expenseReviewer,
                expenseReviewerNotNull: searchOpt.expenseReviewer === '筛选有审核人的发票' ? 1 : '',
                expenseSystemSource: searchOpt.expenseSystemSource === '筛选有来源系统的发票' ? '' : searchOpt.expenseSystemSource,
                expenseSystemSourceNotNull: searchOpt.expenseSystemSource === '筛选有来源系统的发票' ? 1 : '',
                isSign: searchOpt.isSign || '', //纸票是否签收 1是，2否
                pageNo: searchOpt.page || 1,
                pageSize: pageSize,
                isFauthenticate: gxzt === '-1' ? '4' : gxzt, // 0:未勾选，1勾选，2勾选认证，3扫描认证  4 未勾选和勾选合并数据
                type: fplx
            };
        }
        return param;
    };

    const formatData = (list) => {
        if (list.length > 0) {
            return list.map((item) => {
                return {
                    ...item,
                    yxse: item.yxse ? item.yxse : item.taxAmount || item.totalTaxAmount
                };
            });
        } else {
            return list;
        }
    };

    const gxExportData = async(files, type) => { //按查询条件到处要勾选的数据
        confirm({
            title: '全部发票导出提示',
            content: '是否导出当前查询的所有发票，请确认！',
            onOk: async() => {
                const param = dkgxSeach(searchOpt);
                tools.downloadFile({
                    url: gxExportUrl,
                    data: param,
                    method: 'POST',
                    downloadType: 'xhr',
                    startCallback: () => {
                        setGxExporting(true);
                        message.loading('导出EXCEL中...', 0);
                    },
                    endCallback: (res) => {
                        setGxExporting(false);
                        message.destroy();
                        if (res.errcode !== '0000') {
                            message.success('导出失败!');
                            return;
                        }
                        message.success('导出成功');
                    }
                });
            }
        });
    };

    const gxImportData = async(files) => { //导入要勾选的数据
        // 文件限制
        let overLimit = false;
        files = files.filter(o => {
            if (o.size > 20 * 1024 * 1024) {
                overLimit = true;
            } else {
                return true;
            }
        });
        if (overLimit) message.warning('单个文件大小最大允许20M，已自动过滤超出限制的文件，请检查！');
        const { fileQuality, fileLimitSize, fileLimitPixel } = window.__INITIAL_STATE__;
        const fileRes = await compressImgFile(files[0], { fileQuality, fileLimitSize, fileLimitPixel });
        const file = fileRes.file;
        const formData = new FormData();
        formData.append('file', file);
        const endLoading = message.loading('处理中...', 0);
        setUploading(true);
        const res = await pwyFetch(gxImportUrl, {
            data: formData,
            method: 'POST',
            contentType: 'file'
        });
        endLoading();
        setUploading(false);
        if (res.errcode === '0000') {
            const { cancel, select } = res.data;
            setTotalInvoices(res.data.totalNum || 0);
            let cancelLists = [];
            let selectLists = [];
            if (cancel) { //撤销
                if (deductionPurpose == 1) { // 1抵扣，2不抵扣
                    cancelLists = cancel.deduct || [];
                    setCancelList(cancel.deduct || []);
                } else {
                    cancelLists = cancel.notDeduct || [];
                    setCancelList(cancel.notDeduct || []);
                }
            }
            if (select) { //勾选
                if (deductionPurpose == 1) {
                    setSelectList(select.deduct || []);
                    selectLists = select.deduct || [];
                } else {
                    setSelectList(select.notDeduct || []);
                    selectLists = select.notDeduct || [];
                }
            }
            if (deductionPurpose == 1) {
                if (cancelLists.length == 0 && selectLists.length == 0) {
                    modalError({
                        title: '解析excel失败',
                        content: '未解析到任何抵扣勾选和撤销抵扣勾选数据, 请选择正确的文件上传！'
                    });
                    return;
                }
            }
            if (deductionPurpose == 2) {
                if (cancelLists.length == 0 && selectLists.length == 0) {
                    modalError({
                        title: '解析excel失败',
                        content: '未解析到任何不抵扣勾选和撤销不抵扣勾选数据, 请选择正确的文件上传！'
                    });
                    return;
                }
            }
            setShowExcel(true);
        } else {
            modalError({
                title: '解析excel失败',
                content: res.data || '解析excel失败，请检查excel'
            });
        }
        return false;
    };
    const csrfToken = cookieHelp.getCookie('csrfToken');
    const uploadProps = {
        name: 'checkFile',
        method: 'post',
        multiple: false,
        accept: '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        showUploadList: false,
        withCredentials: true,
        data: {},
        headers: { 'x-csrf-token': csrfToken },
        action: gxImportUrl,
        beforeUpload: (file, files) => {
            if (uploading) {
                return false;
            }
            gxImportData(files);
            return false;
        }
    };

    const onSubmit = () => { //提交数据
        const selectData = formatData(selectList);
        const cancelData = formatData(cancelList);
        onImportExcelInvoices(selectData, cancelData);
        setShowExcel(false);
        setTotalInvoices(0);
        setCancelList([]);
        setSelectList([]);
    };

    return (
        <div className='gxExcelList' style={{ display: displayCls || 'inline-block' }}>
            <Upload {...uploadProps} className='inlineBlock'>
                <Tooltip title='支持导入发票Excel，提交税局进行增值税抵扣勾选/撤销勾选、增值税不抵扣勾选/撤销勾选Excel导入勾选或撤销勾选操作'>
                    <Button type='primary' loading={uploading} style={{ marginLeft: 20 }}>导入清单勾选</Button>
                </Tooltip>
            </Upload>
            <Tooltip title='按筛选条件导出发票数据Excel'>
                <Button type='primary' loading={gxExporting} onClick={gxExportData} style={{ marginLeft: 20 }}>导出</Button>
            </Tooltip>
            <Modal
                visible={showExcel}
                title='Excel清单校验结果'
                wrapClassName='showExcelCls'
                maskClosable={false}
                onCancel={() => {
                    setShowExcel(false);
                    setTotalInvoices(0);
                    setCancelList([]);
                    setSelectList([]);
                }}
                footer={null}
            >
                <div className='showExcelCls-cont'>
                    <p className='title'>导入的EXCEL中：</p>
                    <p><span className='point'>-</span>共读取数据<span className='count'>{totalNum}</span>条</p>
                    <p>
                        <span className='point'>-</span>将提交{deductionPurpose == 1 ? '抵扣勾选' : '不抵扣勾选'}的发票
                        <span className='count'>{selectList.length || 0}</span>份
                    </p>
                    <p>
                        <span className='point'>-</span>将{deductionPurpose == 1 ? '撤销抵扣勾选' : '撤销不抵扣勾选'}的发票
                        <span className='count'>{cancelList.length || 0}</span>份
                    </p>
                    <span className='tips'>请核对数据准确性，确定后将提交税局勾选操作</span>
                    <div className='footer'>
                        <Button type='primary' className='btn' onClick={onSubmit}>确认提交</Button>
                    </div>
                </div>
            </Modal>
            {
                importExcelResult ? (
                    <Modal
                        visible={!!importExcelResult}
                        title='Excel清单勾选结果'
                        wrapClassName='showExcelCls'
                        maskClosable={false}
                        onCancel={() => { onCloseResult(); }}
                        footer={null}
                    >
                        <div className='showExcelCls-cont'>
                            <p>共成功<span className='count'>{importExcelResult.success.totalNum}</span>条</p>
                            <p>
                                <span className='point'>-</span>勾选
                                <span className='count'>{importExcelResult.success.gxNum}</span>份
                            </p>
                            <p>
                                <span className='point'>-</span>撤销勾选
                                <span className='count'>{importExcelResult.success.cancelNum}</span>份
                            </p>
                            <p>共失败<span className='count'>{importExcelResult.fail.totalNum}</span>条</p>
                            <p>
                                <span className='point'>-</span>勾选
                                <span className='countFail'>{importExcelResult.fail.gxNum}</span>份
                            </p>
                            <p>
                                <span className='point'>-</span>撤销勾选
                                <span className='countFail'>{importExcelResult.fail.cancelNum}</span>份
                            </p>
                            <span className='tips'>可在</span>
                            <span className='gxLog' onClick={() => { onCloseResult(); onClickGxLog(); }}>【勾选日志】</span>
                            <span className='tips'>导出勾选结果明显</span>
                            <div className='footer'>
                                <Button type='primary' className='btn' onClick={() => { onCloseResult(); }}>知道了</Button>
                            </div>
                        </div>
                    </Modal>
                ) : null
            }
        </div>
    );
};

GxExcelList.propTypes = {
    displayCls: PropTypes.string,
    gxExportUrl: PropTypes.string.isRequired,
    gxImportUrl: PropTypes.string.isRequired,
    deductionPurpose: PropTypes.string.isRequired,
    searchOpt: PropTypes.object.isRequired,
    onImportExcelInvoices: PropTypes.func.isRequired,
    importExcelResult: PropTypes.object,
    onCloseResult: PropTypes.func,
    onClickGxLog: PropTypes.func
};

export default GxExcelList;