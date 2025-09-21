import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import Spin from '@piaozone.com/spin';
import { clientCheck, getRotateRect } from './util';

export default function DragImg(props) {
    const { fileUrl, angle, changeAngle, styleName, reviewBoxWidth, reviewBoxHeight, otherRender, leftWidth, topHeight, display } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [deg, setDeg] = useState(angle);
    const targetImg = useRef(null);
    const divRef = useRef(null);
    const image = targetImg.current;
    // 全局变量
    const minScale = 0.5;
    const maxScale = 4;

    const initData = useRef({
        result: {},
        x: 0,
        y: 0,
        scale: 1,
        isPointerdown: false, // 按下标识
        point: { x: 0, y: 0 }, // 第一个点坐标
        diff: { x: 0, y: 0 }, // 相对于上一次pointermove移动差值
        initXY: { x: 0, y: 0 }, // 初始坐标
        lastPointermove: { x: 0, y: 0 } // 用于计算diff
    });
    let { result, x, y, scale, isPointerdown, point, diff, initXY, lastPointermove } = initData.current;
    useImperativeHandle(props.onRef, () => {
        return {
            zoom,
            rotate,
            resetImg
        };
    });

    useEffect(() => {
        setDeg(angle);
    }, [fileUrl]);

    useEffect(() => {
        if (!image) {
            return;
        }
        result = getImgSize(image.naturalWidth, image.naturalHeight, reviewBoxWidth, reviewBoxHeight);
        image.style.width = result.width + 'px';
        image.style.height = result.height + 'px';
        x = (reviewBoxWidth - result.width) * 0.5;
        y = (reviewBoxHeight - result.height) * 0.5;
        // y = 0;
        image.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${-deg}deg) scale(1)`;
        initXY = { x, y };
        const clientInfo = clientCheck();
        if (!clientInfo.browser.ie && !image.complete) {
            setIsLoading(true);
        }
        initData.current = { ...initData.current, result, x, y, initXY };
    }, [fileUrl, image?.naturalWidth, reviewBoxWidth, deg]);

    /**
     * 获取图片缩放尺寸
     * @param {number} naturalWidth
     * @param {number} naturalHeight
     * @param {number} maxWidth
     * @param {number} maxHeight
     * @returns
     */
    const getImgSize = (naturalWidth, naturalHeight, maxWidth, maxHeight) => {
        const imgRatio = naturalWidth / naturalHeight;
        // const maxRatio = maxWidth / maxHeight;
        // let width, height;
        // 如果图片实际宽高比例 >= 显示宽高比例
        if (display === 'width') {
            return {
                width: maxWidth * 0.8,
                height: (maxWidth * 0.8) / imgRatio
            };
        }
        // if (imgRatio >= maxRatio) {
        //     if (naturalWidth > maxWidth) {
        //         width = maxWidth;
        //         height = (maxWidth / naturalWidth) * naturalHeight;
        //     } else {
        //         width = naturalWidth;
        //         height = naturalHeight;
        //     }
        // } else {
        //     if (naturalHeight > maxHeight) {
        //         width = (maxHeight / naturalHeight) * naturalWidth;
        //         height = maxHeight;
        //     } else {
        //         width = naturalWidth;
        //         height = naturalHeight;
        //     }
        // }
        const res = getRotateRect(deg, naturalWidth, naturalHeight, maxWidth, maxHeight, 1, (maxWidth * 1) / 2, (maxHeight * 1) / 2);
        return { width: res.rw, height: res.rh };
    };

    // 绑定 pointerdown
    const pointerDown = (e) => {
        isPointerdown = true;
        image.setPointerCapture(e.pointerId);
        point = { x: e.clientX, y: e.clientY };
        lastPointermove = { x: e.clientX, y: e.clientY };
        initData.current = { ...initData.current, isPointerdown, point, lastPointermove };
    };

    // 绑定 pointermove
    const pointerMove = (e) => {
        if (isPointerdown) {
            const current1 = { x: e.clientX, y: e.clientY };
            diff.x = current1.x - lastPointermove.x;
            diff.y = current1.y - lastPointermove.y;
            lastPointermove = { x: current1.x, y: current1.y };
            x += diff.x;
            y += diff.y;
            image.style.transform =
                `translate3d(${x}px, ${y}px, 0) rotate(${-deg}deg) scale(${scale})`;
            initData.current = { ...initData.current, diff, x, y, lastPointermove };
        }
        e.preventDefault();
    };
    // 绑定 pointerup
    const pointerUp = () => {
        if (isPointerdown) {
            isPointerdown = false;
            initData.current = { ...initData.current, isPointerdown };
        }
    };
    // 绑定 pointercancel
    const pointerCancel = () => {
        if (isPointerdown) {
            isPointerdown = false;
            initData.current = { ...initData.current, isPointerdown };
        }
    };

    // 滚轮缩放
    const wheelZoom = (e) => {
        let ratio = 1.1;
        // 缩小
        if (e.deltaY > 0) {
            ratio = 1 / 1.1;
        }
        // 限制缩放倍数
        const _scale = scale * ratio;
        if (_scale > maxScale) {
            ratio = maxScale / scale;
            scale = maxScale;
        } else if (_scale < minScale) {
            ratio = minScale / scale;
            scale = minScale;
        } else {
            scale = _scale;
        }
        // 目标元素是img说明鼠标在img上，以鼠标位置为缩放中心，否则默认以图片中心点为缩放中心
        if (e.target.tagName === 'IMG') {
            const origin = {
                x: (ratio - 1) * result.width * 0.5,
                y: (ratio - 1) * result.height * 0.5
            };
            // 计算偏移量
            x -= (ratio - 1) * (e.clientX - x - leftWidth) - origin.x;
            y -= (ratio - 1) * (e.clientY - y - topHeight) - origin.y;
        }
        image.style.transform =
            `translate3d(${x}px, ${y}px, 0) rotate(${-deg}deg) scale(${scale})`;
        initData.current = { ...initData.current, x, y };
        e.preventDefault();
    };

    const handelImgLoaded = () => {
        setIsLoading(false);
    };

    // 旋转
    const rotate = (dir, type) => {
        resetImg();
        let _deg = deg;
        if (dir === 'left') {
            _deg += 90;
        } else {
            _deg -= 90;
        }
        _deg = _deg % 360;
        image.style.transform = `translate3d(${initXY.x}px, ${initXY.y}px, 0) rotate(${-_deg}deg) scale(${scale})`;
        initData.current = { ...initData.current, x, y };
        setDeg(_deg);
        !type && changeAngle && changeAngle(_deg);
    };

    // 按钮缩放
    const zoom = (dir) => {
        let ratio = 1.1;
        // 缩小
        if (dir === 'narrow') {
            ratio = 1 / 1.1;
        }
        // 限制缩放倍数
        const _scale = scale * ratio;
        if (_scale > maxScale) {
            ratio = maxScale / scale;
            scale = maxScale;
        } else if (_scale < minScale) {
            ratio = minScale / scale;
            scale = minScale;
        } else {
            scale = _scale;
        }
        image.style.transform =
            `translate3d(${x}px, ${y}px, 0) rotate(${-deg}deg) scale(${scale})`;
    };

    const resetImg = () => {
        scale = 1;
        image.style.transform =
            `translate3d(${initXY.x}px, ${initXY.y}px, 0) rotate(${-deg}deg) scale(1)`;
        point = { x: 0, y: 0 };
        diff = { x: 0, y: 0 };
        lastPointermove = { x: 0, y: 0 };
        x = initXY.x;
        y = initXY.y;
    };

    return (
        <div className={styleName} onWheel={e => wheelZoom(e)} ref={divRef}>
            {isLoading && <Spin />}
            <img
                ref={targetImg}
                src={fileUrl}
                alt='图像'
                height='100%'
                onLoad={() => handelImgLoaded()}
                onError={() => handelImgLoaded()}
                onWheel={(e) => wheelZoom(e)}
                style={{
                    cursor: 'grab',
                    visibility: isLoading ? 'hidden' : 'visible',
                    backgroundColor: '#fff'
                }}
                onPointerDown={(e) => pointerDown(e)}
                onPointerMove={(e) => pointerMove(e)}
                onPointerUp={(e) => pointerUp(e)}
                onPointerCancel={(e) => pointerCancel(e)}
            />
            {otherRender && otherRender()}
        </div>
    );
}

DragImg.propTypes = {
    fileUrl: PropTypes.string, // 文件地址
    angle: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // 旋转角度
    changeAngle: PropTypes.func, // 旋转后的回调
    reviewBoxWidth: PropTypes.number,
    reviewBoxHeight: PropTypes.number,
    styleName: PropTypes.string,
    otherRender: PropTypes.func,
    onRef: PropTypes.any,
    leftWidth: PropTypes.number, // 画布距离屏幕左侧的距离
    topHeight: PropTypes.number, // 画布距离屏幕上侧的距离
    display: PropTypes.string
};
