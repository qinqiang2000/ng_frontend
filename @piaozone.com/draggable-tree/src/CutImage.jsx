import React, { useState, useImperativeHandle, useEffect, useCallback, forwardRef, useRef } from 'react';
import { message } from 'antd';
import PropTypes from 'prop-types';
import ScanImage from '@piaozone.com/scan-image';
import left from './img/left.png';
import right from './img/right.png';
import enlarge from './img/enlarge.png';
import narrow from './img/narrow.png';
import reset from './img/reset.png';
import forward from './img/forward.png';
import backward from './img/backward.png';
import './index.css';

const CutImage = forwardRef((props, ref) => {
    const { info, handleBackward, handleForward, getNewTreeData, treeData, treeHeight, otherWidth = 0 } = props;
    const { angle = 0, imgUrl, displayFlag = '', id, docUrl } = info || {};
    const openWpsUrl = useRef(null);
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    useEffect(() => {
        const element = openWpsUrl.current;
        if (!element) return;
        console.log('----props.wpsView--前端--', props.wpsView, props.WebOfficeSDK);
        if (props.wpsView && props.wpsView == '1') {
            if (!info.wpsUrl || !info.wpsToken) {
                message.error('预览地址为空或token为空！');
            } else {
                const jssdk = props.WebOfficeSDK.config({
                    url: info.wpsUrl,
                    mount: document.querySelector('.office-url'),
                    refreshToken: info.wpsToken
                });
                jssdk.setToken({
                    token: info.wpsToken,
                    timeout: 10 * 60 * 1000
                });
                jssdk.on('fileOpen', (data) => {
                    // $(".web-office-iframe").css("height", "400px");
                    console.log('打开文档成功: ', data);
                });
            }
        }
    }, [info]);

    const [visible, setVisible] = useState(false);
    const [boxSize, setBoxSize] = useState({
        boxWidth: clientWidth - otherWidth - 440,
        boxHeight: treeHeight || clientHeight
    });

    const handleResize = useCallback(() => {
        setBoxSize({
            boxWidth: document.documentElement.clientWidth - otherWidth - 440,
            boxHeight: treeHeight || document.documentElement.clientHeight
        });
    }, [treeHeight]);

    useEffect(() => {
        setBoxSize({
            boxWidth: clientWidth - otherWidth - 440,
            boxHeight: treeHeight || clientHeight
        });
    }, [treeHeight, otherWidth]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const child = React.createRef();

    useImperativeHandle(ref, () => {
        return {
            zoom,
            rotate,
            fullScreen,
            reset: resetImg
        };
    });

    const handleTree = (arr, _deg) => {
        return arr.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    angle: _deg
                };
            }
            if (item.children && Array.isArray(item.children)) {
                return {
                    ...item,
                    children: handleTree(item.children, _deg)
                };
            }
            return item;
        });
    };

    // 混贴旋转
    const rotate = (dir) => {
        let _deg = angle;
        if (dir === 'left') {
            _deg += 90;
        } else {
            _deg -= 90;
        }
        _deg = _deg % 360;
        getNewTreeData && getNewTreeData(handleTree(treeData, _deg), 'changeAngle');
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

    const renderDom = (type) => {
        return displayFlag === 'showOther' ? (
            props.wpsView ? (
                <div className='office-url' ref={openWpsUrl} style={{ height: treeHeight }} />
            ) : (
                <iframe
                    // frameBorder='no'
                    border='0'
                    // marginWidth='0'
                    // marginHeight='0'
                    allowTransparency='yes'
                    width={boxSize.boxWidth - 200}
                    height={boxSize.boxHeight - 5}
                    src={docUrl}
                />
            )
        ) : (
            <ScanImage
                id={0}
                width={type ? clientWidth : boxSize.boxWidth - 200} // 左右两侧信息栏，中间内容padding
                height={type ? clientHeight : boxSize.boxHeight} // 其他内容高度，单据编号高度，中间内容padding
                rotateDeg={angle}
                largerRatio={1}
                areaInfo={[0, 829, 1516, 1957]}
                displayFlag='markImage'
                visible={true}
                renderInBody={false}
                imgSrc={imgUrl}
                disabledBtns={true}
                disabledMouseWheel={false}
                disabledAutoZoom={false}
                emptyFillStyle={type ? '' : 'rgba(0, 0, 0, 0.5)'}
                ref={child}
            />
        );
    };

    const btns = [
        {
            icon: forward,
            key: 'forward',
            fun: () => handleForward()
        },
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
        {
            icon: backward,
            key: 'backward',
            fun: () => handleBackward()
        }
    ];

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {renderDom()}
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
});

export default CutImage;

CutImage.propTypes = {
    info: PropTypes.object,
    handleBackward: PropTypes.func,
    handleForward: PropTypes.func,
    getNewTreeData: PropTypes.func,
    treeData: PropTypes.array,
    treeHeight: PropTypes.number,
    otherWidth: PropTypes.number,
    wpsView: PropTypes.string,
    WebOfficeSDK: PropTypes.object
};