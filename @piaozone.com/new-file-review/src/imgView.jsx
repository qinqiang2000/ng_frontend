/*eslint-disable*/
import React, { useState, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import DragImg from './dragImg';
import left from './img/left.png';
import right from './img/right.png';
import enlarge from './img/enlarge.png';
import narrow from './img/narrow.png';
import forward from './img/forward.png';
import backward from './img/backward.png';
import resetImg from './img/reset.png';

export default function ImgView(props) {
    const { fileUrl, angle, changeAngle, changeIndex, showChangePageBtn, reviewBoxWidth, reviewBoxHeight, leftWidth, topHeight, display } = props;
    const [visible, setVisible] = useState(false); // 是否展示大图

    const childRef = React.createRef();
    const fullRef = React.createRef();
    
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    useImperativeHandle(props.onRef, () => {
        return {
            zoom,
            rotate,
            fullScreen,
            reset
        };
    });

    // 全屏
    const fullScreen = () => {
        setVisible(true);
    };

    const btns = [
        ...(showChangePageBtn
            ? [
                {
                    icon: forward,
                    key: 'forward',
                    fun: () => changeIndex('forward')
                }
            ]
            : []),
        {
            icon: left,
            key: 'left',
            fun: () => {
                fullRef.current?.rotate('left', 'full');
                childRef.current?.rotate('left');
            }
        },
        {
            icon: right,
            key: 'right',
            fun: () => {
                fullRef.current?.rotate('right', 'full');
                childRef.current?.rotate('right');
            }
        },
        {
            icon: enlarge,
            key: 'enlarge',
            fun: () => fullRef.current?.zoom('enlarge')
        },
        {
            icon: narrow,
            key: 'narrow',
            fun: () => fullRef.current?.zoom('narrow')
        },
        {
            icon: resetImg,
            key: 'reset',
            fun: () => setVisible(false)
        },
        ...(showChangePageBtn
            ? [
                {
                    icon: backward,
                    key: 'backward',
                    fun: () => changeIndex('backward')
                }
            ]
            : [])
    ];

    const zoom = (type) => {
        childRef.current?.zoom(type);
    };

    const rotate = (type) => {
        childRef.current?.rotate(type);
    };

    const reset = () => {
        childRef.current?.resetImg();
    };

    const otherRender = () => (
        <div className='btn-box'>
            {btns.map((item) => (
                <img
                    src={item.icon}
                    key={item.key}
                    className='btn'
                    onClick={item.fun}
                />
            ))}
        </div>
    );
    return (
        <>
            <DragImg
               fileUrl={fileUrl}
               angle={angle}
               changeAngle={changeAngle}
               reviewBoxWidth={reviewBoxWidth}
               reviewBoxHeight={reviewBoxHeight}
               onRef={childRef}
               styleName='drag-box'
               leftWidth={leftWidth}
               topHeight={topHeight}
               display={display}
            />
            {visible && (
                <>
                    <DragImg
                        key='full'
                        fileUrl={fileUrl}
                        angle={angle}
                        changeAngle={changeAngle}
                        reviewBoxWidth={clientWidth}
                        reviewBoxHeight={clientHeight}
                        onRef={fullRef}
                        styleName='full-box'
                        otherRender={otherRender}
                        leftWidth={0}
                        topHeight={0}
                        display='height'
                    />
                </>
            )}
        </>
    );
}

ImgView.propTypes = {
    fileUrl: PropTypes.string, // 文件地址
    angle: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // 旋转后的回调
    changeAngle: PropTypes.func, // 向左向右切换的回调
    changeIndex: PropTypes.func, // 文件类型
    showChangePageBtn: PropTypes.bool,
    reviewBoxWidth: PropTypes.number,
    reviewBoxHeight: PropTypes.number,
    onRef: PropTypes.any,
    leftWidth: PropTypes.number, // 画布距离屏幕左侧的距离
    topHeight: PropTypes.number, // 画布距离屏幕上侧的距离
    display: PropTypes.string
};
