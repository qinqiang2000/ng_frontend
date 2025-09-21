import React from 'react';
import './slide.css';
import PropTypes from 'prop-types';
import { getViewport, getVisibleElements, watchScroll, getOutputScale, THUMBNAIL_HEIGHT } from './tools';
import forward from '../img/forward.png';
import backward from '../img/backward.png';

function extendArray(arr, n) {
    const extendedArr = [...arr]; // 复制原始数组
    while (extendedArr.length < n) {
        extendedArr.push({
            pageNum: extendedArr.length + 1
        }); // 添加空对象，直到达到指定长度n
    }
    return extendedArr;
}
class SliderBar extends React.Component {
    constructor(props) {
        super(...arguments);
        this.state = {
            activePageNum: props.activePageNum || 1,
            thumViews: extendArray(props.viewers, props.numPages).map((item) => {
                const pageNum = item.pageNum;
                const sizeInfo = this.getThumbSize(pageNum, props.viewers);
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
        this.sidebarContent = document.getElementById('side');
        this.thumbnailView = document.getElementById('thumbView');
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
        if (nextProps.viewers.length !== this.props.viewers.length) {
            const newThumViews = [...this.state.thumViews];
            const thumViews = nextProps.viewers.slice(this.props.viewers.length).map((item) => {
                const pageNum = item.pageNum;
                const sizeInfo = this.getThumbSize(pageNum, nextProps.viewers);
                return {
                    renderState: 0,
                    id: pageNum,
                    pageNum: pageNum,
                    ...sizeInfo
                };
            });
            newThumViews.splice(this.props.viewers.length, thumViews.length, ...thumViews);
            this.setState({ thumViews: newThumViews }, () => this.foreceRender());
        }
        const { thumViews } = this.state;
        if (newNum !== this.props.activePageNum) {
            let top = 0;
            for (let i = 1; i < newNum; i++) {
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

    getThumbSize = (pageNum, views) => {
        if (pageNum > views.length) {
            return {
                width: 35,
                height: 50,
                viewport: null,
                src: ''
            };
        }
        const pdfPage = views[pageNum - 1].page;
        const pdfPageRotate = pdfPage.rotate;
        const totalRotation = (pdfPageRotate) % 360;
        const viewport = getViewport(pdfPage, 1, totalRotation);
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;
        const pageRatio = pageWidth / pageHeight;
        const canvasHeight = THUMBNAIL_HEIGHT;
        const canvasWidth = (canvasHeight * pageRatio) | 0;
        return {
            width: canvasWidth,
            height: canvasHeight,
            viewport
        };
    }

    getThumbViewItem = (pageNum) => {
        if (pageNum > this.props.viewers.length) {
            return false;
        }
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
        this.props.goToPage(pageNum, false, true);
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

    handlePageNum = (dir, num) => {
        const { numPages } = this.props;
        if (dir === 'left') {
            this.goToPage(num <= 1 ? 1 : num);
        } else {
            this.goToPage(num >= numPages ? numPages : num);
        }
    }

    render() {
        const thumViews = this.state.thumViews;
        const activePageNum = this.props.activePageNum;
        return (
            <>
                <div className='sidebarContent' id='side'>
                    <div className='thumbnailView thumbnail' id='thumbView'>
                        <img src={forward} className='icon' onClick={() => this.handlePageNum('left', activePageNum - 1)} />
                        <div className='thumbnailItem'>
                            {
                                thumViews.map((item) => {
                                    const { pageNum, src = '', width, height } = item;
                                    return (
                                        <div
                                            key={pageNum}
                                            onClick={() => this.goToPage(pageNum)}
                                            id={'thumbnailContainer' + pageNum}
                                            className={activePageNum === pageNum ? 'selected' : ''}
                                            data-loaded='true'
                                        >
                                            <div className='thumbnailSelectionRing'>
                                                {
                                                    src ? (
                                                        <img
                                                            id={'thumbnail' + pageNum}
                                                            className='thumbnailImage'
                                                            aria-label={'页面' + pageNum + '的缩略图'}
                                                            src={src}
                                                            style={{ width, height, maxWidth: '80px' }}
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
                        <img src={backward} className='icon' onClick={() => this.handlePageNum('right', activePageNum + 1)} />
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
    numPages: PropTypes.number,
    rotateRight: PropTypes.func,
    rotateLeft: PropTypes.func
};

export default SliderBar;