import React from 'react';
import { download } from './download';
import './print';
import { CustomStyle, getViewport, DEFAULT_SCALE_DELTA, MIN_SCALE, MAX_SCALE } from './tools';
import PropTypes from 'prop-types';
class Toolbar extends React.Component {
    constructor(props) {
        super(...arguments);
        this.pageNum = props.activePageNum || 1;
        this.state = {
            scale: props.scale,
            pageNum: props.activePageNum || 1,
            tempPageNum: ''
        };
    }

    componentDidMount() {
        this.printContainer = document.getElementById('printContainer');
        if (window.attachEvent) {
            window.attachEvent('beforeprint', this.startBeforePrint);
            window.attachEvent('afterprint', this.afterPrint);
        } else if (window.addEventListener) {
            window.addEventListener('beforeprint', this.startBeforePrint);
            window.addEventListener('afterprint', this.afterPrint);
        }

        this.props.eventBus.on('afterprint', this.afterPrint);
        this.props.eventBus.on('beforeprint', this.beforePrint);
    }

    startBeforePrint = () => {
        this.printing = true;
        this.pageStyleSheet = document.createElement('style');
        var body = document.querySelector('body');
        body.setAttribute('data-mozPrintCallback', true);
        const pageSize = this.getPageSize();
        const { width, height } = pageSize;
        this.pageStyleSheet.textContent = '@supports ((size:A4) and (size:1pt 1pt)) {' + '@page { size: ' + width + 'pt ' + height + 'pt;}' + '}';
        body.appendChild(this.pageStyleSheet);
        for (let i = 0; i < this.props.numPages; ++i) {
            this.props.eventBus.dispatch('beforeprint', {
                index: i
            });
        }
    }

