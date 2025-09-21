/* eslint-disable */
import React from 'react';
import ReactDom from 'react-dom';
import Spin from '@piaozone.com/spin';
import { loadImage, adjustSize, OperateCanvas } from '@piaozone.com/process-image';
import './showImage.less';
import PropTypes from 'prop-types';
import BottomBtns from './bottomBtns.jsx';
import NewBottomBtns from './newBottomBtns.jsx';
import FullImage from './fullImage';
import immutable from 'immutable';
import ReactEvents from '@piaozone.com/react-events';

class ScanImage extends React.Component {
    constructor(props) {
        super(props);
        this.canvasId = 'canvasId' + ((+new Date()) + '' + Math.random()).replace('.', '');
        this.initLargerRatio = props.largerRatio ?? 1;
        this.largerRatio = props.largerRatio ?? 1;
        this.areaInfo = this.getAreaInfoList(props.areaInfo);
        this.initRotateDeg = this.rotateDeg = props.rotateDeg || 0;
        this.updatePropsArgs(props);
        this.offsetX = this.tempOffsetX = 0;
        this.offsetY = this.tempOffsetY = 0;
        this.state = {
            loading: false,
            largerRatio: this.initLargerRatio,
            loadDescription: '',
            showFull: false
        };
        this.isSelectionMode = props.displayFlag === 'drawRectangle';
        this.selection = { //绘制的坐标
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            isSelecting: false
        };
    }

    componentWillMount() {
        // 注册事件到事件系统中
        const events = {
            onTouchMove: this.onGrabMove,
            onTouchEnd: this.onGrabEnd
        };
        if (!this.props.disabledMouseWheel) {
            events.onMouseWheel = this.onMouseWheel;
        }
        this.reactEvents = new ReactEvents(events);
    }

    removeEvents = () => { // 移动鼠标拖动事件
        if (!this.canvas) return;
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    };

    async componentDidMount() {
        this._isMounted = true;
        this.canvas = document.getElementById(this.canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.operateCanvas = new OperateCanvas({
                ctx: this.ctx,
                emptySize: this.emptySize,
                emptyFillStyle: this.emptyFillStyle,
                width: this.width,
                height: this.height
            });
        }
        // 默认显示图像
        const visible = typeof this.props.visible === 'undefined' ? true : this.props.visible;
        if (visible && this.props.displayFlag !== 'showOther') {
            await this.updateImage(this.props.imgSrc, !this.props.disabledAutoZoom);
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
        if (this.canvas) {
            this.reactEvents.removeMouseWheelEvent(this.canvas);
            window && window.removeEventListener('mouseup', this.mouseup);
        }

        this._isMounted = false;
        this.canvas = null;
        this.ctx = null;
        this.imgObj = null;
    }

    handleMouseDown = (e) => {
        if (!this.isSelectionMode || this.state.loading || this.props.disabledBtns) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 👇 转换为图像坐标
        const imageX = (x - this.offsetX) / this.largerRatio;
        const imageY = (y - this.offsetY) / this.largerRatio;

        this.selection = {
            startX: imageX,
            startY: imageY,
            endX: imageX,
            endY: imageY,
            isSelecting: true
        };

        this.drawRectOnCanvas();
    };

    handleMouseMove = (e) => {
        if (!this.isSelectionMode || !this.selection.isSelecting) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 👇 转换为图像坐标
        const imageX = (x - this.offsetX) / this.largerRatio;
        const imageY = (y - this.offsetY) / this.largerRatio;

        this.selection.endX = imageX;
        this.selection.endY = imageY;

        this.drawRectOnCanvas();
    };

    handleMouseUp = (e) => {
        if (!this.isSelectionMode || !this.selection.isSelecting) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 转换为图像坐标
        const imageX = (x - this.offsetX) / this.largerRatio;
        const imageY = (y - this.offsetY) / this.largerRatio;
        this.selection.endX = imageX;
        this.selection.endY = imageY;
        this.drawRectOnCanvas(true);
        //回调给父组件使用图像坐标
        const { scale,offsetX, offsetY } = this.getImageToCanvasTransform();
        const curOffsetX = offsetX / scale;
        const curOffsetY = offsetY / scale;
        const startX = parseInt(this.selection.startX - curOffsetX);
        const startY = parseInt(this.selection.startY - curOffsetY);
        const endX = parseInt(this.selection.endX - curOffsetX);
        const endY = parseInt(this.selection.endY - curOffsetY);
        const selectedRegion = [startX, startY, endX, endY];
        if(endX > startX && endY > startY) {
            this.drawReactNo();
            if (typeof this.props.onSelection === 'function') {
                this.props.onSelection({
                    region: selectedRegion,
                    pixel: [this.imgObj.width, this.imgObj.height].join(',')
                });
            }
        } else {
            this.props.onSelection({
                region: null,
                description: '鼠标应该从左上角开始选择'
            });
        }
        this.selection.isSelecting = false;
    };

    getImageToCanvasTransform() {
        const imageWidth = this.imgObj.width;
        const imageHeight = this.imgObj.height;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY);

        const offsetX = (canvasWidth - imageWidth * scale) / 2;
        const offsetY = (canvasHeight - imageHeight * scale) / 2;

        return {
            scale,
            offsetX,
            offsetY
        };
    }

