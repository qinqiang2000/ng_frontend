import React from 'react';
import PropTypes from 'prop-types';
import * as PDFJS from 'pdfjs-dist';
// import workerSrc from 'pdfjs-dist/build/pdf.worker.entry';
import { TextLayerBuilder, EventBus } from 'pdfjs-dist/web/pdf_viewer';
import Toolbar from './toolbar';
import Spin from '@piaozone.com/spin';
import {
    CSS_UNITS,
    getVisibleElements,
    getCanvasCSSWH,
    watchScroll,
    getScale,
    getViewport,
    getDownloadInfo
} from './tools';
import 'pdfjs-dist/web/pdf_viewer.css';
import './style.css';
import SliderBar from './sliderBar';

// const PRINT_UNITS = 150 / 72.0;
const userAgent = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
const platform = (typeof navigator !== 'undefined' && navigator.platform) || '';
const maxTouchPoints = (typeof navigator !== 'undefined' && navigator.maxTouchPoints) || 1;

let maxCanvasPixels = 16777216;
// PDF之外占据的宽度 -18 padding -18减去滚动条宽度（不确定）
// let autoWidth = 36;
// let textLayerTop = 3;
// let scaleInterval = 0.05;

const isAndroid = /Android/.test(userAgent);
const isIOS = /\b(iPad|iPhone|iPod)(?=;)/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
;(function checkCanvasSizeLimitation() {
    if (isIOS || isAndroid) {
        maxCanvasPixels = 5242880;
        // autoWidth -= 18;
        // textLayerTop -= 1;
        // 手机上面缩放对清晰度影响更小
        // scaleInterval = 0.4;
    }
})();

class ViewPdf extends React.Component {
    constructor(props) {
        super(...arguments);
        this.eventBus = new EventBus();
        this.renderLimit = 3;
        this.scale = props.scale || 'auto';
        this.rotation = 0;
        PDFJS.GlobalWorkerOptions.workerSrc = props.pdfWorkUrl;
        this.state = {
            docRaw: null,
            fileType: '',
            filename: '',
            viewers: [],
            activePageNum: 1,
            openSlide: props.openSlide || false,
            currentPageNum: 1,
            loadFile: true,
            percent: 0.00,
            numPages: 0,
            scale: props.scale || 'auto',
            pagesContainerRotate: props.pagesContainerRotate || {}, // 没页旋转角度
            currentFileSrc: ''
        };
    }

    componentDidMount() {
        this.startRender();
    }

    componentWillReceiveProps(nextProps) {
        const { src, pagesContainerRotate } = nextProps;
        const { currentFileSrc } = this.state;
        if (src !== currentFileSrc && currentFileSrc) {
            this.startRender(src);
        }
        this.setState({
            currentFileSrc: src,
            pagesContainerRotate
        });
    }

    componentWillUnmount() {
        this._isAmounted = false;
    }

    async startRender(src) {
        this._isAmounted = true;
        const resDoc = await this._loadFile(src || this.props.src, this.props.data, this.props.fileType, this.props.filename);
        if (this.fileType === 'pdf') {
            this.init();
            this.pdfDoc = resDoc.data;
            this.numPages = this.pdfDoc.numPages;
            console.log('this.numPages-----test--', this.numPages);
            const tempViewers = [];
            for (let i = 1; i <= this.numPages; i++) {
                const view = await this._getView(i);
                tempViewers.push(view);
            }
            const visibileEles = getVisibleElements(this.viewerContainer, tempViewers, true);
            const activePageNum = visibileEles.views.length > 0 ? visibileEles.views[0].view.pageNum : 1;
            this.mySetState({
                loadFile: false,
                numPages: this.numPages,
                activePageNum: activePageNum,
                viewers: tempViewers
            });
            for (let i = 0; i < visibileEles.views.length; i++) {
                await this._renderPage(visibileEles.views[i].view);
            }

            setTimeout(() => {
                if (this.numPages == 1) { //处理单页第一次渲染电子签不显示bug
                    this.foreceRender(true, this.scale, true);
                }
            }, 50);
        }
    }

