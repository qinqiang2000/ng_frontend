import React from 'react';
import ReactDom from 'react-dom';
import { loadImage, adjustSize, OperateCanvas } from '@piaozone.com/process-image';
import './showImage.less';
import PropTypes from 'prop-types';
import immutable from 'immutable';
import Loading from '@piaozone.com/dom-loading';
import ReactEvents from '@piaozone.com/react-events';

class ScanImage extends React.Component {
    constructor(props) {
        super(...arguments);
        this.canvasId = 'canvasId' + ((+new Date()) + '' + Math.random()).replace('.', '');
        this.initLargerRatio = this.largerRatio = 1;
        this.areaInfo = this.getAreaInfoList(props.areaInfo);
        this.initRotateDeg = this.rotateDeg = props.rotateDeg || 0;
        this.updatePropsArgs(props);
        this.offsetX = this.tempOffsetX = 0;
        this.offsetY = this.tempOffsetY = 0;
        this.isResetStatus = true;
        this.state = {
            loading: false,
            largerRatio: this.initLargerRatio,
            loadDescription: ''
        };
    }

    componentWillMount() {
        this.reactEvents = new ReactEvents({
            onGestureZoom: this.onGestureZoom,
            onTouchMove: this.onTouchMove,
            onTouchStart: this.onTouchStart,
            onTouchEnd: this.onTouchEnd
        });
    }

