import React from 'react';
import PropTypes from 'prop-types';
import ImgView from './imgView';
import DocView from './docView';
import CutImage from './cutImage';
import { clientCheck, getFileType } from './util';
import forward from './img/forward.png';
import left from './img/left.png';
import right from './img/right.png';
import enlarge from './img/enlarge.png';
import narrow from './img/narrow.png';
import fullScreen from './img/fullScreen.png';
import backward from './img/backward.png';
import origin from './img/origin.png';
import reset from './img/reset.png';
import errorImg from './img/errorImg.png';
import './index.less';

export default function FileReview(props) {
    const { fileUrl, extName, changeIndex, isCutImage, showOriginFile, showChangePageBtn } = props;
    const clientInfo = clientCheck();

    const isPdf = getFileType(extName) === 'pdf';

    /* eslint-disable */
    const isShowMidBtn = (getFileType(extName) !== 'image' && getFileType(extName) !== 'pdf') || (isPdf && !(clientInfo.browser.chrome > 80 || clientInfo.browser.firefox > 80)); // 是否展示中间按钮

    const childRef = React.createRef();

    const propsObj = {
        ...props,
        onRef: childRef
    };

    const renderDom = () => {
        /**
         * CutImage用的scan-image组件，用canvas绘制的图片，存在绘制附件类型图片不清晰问题，所以只有混贴和火狐浏览器使用。
         * ImgView对火狐浏览器有兼容性问题，拖动会被禁止，所以火狐用CutImage
         */
        if (isCutImage || (clientInfo.browser.firefox > 0 && getFileType(extName) === 'image')) {
            return <CutImage {...propsObj} />
        } else if (getFileType(extName) === 'image') {
            return <ImgView {...propsObj} />
        } else if (getFileType(extName) === 'unknown') {
            return (
                <div className='error-info'>
                    <img src={errorImg} width={450} height={168}/>
                    <span className='error-text'>该文件类型暂不支持预览，请下载原文件查看</span>
                    {/* <Button type='primary' onClick={() => showOriginFile ? showOriginFile(selectedInfo) : initShowOriginFile()}>查看原文件</Button> */}
                </div>
            )
        } else {
            return <DocView {...propsObj} />
        }
    }

    const midBtns = [
        {
            icon: left,
            key: 'left',
            fun: () => childRef.current?.rotate('left')
        },
        {
            icon: right,
            key: 'right',
            fun: () => childRef.current?.rotate('right')
        },
        {
            icon: enlarge,
            key: 'enlarge',
            fun: () => childRef.current?.zoom('enlarge')
        },
        {
            icon: narrow,
            key: 'narrow',
            fun: () => childRef.current?.zoom('narrow')
        },
        ...getFileType(extName) === 'image' || isCutImage ? [
            {
                icon: fullScreen,
                key: 'fullScreen',
                fun: () => childRef.current?.fullScreen()
            },
            {
                icon: reset,
                key: 'reset',
                fun: () => childRef.current?.reset()
            },
        ] : []
    ];

    const initShowOriginFile = () => {
        window.open(fileUrl);
    };

    const btns = [
        ...showChangePageBtn ? [{
            icon: forward,
            key: 'forward',
            fun: () => changeIndex('forward')
        }] : [],
        ...isShowMidBtn ? [] : midBtns,
        {
            icon: origin,
            key: 'origin',
            fun: () => showOriginFile ? showOriginFile() : initShowOriginFile()
        },
        ...showChangePageBtn ? [{
            icon: backward,
            key: 'backward',
            fun: () => changeIndex('backward')
        }] : []
    ];

    if (!fileUrl) {
        return <div className='default-page'>暂无数据</div>;
    }

    return (
        <div className='image-review error-file' id='review'>
            {renderDom()}
            {
                <div className={isPdf && (clientInfo.browser.chrome > 80 || clientInfo.browser.firefox > 80) ? 'btn-box btn-box-pdf' : 'btn-box'}>
                    {
                        btns.map(item => (
                            <img src={item.icon} key={item.key} className='btn' onClick={item.fun} />
                        ))
                    }
                </div>
            }
        </div>
    );
};

FileReview.propTypes = {
    fileUrl: PropTypes.string, // 文件地址
    extName: PropTypes.string, // 文件类型
    angle: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]), // 旋转角度
    changeAngle: PropTypes.func, // 旋转后的回调
    changeIndex: PropTypes.func, // 向左向右切换的回调
    isCutImage: PropTypes.bool, // 是否是混贴
    showOriginFile: PropTypes.func, // 查看源文件函数
    reviewBoxWidth: PropTypes.number, // 对于混贴组件固定宽高特殊处理
    reviewBoxHeight: PropTypes.number, // 对于混贴组件固定宽高特殊处理
    method: PropTypes.number, // office组件是否用微软，仅公有云能用
    showChangePageBtn: PropTypes.bool, // 是否展示切换文件的按钮
    officeUrl: PropTypes.string, // office文件预览服务地址
    leftWidth: PropTypes.number, // 画布距离屏幕左侧的距离
    topHeight: PropTypes.number, // 画布距离屏幕上侧的距离
    display: PropTypes.string, // width:以宽度自适应 height:以高度自适应
};

FileReview.defaultProps = {
    isCutImage: false,
    reviewBoxWidth: 0,
    reviewBoxHeight: 0,
    method: 0,
    showChangePageBtn: true,
    leftWidth: 0,
    topHeight: 0,
    display: 'height'
};