    calibrationData = () => { //校准
        var newScale = this.scale;
        newScale = (newScale).toFixed(2);
        newScale = Math.round(newScale * 100) / 100;
        this.foreceRender(true, newScale);
    }

    mySetState = (data) => {
        if (this._isAmounted) {
            this.setState(data);
        }
    }

    foreceRender = async(ignoreStatus, scale = this.scale, isInit = false) => {
        if (!this._isAmounted) {
            return;
        }
        let visibileEles = [];
        const oldScale = this.scale;
        if (scale !== this.scale || isInit) {
            this.scale = scale;
            this.mySetState({
                scale: scale
            });
            const oldScrollTop = this.viewerContainer.scrollTop;
            this.clear();
            const tempViewers = [];
            for (let i = 1; i <= this.numPages; i++) {
                const view = await this._getView(i);
                tempViewers.push(view);
            }
            this.mySetState({
                viewers: tempViewers
            });
            this.viewerContainer.scrollTop = oldScrollTop * (this.scale / oldScale);
            visibileEles = getVisibleElements(this.viewerContainer, tempViewers, true);
        } else {
            visibileEles = getVisibleElements(this.viewerContainer, this.state.viewers, true);
        }
        for (let i = 0; i < visibileEles.views.length; i++) {
            const viewInfo = visibileEles.views[i].view;
            if (ignoreStatus) {
                await this._renderPage(viewInfo);
            } else {
                if (viewInfo.renderStatus === 0) {
                    await this._renderPage(viewInfo);
                }
            }
        }
    }

    init = () => {
        this.printContainer = document.getElementById('printContainer');
        this.wrapperPdfs = document.getElementById('viewer');
        this.viewerContainer = document.getElementById('viewerContainer');
        this.sidebarContent = document.getElementById('sidebarContent');
        this.hideCanvas = document.createElement('canvas');
        this.ctx = this.hideCanvas.getContext('2d');
        this.clear();
        watchScroll(this.viewerContainer, () => {
            this.foreceRender();
        });
    }

    _getView = (num, scale = this.scale) => {
        return new Promise((resolve) => {
            this.pdfDoc.getPage(num).then(async(page) => {
                const outCanvas = document.createElement('div');
                outCanvas.className = 'page loading';
                outCanvas.id = 'pageContainer' + num;
                const pdfPageRotate = page.rotate;
                const totalRotation = (this.rotation + pdfPageRotate) % 360;
                const newScale = getScale(page, scale, { container: this.viewerContainer, rotation: this.rotation });
                const viewport = getViewport(page, CSS_UNITS * newScale, totalRotation);
                this.scale = newScale;
                if (this.state.scale !== newScale) {
                    this.mySetState({
                        scale: newScale
                    });
                }
                const canvasSize = getCanvasCSSWH(viewport, this.ctx, {
                    useOnlyCssZoom: this.props.useOnlyCssZoom,
                    maxCanvasPixels,
                    CSS_UNITS
                });
                outCanvas.style.width = (canvasSize.styleWidth) + 'px';
                outCanvas.style.height = (canvasSize.styleHeight + 18) + 'px';
                this.wrapperPdfs.appendChild(outCanvas);
                resolve({
                    id: num,
                    renderStatus: 0,
                    page,
                    pageNum: num,
                    viewport,
                    pageContainer: outCanvas,
                    canvasSize
                });
            });
        });
    }