    drawReactNo() { // 绘制索引
        const ctx = this.ctx;
        const { startX, startY } = this.selection;
        const canvasStartX = startX * this.largerRatio + this.offsetX;
        const canvasStartY = startY * this.largerRatio + this.offsetY;
        // 绘制索引背景
        ctx.fillStyle = '#1CD66C';
        ctx.beginPath();
        ctx.arc((canvasStartX + 15), (canvasStartY + 15), 12, 0, Math.PI * 2);
        ctx.fill();
        // 绘制索引
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.props.areaInfo.length + 1, (canvasStartX + 15), (canvasStartY + 15));
        ctx.save();
    }

    drawRectOnCanvas(final = false) { // 绘制虚线框
        if (!this.ctx || !this.imgObj) return;
        const ctx = this.ctx;
        const { startX, startY, endX, endY } = this.selection;
        const width = endX - startX;
        const height = endY - startY;

        // 清除并重绘整个图像
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.flushCanvas({});
        // const { scale,offsetX, offsetY } = this.getImageToCanvasTransform();
        // 将图像坐标转为 canvas 绘图坐标
        const canvasStartX = startX * this.largerRatio + this.offsetX;
        const canvasStartY = startY * this.largerRatio + this.offsetY;
        const canvasWidth = width * this.largerRatio;
        const canvasHeight = height * this.largerRatio;

        // 设置虚线样式
            ctx.strokeStyle = '#1CD66C';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            // 绘制空心矩形框
            ctx.strokeRect(canvasStartX, canvasStartY, canvasWidth, canvasHeight);
        // 重置线条样式
            ctx.setLineDash([]);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (immutable.is(immutable.fromJS(this.props), immutable.fromJS(nextProps)) &&
            immutable.is(immutable.fromJS(this.state), immutable.fromJS(nextState))) {
            return false;
        }
        return true;
    }

    componentWillReceiveProps = async(nextProps) => {
        const { imgSrc, displayFlag = 'showImage', disabledBtns, rotateDeg } = nextProps;
        if (displayFlag === "drawRectangle") {
            this.isSelectionMode = true;
        } else if (displayFlag === "markImage") {
            this.isSelectionMode = false;
        }
        if (displayFlag === 'showOther') {
            return;
        }
        const visible = typeof nextProps.visible === 'undefined' ? true : nextProps.visible;
        const preAreaInfo = this.getAreaInfoList(this.props.areaInfo);
        const preDisplayFlag = this.displayFlag;
        const preDisabledBtns = this.disabledBtns;
        const height = this.height;
        const width = this.width;
        // 正在加载中不重复刷新，已经显示过的状态不重复显示
        if (!this.state.loading && visible) {
            const isChange = !immutable.is(immutable.fromJS({ ...this.props, visible }), immutable.fromJS({ ...nextProps, visible }));
            if (!isChange) {
                // 没有改变其它值，只修改了显示状态，重新恢复画布的尺寸
                if (!this.visible) {
                    this.rotateDeg = rotateDeg;
                    // 图像没有加载过
                    if (!this.imgObj) {
                        await this.updateImage(imgSrc, !nextProps.disabledAutoZoom);
                        return;
                    }
                    this.offsetX = 0;
                    this.offsetY = 0;
                    this.tempOffsetX = 0;
                    this.tempOffsetY = 0;
                    this.flushCanvas({
                        resetLargerRatio: true,
                        disabledAutoZoom: nextProps.disabledAutoZoom,
                        largerRatio: this.largerRatio || 1,
                        rotateDeg: this.rotateDeg || 0,
                        offsetX: 0,
                        offsetY: 0
                    });
                }
                return;
            }

            this.areaInfo = this.getAreaInfoList(nextProps.areaInfo);
            this.canvas = document.getElementById(this.canvasId);
            this.ctx = this.canvas.getContext('2d');

            this.updatePropsArgs(nextProps);
            this.operateCanvas.modifyArgs(nextProps);
            let resetFlag = false; // 检测部分参数需要重新还原绘制参数如缩放、拖动等
            if (!this.imgObj) {
                resetFlag = true;
            } else if (!this.visible || imgSrc !== this.imgObj.src || (this.areaInfo[0] && preAreaInfo[0] && this.areaInfo[0].pixel !== preAreaInfo[0].pixel)) {
                this.imgObj = null;
                resetFlag = true;
            } else if (displayFlag !== preDisplayFlag || (this.areaInfo[0] && preAreaInfo[0] && this.areaInfo[0].region !== preAreaInfo[0].region) ||
                preDisabledBtns !== disabledBtns || nextProps.height !== height || nextProps.width !== width || nextProps.rotateDeg !== this.rotateDeg) {
                resetFlag = true;
            }
            this.rotateDeg = rotateDeg;
            this.visible = false;
            if (displayFlag !== preDisplayFlag && this.props.imgSrc === imgSrc) {
                this.rotateDeg = this.initRotateDeg;
                this.largerRatio = this.initLargerRatio;
            }
            await this.updateImage(imgSrc, resetFlag && !nextProps.disabledAutoZoom);
        }
    }

    // 更新需要用到的参数
    updatePropsArgs = (props = {}) => {
        this.disabledBtns = !!props.disabledBtns;
        this.emptySize = props.emptySize || 5;
        this.displayFlag = props.displayFlag || 'showImage';
        this.height = this.disabledBtns ? props.height : props.height - 30;
        this.width = props.width;
        this.emptyFillStyle = props.emptyFillStyle || '#D7DAE1';
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

    addEvents = () => {
        if (!this.canvas) {
            return;
        }
        try {
            this.ctx = this.canvas.getContext('2d');
            window.addEventListener('mouseup', this.onGrabEnd);
            if (!this.isSelectionMode && !this.props.disabledMouseWheel) {
                this.reactEvents.addMouseWheelEvent(this.canvas);
            }
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('mouseleave', this.handleMouseUp);
            this.addEventsFlag = true;
        } catch (error) {
            console.error(error);
        }
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

        if (imgSrc instanceof Image) {
            this.imgObj = imgSrc;
        } else if (!this.imgObj) {
            const res = await loadImage(imgSrc);
            if (res.errcode !== '0000') {
                this.setState({
                    loading: false,
                    loadDescription: this.props.failDescription || res.description + '，点击重试'
                });
                return;
            }
            this.imgObj = res.data.imgObj;
        }

        this.offsetX = 0;
        this.offsetY = 0;
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;

        if (!this.addEventsFlag) {
            this.addEvents();
        }

        if (this.canvas && this.canvas.getContext) {
            if (this.props.disabledAutoZoom) {
                this.offsetY = this.tempOffsetY = -(this.canvas.height / 2 - (this.imgObj.height * this.largerRatio) / 2);
            }
            const res2 = await this.flushCanvas({
                rotateDeg: this.rotateDeg,
                resetLargerRatio: reset,
                offsetX: this.offsetX,
                offsetY: this.offsetY
            });
            if (res2.errcode !== '0000') {
                this.setState({
                    loading: false,
                    loadDescription: res2.description
                });
            } else {
                this.setState({
                    loading: false
                });
            }
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
            if (!opts.areaInfo.length) {
                res = await this.operateCanvas.showImage(this.imgObj, opts);
            } else {
                res = await this.operateCanvas.markImage(this.imgObj, opts);
            }
        } else if (displayFlag === 'drawRectangle') {
            if (!opts.areaInfo.length) {
                res = await this.operateCanvas.showImage(this.imgObj, opts);
            } else {
                res = await this.operateCanvas.markImage(this.imgObj, opts);
            }
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

    zoom = (s) => {
        if (!this.state.loading && this.state.loadDescription === '') {
            this.flushCanvas({
                rotateDeg: this.rotateDeg,
                largerRatio: parseFloat(s / 100),
                offsetX: this.offsetX,
                offsetY: this.offsetY,
                disableFreshImgCanvas: true
            });
        }
    }

    rotate = async(s) => {
        if (!this.state.loading && this.state.loadDescription === '') {
            this.offsetX = this.tempOffsetX = 0;
            this.offsetY = this.tempOffsetY = 0;
            const rotateDeg = this.rotateDeg || 0;
            const newDeg = (rotateDeg + s) % 360;
            this.flushCanvas({
                rotateDeg: newDeg,
                resetLargerRatio: true
            });
            if (typeof this.props.onRotateDeg === 'function') {
                await this.props.onRotateDeg(newDeg);
            }
        }
    }

    // 拖动事件
    onGrabMove = (e, { deltaMoveX, deltaMoveY }) => {
        if (!this.isSelectionMode && this.reactEvents.mouseDownFlag) {
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

    // 拖动结束事件
    onGrabEnd = (e) => {
        if (!this.isSelectionMode){
            this.offsetX = this.tempOffsetX;
            this.offsetY = this.tempOffsetY;
        }
    }

    // 鼠标滚轮缩放事件
    onMouseWheel = (e, { delta }) => {
        if (!this.state.loading && this.state.loadDescription === '') {
            const maxZoom = this.props.maxZoom || 500;
            let nextRatio = typeof this.props.leftWidth === 'undefined' ? this.largerRatio + delta : this.largerRatio;

            let ratio = 1.1;
            // 缩小
            if (delta < 0) {
                ratio = 1 / 1.1;
            }
            // 限制缩放倍数
            const _scale = nextRatio * ratio;
            if (_scale > maxZoom) {
                ratio = maxZoom / nextRatio;
                nextRatio = maxZoom;
            } else if (_scale < 0.1) {
                ratio = 0.1 / nextRatio;
                nextRatio = 0;
            } else {
                nextRatio = _scale;
            }

            if (nextRatio > 0 && nextRatio * 100 < maxZoom) {
                const rotateDeg = this.rotateDeg || 0;
                const origin = {
                    x: (ratio - 1) * this.canvas.width * 0.5,
                    y: (ratio - 1) * this.canvas.height * 0.5
                };
                // // 计算偏移量
                this.tempOffsetX -= (ratio - 1) * (e.clientX - this.tempOffsetX - this.props.leftWidth || 0) - origin.x;
                this.tempOffsetY -= (ratio - 1) * (e.clientY - this.tempOffsetY - this.props.topHeight || 0) - origin.y;

                if (typeof this.props.leftWidth !== 'undefined') {
                  this.offsetX = this.tempOffsetX;
                  this.offsetY = this.tempOffsetY;
                }

                this.flushCanvas({
                    rotateDeg: rotateDeg,
                    largerRatio: nextRatio,
                    offsetX: this.offsetX,
                    offsetY: this.offsetY
                });
            }
        }
    }

    reset = async() => {
        if (this.state.loadDescription === '' && !this.state.loading) {
            this.offsetX = this.tempOffsetX = 0;
            this.offsetY = this.tempOffsetY = 0;
            this.largerRatio = 1;

            if (typeof this.props.onRotateDeg === 'function' && this.initRotateDeg !== this.rotateDeg) {
                this.setState({
                    disabledRotate: true
                });
                await this.props.onRotateDeg(this.initRotateDeg);
                this.setState({
                    disabledRotate: false
                });
            }
            this.flushCanvas({
                rotateDeg: this.initRotateDeg,
                largerRatio: this.initLargerRatio,
                resetLargerRatio: true,
                disabledAutoZoom: this.props.disabledAutoZoom,
                offsetX: 0,
                offsetY: 0
            });
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
                this.updateImage(this.props.imgSrc);
            }, 400);
        }
    }

    onFullScreen = (result) => {
        this.setState({
            showFull: result
        });
    }

    render() {
        const {
            minZoom = 10,
            maxZoom = 500,
            index,
            total,
            onExit,
            disabledBtns,
            style = {},
            imgSrc,
            className,
            emptyFillStyle = '#d7dae1',
            displayFlag,
            width, //画布宽度
            height, //画布高度
            showNewBtns,
            areaInfo,
            showOriginFile,
            showFullBtn,
            showChangePageBtn,
            rotateDeg,
            changeIndex
        } = this.props;
        const {
            largerRatio,
            loading,
            loadDescription = '',
            disabledRotate,
            imgWidth = 0, // img标签显示图像大小
            imgHeight = 0,
            showImageTag,
            showFull
        } = this.state;
        const renderInBody = !!this.props.renderInBody;
        const emptySize = this.emptySize || 5;
        const hideImg = loading || loadDescription;
        const disabled = loading || loadDescription !== '' || disabledRotate;
        const canvasHeight = disabledBtns ? height - emptySize * 2 : height - 30 - emptySize * 2;
        const canvasWidth = width - emptySize * 2;

        const boxStyle = {
            background: emptyFillStyle,
            width: width + 'px',
            height: height + 'px',
            padding: emptySize,
            overflow: 'hidden',
            boxSizing: 'border-box',
            ...style
        };

        const boxClassName = className ? className + ' showImageBox' : 'showImageBox';
        const newSizeInfo = showImageTag ? adjustSize(imgWidth, imgHeight, canvasWidth, canvasHeight) : {};
        let marginLeft = 0;
        let marginTop = 0;
        if (newSizeInfo.width) {
            marginLeft = (width - newSizeInfo.width) / 2;
            marginTop = (height - newSizeInfo.height) / 2;
        }

        const isShowBtns = !disabledBtns && !showImageTag && !loadDescription;
        const toucheEvents = {
            onMouseDown: this.reactEvents.onTouchStart,
            onMouseMove: this.reactEvents.onTouchMove,
            onMouseOut: this.reactEvents.onTouchEnd,
            onMouseUp: this.reactEvents.onTouchEnd
        };
        const cursorStyle = displayFlag === 'drawRectangle' ? 'crosshair' : 'grab';
        const contentDiv = (
            <div style={boxStyle} className={boxClassName}>

                {
                    displayFlag === 'showOther' ? (
                        <iframe
                            frameBorder='no'
                            border='0'
                            marginWidth='0'
                            marginHeight='0'
                            allowTransparency='yes'
                            width={canvasWidth}
                            height={canvasHeight + 30}
                            src={this.props.imgSrc}
                            id='iframeId'
                        />
                    ) : (
                        !showImageTag ? (
                            <canvas
                                id={this.canvasId}
                                width={canvasWidth}
                                height={canvasHeight}
                                style={{ width: canvasWidth, height: canvasHeight, cursor: `${cursorStyle}`, display: hideImg ? 'none' : 'block' }}
                                {...toucheEvents}
                            />
                        ) : (
                            <img
                                style={{ width: newSizeInfo.width, height: newSizeInfo.height, marginLeft, marginTop, display: hideImg ? 'none' : 'block' }}
                                src={imgSrc}
                            />
                        )
                    )
                }
                {
                    showNewBtns ? (
                        <NewBottomBtns
                            imgSrc={imgSrc}
                            total={total}
                            isShowBtns={isShowBtns}
                            onZoom={this.zoom}
                            onReset={this.reset}
                            onExit={onExit}
                            disabled={disabled}
                            minZoom={minZoom}
                            maxZoom={maxZoom}
                            onRotate={this.rotate}
                            displayFlag={displayFlag}
                            largerRatio={largerRatio}
                            showOriginFile={showOriginFile}
                            areaInfo={areaInfo}
                            onFullScreen={this.onFullScreen}
                            showFullBtn={showFullBtn}
                            showChangePageBtn={showChangePageBtn}
                            isShowMidBtn={displayFlag === 'showOther'}
                            changeIndex={changeIndex}
                        />
                    ) : displayFlag === 'showOther' || displayFlag === 'drawRectangle' ? null : (
                        <BottomBtns
                            index={index}
                            total={total}
                            isShowBtns={isShowBtns}
                            onZoom={this.zoom}
                            onReset={this.reset}
                            onExit={onExit}
                            disabled={disabled}
                            minZoom={minZoom}
                            maxZoom={maxZoom}
                            onRotate={this.rotate}
                            displayFlag={displayFlag}
                            largerRatio={largerRatio}
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
                            <Spin
                                size='large'
                                style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -30, marginTop: -30 }}
                            />
                        ) : null
                    )
                }
                {
                    showFull && (
                        <FullImage
                            imgSrc={imgSrc}
                            displayFlag={displayFlag}
                            largerRatio={largerRatio}
                            areaInfo={areaInfo}
                            onFullScreen={this.onFullScreen}
                            rotateDeg={rotateDeg}
                            changeIndex={changeIndex}
                        />
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
    imgSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // 图像的地址
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // 图像的id, 用于判断图像的唯一，后续扩展循环显示
    width: PropTypes.number.isRequired, // 整个区域的宽度
    height: PropTypes.number.isRequired, // 整个区域的高度
    areaInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // 图像显示的必要参数[{ pixel: '', region: '', markColor: '#D7DAE1' }]
    rotateDeg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onGetImage: PropTypes.func, // 图像获取失败，通过id向后台接口可以重新生成
    onRotateDeg: PropTypes.func, // 当旋转角度时的回调函数
    onDidMount: PropTypes.func, // 当组件加载完成后的回调
    largerRatio: PropTypes.number, // 图像的放大系数，默认为1不放大
    visible: PropTypes.bool, // 是否显示，主要用于控制多个轮播图像多个图像同时加载时消耗资源
    minZoom: PropTypes.number, // 拖动放大时的最小放大系数
    maxZoom: PropTypes.number, // 拖动放大时的最大放大系数
    disabledBtns: PropTypes.bool, // 是否不需要显示按钮
    renderInBody: PropTypes.bool, // 是否渲染到body里面，主要用于全局弹出显示图像的情况
    className: PropTypes.string, // 使用自己的样式控制
    emptyFillStyle: PropTypes.string, // 画布背景空白填充颜色
    emptySize: PropTypes.number, // 边界留白的大小
    displayFlag: PropTypes.string, // 图像的显示方式，showImage, cuteImage, markImage, showOther, drawRectangle
    index: PropTypes.number, // 显示当前排序值
    total: PropTypes.number, // 显示总数量
    onExit: PropTypes.func, // 全屏时退出全屏
    disabledMouseWheel: PropTypes.bool, // 禁止鼠标滚动放大
    style: PropTypes.object, // 控制样式
    disabledAutoZoom: PropTypes.bool, // 由程序自动控制初始的缩放
    failDescription: PropTypes.string,
    showNewBtns: PropTypes.bool, // 是否显示新的按钮组
    showOriginFile: PropTypes.func, // 点击查看源文件按钮的回调
    showFullBtn: PropTypes.bool, // 是否显示全屏按钮
    showChangePageBtn: PropTypes.bool, // 是否显示切换按钮
    changeIndex: PropTypes.func, // 切换文件的回调
    leftWidth: PropTypes.number, // 画布距离屏幕左侧的距离
    topHeight: PropTypes.number // 画布距离屏幕上侧的距离
};

export default ScanImage;