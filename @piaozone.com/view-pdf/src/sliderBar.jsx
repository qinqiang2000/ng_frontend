import React from 'react';
import './slide.css';
import PropTypes from 'prop-types';
import { getViewport, THUMBNAIL_WIDTH, getVisibleElements, watchScroll, getOutputScale } from './tools';
class SliderBar extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            activePageNum: props.activePageNum || 1,
            thumViews: props.viewers.map((item) => {
                const pageNum = item.pageNum;
                const sizeInfo = this.getThumbSize(pageNum);
                return {
                    renderState: 0,
                    id: pageNum,
                    pageNum: pageNum,
                    ...sizeInfo
                };
            })
        };
    }

    async componentDidMount() {
        this._isAmounted = true;
        this.sidebarContent = document.getElementById('sidebarContent');
        this.thumbnailView = document.getElementById('thumbnailView');
        this.foreceRender();
        watchScroll(this.thumbnailView, () => {
            this.foreceRender();
        });
    }

    componentWillUnmount() {
        this._isAmounted = false;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.activePageNum !== this.props.activePageNum || nextState.thumViews !== this.state.thumViews;
    }

    componentWillReceiveProps(nextProps) {
        const newNum = nextProps.activePageNum;
        if (newNum !== this.props.activePageNum) {
            let top = 0;
            const thumViews = this.state.thumViews || [];
            for (let i = 0; i < newNum; i++) {
                top += thumViews[i].height + 14 + 5 + 2;
            }
            let preTop = top - (thumViews[newNum - 1].height + 14 + 5 + 2);
            if (newNum === 1) {
                this.thumbnailView.scrollTop = 0;
            } else if (newNum === thumViews.length) {
                this.thumbnailView.scrollTop = this.thumbnailView.scrollHeight - this.thumbnailView.clientHeight;
            } else {
                if (top > this.thumbnailView.clientHeight + this.thumbnailView.scrollTop) {
                    if (preTop + this.thumbnailView.clientHeight > this.thumbnailView.scrollHeight) {
                        preTop = this.thumbnailView.scrollHeight - this.thumbnailView.clientHeight;
                    }
                    this.thumbnailView.scrollTop = preTop;
                } else if (preTop < this.thumbnailView.scrollTop) {
                    if (newNum === 1) {
                        this.thumbnailView.scrollTop = 0;
                    } else {
                        this.thumbnailView.scrollTop = preTop;
                    }
                }
            }
        }
    }

    mySetState = (data) => {
        if (this._isAmounted) {
            this.setState(data);
        }
    }

    foreceRender = async() => {
        this.rendering = true;
        const fullViews = this.state.thumViews.map((item) => {
            return {
                ...item,
                pageContainer: item.pageContainer ? item.pageContainer : document.getElementById('thumbnailContainer' + item.pageNum)
            };
        });
        const visibleEles = getVisibleElements(this.thumbnailView, fullViews, true);
        const visibleThumViews = visibleEles.views;
        for (let i = 0; i < visibleThumViews.length; i++) {
            const pageNum = visibleThumViews[i].view.pageNum;
            if (fullViews[pageNum - 1].src) {
                continue;
            }
            const curView = await this.getThumbViewItem(pageNum);
            this.mySetState({
                thumViews: this.state.thumViews.map((item) => {
                    if (item.pageNum === pageNum) {
                        return {
                            ...item,
                            ...curView
                        };
                    } else {
                        return item;
                    }
                })
            });
        }
        this.rendering = false;
    }

    getThumbSize = (pageNum) => {
        const pdfPage = this.props.viewers[pageNum - 1].page;
        const pdfPageRotate = pdfPage.rotate;
        const totalRotation = (pdfPageRotate) % 360;
        const viewport = getViewport(pdfPage, 1, totalRotation);
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;
        const pageRatio = pageWidth / pageHeight;
        const canvasWidth = THUMBNAIL_WIDTH;
        const canvasHeight = (canvasWidth / pageRatio) | 0;
        return {
            width: canvasWidth,
            height: canvasHeight,
            viewport
        };
    }

    getThumbViewItem = (pageNum) => {
        return new Promise((resolve) => {
            const pageTumbInfo = this.state.thumViews[pageNum - 1];
            const pdfPage = this.props.viewers[pageNum - 1].page;
            const viewport = pageTumbInfo.viewport;
            const pageWidth = viewport.width;
            const width = pageTumbInfo.width;
            const height = pageTumbInfo.height;
            const scale = width / pageWidth;
            const canvas = document.createElement('canvas');
            canvas.mozOpaque = true;
            const ctx = canvas.getContext('2d', {
                alpha: false
            });

            var outputScale = getOutputScale(ctx);
            canvas.width = (width * outputScale.sx) | 0;
            canvas.height = (height * outputScale.sy) | 0;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            if (outputScale.scaled) {
                ctx.scale(outputScale.sx, outputScale.sy);
            }

            const drawViewport = viewport.clone({
                scale: scale
            });

            var renderContext = {
                canvasContext: ctx,
                viewport: drawViewport
            };
            var renderTask = pdfPage.render(renderContext);
            renderTask.promise.then(() => {
                pdfPage.cleanup();
                resolve({
                    src: canvas.toDataURL(),
                    pageNum,
                    renderState: 1
                });
            }, (error) => {
                console.log('slidebar render err', error);
                pdfPage.cleanup();
                resolve({
                    src: '',
                    pageNum,
                    renderState: 2
                });
            });
        });
    }

    goToPage = (pageNum) => {
        this.props.goToPage(pageNum);
    }

    rotateRight = () => {
        const { rotateRight, activePageNum } = this.props;
        if (rotateRight) {
            rotateRight(activePageNum);
        }
    }

    rotateLeft = () => {
        const { rotateLeft, activePageNum } = this.props;
        if (rotateLeft) {
            rotateLeft(activePageNum);
        }
    }

    render() {
        const thumViews = this.state.thumViews;
        const activePageNum = this.props.activePageNum;
        return (
            <>
                <div id='toolbarSidebar'>
                    <div id='toolbarSidebar'>
                        <div className='splitToolbarButton toggled'>
                            <button id='viewThumbnail' className='toolbarButton group toggled' title='显示缩略图' tabIndex='2' data-l10n-id='thumbs'>
                                <span data-l10n-id='thumbs_label'>缩略图</span>
                            </button>
                            <button id='viewOutline' className='toolbarButton group' title='显示文档大纲' tabIndex='3' data-l10n-id='outline' disabled>
                                <span data-l10n-id='outline_label'>文档大纲</span>
                            </button>
                            <button id='viewAttachments' className='toolbarButton group' title='显示附件' tabIndex='4' data-l10n-id='attachments' disabled>
                                <span data-l10n-id='attachments_label'>附件</span>
                            </button>
                            <button 
                                id='ViewRotateRight' 
                                className='toolbarButton group' 
                                title='顺时针旋转' 
                                tabIndex='5' 
                                data-l10n-id='rotateRight' 
                                onClick={() => this.rotateRight()}
                            >
                                <span data-l10n-id='rotateRight_label'>附件</span>
                            </button>
                            <button 
                                id='ViewRotateLeft' 
                                className='toolbarButton group' 
                                title='逆时针旋转' 
                                tabIndex='6' 
                                data-l10n-id='rotateLeft'
                                onClick={() => this.rotateLeft()}
                            >
                                <span data-l10n-id='rotateLeft_label'>附件</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div id='sidebarContent'>
                    <div id='thumbnailView' className='thumbnail'>
                        {
                            thumViews.map((item) => {
                                const { pageNum, src = '', width, height } = item;
                                return (
                                    <div
                                        key={pageNum}
                                        onClick={() => this.goToPage(pageNum)}
                                        id={'thumbnailContainer' + pageNum}
                                        className={activePageNum === pageNum ? 'thumbnail selected' : 'thumbnail'}
                                        data-loaded='true'
                                    >
                                        <div className='thumbnailSelectionRing' style={{ width: width + 2, height: height + 2 }}>
                                            {
                                                src ? (
                                                    <img
                                                        id={'thumbnail' + pageNum}
                                                        className='thumbnailImage'
                                                        aria-label={'页面' + pageNum + '的缩略图'}
                                                        src={src}
                                                        style={{ width, height }}
                                                    />
                                                ) : (
                                                    <div style={{ width, height }} className='thumbnailImage iconImage'>&nbsp;</div>
                                                )
                                            }
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </>
        );
    }
}

SliderBar.propTypes = {
    activePageNum: PropTypes.number,
    viewers: PropTypes.array,
    goToPage: PropTypes.func,
    rotateRight: PropTypes.func,
    rotateLeft: PropTypes.func
};

export default SliderBar;