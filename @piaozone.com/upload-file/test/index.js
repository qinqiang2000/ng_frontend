import React from 'react';
import ReactDOM from 'react-dom';
import MultiInvoicesUpload from '..//src/multiInvoicesUpload.js';
import { Modal, Progress } from 'antd';

import './style.css';

const staticUrl = 'http://localhost/static';
const userKey = 'a401c3c2f17f558e5b4d26b614990c2c';

class TestPage extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            listData: [],
            scale: 1.5,
            curImageSrc: '',
            pdfErrList: []
        };

        this.multiInvoicesUpload = new MultiInvoicesUpload({
            limeFileSize: 50,
            staticUrl: staticUrl,
            uploadName: 'exceltxt',
            uploadFullUrl: '/m16/invoice/localfile/save',
            uploadSingleUrl: '/m4/fpzs/expense/upload',
            analysisFullUrl: '/m16/invoice/pdf/analysis',
            getPdfInfoUrl: '/m4/fpzs/expense/upload/by/url',
            fileLimitSize: 3, // 大于3M才压缩
            fileQuality: 0.98, // 清晰度
            fileLimitPixel: 1500, // 原始像素小于该值则不处理
            datas: {
                userKey,
                isIeBrowser: window.isIeBrowser || ''
            }
        });
    }

    startUpload = async(e) => {
        const fileTarget = document.getElementById('file');
        this.setState({
            listData: [],
            percent: 0,
            percentDescription: fileTarget.files[0].name,
            isUploadingMultiPdf: true
        });

        this.multiInvoicesUpload.start(fileTarget.files, {
            onPreUpload: function(res) {
                console.log('onPreUpload', res);
                return {
                    errcode: '0000',
                    data: {
                        test: '123'
                    }
                };
            },
            onStepFinish: function(res) {
                const processType = res.processType;
                const pageNo = res.pageNo;
                if (processType === 'pdfPage') {
                    console.log('pdf第' + pageNo + '页结果: ', res);
                } else if (processType === 'pdf') {
                    console.log('pdf' + res.name + '处理结果：', res);
                } else {
                    console.log(res.name, res);
                }
            },
            onFinish: function() {
                console.log('全部文件上传完成');
            }
        });
        return false;
    }


    render() {
        const {
            percent = 0,
            percentDescription = '',
            isUploadingMultiPdf,
            listData = [],
            curImageSrc = ''
        } = this.state;
        return (
            <div>
                <input type='file' name='test' id='file' multiple='multiple' />
                <button onClick={this.startUpload}>开始上传</button>
                <p>共{listData.length}张图像</p>
                <div>
                    {
                        listData.map((item) => {
                            return (
                                <div className='outImgItem' key={item.id}>
                                    <div className='imgItem'>
                                        <img
                                            src={item.localUrl}
                                            onClick={() => this.setState({ curImageSrc: item.localUrl })}
                                        />;
                                    </div>

                                    <p className='info'>
                                        <span>{item.name}</span>
                                    </p>
                                    <p className='info'>
                                        <span>第{item.pageNo}页</span>
                                    </p>
                                    <p className='info'>
                                        <span>长宽: {item.width} x {item.height}</span>
                                    </p>
                                    <p className='info'>
                                        <span>大小: {parseInt(item.size / 1024)}Kb</span>
                                    </p>
                                    <p className='info' style={{ marginTop: 5 }}>
                                        <span>返回: {item.description}[{item.errcode}]</span>
                                    </p>
                                </div>
                            );
                        })
                    }
                </div>
                <canvas id='canvasTest' />
                <div id='pageBox'>&nbsp;</div>

                <Modal
                    visible={!!curImageSrc}
                    width={900}
                    onCancel={() => this.setState({ curImageSrc: '' })}
                >
                    <img src={curImageSrc} style={{ maxWidth: 800 }} />
                </Modal>

                {
                    isUploadingMultiPdf ? (
                        <div
                            style={{
                                width: 300,
                                zIndex: 5,
                                position: 'absolute',
                                left: '50%',
                                marginLeft: -130,
                                top: '50%',
                                marginTop: -50,
                                background: '#fff',
                                padding: '10px 25px 10px 10px',
                                boxShadow: '0 0 3px #aaa',
                                border: '1px solid #aaa',
                                borderRadius: 4
                            }}
                        >
                            <Progress
                                type='line'
                                percent={percent}
                            />
                            <p>{percentDescription}</p>
                        </div>
                    ) : ''
                }
            </div>
        );
    }
}

const domCom = React.createElement(TestPage, {});
ReactDOM.render(domCom, document.getElementById('root'));
// export default TestPage;

