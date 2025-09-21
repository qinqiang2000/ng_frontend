import React from 'react';
import { UploadMultPagePdf, pdfRenderToCanvas, getPdfDocument } from '../../src/index.js';
import './style.css';
import { Modal, message, Progress } from 'antd';

// import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer';
// import 'pdfjs-dist/web/pdf_viewer.css';

const staticUrl = 'http://172.20.97.39/static';
const userKey = 'eb22a7090ac59bc19348d920428ca84b';
/*
const renderText = (textContent, pageDom, page, viewport) => {
    const textLayerDiv = document.createElement('div');
    textLayerDiv.setAttribute('class', 'textLayer');
    textLayerDiv.style.width = '800px';
    textLayerDiv.style.height = '600px';

    // 将文本图层div添加至每页pdf的div中
    pageDom.appendChild(textLayerDiv);

    // 创建新的TextLayerBuilder实例
    const textLayer = new TextLayerBuilder({
        textLayerDiv,
        pageIndex: page.pageIdx,
        viewport
    });
    console.log('textLayer', textLayer);
    textLayer.setTextContent(textContent);
    textLayer.render();
};

*/

class TestPage extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            listData: [],
            scale: 1.5,
            curImageSrc: '',
            pdfErrList: []
        };

        this.uploadMultPdf = new UploadMultPagePdf({
            limeFileSize: 50,
            staticUrl: staticUrl,
            uploadName: 'exceltxt',
            uploadSingleUrl: '/m4/fpzs/expense/upload',
            analysisFullUrl: '/m16/invoice/pdf/analysis',
            getPdfInfoUrl: '/m4/fpzs/expense/upload/by/url',
            datas: { userKey, isIeBrowser: window.isIeBrowser || '' }
        });
    }

    pdfToImages = async() => {
        const fileTarget = document.getElementById('file');
        this.setState({
            listData: [],
            percent: 0,
            percentDescription: fileTarget.files[0].name,
            isUploadingMultiPdf: true
        });

        const res = await this.uploadMultPdf.startUpload(fileTarget.files, (info) => {
            this.setState({
                listData: this.state.listData.concat({
                    width: info.width,
                    height: info.height,
                    name,
                    size: info.size,
                    id: info.id,
                    localUrl: info.imgSrc
                })
            });

            this.setState({
                percentDescription: info.filename,
                percent: ((info.percentIndex / info.totalPages) * 100).toFixed(2)
            });
        });

        setTimeout(() => {
            this.setState({
                isUploadingMultiPdf: false
            });
        }, 500);
        if (res.errcode !== '0000') {
            message.info(res.description);
        } else {
            message.success('处理完成！');
        }
        return false;
    }

    pdfRenderToCanvas = async() => {
        const fileTarget = document.getElementById('file');
        const file = fileTarget.files[0];

        this.setState({
            listData: []
        });

        const pdfRes = await getPdfDocument({
            CMAP_URL: staticUrl + '/gallery/pdfjs-dist/cmaps/', // pdfjs字体地址
            workerSrc: staticUrl + '/gallery/pdfjs-dist/build/pdf.worker.min.js', // pdfjs的worker地址
            file
        });

        if (pdfRes.errcode !== '0000') {
            message.info(pdfRes.description);
            return;
        }
        try {
            const res = await pdfRenderToCanvas(pdfRes.data, {
                scale: this.state.scale,
                canvasId: 'canvasTest'
            });

            if (res.errcode !== '0000') {
                message.info(res.description);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /*
    pdfRender = async() => {
        const fileTarget = document.getElementById('file');
        const file = fileTarget.files[0];
        const pdfRes = await getPdfDocument({
            CMAP_URL: staticUrl + '/static/gallery/pdfjs-dist/cmaps/', // pdfjs字体地址
            workerSrc: staticUrl + '/static/gallery/pdfjs-dist/build/pdf.worker.min.js', // pdfjs的worker地址
            file
        });

        if (pdfRes.errcode !== '0000') {
            message.info(pdfRes.description);
            return;
        }
        const pdfDoc = pdfRes.data;
        let outPage;
        pdfDoc.getPage(1).then((page) => {
            outPage = page;
            console.log(page);
            return page.getTextContent();
        }).then((textContent) => {
            const viewport = outPage.getViewport({ scale: 1.5 });
            const pageBox = document.getElementById('pageBox');
            renderText(textContent, pageBox, outPage, viewport);
        });
    }
    */

    render() {
        const {
            percent = 0,
            percentDescription = '',
            isUploadingMultiPdf,
            listData = [],
            curImageSrc = '',
            scale
        } = this.state;
        return (
            <div>
                <input type='file' name='test' id='file' />
                PDF放大系数：<input type='number' value={scale} onChange={(e) => this.setState({ scale: e.target.value })} />
                <button onClick={this.pdfToImages}>pdf转换为图像</button>
                <button onClick={this.pdfRenderToCanvas}>pdf渲染到画布</button>
                <button onClick={this.pdfRender}>pdf完整渲染</button>

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
                                        <span>长宽: {item.width} x {item.height}</span>
                                    </p>
                                    <p className='info'>
                                        <span>大小: {parseInt(item.size / 1024)}Kb</span>
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

export default TestPage;

