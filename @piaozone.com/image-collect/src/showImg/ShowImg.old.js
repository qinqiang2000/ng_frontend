/*eslint-disable*/
import React, { Suspense } from 'react';
import { Icon, message, Button, Spin, Slider } from 'antd';
import { connect } from 'dva';
import DragDiv from './DragDiv';
import Loader from './Loader';
import { withTranslation } from 'react-i18next';
import noImg from '../img/fileIcons/no-img.png';
import RenderInBody from './renderInBody';
import ScanImage from '@piaozone.com/scan-image';
import { getBrowser, urlSearch } from '../utils';
import './showImg.css';

class ShowImg extends React.Component {
    constructor(props) {
        super(props);
        this.imgOldWidth = 0;
        this.imgRef = React.createRef();
        this.boxRef = React.createRef();
        this.oldWidth = '100%';
        this.oldHeight = 300; // 默认图片高度

        this.state = {
            src: props.src || '',
            isFullView: false,
            dragLeft: 0,
            dragTop: 0,
            deg: props.rotateAngle,
            scaleWidth: 150,
            transformStyle: {
                // 放大显示时，按照之前的缩放旋转操作全屏显示内容
                deg: props.rotateAngle || 0,
                curWidth: 350,
                maxWidth: 'auto'
            },
            t: this.props.t,
            isErr: false,
            isLoading: true,
            outterHeight: '100%',
            outterWidth: '100%',
            sliderWidth: 0,
            canvasRenderWidth: '100%',
            canvasRenderHeight: 1600, // 外层高度
            tempWidth:0,
            tempHeight:0
        };
    }

    componentDidMount() {
        // 窗口大小改变之后,重新计算图像高度
        const [tempWidth, tempHeight] = this.setInitalImageSize(this.props.imgViewMode);
       // console.log('图片宽高',tempWidth,tempHeight,this.props.imgViewMode)
        window.addEventListener('resize', this.updateImgHeight);
        const boxDom = this.boxRef.current;
        this.oldWidth = boxDom.offsetWidth - 20;
        this.oldHeight = boxDom.offsetHeight - 50;
        this.setState({
            tempWidth:tempWidth,
            tempHeight:tempHeight,
            outterWidth: tempWidth,
            outterHeight: tempHeight,
            canvasRenderWidth: this.oldWidth,
            canvasRenderHeight: this.oldHeight
        });
    }

    updateImgHeight = () => {
        const boxDom = this.boxRef.current; // 容器高度
        // const [tempWidth, tempHeight] = this.setInitalImageSize(this.props.imgViewMode);
        this.oldWidth = boxDom.offsetWidth - 20;
        this.oldHeight = boxDom.offsetHeight - 50;
        this.setState({
            outterHeight: this.oldHeight - 30,
            outterWidth: boxDom.offsetWidth - 20,
            canvasRenderWidth: this.oldWidth,
            canvasRenderHeight: this.oldHeight
        });
    };

    setInitalImageSize = (imgViewMode) => {
        const boxDom = this.boxRef.current;
        let tempWidth = 0;
        let tempHeight = 0;

        this.oldWidth = boxDom.offsetWidth - 20;
        this.oldHeight = boxDom.offsetHeight - 25;

        if(boxDom){
            if(imgViewMode == 2){
                boxDom.style.overflow = 'scroll';
                tempWidth = '100%';
                tempHeight = 'auto';
            } else {
                boxDom.style.overflow = 'hidden';
                tempWidth = 'auto';
                tempHeight = boxDom.offsetHeight - 50;
            }
        }
        return [tempWidth, tempHeight, this.oldWidth, this.oldHeight];

    }

    // 获取props的派生状态
    // static getDerivedStateFromProps(props, state) {
    //     console.log('props', props, state);
    //     return {
    //         src: props.src,
    //         isErr: false,
    //         transformStyle: {
    //             deg: props.rotateAngle || 0
    //         },
    //         outterHeight: props.height
    //     };
    // }