    _renderPage = (view) => {
        return new Promise((resolve) => {
            const { pageContainer, viewport, page, canvasSize, pageNum, renderStatus } = view;
            if (renderStatus === 1) {
                resolve({ errcode: '0000', description: 'success' });
                return;
            }
            view.renderStatus = 2; // 正在渲染中
            const wrapperCanvasEl = document.createElement('div');
            wrapperCanvasEl.className = 'canvasWrapper';
            wrapperCanvasEl.style.width = canvasSize.styleWidth + 'px';
            wrapperCanvasEl.style.height = canvasSize.styleHeight + 'px';
            const canvas = document.createElement('canvas');
            canvas.id = 'page' + pageNum;
            const ctx = canvas.getContext('2d');
            canvas.width = canvasSize.width;
            canvas.height = canvasSize.height;
            canvas.style.width = canvasSize.styleWidth + 'px';
            canvas.style.height = canvasSize.styleHeight + 'px';
            const outputScale = canvasSize.outputScale;
            const transform = !outputScale.scaled ? null : [outputScale.sx, 0, 0, outputScale.sy, 0, 0];
            const renderContext = {
                canvasContext: ctx,
                transform: transform,
                viewport: viewport,
                renderInteractiveForms: !!this.props.renderInteractiveForms
            };
            try {
                const { pagesContainerRotate } = this.state;
                const currentPageRotate = pagesContainerRotate[pageNum];
                if (currentPageRotate || Number(currentPageRotate) === 0) {
                    pageContainer.style.transform = 'rotate(' + currentPageRotate + 'deg)';
                    while (pageContainer.hasChildNodes()) {
                        pageContainer.removeChild(pageContainer.lastChild);
                    }
                }
                const pageRendering = page.render(renderContext);
                pageRendering.promise.then(() => { // 渲染成功
                    // 检查canvas是否包含数据
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    const isCover = data.every(val => val === 0);
                    if (isCover) {
                        return this._retryRender(view, resolve);
                    }
                    wrapperCanvasEl.appendChild(canvas);
                    pageContainer.appendChild(wrapperCanvasEl);
                    page.getTextContent({
                        // normalizeWhitespace: true
                    }).then((oldTextContent) => {
                        const items = oldTextContent.items;
                        const newItems = [];
                        for (let i = 0; i < items.length; i++) {
                            const curItem = items[i];
                            let str = curItem.str || '';
                            if (typeof str.trim === 'function') {
                                str = str.trim();
                            } else {
                                str = str.replace(/^\s+/, '').replace(/\s+$/, '');
                            }
                            if (str) {
                                newItems.push(curItem);
                            }
                        }
                        const textContent = { ...oldTextContent, items: newItems };
                        const textLayerDiv = document.createElement('div');
                        textLayerDiv.setAttribute('class', 'textLayer');
                        pageContainer.appendChild(textLayerDiv);
                        // 创建新的TextLayerBuilder实例
                        var textLayer = new TextLayerBuilder({
                            eventBus: this.eventBus,
                            textLayerDiv: textLayerDiv,
                            pageIndex: page.pageIndex,
                            viewport: viewport
                        });

                        textLayer.setTextContent(textContent);
                        textLayer.render();
                        pageContainer.className = 'page';
                        view.renderStatus = 1; // 渲染结束
                        page.cleanup();
                        resolve({ errcode: '0000', description: 'success' });
                    });
                }, (error) => {
                    window.console && console.log('pdf预览异常', error);
                    page.cleanup();
                    resolve({ errcode: '5000', description: 'pdf预览异常' });
                });
            } catch (error) {
                window.console && console.log('pdf处理异常', error);
                page.cleanup();
                resolve({ errcode: '5000', description: 'pdf处理异常' });
            }
        });
    }

    _retryRender = (view, resolve, retries = 3) => { //重试渲染
        if (retries > 0) {
            setTimeout(() => {
                view.renderStatus = 0; // 重置渲染状态
                this._renderPage(view).then(resolve);
            }, 1000); // 等待1秒后重试
        } else {
            resolve({ errcode: '5000', description: '渲染失败' });
        }
    }

    _rotatePage = (pageNum, dir) => { //旋转当前页
        const { pagesContainerRotate, viewers } = this.state;
        const currentView = viewers[pageNum - 1];
        let currentPageRotate = pagesContainerRotate[pageNum] || 0;
        if (dir === 's') {
            currentPageRotate = currentPageRotate <= -360 ? 0 : currentPageRotate + 90;
        } else {
            currentPageRotate = currentPageRotate >= 360 ? 0 : currentPageRotate - 90;
        }

        this.setState({
            pagesContainerRotate: {
                ...pagesContainerRotate,
                [pageNum]: currentPageRotate
            }
        }, () => {
            const { setPageRotate } = this.props;
            if (setPageRotate) {
                if (setPageRotate) {
                    setPageRotate(pageNum, currentPageRotate);
                }
            }
            currentView.renderStatus = 0;
            this._renderPage(currentView);
        });
    }

