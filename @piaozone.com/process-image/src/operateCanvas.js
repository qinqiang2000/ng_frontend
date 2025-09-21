import { getRotateRect, cuteImage, markImage, showImage } from './utils';

export default class OperateCanvas {
    constructor(props) {
        this.ctx = props.ctx;
        this.width = props.width;
        this.height = props.height;
        this.initLargerRatio = props.largerRatio || 1;
        this.initRotateDeg = props.rotateDeg || 0;
        this.rotateDeg = this.initRotateDeg;
        this.largerRatio = this.initLargerRatio;
        this.emptyFillStyle = props.emptyFillStyle || '#D7DAE1';
    }

    modifyArgs = (opt) => {
        this.displayFlag = opt.displayFlag || this.displayFlag;
        this.width = opt.width || this.width;
        this.height = opt.height || this.height;
        this.emptyFillStyle = opt.emptyFillStyle || this.emptyFillStyle;
        this.imgCanvasObj = null;
    }

    computeDrawSize = (opt = {}) => {
        const {
            imgWidth,
            imgHeight,
            maxWidth,
            maxHeight,
            rotateDeg = this.rotateDeg,
            displayFlag = 'showImage',
            resetLargerRatio,
            disabledAutoZoom,
            reset
        } = opt;
        const largerRatio = typeof opt.largerRatio !== 'undefined' ? opt.largerRatio : this.largerRatio;
        const rate = parseFloat(imgWidth / imgHeight);
        const minWidth = (maxWidth * 1) / 2;
        const minHeight = (maxHeight * 1) / 2;
        if ((rotateDeg !== this.rotateDeg || resetLargerRatio || reset) && !disabledAutoZoom) {
            const tempRotateDeg = displayFlag === 'markImage' ? 0 : rotateDeg;
            const tempRwRh = getRotateRect(tempRotateDeg, imgWidth, imgHeight, maxWidth, maxHeight, 0, minWidth, minHeight);
            this.rw = tempRwRh.rw;
            this.rh = tempRwRh.rh;
            this.rotateDeg = reset ? this.initRotateDeg : rotateDeg;
            this.largerRatio = parseFloat(this.rw / imgWidth);
            if (!this.initLargerRatio) {
                this.initLargerRatio = this.largerRatio;
            }
        } else {
            if (largerRatio !== this.largerRatio) { // 放大系数发生变化
                this.largerRatio = largerRatio;
            }
            this.rotateDeg = rotateDeg;
            this.rh = imgHeight * largerRatio;
            this.rw = this.rh * rate;
        }
    }

    getOffset(rotateDeg, offsetX = 0, offsetY = 0) {
        if (rotateDeg === 90 || rotateDeg === -270) {
            const temp = offsetY;
            offsetY = offsetX;
            offsetX = -temp;
        } else if (rotateDeg === -90 || rotateDeg === 270) {
            const temp = offsetY;
            offsetY = -offsetX;
            offsetX = temp;
        } else if (rotateDeg === 180 || rotateDeg === -180) {
            offsetY = -offsetY;
            offsetX = -offsetX;
        }
        return { offsetX, offsetY };
    }

    showImage = async(imgObj, opt = {}) => {
        const {
            resetLargerRatio,
            reset,
            disabledAutoZoom,
            largerRatio = this.largerRatio
        } = opt;

        let rotateDeg = typeof opt.rotateDeg !== 'undefined' ? opt.rotateDeg : this.rotateDeg;
        rotateDeg = rotateDeg % 360;
        const maxWidth = this.ctx.canvas.width;
        const maxHeight = this.ctx.canvas.height;
        const { offsetX, offsetY } = this.getOffset(rotateDeg, opt.offsetX, opt.offsetY);
        if (rotateDeg !== this.rotateDeg || !this.imgCanvasObj) {
            const cuteRes = await showImage(imgObj);
            if (cuteRes.errcode !== '0000') {
                return cuteRes;
            }
            this.imgCanvasObj = cuteRes.data;
        }

        const ctx = this.ctx;
        const imgWidth = this.imgCanvasObj.width;
        const imgHeight = this.imgCanvasObj.height;

        // 更新图像绘制的尺寸
        this.computeDrawSize({
            imgWidth,
            imgHeight,
            maxWidth,
            maxHeight,
            rotateDeg,
            largerRatio,
            resetLargerRatio,
            disabledAutoZoom,
            reset
        });
        const canvas = ctx.canvas;
        ctx.save();
        ctx.fillStyle = this.emptyFillStyle;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-rotateDeg * Math.PI / 180);
        ctx.translate(-this.rw / 2 + offsetX, -this.rh / 2 + offsetY);
        ctx.drawImage(this.imgCanvasObj, 0, 0, imgWidth, imgHeight, 0, 0, this.rw, this.rh);
        ctx.restore();

