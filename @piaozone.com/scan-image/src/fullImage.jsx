import React from 'react';
import PropTypes from 'prop-types';
import ScanImage from './index';
import closeIcon from './img/close.png';
import './showImage.less';

export default function FullImage(props) {
    const { imgSrc, displayFlag, largerRatio, areaInfo, onFullScreen, rotateDeg, changeIndex } = props;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    return (
        <div className='full-box'>
            <img className='close' src={closeIcon} onClick={() => onFullScreen(false)} />
            <ScanImage
                id='full'
                width={clientWidth}
                height={clientHeight}
                rotateDeg={rotateDeg}
                largerRatio={largerRatio}
                areaInfo={areaInfo}
                displayFlag={displayFlag}
                visible={true}
                renderInBody={false}
                imgSrc={imgSrc}
                disabledBtns={true}
                disabledMouseWheel={false}
                disabledAutoZoom={false}
                emptyFillStyle=''
                showNewBtns={true}
                showFullBtn={false}
                isShowMidBtn={false}
                showChangePageBtn={false}
                changeIndex={changeIndex}
            />
        </div>
    );
}

FullImage.propTypes = {
    imgSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // 图像的地址
    largerRatio: PropTypes.number,
    displayFlag: PropTypes.string,
    areaInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // 图像显示的必要参数[{ pixel: '', region: '', markColor: '#D7DAE1' }]
    rotateDeg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onFullScreen: PropTypes.func,
    changeIndex: PropTypes.func
};