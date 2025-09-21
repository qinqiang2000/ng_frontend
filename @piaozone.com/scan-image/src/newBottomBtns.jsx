import React from 'react';
import PropTypes from 'prop-types';
import left from './img/left.png';
import right from './img/right.png';
import enlarge from './img/enlarge.png';
import narrow from './img/narrow.png';
import reset from './img/reset.png';
import forward from './img/forward.png';
import backward from './img/backward.png';
import fullScreen from './img/fullScreen.png';
import origin from './img/origin.png';
import './showImage.less';

function NewBottomBtns(props) {
    const {
        largerRatio, onZoom, onReset, onRotate, changeIndex,
        showChangePageBtn, isShowMidBtn, showOriginFile, onFullScreen,
        showFullBtn = true
    } = props;

    const zoom = (type) => {
        let _scale = largerRatio;
        if (type === 'enlarge') {
            // _scale = _scale >= 2 ? 2 : _scale + 0.1;
            _scale = _scale + 0.1; // 暂时不限制放大
        } else {
            _scale = _scale <= 0.01 ? 0.01 : _scale - 0.1;
        }
        onZoom(_scale * 100);
    };

    const midBtns = [
        {
            icon: left,
            key: 'left',
            name: '向左旋转',
            fun: () => onRotate(90)
        },
        {
            icon: right,
            key: 'right',
            name: '向右旋转',
            fun: () => onRotate(-90)
        },
        {
            icon: enlarge,
            key: 'enlarge',
            name: '放大',
            fun: () => zoom('enlarge')
        },
        {
            icon: narrow,
            key: 'narrow',
            name: '缩小',
            fun: () => zoom('narrow')
        },
        ...showFullBtn ? [{
            icon: fullScreen,
            key: 'fullScreen',
            name: '全屏',
            fun: () => onFullScreen(true)
        }] : [],
        {
            icon: reset,
            key: 'reset',
            name: '还原',
            fun: () => onReset()
        }
    ];

    const btns = [
        ...showChangePageBtn ? [{
            icon: forward,
            key: 'forward',
            name: '上一份',
            fun: () => changeIndex('prev')
        }] : [],
        ...isShowMidBtn ? [] : midBtns,
        ...showOriginFile ? [{
            icon: origin,
            key: 'origin',
            name: '查看原文件',
            fun: () => showOriginFile()
        }] : [],
        ...showChangePageBtn ? [{
            icon: backward,
            key: 'backward',
            name: '下一份',
            fun: () => changeIndex('next')
        }] : []
    ];
    return (
        <div className='btn-box'>
            {
                btns.map(item => (
                    <img src={item.icon} key={item.key} className='btn' onClick={item.fun} title={item.name} />
                ))
            }
        </div>
    );
}

NewBottomBtns.propTypes = {
    onZoom: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onRotate: PropTypes.func.isRequired,
    largerRatio: PropTypes.number,
    showOriginFile: PropTypes.func,
    onFullScreen: PropTypes.func,
    showFullBtn: PropTypes.bool,
    showChangePageBtn: PropTypes.bool,
    isShowMidBtn: PropTypes.bool,
    changeIndex: PropTypes.func
};

export default NewBottomBtns;