        return {
            errcode: '0000',
            data: {
                rotateDeg: this.rotateDeg,
                largerRatio: this.largerRatio
            }
        };
    }

    cuteImage = async(imgObj, opt = {}) => {
        const {
            resetLargerRatio,
            reset,
            largerRatio = this.largerRatio,
            disabledAutoZoom,
            areaInfo = []
        } = opt;
        let rotateDeg = typeof opt.rotateDeg !== 'undefined' ? opt.rotateDeg : this.rotateDeg;
        rotateDeg = rotateDeg % 360;
        const { pixel, region } = areaInfo[0];

        const maxWidth = this.ctx.canvas.width;
        const maxHeight = this.ctx.canvas.height;

        if (rotateDeg !== this.rotateDeg || !this.imgCanvasObj) {
            const cuteRes = await cuteImage(imgObj, { pixel, region });
            if (cuteRes.errcode !== '0000') {
                return cuteRes;
            }
            this.imgCanvasObj = cuteRes.data;
        }

        const ctx = this.ctx;
        const canvas = ctx.canvas;
        const imgWidth = this.imgCanvasObj.width;
        const imgHeight = this.imgCanvasObj.height;
        const { offsetX, offsetY } = this.getOffset(rotateDeg, opt.offsetX, opt.offsetY);
        // 更新图像绘制的尺寸
        this.computeDrawSize({
            imgWidth,
            imgHeight,
            maxWidth,
            maxHeight,
            rotateDeg,
            largerRatio,
            resetLargerRatio,
            disabledAutoZoom,
            reset
        });

        ctx.save();
        ctx.fillStyle = this.emptyFillStyle;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-rotateDeg * Math.PI / 180);
        ctx.translate(-this.rw / 2 + offsetX, -this.rh / 2 + offsetY);
        ctx.drawImage(this.imgCanvasObj, 0, 0, imgWidth, imgHeight, 0, 0, this.rw, this.rh);
        ctx.restore();
        return {
            errcode: '0000',
            data: {
                rotateDeg: this.rotateDeg,
                largerRatio: this.largerRatio
            }
        };
    }

    markImage = async(imgObj, opt = {}) => {
        const {
            resetLargerRatio,
            reset,
            offsetX,
            offsetY,
            largerRatio = this.largerRatio,
            disabledAutoZoom,
            areaInfo = []
        } = opt;
        let rotateDeg = typeof opt.rotateDeg !== 'undefined' ? opt.rotateDeg : this.rotateDeg;
        rotateDeg = rotateDeg % 360;
        const ctx = this.ctx;
        const maxWidth = ctx.canvas.width;
        const maxHeight = ctx.canvas.height;
        let cuteRes;
        if (rotateDeg !== this.rotateDeg || !this.imgCanvasObj) {
            cuteRes = await markImage(imgObj, {
                targetHeight: maxHeight,
                targetWidth: maxWidth,
                areaInfo,
                orientation: rotateDeg
            });
            if (cuteRes.errcode !== '0000') {
                return cuteRes;
            }
            this.imgCanvasObj = cuteRes.data;
        }

        const imgWidth = this.imgCanvasObj.width;
        const imgHeight = this.imgCanvasObj.height;

        // 更新图像绘制的尺寸
        this.computeDrawSize({
            displayFlag: 'markImage',
            imgWidth,
            imgHeight,
            maxWidth,
            maxHeight,
            rotateDeg,
            largerRatio,
            resetLargerRatio,
            disabledAutoZoom,
            reset
        });

        ctx.save();
        ctx.fillStyle = this.emptyFillStyle;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(ctx.canvas.width / 2 - this.rw / 2 + offsetX, ctx.canvas.height / 2 - this.rh / 2 + offsetY);
        ctx.drawImage(this.imgCanvasObj, 0, 0, imgWidth, imgHeight, 0, 0, this.rw, this.rh);
        ctx.restore();
        return {
            errcode: '0000',
            data: {
                rotateDeg: this.rotateDeg,
                largerRatio: this.largerRatio
            }
        };
    }
}