    async componentDidMount() {
        this._isMounted = true;
        this.canvas = document.getElementById(this.canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.operateCanvas = new OperateCanvas({
            ctx: this.ctx,
            emptySize: this.emptySize,
            emptyFillStyle: this.emptyFillStyle,
            width: this.width,
            height: this.height
        });
        // 默认显示图像
        const visible = typeof this.props.visible === 'undefined' ? true : this.props.visible;
        if (visible) {
            // 重置更新图像
            await this.updateImage(this.props.imgSrc, true);
        } else {
            this.setState({
                loading: false
            });
        }

        if (typeof this.props.onDidMount === 'function') {
            this.props.onDidMount(this);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.canvas = null;
        this.ctx = null;
        this.imgObj = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (immutable.is(immutable.fromJS(this.props), immutable.fromJS(nextProps)) &&
            immutable.is(immutable.fromJS(this.state), immutable.fromJS(nextState))) {
            return false;
        }
        return true;
    }

    // 正在加载中不重复刷新，已经显示过的状态不重复显示
    componentWillReceiveProps = async(nextProps) => {
        const visible = typeof nextProps.visible === 'undefined' ? true : nextProps.visible;
        const preAreaInfo = this.getAreaInfoList(this.props.areaInfo);
        const preDisplayFlag = this.props.displayFlag;
        const preRotateDeg = this.props.rotateDeg;
        if (!this.state.loading && visible) {
            const isChange = !immutable.is(immutable.fromJS({ ...this.props, visible }), immutable.fromJS({ ...nextProps, visible }));
            if (!isChange && this.visible) {
                return;
            }

            this.areaInfo = this.getAreaInfoList(nextProps.areaInfo);
            this.canvas = document.getElementById(this.canvasId);
            this.ctx = this.canvas.getContext('2d');
            const { imgSrc, displayFlag = 'showImage' } = nextProps;

            this.updatePropsArgs(nextProps);
            this.operateCanvas.modifyArgs(nextProps);

            let resetFlag = false; // 检测部分参数需要重新还原绘制参数如缩放、拖动等
            if (!this.visible || imgSrc !== this.props.imgSrc || this.areaInfo[0].pixel !== preAreaInfo[0].pixel) {
                this.imgObj = null;
                resetFlag = true;
            } else if (displayFlag !== preDisplayFlag || this.areaInfo[0].region !== preAreaInfo[0].region || preRotateDeg !== nextProps.rotateDeg) {
                resetFlag = true;
            }
            this.visible = false;
            await this.updateImage(imgSrc, resetFlag);
        }
    }

    // 更新需要用到的参数
    updatePropsArgs = (props = {}) => {
        this.displayFlag = props.displayFlag || 'showImage';
        this.width = props.width;
        this.height = props.height;
        this.emptySize = props.emptySize || 5;
        this.emptyFillStyle = props.emptyFillStyle || '#D7DAE1';
        this.rotateDeg = typeof props.rotateDeg !== 'undefined' ? props.rotateDeg : this.rotateDeg || 0;
    }

    getAreaInfoList(areaInfo) {
        if (typeof areaInfo === 'undefined') {
            return [{
                rotateDeg: 0,
                pixel: '',
                region: ''
            }];
        } else if (typeof areaInfo === 'object') {
            if (!(areaInfo instanceof Array)) {
                return [].concat(areaInfo);
            }
        }
        return areaInfo;
    }

    updateImage = async(imgSrc = '', reset) => {
        if (!imgSrc) {
            this.setState({
                loading: false,
                loadDescription: '图像地址为空'
            });
            return;
        }
        this.setState({
            showImageTag: false,
            loading: true,
            loadDescription: ''
        });
        if (!this.imgObj) {
            const res = await loadImage(imgSrc);
            if (res.errcode !== '0000') {
                this.setState({
                    loading: false,
                    loadDescription: this.props.failDescription ? this.props.failDescription : res.description + ',请重试'
                });
                return;
            }
            this.imgObj = res.data.imgObj;
        }

        this.offsetX = 0;
        this.offsetY = 0;
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;

        if (this.canvas && this.canvas.getContext) {
            await this.flushCanvas({ rotateDeg: this.rotateDeg, resetLargerRatio: reset });
        } else { // 浏览器不支持画布，直接通过图像标签显示
            this.setState({
                showImageTag: true,
                loading: false,
                imgWidth: this.imgObj.width,
                imgHeight: this.imgObj.height
            });
        }
    }

    // 仅仅将图像绘制到canvas里面，支持放大、缩小、旋转、拖动
    flushCanvas = async(opt) => {
        if (!this._isMounted) {
            return;
        }
        let res;
        const displayFlag = opt.displayFlag || this.displayFlag;
        const offsetX = typeof opt.offsetX !== 'undefined' ? opt.offsetX : this.offsetX;
        const offsetY = typeof opt.offsetY !== 'undefined' ? opt.offsetY : this.offsetY;
        const rotateDeg = typeof opt.rotateDeg !== 'undefined' ? opt.rotateDeg : this.rotateDeg;
        const largerRatio = typeof opt.largerRatio !== 'undefined' ? opt.largerRatio : this.largerRatio;
        const opts = { ...opt, areaInfo: this.areaInfo, offsetX, offsetY, rotateDeg, largerRatio };
        if (displayFlag === 'showImage') {
            res = await this.operateCanvas.showImage(this.imgObj, opts);
        } else if (displayFlag === 'cuteImage') {
            res = await this.operateCanvas.cuteImage(this.imgObj, opts);
        } else if (displayFlag === 'markImage') {
            res = await this.operateCanvas.markImage(this.imgObj, opts);
        }
        if (res.errcode === '0000') {
            this.visible = true;
            this.largerRatio = res.data.largerRatio;
            this.rotateDeg = res.data.rotateDeg;
            this.setState({
                loading: false,
                largerRatio: this.largerRatio,
                rotateDeg: this.rotateDeg
            });

            if (opts.resetLargerRatio) {
                this.zoomFlag = '';
                this.isResetStatus = true;
            }
        } else {
            this.setState({
                showImageTag: true,
                loading: false,
                imgWidth: this.imgObj.width,
                imgHeight: this.imgObj.height
            });
        }

        return { errcode: '0000', description: 'success' };
    }

    onTouchStart = (e) => {
        this.zoomFlag = '';
        this.touchStartRatio = this.largerRatio || 1;
    }

    // 手势缩放
    onGestureZoom = (e, { zoomDelta }) => {
        this.isResetStatus = false;
        const rotateDeg = this.rotateDeg || 0;
        const largerRatio = this.touchStartRatio + zoomDelta * 0.005;
        if (this.operateCanvas.rw && zoomDelta < 0 && this.operateCanvas.rw < this.width - 2 * this.emptySize - 20) {
            this.zoomFlag = 'smaller';
        }

        // 过大或者过小缩放不刷新图像
        if ((this.largerRatio < 0.3 && zoomDelta < 0) || (this.largerRatio > 15 && zoomDelta > 0)) {
            return;
        }

        this.flushCanvas({
            rotateDeg,
            largerRatio,
            offsetX: this.tempOffsetX,
            offsetY: this.tempOffsetY
        });
    }

    onTouchMove = (e, { deltaMoveX, deltaMoveY }) => {
        if (this.isResetStatus) {
            typeof this.props.onSwiper === 'function' && this.props.onSwiper(e, { deltaMoveX, deltaMoveY });
        } else {
            this.tempOffsetX = this.offsetX + deltaMoveX;
            this.tempOffsetY = this.offsetY + deltaMoveY;
            this.flushCanvas({
                rotateDeg: this.rotateDeg || 0,
                largerRatio: this.largerRatio || 1,
                offsetX: this.tempOffsetX,
                offsetY: this.tempOffsetY
            });
        }
    }

    reset = async() => {
        this.offsetX = this.tempOffsetX = 0;
        this.offsetY = this.tempOffsetY = 0;
        this.zoomFlag = '';
        await this.flushCanvas({
            offsetX: 0,
            offsetY: 0,
            resetLargerRatio: true
        });
        this.isResetStatus = true;
    }

    // 拖动结束事件
    onTouchEnd = (e) => {
        this.offsetX = this.tempOffsetX;
        this.offsetY = this.tempOffsetY;
        if (this.zoomFlag === 'smaller') {
            this.reset();
        } else if (typeof this.props.onSwiperEnd === 'function') {
            this.props.onSwiperEnd(e);
        }
    }

    onClickHander = () => {
        if (!this.isResetStatus && !this.state.loading) {
            this.reset();
        }
    }

    onReloadImage = async() => {
        this.setState({
            loading: true,
            loadDescription: ''
        });
        if (typeof this.props.onGetImage === 'function') {
            const res = await this.props.onGetImage(this.props.id);
            // 成功后自动通过新地址触发
            if (res.errcode !== '0000') {
                this.setState({
                    loading: false,
                    loadDescription: res.description
                });
                return;
            }
            const { imgSrc = this.props.imgSrc } = res.data || {};
            await this.updateImage(imgSrc, true);
        } else {
            setTimeout(() => {
                this.updateImage(this.props.imgSrc, true);
            }, 400);
        }
    }

    render() {
        const {
            imgSrc,
            className,
            emptyFillStyle = '#d7dae1',
            width, //画布宽度
            height //画布高度
        } = this.props;
        const {
            loading,
            loadDescription = '',
            imgWidth = 0, // img标签显示图像大小
            imgHeight = 0,
            showImageTag
        } = this.state;

        const renderInBody = !!this.props.renderInBody;
        const emptySize = this.emptySize || 5;
        const hideImg = loading || loadDescription;
        const canvasHeight = height - emptySize * 2;
        const canvasWidth = width - emptySize * 2;

        const style = {
            background: emptyFillStyle,
            width: width + 'px',
            height: height + 'px',
            padding: emptySize,
            overflow: 'hidden',
            boxSizing: 'border-box',
            position: 'relative'
        };

        const boxClassName = className ? className + ' showImageBox' : 'showImageBox ' + name;
        const newSizeInfo = showImageTag ? adjustSize(imgWidth, imgHeight, canvasWidth, canvasHeight) : {};
        let marginLeft = 0;
        let marginTop = 0;
        if (newSizeInfo.width) {
            marginLeft = (width - newSizeInfo.width) / 2;
            marginTop = (height - newSizeInfo.height) / 2;
        }

        const toucheEvents = {
            onTouchStart: this.reactEvents.onTouchStart,
            onTouchMove: this.reactEvents.onTouchMove,
            onTouchEnd: this.reactEvents.onTouchEnd,
            onClick: this.onClickHander
        };
        const dpr = window.devicePixelRatio; //屏幕像素
        const contentDiv = (
            <div style={style} className={boxClassName} {...toucheEvents}>
                {
                    !showImageTag ? (
                        <canvas
                            id={this.canvasId}
                            width={canvasWidth * dpr}
                            height={canvasHeight * dpr}
                            style={{ width: canvasWidth, height: canvasHeight, cursor: 'grab', display: hideImg ? 'none' : 'block' }}
                        />
                    ) : (
                        <img
                            style={{ width: newSizeInfo.width, height: newSizeInfo.height, marginLeft, marginTop, display: hideImg ? 'none' : 'block' }}
                            src={imgSrc}
                        />
                    )
                }

                {
                    loadDescription ? (
                        <div className='loadErr'>
                            {
                                loadDescription ? (
                                    <span onClick={this.onReloadImage}>{loadDescription}</span>
                                ) : null
                            }
                        </div>
                    ) : (
                        loading ? (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    width: '100%',
                                    textAlign: 'center',
                                    marginTop: -15,
                                    lineHeight: '30px'
                                }}
                            >
                                <Loading loading={this.state.loading} />
                            </div>
                        ) : null
                    )
                }
            </div>
        );

        if (renderInBody) {
            return ReactDom.createPortal(contentDiv, document.body);
        } else {
            return contentDiv;
        }
    }
}