    beforePrint = (e) => {
        const i = e.index;
        var pdfPage = this.props.viewers[i].page;
        var viewport = getViewport(pdfPage, 1);
        var PRINT_OUTPUT_SCALE = 2;
        var canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width) * PRINT_OUTPUT_SCALE;
        canvas.height = Math.floor(viewport.height) * PRINT_OUTPUT_SCALE;
        canvas.style.width = (PRINT_OUTPUT_SCALE * 100) + '%';
        var cssScale = 'scale(' + (1 / PRINT_OUTPUT_SCALE) + ', ' + (1 / PRINT_OUTPUT_SCALE) + ')';
        CustomStyle.setProp('transform', canvas, cssScale);
        CustomStyle.setProp('transformOrigin', canvas, '0% 0%');
        var canvasWrapper = document.createElement('div');
        canvasWrapper.appendChild(canvas);
        canvas.mozPrintCallback = function(obj) {
            var ctx = obj.context;
            ctx.save();
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
            ctx._transformMatrix = [PRINT_OUTPUT_SCALE, 0, 0, PRINT_OUTPUT_SCALE, 0, 0];
            ctx.scale(PRINT_OUTPUT_SCALE, PRINT_OUTPUT_SCALE);
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport,
                intent: 'print'
            };
            pdfPage.render(renderContext).promise.then(function() {
                obj.done();
            }, (error) => {
                window.console && console.error('page render err', error);
                if ('abort' in obj) {
                    obj.abort();
                } else {
                    obj.done();
                }
            });
        };
        this.printContainer.appendChild(canvasWrapper);
    }

    afterPrint = () => {
        var div = this.printContainer;
        while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
        }
        if (this.pageStyleSheet && this.pageStyleSheet.parentNode) {
            this.pageStyleSheet.parentNode.removeChild(this.pageStyleSheet);
            this.pageStyleSheet = null;
        }
        this.printing = false;
    }

    downloadFile = () => {
        const blob = new Blob([this.props.docData]);
        var blobUrl = URL.createObjectURL(blob);
        download(blobUrl, this.props.filename);
    }

    getPageSize = () => {
        var width = 0;
        var height = 0;
        const { numPages, viewers } = this.props;
        for (var i = 0; i < numPages; i++) {
            const viewport = getViewport(viewers[i].page, 2);
            if (viewport.width > width) {
                width = viewport.width;
            }
            if (viewport.height > height) {
                height = viewport.height;
            }
        }
        return {
            width: width,
            height: height
        };
    };

    printDoc = () => {
        window.print();
    }

    changeScale = (e) => {
        this.props.foreceRender(true, e.target.value);
        this.setState({
            scale: e.target.value
        });
    }

    zoomIn = (ticks) => {
        var newScale = this.props.scale;
        do {
            newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
            newScale = Math.ceil(newScale * 10) / 10;
            newScale = Math.min(MAX_SCALE, newScale);
        } while (--ticks > 0 && newScale < MAX_SCALE);
        this.props.foreceRender(true, newScale);
        this.setState({
            scale: newScale
        });
    }

    zoomOut = (ticks) => {
        var newScale = this.props.scale;
        do {
            newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
            newScale = Math.floor(newScale * 10) / 10;
            newScale = Math.max(MIN_SCALE, newScale);
        } while (--ticks > 0 && newScale > MIN_SCALE);
        this.props.foreceRender(true, newScale);
        this.setState({
            scale: newScale
        });
    }

    goToPage = (pageNum) => {
        this.props.goToPage(pageNum);
    }

    onChange = (e) => {
        let num = parseInt(e.target.value);
        if (isNaN(num)) {
            num = 1;
        }
        this.setState({
            tempPageNum: num
        });
    }

    onConfirmPage = (e, type) => {
        const numPages = this.props.numPages;
        let pageNum = this.state.tempPageNum;
        pageNum = parseInt(pageNum);
        if (type === 1) { // 失去焦点时
            this.setState({
                tempPageNum: ''
            });
            if (pageNum >= 1 && pageNum <= numPages) {
                this.goToPage(pageNum);
            }
        } else if (type === 2 && e.keyCode === 13) { // keyDown时间回车判断
            this.setState({
                tempPageNum: ''
            });
            if (pageNum >= 1 && pageNum <= numPages) {
                this.goToPage(pageNum);
            }
        }
    }

    nextPage = () => {
        const pageNum = this.props.activePageNum;
        if (pageNum + 1 <= this.props.numPages) {
            this.goToPage(pageNum + 1);
        }
    }

    prePage = () => {
        const pageNum = this.props.activePageNum;
        if (pageNum - 1 >= 1) {
            this.goToPage(pageNum - 1);
        }
    }

    render() {
        const {
            percent = 0,
            loadFile = false,
            numPages,
            filename,
            activePageNum
        } = this.props;
        const scale = this.state.scale;
        const tempPageNum = this.state.tempPageNum;
        let displayScale = scale;
        const list = ['auto', 'page-actual', 'page-fit', 'page-width', 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
        if (list.indexOf(scale) === -1) {
            displayScale = 'custom';
        }
        return (
            <div className='toolbar'>
                <div id='toolbarContainer'>
                    <div id='toolbarViewer'>
                        <div id='toolbarViewerLeft' className='hiddenMediumView'>
                            <button
                                id='sidebarToggle'
                                className='toolbarButton'
                                title='切换侧栏'
                                tabIndex='11'
                                data-l10n-id='toggle_sidebar'
                                onClick={this.props.toggleSlide}
                            >
                                <span data-l10n-id='toggle_sidebar_label'>
                                    切换侧栏
                                </span>
                            </button>
                            <div className='toolbarButtonSpacer' />
                            <div className='splitToolbarButton'>
                                <button
                                    className='toolbarButton pageUp'
                                    title='上一页'
                                    id='previous'
                                    tabIndex='13'
                                    data-l10n-id='previous'
                                    disabled={activePageNum <= 1}
                                    onClick={this.prePage}
                                >
                                    <span data-l10n-id='previous_label'>上一页</span>
                                </button>
                                <div className='splitToolbarButtonSeparator' />
                                <button
                                    className='toolbarButton pageDown'
                                    title='下一页'
                                    id='next'
                                    tabIndex='14'
                                    data-l10n-id='next'
                                    disabled={activePageNum >= numPages}
                                    onClick={this.nextPage}
                                >
                                    <span data-l10n-id='next_label'>下一页</span>
                                </button>
                            </div>
                            <label id='pageNumberLabel' className='toolbarLabel pageNumber' data-l10n-id='page_label'>
                                页面：
                            </label>
                            <input
                                type='number'
                                id='pageNumber'
                                className='toolbarField pageNumber loading'
                                value={tempPageNum || activePageNum}
                                size='4'
                                min='1'
                                tabIndex='15'
                                max={numPages}
                                onChange={this.onChange}
                                onBlur={(e) => this.onConfirmPage(e, 1)}
                                onKeyDown={(e) => this.onConfirmPage(e, 2)}
                            />
                            <span id='numPages' className='toolbarLabel'>/{numPages}</span>
                        </div>
                        <span className='filename'>{filename}</span>
                        <div id='toolbarViewerRight'>
                            <button
                                id='print'
                                className='toolbarButton print hiddenMediumView'
                                title='打印1'
                                tabIndex='33'
                                data-l10n-id='print'
                                onClick={this.printDoc}
                            >
                                <span data-l10n-id='print_label'>
                                    打印
                                </span>
                            </button>
                            <button
                                onClick={this.downloadFile}
                                id='download'
                                className='toolbarButton download'
                                title='下载'
                                tabIndex='34'
                                data-l10n-id='download'
                            >
                                <span data-l10n-id='download_label'>下载</span>
                            </button>
                            <div className='verticalToolbarSeparator hiddenSmallView' style={{ display: 'none' }} />
                        </div>
                        <div className='outerCenter hiddenMediumView'>
                            <div className='innerCenter' id='toolbarViewerMiddle'>
                                <div className='splitToolbarButton'>
                                    <button
                                        disabled={scale <= MIN_SCALE}
                                        id='zoomOut'
                                        className='toolbarButton zoomOut'
                                        title='缩小'
                                        tabIndex='21'
                                        data-l10n-id='zoom_out'
                                        onClick={this.zoomOut}
                                    >
                                        <span data-l10n-id='zoom_out_label'>
                                            缩小
                                        </span>
                                    </button>
                                    <div className='splitToolbarButtonSeparator' />
                                    <button
                                        disabled={scale >= MAX_SCALE}
                                        id='zoomIn'
                                        className='toolbarButton zoomIn'
                                        title='放大'
                                        tabIndex='22'
                                        data-l10n-id='zoom_in'
                                        onClick={this.zoomIn}
                                    >
                                        <span data-l10n-id='zoom_in_label'>
                                            放大
                                        </span>
                                    </button>
                                </div>
                                <span id='scaleSelectContainer' className='dropdownToolbarButton' style={{ minWidth: '82px', maxWidth: '82px' }}>
                                    <select
                                        id='scaleSelect'
                                        title='缩放'
                                        tabIndex='23'
                                        data-l10n-id='zoom'
                                        style={{ minWidth: '104px' }}
                                        value={displayScale}
                                        onChange={this.changeScale}
                                    >
                                        <option id='pageAutoOption' title='' value='auto' data-l10n-id='page_scale_auto'>
                                            自动缩放
                                        </option>
                                        <option id='pageActualOption' title='' value='page-actual' data-l10n-id='page_scale_actual'>
                                            实际大小
                                        </option>
                                        <option id='pageFitOption' title='' value='page-fit' data-l10n-id='page_scale_fit'>
                                            适合页面
                                        </option>
                                        <option id='pageWidthOption' title='' value='page-width' data-l10n-id='page_scale_width'>
                                            适合页宽
                                        </option>
                                        <option id='customScaleOption' title='' value='custom'>{parseInt(scale * 100) + '%'}</option>
                                        <option title='' value='0.5' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 50 }'>
                                            50%
                                        </option>
                                        <option title='' value='0.75' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 75 }'>
                                            75%
                                        </option>
                                        <option title='' value='1' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 100 }'>
                                            100%
                                        </option>
                                        <option title='' value='1.25' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 125 }'>
                                            125%
                                        </option>
                                        <option title='' value='1.5' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 150 }'>
                                            150%
                                        </option>
                                        <option title='' value='2' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 200 }'>
                                            200%
                                        </option>
                                        <option title='' value='3' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 300 }'>
                                            300%
                                        </option>
                                        <option title='' value='4' data-l10n-id='page_scale_percent' data-l10n-args='{ &quot;scale&quot;: 400 }'>
                                            400%
                                        </option>
                                    </select>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id='loadingBar' className={loadFile ? '' : 'hidden'}>
                        <div className='progress' style={{ height: '100%', width: percent + '%' }}>
                            <div className='glimmer' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Toolbar.propTypes = {
    activePageNum: PropTypes.number,
    scale: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    eventBus: PropTypes.object,
    numPages: PropTypes.number,
    viewers: PropTypes.array,
    docData: PropTypes.object,
    toggleSlide: PropTypes.func,
    filename: PropTypes.string,
    foreceRender: PropTypes.func,
    goToPage: PropTypes.func,
    percent: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    loadFile: PropTypes.bool
};

export default Toolbar;