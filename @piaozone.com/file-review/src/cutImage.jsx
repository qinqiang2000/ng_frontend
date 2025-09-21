/*eslint-disable*/
import React, { useState, useImperativeHandle, useEffect } from 'react';
import PropTypes from 'prop-types';
import ScanImage from '@piaozone.com/scan-image';
import left from './img/left.png';
import right from './img/right.png';
import enlarge from './img/enlarge.png';
import narrow from './img/narrow.png';
import reset from './img/reset.png';
import forward from './img/forward.png';
import backward from './img/backward.png';
import './index.less';

export default function CutImage(props) {
    const { fileUrl, angle, inputInvoices = [], changeAngle, changeIndex, reviewBoxWidth, reviewBoxHeight, showChangePageBtn, leftWidth, topHeight, display, isCutImage } = props; 

    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const [visible, setVisible] = useState(false);
    const [boxSize, setBoxSize] = useState({ boxWidth: clientWidth, boxHeight: clientHeight });
    const [largerRatio, setLargerRatio] = useState(undefined);


    const resizeUpdate = () => {
        const reviewDom = document.getElementById('review');
        setBoxSize({
            boxWidth: reviewDom.clientWidth,
            boxHeight: reviewDom.clientHeight
        });
    };


    useEffect(() => {
        resizeUpdate();
        window.addEventListener('resize', resizeUpdate);
        const img = new Image();
        let ratio = 1;
        if (inputInvoices.length && inputInvoices[0]?.pixel) {
            const imgWidth = inputInvoices[0].pixel.split(',')[0];
            ratio = (reviewBoxWidth * 0.8) / imgWidth;
            setLargerRatio(ratio);
        } else {
            img.src = fileUrl;
            img.onload = (e) => {
                ratio = (reviewBoxWidth * 0.8) / img.width;
                setLargerRatio(ratio);
            };
        }
        return () => {
            window.removeEventListener('resize', resizeUpdate);
        };
    }, [fileUrl, reviewBoxWidth]);

    const child = React.createRef();

    useImperativeHandle(props.onRef, () => {
        return {
            zoom,
            rotate,
            fullScreen,
            reset: resetImg
        };
    });

    // 混贴旋转
    const rotate = (dir) => {
        let _deg = angle;
        if (dir === 'left') {
            _deg += 90;
        } else {
            _deg -= 90;
        }
        _deg = _deg % 360;
        changeAngle && changeAngle(_deg);
    };

    // 混贴缩放
    const zoom = (dir) => {
        let _scale = child.current.largerRatio;
        if (dir === 'enlarge') {
            _scale = _scale >= 2 ? 2 : _scale + 0.1;
        } else {
            _scale = _scale <= 0.01 ? 0.01 : _scale - 0.1;
        }
        child.current.zoom(_scale * 100);
    };

    const resetImg = () => {
        child.current.rotate(0);
    };

    const fullScreen = () => {
        setVisible(true);
    };

    const renderDom = (type, ratio) => (
        <ScanImage
            id={0}
            width={type ? clientWidth : reviewBoxWidth || boxSize.boxWidth}
            height={type ? clientHeight : reviewBoxHeight || boxSize.boxHeight}
            rotateDeg={angle}
            largerRatio={ratio}
            areaInfo={inputInvoices.length ? inputInvoices : []}
            displayFlag={isCutImage ? 'markImage' : 'showImage'}
            visible={true}
            renderInBody={false}
            imgSrc={fileUrl}
            disabledBtns={true}
            disabledMouseWheel={false}
            disabledAutoZoom={type ? false : !!(display === 'width')}
            emptyFillStyle={type ? '' : '#d8d8d8'}
            ref={child}
            leftWidth={type ? 0 : leftWidth}
            topHeight={type ? 0 : topHeight}
            emptySize={1}
        />
    );

    const btns = [
        ...showChangePageBtn ? [{
            icon: forward,
            key: 'forward',
            fun: () => changeIndex('forward')
        }] : [],
        {
            icon: left,
            key: 'left',
            fun: () => rotate('left')
        },
        {
            icon: right,
            key: 'right',
            fun: () => rotate('right')
        },
        {
            icon: enlarge,
            key: 'enlarge',
            fun: () => zoom('enlarge')
        },
        {
            icon: narrow,
            key: 'narrow',
            fun: () => zoom('narrow')
        },
        {
            icon: reset,
            key: 'reset',
            fun: () => setVisible(false)
        },
        ...showChangePageBtn ? [{
            icon: backward,
            key: 'backward',
            fun: () => changeIndex('backward')
        }] : []
    ];

    if (!largerRatio) {
        return null;
    }
    return (
        <div>
            {renderDom('', largerRatio)}
            {visible && (
                <div className='full-box'>
                    {renderDom('full')}
                    {
                        <div className='btn-box'>
                            {
                                btns.map(item => (
                                    <img src={item.icon} key={item.key} className='btn' onClick={item.fun} />
                                ))
                            }
                        </div>
                    }
                </div>
            )}
        </div>
    );
}

CutImage.propTypes = {
    fileUrl: PropTypes.string, // 文件地址
    angle: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // 旋转角度
    changeAngle: PropTypes.func, // 旋转后的回调
    changeIndex: PropTypes.func, // 向左向右切换的回调
    inputInvoices: PropTypes.array, // 混贴坐标
    showChangePageBtn: PropTypes.bool,
    reviewBoxWidth: PropTypes.number, // 对于混贴组件固定宽高特殊处理
    reviewBoxHeight: PropTypes.number, // 对于混贴组件固定宽高特殊处理
    onRef: PropTypes.any,
    leftWidth: PropTypes.number, // 画布距离屏幕左侧的距离
    topHeight: PropTypes.number, // 画布距离屏幕上侧的距离
    display: PropTypes.string,
    isCutImage: PropTypes.bool // 是否展示混贴框
};