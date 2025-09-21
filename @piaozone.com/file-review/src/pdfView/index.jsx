import React from 'react';
import PropTypes from 'prop-types';
import * as PDFJS from 'pdfjs-dist';
import { TextLayerBuilder, EventBus } from 'pdfjs-dist/web/pdf_viewer';
import Spin from '@piaozone.com/spin';
import {
    CSS_UNITS,
    getVisibleElements,
    getCanvasCSSWH,
    watchScroll,
    getScale,
    getViewport,
    getDownloadInfo,
    DEFAULT_SCALE_DELTA,
    MAX_SCALE,
    MIN_SCALE
} from './tools';
import 'pdfjs-dist/web/pdf_viewer.css';
import './style.css';
import SliderBar from './sliderBar';

const userAgent = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
const platform = (typeof navigator !== 'undefined' && (navigator.userAgentData?.platform || navigator?.platform)) || '';
const maxTouchPoints = (typeof navigator !== 'undefined' && navigator.maxTouchPoints) || 1;

let maxCanvasPixels = 16777216;

const isAndroid = /Android/.test(userAgent);
const isIOS = /\b(iPad|iPhone|iPod)(?=;)/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
;(function checkCanvasSizeLimitation() {
    if (isIOS || isAndroid) {
        maxCanvasPixels = 5242880;
    }
})();

