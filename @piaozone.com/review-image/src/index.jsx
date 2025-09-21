import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import SnapshotTree from './snapshotTree';
import ImageReview from './imageReview';
import TreeReview from './treeReview';
import DetailInfo from './detailInfo';
import './index.less';

function ReviewImage(props) {
    /* eslint-disable */
    const {
        modeKey,
        dataList,
        modeConfig=[],
        visible,
        changeVisible,
        otherHeight,
        setPageRotate,
        handleSelectedInfo,
        showOriginFile,
        btnsRender,
        defaultModeKey,
        display,
        from,
        isShowStatistics,
        method,
        // officeUrl,
        leftWidth,
        topHeight,
        showCutImage,
        imageViewOriginal,
        onReviewFileUrl,
        showLeftViewModel,
        isShowWaterMark
    } = props;
    const flatArr = (arr) => {
        return arr.reduce(function(pre, next) {
            if (Array.isArray(next)) {
                return pre.concat(flatArr(next));
            } else {
                return pre.concat(next);
            }
        }, []).filter(item => item);
    };

    const handleData = (arr) => {
        return arr.map((item, index) => {
            return modeConfig.map(i => {
                return arr[index][i.key];
            });
        });
    };

    const handleTree = (arr) => {
        return arr.reduce(function(pre, next) {
            if (Array.isArray(next.childNode)) {
                return next?.storageList?.length ? pre.concat(next.storageList).concat(handleTree(next.childNode)) : pre.concat(handleTree(next.childNode));
            } else {
                return pre.concat(next.storageList);
            }
        }, []);
    };

    const [selectedInfo, setSelectedInfo] = useState({});
    const [selectNo, setSelectNo] = useState(dataList[0].fscanBillNos);
    const [data, setData] = useState(dataList);
    const [platDataList, setPlatDataList] = useState(from === 'document' ? handleTree(dataList) : flatArr(handleData(dataList)));

    useEffect(() => {
        setPlatDataList(from === 'document' ? handleTree(data) : flatArr(handleData(dataList)));
    }, [data]);

    useEffect(() => {
        setSelectedInfo(platDataList[0] || {});
        handleSelectedInfo && handleSelectedInfo(platDataList[0] || {});
    }, []);

    const getSelectedInfo = useCallback((info) => {
        setSelectedInfo(info);
        handleSelectedInfo && handleSelectedInfo(info);
    }, []);

    const getSelectNo = useCallback((no) => {
        setSelectNo(no);
    }, []);

    const changeDataListAngle = useCallback((info) => {
        setData(info);
    }, []);

    const showOriginFileCallBack = () => {
        showOriginFile && showOriginFile(selectedInfo);
    };

    return (
        <div className='review-box' style={{ height: `calc(100vh - ${otherHeight}px)` }}>
            <div className='review-box-left'>
                <SnapshotTree
                    modeKey={modeKey}
                    dataList={data}
                    modeConfig={modeConfig}
                    selectedInfo={selectedInfo}
                    getSelectedInfo={getSelectedInfo}
                    otherHeight={otherHeight}
                    getSelectNo={getSelectNo}
                    selectNo={selectNo}
                    defaultModeKey={defaultModeKey}
                    from={from}
                    isShowStatistics={isShowStatistics}
                    platDataList={platDataList}
                    showLeftViewModel={showLeftViewModel}
                />
            </div>
            <div className='review-box-mid' style={{ width: `calc(100% - ${visible ? 544 : 264}px)` }}>
                {useMemo(() => (
                    from === 'document' ? (
                        <TreeReview
                            selectedInfo={selectedInfo}
                            platDataList={platDataList}
                            getSelectedInfo={getSelectedInfo}
                            dataList={data}
                            selectNo={selectNo}
                            setPageRotate={setPageRotate}
                            showOriginFileCallBack={showOriginFileCallBack}
                            btnsRender={btnsRender}
                            changeDataListAngle={changeDataListAngle}
                            otherHeight={otherHeight}
                            from={from}
                        />
                    ) : (
                        <ImageReview
                            selectedInfo={selectedInfo}
                            platDataList={platDataList}
                            getSelectedInfo={getSelectedInfo}
                            dataList={data}
                            selectNo={selectNo}
                            setPageRotate={setPageRotate}
                            showOriginFileCallBack={showOriginFileCallBack}
                            btnsRender={btnsRender}
                            changeDataListAngle={changeDataListAngle}
                            otherHeight={otherHeight}
                            modeConfig={modeConfig}
                            visible={visible}
                            from={from}
                            method={method}
                            // officeUrl={officeUrl}
                            leftWidth={leftWidth}
                            topHeight={topHeight}
                            display={display}
                            showCutImage={showCutImage}
                            imageViewOriginal={imageViewOriginal}
                            onReviewFileUrl={onReviewFileUrl}
                            isShowWaterMark={isShowWaterMark}
                        />
                    )
                ), [selectedInfo?.serialNo, selectedInfo?.rotationAngle, visible])}
            </div>
            <div className='review-box-icon' style={{ right: `${visible ? 262 : 0}px` }} onClick={() => changeVisible && changeVisible(!visible)}>
                <div className='box'>
                    <div className='box-triangle' />
                </div>
                {visible && (
                    <div className='box right'>
                        <div className='box-triangle' />
                    </div>
                )}
            </div>
            {visible && <div className='review-box-right'><DetailInfo selectedInfo={selectedInfo} getSelectedInfo={getSelectedInfo} /></div>}
        </div>
    );
};

ReviewImage.propTypes = {
    modeKey: PropTypes.array, // 需要展示的模式
    dataList: PropTypes.array.isRequired, // 预览数据
    modeConfig: PropTypes.array, // 树状结构配置项 name 副标题，key dataList中取值的key
    visible: PropTypes.bool, // 是否展示右侧信息栏
    changeVisible: PropTypes.func,
    otherHeight: PropTypes.number, // 预览界面的高度
    setPageRotate: PropTypes.func, // 保存旋转角度
    handleSelectedInfo: PropTypes.func, // 父组件获取selectedInfo
    showOriginFile: PropTypes.func, // 查看原文件的回调函数
    btnsRender: PropTypes.any, // 操作按钮渲染内容
    defaultModeKey: PropTypes.string, // 左侧模式默认值
    from: PropTypes.string, // document 来自文档中心
    isShowStatistics: PropTypes.bool, // 是否展示左下侧统计信息
    method: PropTypes.number, // office文件是否用微软预览，仅公有云可用
    // officeUrl: PropTypes.string, // office文件预览服务地址
    leftWidth: PropTypes.number, // 画布距离屏幕左侧的距离
    topHeight: PropTypes.number, // 画布距离屏幕上侧的距离
    display: PropTypes.string, // 中间画布自适应方式
    showCutImage: PropTypes.bool, // 是否展示混贴图片
    imageViewOriginal: PropTypes.bool, //私有化定制， aws默认false
    onReviewFileUrl: PropTypes.func,
    showLeftViewModel: PropTypes.number, // 显示左边的视图模型，1：分类展示，2：按采集顺序展示
    isShowWaterMark: PropTypes.number, // 是否展示水印，防止切换调阅水印设置后仍能缓存
};

ReviewImage.defaultProps = {
    modeKey: ['img', 'list', 'match'], // 图片，列表，匹配模式
    visible: false,
    otherHeight: 0,
    defaultModeKey: 'img',
    isShowStatistics: true,
    method: 0,
    leftWidth: 264,
    topHeight: 50,
    display: 'height',
    showCutImage: true
};

export default ReviewImage;