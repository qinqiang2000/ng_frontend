import React, { useState } from 'react';
import { Upload, Input, Button, message, Modal } from 'antd';
import { pwyFetch } from '@piaozone.com/utils';
import './style.less';
import PropTypes from 'prop-types';

export default function ImportGovJxxZip(props) {
    const [processList, setProcessList] = useState([]);
    const [zipPassword, setZipPassword] = useState('');
    const [loading, setLoading] = useState(false);
    let uploadJxx = false;
    let tipsIndex = 1;
    const onImport = async(fileList) => {
        if (uploadJxx) {
            return false;
        }
        tipsIndex = 1;
        setLoading(true);
        setProcessList([]);

        uploadJxx = true;
        const formData = new FormData();
        let description = '';
        for (let i = 0; i < fileList.length; i++) {
            formData.append('files', fileList[i], fileList[i].name);
            formData.append('password', zipPassword);
            const res = await pwyFetch(props.uploadJxxUrl, {
                method: 'post',
                contentType: 'file',
                data: formData
            }, true);
            description = res.description || '服务端异常，请稍后再试！';
            setProcessList((processList) => {
                return [...processList].concat(res);
            });
        }
        message.destroy();
        uploadJxx = false;
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
        setLoading(false);
    };

    const zipPartList = ['.zip'];
    for (let i = 0; i < 99; i++) {
        const indexStr = i < 10 ? '0' + i : i;
        zipPartList.push('.z' + indexStr);
    }
    return (
        <div className='importGovJxxZip'>
            <div className='row' style={{ marginBottom: 20 }}>
                <label>进销项申请的压缩密码：</label>
                <Input
                    type='text'
                    placeholder='发票云自动申请的文件可以为空'
                    style={{ width: 300 }}
                    value={zipPassword}
                    onChange={(e) => setZipPassword(e.target.value)}
                />
            </div>
            <div className='row' style={{ marginBottom: 20 }}>
                <label>选择抵扣平台压缩文件：</label>
                <Upload
                    className='inlineBlock'
                    style={{ width: 200 }}
                    accept={zipPartList.join(',')}
                    showUploadList={false}
                    multiple={true}
                    beforeUpload={(info, list) => { onImport(list); return false; }}
                    disabled={loading}
                >
                    <Button type='primary' loading={loading}>选择文件并上传</Button>
                </Upload>
            </div>
            {
                processList.length > 0 ? (
                    <div className='tips'>
                        {
                            processList.map((item, j) => {
                                const { data = {} } = item;
                                const { successFiles = [], failFiles = [] } = data;
                                const result = successFiles.map((sItem, i) => {
                                    const {
                                        fileName,
                                        excelName,
                                        num
                                    } = sItem;
                                    return (
                                        <p className='success' key={excelName}>
                                            <span>{tipsIndex++}.压缩包名称: {fileName}</span>
                                            <span>，excel名称: {excelName}</span>
                                            <span>，发票份数: {num}</span>
                                            <span>，处理状态: 成功</span>
                                        </p>
                                    );
                                });

                                const result2 = failFiles.map((sItem, i) => {
                                    const {
                                        fileName,
                                        excelName,
                                        description
                                    } = sItem;
                                    return (
                                        <p className='err' key={excelName}>
                                            <span>{tipsIndex++}.压缩包名称: {fileName}</span>
                                            {
                                                excelName ? (
                                                    <span>，excel名称: {excelName}</span>
                                                ) : null
                                            }
                                            <span>，处理状态: {description}</span>
                                        </p>
                                    );
                                });
                                return result.concat(result2);
                            })
                        }
                    </div>
                ) : null
            }
            <p style={{ marginBottom: 0 }}>备注：压缩包来源税局抵扣勾选平台，发票管理 -&gt; 发票下载模块，可以人工到税局下载后在当前界面导入。</p>
        </div>
    );
}


ImportGovJxxZip.propTypes = {
    uploadJxxUrl: PropTypes.string.isRequired
};