    UNSAFE_componentWillReceiveProps(props, prevProps) {
        const [tempWidth, tempHeight, canvasRenderWidth, canvasRenderHeight] = this.setInitalImageSize(props.imgViewMode);
        this.setState(
            {
                src: props.src,
                isErr: false,
                isLoading: props.isLoading,
                transformStyle: {
                    deg: props.rotateAngle || 0
                },
                canvasRenderWidth,
                canvasRenderHeight,
                outterHeight: tempHeight,
                outterWidth: tempWidth,
                deg: props.rotateAngle,
                isResize: props.isResize
            },
            () => {

                // 还原图片尺寸
                const imgDom = this.imgRef.current;
                const boxDom = this.boxRef.current;
                boxDom.scrollTop = 0; // 重置滚动条高度

                if(imgDom){
                    // 宽度自适应
                    if(props.imgViewMode == 2){
                        imgDom.style.width = '100%';
                        imgDom.style.height = 'auto';
                    } else {
                        imgDom.style.width = 'auto';
                        imgDom.style.height = '100%';
                    }
                }
            }
        );
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateImgHeight);
    }

    onIndexChange = (type) => {
        typeof this.props.onIndexChange === 'function' && this.props.onIndexChange(type);
    };

    rotate = (dir, s) => {
        // 基于上次的角度进行旋转
        console.log('旋转',dir, typeof this.props.onRotate)
        const { rotateAngle } = this.props;
        let newDeg = rotateAngle;
        const _img = this.imgRef.current;
        if (dir === 's') { // 顺时针
            newDeg = newDeg - 0 + 90;
        } else { // 逆时针
            newDeg -= 90;
        }
        _img.style.transform = 'rotate(' + (-newDeg) + 'deg)';
        newDeg = newDeg % 360; // 取余
        this.setState({ deg: newDeg, transformStyle: { deg: _img.style.transform, curWidth: _img.style.width } });

        typeof this.props.onRotate === 'function' && this.props.onRotate(newDeg);
    };
    //订阅的canvas图片的旋转
    onRotateDeg = async (deg)=>{
        console.log('onRotateDeg',deg)
        await typeof this.props.onRotate === 'function' && this.props.onRotate(deg);

    }

    wheelZoom = (e) => {
        const { imgViewMode } = this.props;
        let { scaleWidth, sliderWidth } = this.state;
        const _img = this.imgRef.current;
        let curWidth = parseFloat(getComputedStyle(_img, null)['width']);
        e = e || window.event;
        if(imgViewMode == 2){
            return;
        }
        if (parseInt(e.deltaY) < 0) {
            // up
            curWidth += scaleWidth;
            _img.style.width = Math.min(2000, curWidth) + 'px';
        } else {
            // down
            curWidth -= scaleWidth;
            _img.style.width = Math.max(500, curWidth) + 'px';
        }
        sliderWidth = ((curWidth - this.imgOldWidth) / (2000 - this.imgOldWidth)) * 100;
        this.setState({ outterHeight: 'auto', sliderWidth });
    };

    getStyle(ele, attr) {
        return ele.currentStyle ? ele.currentStyle[attr] : window.getComputedStyle(ele, null)[attr];
    }

    turn2cover = () => {
        typeof this.props.turn2cover === 'function' && this.props.turn2cover();
    };

    turn2image = (type) => {
        typeof this.props.turn2image === 'function' && this.props.turn2image(type);
    };

    turn2SubCover = (isCover) => {
        typeof this.props.turn2SubCover === 'function' && this.props.turn2SubCover(isCover);
    }

    onError = () => {
        // 通知父组件,图片加载失败
        typeof this.props.onError === 'function' && this.props.onError();
        this.setState({ src: noImg, isErr: true, isLoading: false });
    };

    onLoad = () => {
        // 加载成功后,进行自适应处理
        if (this.props.src) {
            const _img = this.imgRef.current;
            const initWidth = _img.offsetWidth;
            const initHeight = _img.offsetHeight;
            if (initWidth > initHeight) {
                _img.style.maxWidth = '100%';
            } else {
                _img.style.maxHeight = '100%';
            }
            this.imgOldWidth = initWidth;
            _img.style.transform = `rotate(${-Number(this.props.rotateAngle)}deg)`;
        }
        this.setState({ isErr: false, isLoading: false });
        typeof this.props.onLoad === 'function' && this.props.onLoad();
    };

    resetImg = () => {
        const _img = this.imgRef.current;
        _img.style.height = '100%';
        _img.style.width = 'auto';
        this.setState({
            transformStyle: {
                ...this.state.transformStyle,
                deg: 0
            },
            outterHeight: this.oldHeight,
            sliderWidth: 0
        });
    };

    onSliderChange = (value) => {
        const _img = this.imgRef.current;
        _img.style.width = this.imgOldWidth + (value * (2000 - this.imgOldWidth)) / 100 + 'px';
        this.setState({ outterHeight: 'auto', sliderWidth: value });
    };

    fullScreen = () => {
        // this.resetImg();
        this.setState({ renderInBody: true });
    };

    offFullScreen = () => {
        this.setState({ renderInBody: false });
        // this.resetImg();
    };

    // 查看源文件
    showOriginalFile = () => {
        const { originFile, isOriginPdf, curItem } = this.props;
        const { ffileName } = curItem;
        let isOfd = '0';
        if (ffileName) {
            const ext = ffileName.split('.')[1];
            isOfd = ext && ext.toLowerCase(ext) === 'ofd' ? '1' : '0';
        }
        const pageUrl = originFile.split('?')[0];
        const params = originFile.split('?')[1];
        const { fileId, userKey } = urlSearch(params);
        const brower = getBrowser();
        if (originFile) {
            const url = `${this.props.PAGE_PRE_PATH}/public/imgview?fileUrl=${pageUrl}&fileId=${fileId}&userKey=${userKey}&isPdf=${
                isOriginPdf ? 1 : 0
            }&isOfd=${isOfd}`;
            if (brower == 'IE') {
                window.open(url);
            } else {
                let aDom = document.createElement('a');
                aDom.href = url;
                aDom.target = '_blank';
                aDom.click();
            }
        } else {
            message.warning('原文件不存在');
        }
    };

    downloadFile = () => {
        const { originFile, isOriginPdf } = this.props;
        const pageUrl = originFile.split('?')[0];
        const params = originFile.split('?')[1];
        const { fileId } = urlSearch(params);
        const brower = getBrowser();
        if (originFile) {
            const url = `${pageUrl}?fileId=${fileId}`;
            if (brower == 'IE') {
                window.open(url);
            } else {
                let aDom = document.createElement('a');
                aDom.href = url;
                aDom.target = '_blank';
                aDom.click();
            }
        } else {
            message.warning('原文件不存在');
        }
    }
    getImageSize = () => {
        const isHiddenInfo = this.props.isHiddenInfo;
        const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        let width = isHiddenInfo ? w - 180 - 75 : w - 180 - 390 - 75;
        let height = h - 64 - 20 - 40 - 15 - 70;
        if (width < 750) {
            width = 750;
        }

        if (height < 470) {
            height = 470;
        }
        return {
            width,
            height
        };
    }

    render() {
        const {
            isFullView,
            dragLeft,
            dragTop,
            transformStyle,
            isLoading,
            outterHeight,
            sliderWidth,
            renderInBody,
            outterWidth,
            canvasRenderWidth,
            // canvasRenderHeight
        } = this.state;
        const {
            t,
            isCover,
            isTurn,
            src,
            curImgFileType = '',
            total,
            curPageIndex,
            mode,
            showImageInfo,
            scanRefer,
            isShowBtns = true,
            isDownload,
            isTurning = false,
            isTurnSubCover = false,
            isTurningOther = false,
            isTurnInvoice = false,
            imgViewMode,
            imgBoxWidth,
            imgBoxHeight,
            imgScanMode,
            coverInfo
        } = this.props;
        //console.log('props',this.props)
        const imgSize = this.getImageSize();
        // 兼容其他发票没有region，pixel等位置信息;
        // 兼容拓维人工审核页面查看。
        let fixedShowImageInfo = [];
        let radix = 1;
        let canvasRenderHeight = imgBoxHeight>this.state.canvasRenderHeight?imgBoxHeight:this.state.canvasRenderHeight;
        // 是否显示混贴
        let isCanvasRender = false;
        if(scanRefer == 'markImage' && !isCover){
            isCanvasRender = true;
        }

        if(showImageInfo && Array.isArray(showImageInfo)){
            fixedShowImageInfo = showImageInfo.map(itm => {
                if(!itm.region && !isCover){
                    return { ...itm, region: '', pixel: ''}
                }
                return itm;
            });

            if(showImageInfo.length && isCanvasRender){
                let pixel = showImageInfo[0].pixel || "2494,3535";
                let [orignalWidth, orignalHeight] = pixel.split(',');
                if(imgBoxWidth>canvasRenderWidth){
                    radix = parseFloat(imgBoxWidth/orignalWidth);
                }else{
                    radix = parseFloat(canvasRenderWidth/orignalWidth);
                }
                if(imgViewMode == 2){
                    canvasRenderHeight = parseInt(orignalHeight * radix);
                }
            }
        };

        let isDisabledWheel = false;
        if(imgViewMode == 2){
            isDisabledWheel = true;
        }
        // console.log('isCanvasRender',isCanvasRender,imgBoxWidth,canvasRenderHeight,imgBoxHeight,fixedShowImageInfo)
        // console.log('outerWidth',outterWidth,outterHeight)

        const cacheConfig = localStorage.getItem('config');
        let isSyncCheck = false;
        let fisCoverSplit = false;
        if(cacheConfig){
            isSyncCheck = JSON.parse(cacheConfig)?.isSyncCheck ?? false;
            fisCoverSplit = JSON.parse(cacheConfig)?.fisCoverSplit === 0 ? true : false; // 1-不支持多封面   0-支持多封面
        }
        // console.log('imgScanMode---isSyncCheck--fisCoverSplit------', imgScanMode, isSyncCheck, fisCoverSplit);
        const curNoCoverFile = isCover && coverInfo && coverInfo.fnoCover; //当前为无封面文件的单据编号时，不显示任何按钮
        const contentDiv = (
            <div className={`imgContainer ${mode == 'scan' ? 'fixed' : ''}`}>
                <div className='imgBox' ref={this.boxRef} >
                    <div className='prev' onClick={() => this.onIndexChange('prev')}></div>
                    <div className='next' onClick={() => this.onIndexChange('next')}></div>
                    <div className='transform' style={{ display: curNoCoverFile ? 'none' : 'block' }}>
                        {isTurn && !isSyncCheck &&
                            (
                                isCover && imgScanMode == 'append' ? <></> : isCover ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Button type='primary' loading={isTurning} size='small' onClick={() => this.turn2image(2)}>
                                        {t('common.tranformimage')}
                                    </Button>
                                    {fisCoverSplit && <Button type='primary' loading={isTurnSubCover} size='small' onClick={() => this.turn2SubCover(isCover)} style={{ marginTop: 10 }}>
                                        转子封面
                                    </Button>}
                                </div>
                            ) : curImgFileType !== 0 ? (
                                imgScanMode !== 'append' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Button type='primary' loading={isTurning} size='small' onClick={this.turn2cover}>
                                            {t('common.tranformcover')}
                                        </Button>
                                        {fisCoverSplit && curImgFileType !== 0 && <Button type='primary' loading={isTurnSubCover} size='small' onClick={() => this.turn2SubCover(isCover)} style={{ marginTop: 10 }}>
                                            转子封面
                                        </Button>}
                                    </div>
                                ) : null
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>

                                    {imgScanMode !== 'append' && <Button type='primary' loading={isTurning} size='small' onClick={this.turn2cover}>
                                        {t('common.tranformcover')}
                                    </Button>}
                                    {imgScanMode !== 'append' && <Button type='primary' size='small' loading={isTurningOther} onClick={() => this.props.turnFileType(2)} style={{ marginTop: 10 }}>
                                        {t('common.tranformimage')}
                                    </Button>}
                                </div>
                            ))}
                        {
                            !isCover && isSyncCheck && curImgFileType === 1 ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {imgScanMode !== 'append' && <Button type='primary' loading={isTurning} size='small' onClick={this.turn2cover}>
                                        {t('common.tranformcover')}
                                    </Button>}
                                    {imgScanMode !== 'append' && fisCoverSplit && <Button type='primary' loading={isTurnSubCover} size='small' onClick={() => this.turn2SubCover(isCover)} style={{ marginTop: 10 }}>
                                        转子封面
                                    </Button>}
                                    <Button type='primary' loading={isTurningOther} size='small' onClick={() => this.props.turnFileType(2)} style={{ marginTop: 10 }}>
                                        转附件
                                    </Button>
                                </div>
                            ) : null
                        }
                        {
                            !isCover && isSyncCheck && curImgFileType === 2 ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {imgScanMode !== 'append' && <Button type='primary' loading={isTurning} size='small' onClick={this.turn2cover}>
                                        {t('common.tranformcover')}
                                    </Button>}
                                    {imgScanMode !== 'append' && fisCoverSplit && <Button type='primary' loading={isTurnSubCover} size='small' onClick={() => this.turn2SubCover(isCover)} style={{ marginTop: 10 }}>
                                        转子封面
                                    </Button>}
                                    <Button type='primary' loading={isTurnInvoice} size='small' onClick={() => this.props.turnFileType(1)} style={{ marginTop: 10 }}>
                                        转发票
                                    </Button>
                                </div>
                            ) : null
                        }
                        {
                            !isCover && isSyncCheck && curImgFileType === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {imgScanMode !== 'append' && <Button type='primary' loading={isTurning} size='small' onClick={this.turn2cover}>
                                        {t('common.tranformcover')}
                                    </Button>}
                                    <Button type='primary' loading={isTurnInvoice} size='small' onClick={() => this.props.turnFileType(1)} style={{ marginTop: 10 }}>
                                        转发票
                                    </Button>
                                    <Button type='primary' loading={isTurningOther} size='small' onClick={() => this.props.turnFileType(2)} style={{ marginTop: 10 }}>
                                        转附件
                                    </Button>
                                </div>
                            ) : null
                        }
                        {
                            isCover && isSyncCheck && imgScanMode != 'append' ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {fisCoverSplit && <Button type='primary' loading={isTurnSubCover} size='small' onClick={() => this.turn2SubCover(isCover)} style={{ marginBottom: 10 }}>
                                        转子封面
                                    </Button>}
                                    <Button type='primary' loading={isTurnInvoice} size='small' onClick={() => this.turn2image(1)}>
                                        转发票
                                    </Button>
                                    <Button type='primary' loading={isTurningOther} size='small' onClick={() => this.turn2image(2)} style={{ marginTop: 10 }}>
                                        转附件
                                    </Button>
                                </div>
                            ) : null
                        }
                    </div>

                    {isDownload ? (
                        <div className='origin' onClick={this.showOriginalFile}>
                            <span>{t('imgapprove.originFile')}</span>
                        </div>
                    ) : null}

                    { isCanvasRender ? (
                        // markImage,影像调阅,图像框选
                        <ScanImage
                            // width={imgBoxWidth>canvasRenderWidth?imgBoxWidth:canvasRenderWidth}
                            // height={canvasRenderHeight}
                            width={imgSize.width}
                            height={imgSize.height}
                            //rotateDeg={fixedShowImageInfo.length ? fixedShowImageInfo[0].rotationAngle : '0'}
                            rotateDeg={this.props.rotateAngle || '0'}
                            onRotateDeg={(deg)=>this.onRotateDeg(deg)}
                            areaInfo={fixedShowImageInfo}
                            displayFlag='markImage'
                            visible={true}
                            renderInBody={false}
                            imgSrc={src}
                            disabledBtns={false}
                            index={curPageIndex - 1}
                            total={total}
                            emptyFillStyle='#fff'
                            disabledMouseWheel={isDisabledWheel}
                            style={{margin:'0 auto',width:'100%',height:'100%'}}
                        />
                    ) : (
                         <DragDiv
                            className='outImg'
                            style={{
                                position: 'relative',
                                left: dragLeft,
                                top: dragTop,
                                textAlign: 'center',
                                width: outterWidth,
                                height: outterHeight,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {
                                src ? (
                                    <img
                                        ref={this.imgRef}
                                        className='img'
                                        src={src}
                                        alt={t('common.image')}
                                        title={t('showimg.t1')}
                                        onLoad={this.onLoad}
                                        onError={this.onError}
                                        onWheel={(e) => this.wheelZoom(e)}
                                        onDoubleClick={() => {
                                            this.setState({ isFullView: true });
                                        }}
                                        style={{background:'#fff', transform: `rotate(${-this.props.rotateAngle}deg)` }}
                                    />
                                ) : (
                                    <span style={{ color: '#fff' }}>{isCover ? '无封面文件' : '没有可预览的图片'}</span>
                                )
                            }
                        </DragDiv>
                    )}
                </div>
                {isShowBtns ? (
                    <div className='bottom'>
                        <ul className='ul'>
                            {curPageIndex ? (
                                <li className='li'>
                                    {t('common.pageIndex', { page: `${curPageIndex}/${total}` })}
                                </li>
                            ) : null}

                            <li className='li' onClick={() => this.rotate('s', 90)}>
                                <Icon
                                    type='undo'
                                    rotate={30}
                                    style={{
                                        fontSize: 16,
                                        color: '#3598ff',
                                        cursor: 'pointer',
                                        display: 'inline-block'
                                    }}
                                />
                            </li>
                            <li className='li slider'>
                                <Slider value={sliderWidth} onChange={this.onSliderChange} />
                            </li>
                            <li className='li' onClick={() => this.rotate('n', -90)}>
                                <Icon
                                    type='redo'
                                    style={{
                                        fontSize: 16,
                                        color: '#3598ff',
                                        cursor: 'pointer',
                                        display: 'inline-block'
                                    }}
                                />
                            </li>
                            <li className='li' onClick={this.resetImg}>
                                {t('common.back2init')}
                            </li>
                            {!renderInBody ? (
                                <li className='li' onClick={this.fullScreen}>
                                    {t('common.fullscreen')}
                                </li>
                            ) : (
                                <li className='li' onClick={this.offFullScreen}>
                                    {t('common.offscreen')}
                                </li>
                            )}
                        </ul>
                    </div>
                ) : null}

                {isLoading && scanRefer != 'markImage' ? (
                    <div style={{ position: 'absolute', left: 300, top: 200 }}>
                        <Spin size='large' />
                    </div>
                ) : null}
                {isFullView ? (
                    <div
                        className='fullView'
                        onClick={() => {
                            this.setState({ isFullView: false });
                        }}
                    >
                        <img
                            src={src}
                            style={{
                                transform: `rotate(${transformStyle.deg}deg)`,
                                width: transformStyle.curWidth + 'px',
                                maxWidth: transformStyle.maxWidth,
                                maxHeight: '100%'
                            }}
                            alt={t('common.image')}
                            title={t('showimg.t2')}
                        />
                    </div>
                ) : null}
            </div>
        );

        const rootStyle = {
            background: '#D7DAE1',
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 9999,
            overflow: 'hidden',
            width: '100%',
            height: '100%'
        };

        if (renderInBody) {
            return <RenderInBody layerStyle={rootStyle}>{contentDiv}</RenderInBody>;
        } else {
            return contentDiv;
        }
    }
}

const AHome = withTranslation()(ShowImg);

class ExtendedComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Suspense fallback={<Loader />}>
                <AHome {...this.props} />
            </Suspense>
        );
    }
}

function mapStateToProps(state) {
    const { imgViewMode, imgBoxWidth, imgBoxHeight } = state.imgapprove;
    return {
        imgViewMode,
        imgBoxWidth,
        imgBoxHeight
    }
}

export default connect(mapStateToProps)(ExtendedComponent);