class ViewPdf extends React.Component {
    constructor(props) {
        super(...arguments);
        this.eventBus = new EventBus();
        this.renderLimit = 3;
        this.showPages = 1;
        this.scale = props.scale || 'auto';
        this.rotation = 0;
        PDFJS.GlobalWorkerOptions.workerSrc = props.pdfWorkUrl;
        // PDFJS.GlobalWorkerOptions.workerSrc = './pdf.worker.js';
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
            currentFileSrc: '',
            loading: false
        };
    }

    componentDidMount() {
        this.startRender();
    }

    componentWillReceiveProps(nextProps) {
        const { src, pagesContainerRotate, scale } = nextProps;
        const { currentFileSrc } = this.state;
        if (scale && scale !== this.scale && scale !== 'auto') {
            this.scale = scale;
        }
        if (src !== currentFileSrc && currentFileSrc) {
            this.showPages = 1;
            this.startRender(src);
        }
        this.setState({
            currentFileSrc: src,
            pagesContainerRotate,
            scale
        });
    }

    componentWillUnmount() {
        this._isAmounted = false;
    }

    async startRender(src) {
        this._isAmounted = true;
        this.setState({ loading: true });
        const resDoc = await this._loadFile(src || this.props.src, this.props.data, this.props.fileType, this.props.filename);
        this.setState({ loading: false });
        if (this.fileType === 'pdf') {
            this.init();
            this.pdfDoc = resDoc.data;
            this.numPages = this.pdfDoc.numPages;
            const currentPage = this.numPages > this.showPages + this.renderLimit - 1 ? this.showPages + this.renderLimit - 1 : this.numPages;
            const tempViewers = [];
            for (let i = 1; i <= currentPage; i++) {
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
            this.showPages = currentPage + 1;
            setTimeout(() => {
                if (this.numPages == 1) { //处理单页第一次渲染电子签不显示bug
                    this.foreceRender(true, this.scale, true);
                }
            }, 50);
        }
    }

    async updateRender() {
        const { viewers } = this.state;
        const currentPage = this.numPages > this.showPages + this.renderLimit ? this.showPages + this.renderLimit : this.numPages;
        if (this.showPages - 1 >= this.numPages) {
            return;
        }
        const tempViewers = [];
        for (let i = this.showPages; i < currentPage; i++) {
            const view = await this._getView(i);
            tempViewers.push(view);
        }
        if (this.showPages === this.numPages && viewers.length < this.numPages) {
            const view = await this._getView(currentPage);
            tempViewers.push(view);
        }
        const visibileEles = getVisibleElements(this.viewerContainer, tempViewers, true);
        this.mySetState({
            viewers: viewers.concat(tempViewers)
        });
        for (let i = 0; i < visibileEles.views.length; i++) {
            await this._renderPage(visibileEles.views[i].view);
        }
        this.showPages = currentPage;
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
            for (let i = 1; i <= this.showPages - 1; i++) {
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

    // 找到数组中最近的一个值的下标
    findCloseNum(arr, num) {
        var index = 0; // 保存最接近数值在数组中的索引
        var old_value = Number.MAX_VALUE; // 保存差值绝对值，默认为最大数值
        for (var i = 0; i < arr.length; i++) {
            var new_value = Math.abs(arr[i] - num); // 新差值
            if (new_value <= old_value) { // 如果新差值绝对值小于等于旧差值绝对值，保存新差值绝对值和索引
                if (new_value === old_value && arr[i] < arr[index]) { // 如果数组中两个数值跟目标数值差值一样，取大
                    continue;
                }
                index = i;
                old_value = new_value;
            }
        }
        return index;
    }

    init = () => {
        this.printContainer = document.getElementById('printContainer');
        this.wrapperPdfs = document.getElementById('viewer');
        this.viewerContainer = document.getElementById('viewerContainer');
        this.sidebarContent = document.getElementById('sidebarContent');
        this.hideCanvas = document.createElement('canvas');
        this.ctx = this.hideCanvas.getContext('2d');
        this.clear();
        watchScroll(this.viewerContainer, (state) => {
            this.foreceRender();
            const { viewers, activePageNum } = this.state;
            const { down, lastY } = state;

            let top = 0;
            const distance = [];
            let curPage = 0;
            for (let i = 0; i < viewers.length - 1; i++) {
                top += viewers[i].canvasSize.styleHeight + 11;
                distance.push(top);
                if (lastY >= top && lastY < top + viewers[i + 1].canvasSize.styleHeight + 11) {
                    curPage = i + 1;
                }
            }
            distance.unshift(0);
            if (down) {
                // const index = distance.findIndex(item => lastY <= item);
                // const lastDistance = distance[distance.length - 1];
                // const second2Last = distance.length > 2 ? distance[distance.length - 2] : 0;
                // if (index === activePageNum + 1) {
                //     this.goToPage(index, down);
                // }
                // else if (lastY > (second2Last + lastDistance) / 2 && lastY <= lastDistance) {
                //     this.goToPage(numPages, down);
                // }
                this.goToPage(curPage + 1, down);
            } else {
                const index = this.findCloseNum(distance, lastY);
                if (index + 1 < activePageNum) {
                    this.goToPage(index + 1, down);
                }
            }
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
                const currentPageRotate = pagesContainerRotate[pageNum] || 0;
                if (currentPageRotate || Number(currentPageRotate) === 0) {
                    pageContainer.style.transform = 'rotate(' + currentPageRotate + 'deg)';
                    while (pageContainer.hasChildNodes()) {
                        pageContainer.removeChild(pageContainer.lastChild);
                    }
                }
                if ([90, 270].includes(Math.abs(currentPageRotate) % 360)) {
                    const officeHeight = canvasSize.width - canvasSize.height;
                    document.getElementById('pageContainer' + pageNum).style.marginTop = officeHeight / 2 + 'px';
                    document.getElementById('pageContainer' + pageNum).style.marginBottom = officeHeight / 2 + 'px';
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

    _rotatePage = (pageNum, dir) => { // 旋转当前页
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
            const { changeAngle } = this.props;
            changeAngle && changeAngle(currentPageRotate, pageNum);
            currentView.renderStatus = 0;
            this._renderPage(currentView);
        });
    }

    rotate = (dir) => {
        const { activePageNum } = this.state;
        this._rotatePage(activePageNum, dir === 'right' && 's');
    }

    goToPage = (pageNum, down, isClick) => {
        const { viewers, activePageNum } = this.state;
        let top = 0;
        if (pageNum === activePageNum) {
            return;
        }
        if (pageNum > viewers.length) {
            return;
        }
        for (let i = 0; i < pageNum - 1; i++) {
            top += viewers[i].canvasSize.styleHeight + 11;
        }
        this.mySetState({
            activePageNum: pageNum
        });
        if ((pageNum % this.renderLimit === 2 && down && pageNum < this.numPages) ||
            (pageNum === viewers.length && pageNum < this.numPages && down) ||
            (this.numPages - pageNum === 2 && down)
        ) {
            this.updateRender();
        }
        if (isClick) {
            this.updateRender();
            this.viewerContainer.scrollTop = top;
        }
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

    calibrationData = () => { //校准
        var newScale = this.scale;
        newScale = (newScale).toFixed(2);
        const randomStr = Math.random() / 10;
        newScale = Math.floor(newScale * 10) / 10 + randomStr.toFixed(2);
        this.foreceRender(true, newScale);
    }

    zoomIn = (ticks) => {
        var newScale = this.scale;
        do {
            newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
            newScale = Math.ceil(newScale * 10) / 10;
            newScale = Math.min(MAX_SCALE, newScale);
        } while (--ticks > 0 && newScale < MAX_SCALE);
        this.foreceRender(true, newScale);
        this.setState({
            scale: newScale
        });
    }

    zoomOut = (ticks) => {
        var newScale = this.scale;
        do {
            newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
            newScale = Math.floor(newScale * 10) / 10;
            newScale = Math.max(MIN_SCALE, newScale);
        } while (--ticks > 0 && newScale > MIN_SCALE);
        this.foreceRender(true, newScale);
        this.setState({
            scale: newScale
        });
    }

    render() {
        let defaultCls = ['pwy-render-in-body clearBoth'];
        const {
            numPages,
            openSlide,
            activePageNum,
            viewers,
            responseErr,
            loading
        } = this.state;
        const { style = {}, className, fileType } = this.props;
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
                    {loading ? <Spin /> : (
                        <div id='outerContainer' className={defaultCls.join(' ')}>
                            <div className='sidebarContainer'>
                                {
                                    !isMobile && viewers.length > 0 ? (
                                        <SliderBar
                                            sidebarContent={this.sidebarContent}
                                            viewerContainer={this.viewerContainer}
                                            viewers={viewers}
                                            activePageNum={activePageNum}
                                            numPages={numPages}
                                            goToPage={this.goToPage}
                                        />
                                    ) : null
                                }
                            </div>
                            <div id='mainContainer'>
                                <div style={style} id='viewerContainer' tabIndex='0'>
                                    <div id='viewer' className='pdfViewer' />
                                </div>
                            </div>
                            <div className='count-box'>第{activePageNum}/{this.numPages}页</div>
                        </div>
                    )}
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
    changeAngle: PropTypes.func,
    scale: PropTypes.string,
    openSlide: PropTypes.bool,
    pdfWorkUrl: PropTypes.string
};

export default ViewPdf;