ScanImage.propTypes = {
    imgSrc: PropTypes.string.isRequired, // 图像的地址
    id: PropTypes.string.isRequired, // 图像的id, 用于判断图像的唯一，后续扩展循环显示
    width: PropTypes.number.isRequired, // 整个区域的宽度
    height: PropTypes.number.isRequired, // 整个区域的高度
    areaInfo: PropTypes.object.isRequired, // 图像显示的必要参数[{ rotateDeg: 0, pixel: '', region: '', markColor: '#D7DAE1' }]
    rotateDeg: PropTypes.number,
    onGetImage: PropTypes.func, // 图像获取失败，通过id向后台接口可以重新生成
    onRotateDeg: PropTypes.func, // 当旋转角度时的回调函数
    onDidMount: PropTypes.func, // 当组件加载完成后的回调
    largerRatio: PropTypes.number, // 图像的放大系数，默认为1不放大
    visible: PropTypes.boolean, // 是否显示，主要用于控制多个轮播图像多个图像同时加载时消耗资源
    renderInBody: PropTypes.boolean, // 是否渲染到body里面，主要用于全局弹出显示图像的情况
    className: PropTypes.string, // 使用自己的样式控制
    emptyFillStyle: PropTypes.string, // 画布背景空白填充颜色
    emptySize: PropTypes.number, // 边界留白的大小
    displayFlag: PropTypes.string, // 图像的显示方式，showImage, cuteImage, markImage
    onSwiper: PropTypes.func,
    onSwiperEnd: PropTypes.func
};

export default ScanImage;
