import React, { useState, useImperativeHandle, forwardRef } from 'react';
import ViewFile from './ViewFile';
import PropTypes from 'prop-types';
import ShowImg from './showImg/ShowImg.old';
import left from './img/left.png';
import right from './img/right.png';
import enlarge from './img/enlarge.png';
import narrow from './img/narrow.png';
import reset from './img/reset.png';
import forward from './img/forward.png';
import backward from './img/backward.png';
import './index.css';

const getFileId = (curImgSrc) => {
    if (!curImgSrc || curImgSrc.indexOf('?') === -1) {
        return '';
    }
    const params = curImgSrc.split('?')[1];
    return params ? params.split('=')[1] : '';
};

const CutImage = forwardRef((props, ref) => {
    const { info, handleBackward, handleForward, getNewTreeData, treeData } = props;
    const { angle = 0, src, localUrl, id, ffileType, rotateAngle = 0 } = info || {};
    console.log('info----------------', info);
    // const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; treeHeight, otherWidth = 0
    // const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const [visible, setVisible] = useState(false);
    // const [boxSize, setBoxSize] = useState({
    //     boxWidth: clientWidth - otherWidth - 440,
    //     boxHeight: treeHeight || clientHeight
    // });
    // console.log(boxSize);
    // const handleResize = useCallback(() => {
    //     setBoxSize({
    //         boxWidth: document.documentElement.clientWidth - otherWidth - 440,
    //         boxHeight: treeHeight || document.documentElement.clientHeight
    //     });
    // }, [treeHeight]);

    // useEffect(() => {
    //     setBoxSize({
    //         boxWidth: clientWidth - otherWidth - 440,
    //         boxHeight: treeHeight || clientHeight
    //     });
    // }, [treeHeight, otherWidth]);

    // useEffect(() => {
    //     window.addEventListener('resize', handleResize);

    //     return () => window.removeEventListener('resize', handleResize);
    // }, []);

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
        return ffileType && ffileType != 2 ? (
            <ViewFile
                fileUrl={src || localUrl}
                fileId={getFileId(src || localUrl)}
                fileType={(ffileType == 1) ? 'pdf' : ''}
                fileName=''
                openSlide={false}
                accessToken={props.accessToken}
                onReviewFileUrl={props.onReviewFileUrl}
            />
        ) : (
            <ShowImg
                isShowBtns={true}
                isTurn={true}
                isCover={false}
                coverInfo={null}
                src={src || localUrl}
                curImgFileType={ffileType}
                mode='scan'
                isTurning={false}
                isTurnSubCover={false}
                isTurningOther={false}
                isTurnInvoice={false}
                // turn2cover={this.turn2Cover}
                // turn2SubCover={this.turn2SubCover}
                // turn2image={(type) => this.turn2Image(this.identifyItems, type)}
                // turnFileType={(type) => this.turnFileType(this.identifyItems, type)}
                // onIndexChange={this.onImgIndexChange}
                // onRotate={this.onRotate}
                rotateAngle={rotateAngle}
                isDownload={false}
                scanRefer='showImage'
                imgScanMode=''
                PAGE_PRE_PATH={props.PAGE_PRE_PATH}
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
    // treeHeight: PropTypes.number,
    // otherWidth: PropTypes.number,
    accessToken: PropTypes.string,
    onReviewFileUrl: PropTypes.func,
    PAGE_PRE_PATH: PropTypes.string
};