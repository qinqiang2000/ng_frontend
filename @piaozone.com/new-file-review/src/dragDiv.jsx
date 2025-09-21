import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './index.less';

const initStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    top: 0,
    left: 0,
    cursor: 'grab'
};

export default function DragDiv(props) {
    const [styles, setStyles] = useState(initStyle);
    const [dragging, setDragging] = useState(false);
    const [positionInfo, setPositionInfo] = useState({
        startTop: 0,
        startLeft: 0,
        dragPosY: 0,
        dragPosX: 0
    });
    const { children, src, onWheel } = props;

    useEffect(() => {
        // 切换时，恢复默认样式
        setStyles(initStyle);
    }, [src]);

    const trimPX = (_px) => {
        if(_px == null || _px === '')
          return 0;
        if (typeof _px === 'number') {
          return _px;
        }
        return parseInt(_px.substr(0, _px.lastIndexOf('px')), 10);
    };

    const onMouseDown = (event) => { // start moving image
        const currentTarget = event.currentTarget;
        const startTop = trimPX(currentTarget.style.top);
        const startLeft = trimPX(currentTarget.style.left);
        const dragPosX = trimPX(event.pageX);
        const dragPosY = trimPX(event.pageY);
        setPositionInfo(info => ({
            ...info,
            startTop,
            startLeft,
            dragPosX,
            dragPosY
        }));
        setDragging(true);
        event.preventDefault(); // disable default behavior of browser
    };
    
    const onMouseMove = (event) => { // moving image
        if (dragging){
            const lx = positionInfo.startLeft + (event.pageX - positionInfo.dragPosX);
            const tx = positionInfo.startTop + (event.pageY - positionInfo.dragPosY);
            setStyles(style => ({
                ...style,
                left: lx,
                top: tx
            }));
        }
        event.preventDefault();
    };
    
    const onMouseUp = (event) => {// stop moving image
        setDragging(false);
        event.preventDefault();
    };

    return (
        <div
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseOver={onMouseUp}
            onMouseMove={onMouseMove}
            onWheel={onWheel}
            style={{ ...styles }}
        >
            {children}
        </div>
    )
};

DragDiv.propTypes = {
    children: PropTypes.any,
    src: PropTypes.string
};