    rotateRight = (pageNum) => {
        this._rotatePage(pageNum, 's');
    }

    rotateLeft = (pageNum) => {
        this._rotatePage(pageNum);
    }

    goToPage = (pageNum) => {
        const viewers = this.state.viewers;
        let top = 0;
        for (let i = 0; i < pageNum - 1; i++) {
            top += viewers[i].canvasSize.styleHeight + 11;
        }
        this.mySetState({
            activePageNum: pageNum
        });
        this.viewerContainer.scrollTop = top;
    }

    request = (url, options = {}) => {
        return new Promise((resolve) => {
            var xhr = new XMLHttpRequest();
            const onResponseProgress = options.onResponseProgress || (f => f);
            xhr.onload = () => {
                resolve({ response: xhr.response });
            };

            xhr.onprogress = (evt = {}) => {
                onResponseProgress(evt.loaded, evt.total, xhr);
            };

            try {
                xhr.open('GET', url);
                xhr.responseType = 'arraybuffer';
                xhr.send();
            } catch (e) {
                resolve({ errcode: 'err', description: '获取文件异常' });
            }
        });
    }

    base64ToUint8Array(base64) {
        const raw = window.atob(base64);
        const rawLength = raw.length;
        const array = new Uint8Array(new ArrayBuffer(rawLength));
        for (let i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }

    uint8ArrayToBase64(buffer) {
        var array = new Uint8Array(buffer);
        var res = '';
        var chunk = 8 * 1024;
        var i;
        for (i = 0; i < array.length / chunk; i++) {
            res += String.fromCharCode.apply(null, array.slice(i * chunk, (i + 1) * chunk));
        }
        res += String.fromCharCode.apply(null, array.slice(i * chunk));
        // const str = String.fromCharCode(...new Uint8Array(buffer));
        return 'data:image/jpeg;base64,' + window.btoa(res);
    }

    // buffer转换为字符串
    buf2char(buffer) {
        const array = new Uint8Array(buffer);
        var res = '';
        var chunk = 8 * 1024;
        var i;
        for (i = 0; i < array.length / chunk; i++) {
            res += String.fromCharCode.apply(null, array.slice(i * chunk, (i + 1) * chunk));
        }
        res += String.fromCharCode.apply(null, array.slice(i * chunk));
        return decodeURIComponent(escape(res));
    }

    _loadFile = (url, data, fileType = '1.pdf', filename = '') => {
        return new Promise((resolve) => {
            if (data) {
                this.mySetState({
                    docRaw: data,
                    fileType: fileType,
                    filename: filename || ''
                });
                this.fileType = fileType;
                PDFJS.getDocument({
                    data: new Uint8Array(data),
                    cMapPacked: this.props.cMapPacked,
                    cMapUrl: this.props.cMapUrl
                }).promise.then((pdf) => {
                    resolve({ errcode: '0000', description: 'success', data: pdf });
                });
            } else {
                this.fileType = '';
                this.request(url, {
                    onResponseProgress: (loaded, total, xhr) => {
                        if (!this.fileType) {
                            const info = getDownloadInfo(xhr);
                            this.fileType = info.fileType;
                            this.mySetState({
                                fileType: info.fileType,
                                filename: info.filename
                            });
                        }
                        this.mySetState({
                            percent: (parseFloat(loaded / total) * 100).toFixed(2)
                        });
                    }
                }).then(({ response }) => {
                    this.mySetState({
                        docRaw: response
                    });
                    if (this.fileType === 'pdf') {
                        PDFJS.getDocument({
                            data: new Uint8Array(response),
                            cMapPacked: this.props.cMapPacked,
                            cMapUrl: this.props.cMapUrl
                        }).promise.then((pdf) => {
                            resolve({ errcode: '0000', description: 'success', data: pdf });
                        });
                    } else if (this.fileType === 'json') {
                        const dataStr = this.buf2char(response);
                        let jsonData = { errcode: '5000', description: '服务器异常，请稍后再试' };
                        try {
                            jsonData = JSON.parse(dataStr);
                        } catch (error) {
                            console.error('json转换异常', error);
                        }
                        this.setState({
                            responseErr: jsonData.description
                        });
                    }
                });
            }
        });
    }

    clear = () => {
        const container = this.wrapperPdfs;
        if (container) {
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }
        }
        const div = this.printContainer;
        if (div) {
            while (div.hasChildNodes()) {
                div.removeChild(div.lastChild);
            }
        }
        this.mySetState({
            viewers: []
        });
    }

