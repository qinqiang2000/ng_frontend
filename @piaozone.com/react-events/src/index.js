export default class ReactEvents {
    constructor(opt) {
        this.onGestureZoom = opt.onGestureZoom;
        this.touchMove = opt.onTouchMove;
        this.touchStart = opt.onTouchStart;
        this.touchEnd = opt.onTouchEnd;
        this.mouseWheel = opt.onMouseWheel;
    };

    preventDefault = (e, stopPropagation) => {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.stopPropagation && stopPropagation) {
            e.stopPropagation();
        }
    }

    computeDistance = (t1, t2) => {
        const pageX1 = t1.pageX;
        const pageY1 = t1.pageY;
        const pageX2 = t2.pageX;
        const pageY2 = t2.pageY;
        return { x: Math.abs(pageX1 - pageX2), y: Math.abs(pageY1 - pageY2) };
    }

    // pc和移动端都可以使用
    onTouchStart = (e) => {
        const touches = e.touches || [];
        if (touches.length > 1) {
            this.startDistance = this.computeDistance(touches[0], touches[1]);
        } else {
            let clientX = e.clientX;
            let clientY = e.clientY;
            if (touches && touches.length > 0) {
                clientX = touches[0].clientX;
                clientY = touches[0].clientY;
            }
            this.startMoveX = clientX;
            this.startMoveY = clientY;
        }
        this.mouseDownFlag = true;
        this.preventDefault(e);
        typeof this.touchStart === 'function' && this.touchStart(e);
        return false;
    }

    // pc和移动端都可以使用
    onTouchMove = (e) => {
        const touches = e.touches || [];
        if (this.mouseDownFlag) {
            if (touches && touches.length > 1) {
                const curDistance = this.computeDistance(touches[0], touches[1]);
                const deltaX = curDistance.x - this.startDistance.x;
                const deltaY = curDistance.y - this.startDistance.y;
                const zoomDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                typeof this.onGestureZoom === 'function' && this.onGestureZoom(e, { zoomDelta, deltaX, deltaY });
            } else {
                let clientX = e.clientX;
                let clientY = e.clientY;
                if (touches && touches.length > 0) {
                    clientX = touches[0].clientX;
                    clientY = touches[0].clientY;
                }
                const deltaMoveX = clientX - this.startMoveX;
                const deltaMoveY = clientY - this.startMoveY;
                typeof this.touchMove === 'function' && this.touchMove(e, { deltaMoveX, deltaMoveY });
            }
            this.preventDefault(e, true);
            return false;
        }
    }

    // pc和移动端都可以使用
    onTouchEnd = (e) => {
        this.mouseDownFlag = false;
        typeof this.touchEnd === 'function' && this.touchEnd(e);
    }

    addMouseWheelEvent(dom) {
        dom.addEventListener('DOMMouseScroll', this.onMouseWheel);
        dom.addEventListener('mousewheel', this.onMouseWheel);
    }

    removeMouseWheelEvent(dom) {
        dom.removeEventListener('DOMMouseScroll', this.onMouseWheel);
        dom.removeEventListener('mousewheel', this.onMouseWheel);
    }

    // 鼠标滚轮缩放事件
    onMouseWheel = (e) => {
        let wheelValue;
        if (e.wheelDelta) {
            wheelValue = (window.opera && parseFloat(window.opera.version()) < 9.5
                ? -e.wheelDelta : e.wheelDelta);
        } else {
            wheelValue = -e.detail * 40; //for firefox (event.detail = -3)
        }
        const delta = parseFloat(wheelValue / 550);
        typeof this.mouseWheel === 'function' && this.mouseWheel(e, { delta });
        this.preventDefault(e, true);
    }
}