    toggleSlide = () => {
        this.mySetState({
            openSlide: !this.state.openSlide
        });
    }

    render() {
        let defaultCls = ['pwy-render-in-body clearBoth'];
        const {
            loadFile,
            percent,
            numPages,
            scale,
            openSlide,
            activePageNum,
            viewers,
            filename,
            fileType,
            docRaw,
            responseErr
        } = this.state;
        const { style = {}, className } = this.props;
        if (className) {
            defaultCls = defaultCls.concat(className.split(' '));
        }
        if (openSlide) {
            defaultCls.push('sidebarOpen');
        }
        const isMobile = isAndroid || isIOS || document.body.clientWidth < 800;

        if (fileType === 'pdf') {
            return (
                <>
                    <div id='outerContainer' className={defaultCls.join(' ')}>
                        <div id='sidebarContainer'>
                            {
                                !isMobile && viewers.length > 0 ? (
                                    <SliderBar
                                        sidebarContent={this.sidebarContent}
                                        viewerContainer={this.viewerContainer}
                                        viewers={viewers}
                                        activePageNum={activePageNum}
                                        goToPage={this.goToPage}
                                        rotateRight={this.rotateRight}
                                        rotateLeft={this.rotateLeft}
                                    />
                                ) : null
                            }
                        </div>
                        <div id='mainContainer'>
                            <Toolbar
                                fileType={fileType}
                                viewers={viewers}
                                filename={filename}
                                percent={percent}
                                loadFile={loadFile}
                                docData={docRaw}
                                numPages={numPages}
                                activePageNum={activePageNum}
                                eventBus={this.eventBus}
                                scale={scale}
                                foreceRender={this.foreceRender}
                                wrapperPdfs={this.wrapperPdfs}
                                viewerContainer={this.viewerContainer}
                                toggleSlide={this.toggleSlide}
                                isAndroid={isAndroid}
                                isIOS={isIOS}
                                goToPage={this.goToPage}
                            />
                            <div style={style} id='viewerContainer' tabIndex='0'>
                                <div id='viewer' className='pdfViewer' />
                            </div>
                        </div>
                    </div>
                    <div id='printContainer' />
                    <div id='mozPrintCallback-shim' hidden>
                        <div className='mozPrintCallback-dialog-box'>
                            <div className='progress-row'>
                                <progress value='0' max='100' />
                                <span className='relative-progress'>0%</span>
                            </div>
                            <div className='progress-actions'>
                                <input type='button' className='mozPrintCallback-cancel' value='Cancel' />
                            </div>
                        </div>
                    </div>
                </>
            );
        } else if (fileType === 'json') { // 后台返回异常信息
            return (
                <h3 style={{ textAlign: 'center', marginTop: 30 }}>{responseErr || '服务端异常, 请稍候再试！'}</h3>
            );
        }
        return (
            <Spin />
        );
    }
}

ViewPdf.propTypes = {
    cMapPacked: PropTypes.bool,
    cMapUrl: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    src: PropTypes.string,
    useOnlyCssZoom: PropTypes.bool,
    renderInteractiveForms: PropTypes.bool,
    data: PropTypes.object,
    filename: PropTypes.string,
    fileType: PropTypes.string,
    pagesContainerRotate: PropTypes.object,
    setPageRotate: PropTypes.func,
    scale: PropTypes.string,
    openSlide: PropTypes.bool,
    pdfWorkUrl: PropTypes.string
};

export default ViewPdf;