/*eslint-disable*/
import React, { useEffect, useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, message, InputNumber } from 'antd';
import DraggableTree from './DraggableTree';
import InvoiceInfo from './InvoiceInfo';
import CutImage from './CutImage';
import left from './img/left.png';
import right from './img/right.png';
import leftBtn from './img/left_btn.png';
import rightBtn from './img/right_btn.png';
import enlarge from './img/enlarge.png';
import narrow from './img/narrow.png';
import reset from './img/reset.png';
import forward from './img/forward.png';
import backward from './img/backward.png';
import origin from './img/origin.png';
import fullScreen from './img/fullScreen.png';
import error from './img/tips_icon.png';

export default function Review (props) {
  const {
    treeData,
    getNewTreeData,
    handleClick,
    treeHeight,
    otherWidth,
    tips,
    getCheckedId,
    handleSelectId,
    isShowExplain,
    explainList,
    isShowExplainText,
    draggable,
    isEdit,
    explainHeight,
    isDelete,
    nextShowId,
    isShowJump,
    onAddLabel,
    onEditInvoice,
    showFileInfo,
    isShowLabel,
    wpsView,
    WebOfficeSDK
} = props;
  const handleTree = (arr) => {
        return arr.reduce(function(pre, next) {
            if (Array.isArray(next.children)) {
                return pre.concat(next).concat(handleTree(next.children));
            } else {
                return pre.concat(next);
            }
        }, []);
    }

    // 摊平未折叠的树
    const handleCollapseTree = (arr, ids) => {
        return arr.reduce(function(pre, next) {
            if (Array.isArray(next.children) && !ids.some(i => i === next.id)) {
                return pre.concat(next).concat(handleCollapseTree(next.children, ids));
            } else {
                return pre.concat(next);
            }
        }, []);
    }

    const [platDataList, setPlatDataList] = useState(handleTree(treeData)); // 摊平数组，上下切换
    const [selectedInfo, setSelectedInfo] = useState({}); // 当前选中的数据
    const [selectedId, setSelectedId] = useState(''); // 当前选中的id
    const [editId, setEditId] = useState(''); // 当前编辑的封面的id
    const [collapseIds, setCollapseIds] = useState([]); // 收起的数组的集合
    const [checkedKeys, setCheckedKeys] = useState([]); // 勾选中的数组的集合
    const [curNum, setCurNum] = useState(1); // 跳转第几个
    let count = 0;

    useEffect(() => {
        // 摊平树，过滤出所有影像文件
        const allData = handleTree(treeData).filter(item => item.itemType === 'file');
        // 初始化selectedId不存在，默认取第一个值
        if (!selectedId) {
            setSelectedId(allData.length ? allData[0].id : '');
            handleSelectId(allData.length ? allData[0].id : '');
        }
        // 删除勾选的影像后，checkedKeys置空，若selectedId在删除的影像中，selectedId取下一个影像的id
        if (isDelete) {
        setCollapseIds(collapseIds.filter(item => !checkedKeys.some(i => i === item)));
        setSelectedId(nextShowId);
        setCheckedKeys([]);
        }
        // 删除选中的数组后，默认取第一个值
        // if (selectedId && !allData.some(item => item.id === selectedId)) {
        //   setSelectedId(allData.length ? allData[0].id : '');
        // }
        // 替扫补扫重试后，id变化，赋值新的id
        if (selectedId && allData.some(item => item.id === selectedId)) {
            const curSelectedInfo = allData.find(item => item.id === selectedId);
            if (curSelectedInfo?.beforeId && curSelectedInfo.beforeId !== selectedId) {
                setSelectedId(curSelectedInfo.id);
            }
        }
        // treeData更新时，如果checkedId存在时遍历treeData，找到勾选的父节点的所有子节点，告诉后端
        if (checkedKeys.length) {
        const newCheckedIds = getNewCheckedId(treeData);
        getCheckedId(newCheckedIds);
        }
        setEditId('');
        setPlatDataList(handleTree(treeData));
    }, [treeData, isDelete]);

    useEffect(() => {
        setSelectedInfo(platDataList.find(item => item.id === selectedId));
    }, [platDataList, selectedId]);

    const childRef = useRef(null);

    const getNewCheckedId = (tree) => {
        let newCheckedKeys = [];

        function traverse(node) {
            node.forEach(i => {
                if (checkedKeys.some(item => item === i.id) && i.children) {
                    newCheckedKeys = newCheckedKeys.concat(i.children.map(item => item.id));
                }
                if (i.children && i.children.length > 0) {
                    traverse(i.children);
                }
            })
        }
        // 遍历整个树
        traverse(tree);
        return [...new Set([...newCheckedKeys, ...checkedKeys])];
    }

    const getSelectedId = (id) => {
        setSelectedId(id || selectedId);
        handleSelectId(id || selectedId);
    };

    const getEditId = (id) => {
        setEditId(id);
    };

    const getCollapseIds = (ids) => {
        setCollapseIds(ids);
    };

    // 下一张发票
    const handleBackward = () => {
        const fileList = platDataList.filter(item => item.itemType === 'file');
        const curIndex = fileList.map(item => item.id).indexOf(selectedInfo.id);
        const nextInfo = fileList[curIndex === fileList.length - 1 ? curIndex : curIndex + 1];
        if (curIndex === fileList.length - 1) {
            message.info('已经是最后一页了');
        }
        getSelectedId(nextInfo.id);
    };

    // 上一张发票
    const handleForward = () => {
        const fileList = platDataList.filter(item => item.itemType === 'file');
        const curIndex = fileList.map(item => item.id).indexOf(selectedInfo.id);
        const nextInfo = fileList[curIndex === 0 ? 0 : curIndex - 1];
        if (curIndex === 0) {
            message.info('已经是第一页了');
        }
        getSelectedId(nextInfo.id);
    };

    const initShowOriginFile = () => {
        const { displayFlag = '', imgUrl = '', docUrl = '' } = selectedInfo;
        window.open(displayFlag === 'showOther' ? docUrl : imgUrl);
    };

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
        {
            icon: fullScreen,
            key: 'fullScreen',
            fun: () => childRef.current?.fullScreen()
        },
        {
            icon: reset,
            key: 'reset',
            fun: () => childRef.current?.reset()
        }
    ];

    const btns = [
        {
            icon: forward,
            key: 'forward',
            fun: () => handleForward()
        },
        ...selectedInfo?.displayFlag === 'showOther' ? [] : midBtns,
        {
            icon: origin,
            key: 'origin',
            fun: () => initShowOriginFile()
        },
        {
            icon: backward,
            key: 'backward',
            fun: () => handleBackward()
        }
    ];

    // 点击异常提示，跳转到异常单据
    const scrollTree = () => {
        const tree = document.getElementById('tree');
        const fileHeight = 70;
        const titleHeight = 24;
        const errorList = treeData.filter(item => +item.status !== 5);
        const beforeList = [];
        if (count >= errorList.length) {
            count = 0;
        }
        for(let i = 0; i < treeData.length; i++) {
            if (errorList[count].id === treeData[i].id) {
                break;
            }
         beforeList.push(treeData[i]);
        }
        const beforeFlatList = handleCollapseTree(beforeList, collapseIds);
        let fileNum = 0;
        let titleNum = 0;
        beforeFlatList.forEach(item => {
            if (item.itemType === 'file') {
                fileNum ++;
            } else {
                titleNum ++;
            }
        })

        tree.scrollTop = fileNum * fileHeight + titleNum * titleHeight;
        count ++;
    };

    const changeCheckedId = (ids) => {
        getCheckedId(ids);
        setCheckedKeys(ids);
    };

    // 跳转
    const scrollToChapter = (id) => {
        const chapterEl = document.getElementById(id);
        chapterEl.scrollIntoView({ behavior: 'smooth' });
    };

    // 跳转确定事件
    const jumpSure = (id) => {
        const curValue = platDataList.filter(item => item.itemType === 'file')[id - 1];
        getSelectedId(curValue.id);
        jump(curValue.id);
    };

  // 跳转
    const jump = (id) => {
        const fileList = platDataList.filter(item => item.itemType === 'file');
        if (fileList.length > 0 && id === fileList[0].id) {
            const tree = document.getElementById('tree');
            tree.scrollTop = 0;
            return;
        }
        scrollToChapter(id || selectedId);
    };

    // const handleKeyDown = (e) => {
    //     const { keyCode } = e;
    //     if (keyCode == 40) {
    //         handleBackward();
    //     } else if (keyCode == 38) {
    //         handleForward();
    //     }
    // };

    // useEffect(() => {
    //     document.addEventListener('keydown', handleKeyDown);
    //     return () => {
    //         document.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, [selectedInfo?.id]);

    const bottomHeight = isShowExplain ? (isShowJump ? explainHeight + 40 : explainHeight) : 40;
    console.log('selectedInfo==========xxxxxxx========', selectedInfo);
    return (
        <div style={{ display: 'flex', height: treeHeight ? `${treeHeight}px` : '100vh' }} className='draggable-box'>
            <div id='tree' style={{ width: '440px', height: '100%', overflow: 'auto', border: '1px solid #e5e5e5', position: 'relative' }}>
                {tips && <div className='tips' onClick={scrollTree}><img src={error} className='icon' />{tips}</div>}
                <div style={{ paddingTop: tips ? '28px' : 0, minHeight: `calc(100% - ${bottomHeight}px)` }}>
                    <DraggableTree
                        treeData={treeData}
                        getNewTreeData={getNewTreeData}
                        selectedId={selectedId}
                        editId={editId}
                        getSelectedId={getSelectedId}
                        changeCheckedId={changeCheckedId}
                        getEditId={getEditId}
                        handleClick={handleClick}
                        collapseIds={collapseIds}
                        getCollapseIds={getCollapseIds}
                        draggable={draggable}
                        isEdit={isEdit}
                        platDataList={platDataList}
                        checkedKeys={checkedKeys}
                        onAddLabel={onAddLabel}
                        isShowLabel={isShowLabel}
                    />
                </div>
                <div className='tree-bottom'>
                    {isShowExplain && (
                        <div className='explain'>
                        {isShowExplainText && <div>说明：</div>}
                        <div>
                            {
                            explainList.map(item => (
                                <div key={item}>{item}</div>
                            ))
                            }
                        </div>
                        </div>
                    )}
                    {isShowJump && <div className='jump-box'>
                        <span>影像选择</span>
                        <div
                            className='jump-box-icon'
                            onClick={() => {
                                setCurNum(1);
                                jumpSure(1);
                            }}
                        >
                            <img src={leftBtn} />
                        </div>
                        <InputNumber
                            size='small'
                            onChange={(val) => setCurNum(val)}
                            className='jump-box-input'
                            min={1}
                            value={curNum}
                            max={platDataList.filter(item => item.itemType === 'file').length}
                        />
                        <span>{`/  ${platDataList.filter(item => item.itemType === 'file').length}`}</span>
                        <div
                            className='jump-box-icon icon-right'
                            onClick={() => {
                                const totalNum = platDataList.filter(item => item.itemType === 'file').length;
                                setCurNum(totalNum);
                                jumpSure(totalNum);
                            }}
                        >
                            <img src={rightBtn} />
                        </div>
                        <Button onClick={() => jumpSure(curNum)} type='primary' className='btn'>确定</Button>
                    </div>}
                </div>
            </div>
            <div className='review-left' style={{ height: treeHeight ? `${treeHeight}px` : '100vh' }}>
                {
                    useMemo(() => (
                        <CutImage
                            info={selectedInfo}
                            ref={childRef}
                            handleBackward={handleBackward}
                            handleForward={handleForward}
                            getNewTreeData={getNewTreeData}
                            treeData={treeData}
                            treeHeight={treeHeight}
                            otherWidth={otherWidth}
                            wpsView={wpsView}
                            WebOfficeSDK={WebOfficeSDK}
                        />
                    ), [selectedInfo?.id, selectedInfo?.angle, selectedInfo?.docUrl, selectedInfo?.imgUrl])
                }
                <div className='btn-box'>
                    {
                        btns.map(item => (
                            <img src={item.icon} key={item.key} className='btn' onClick={item.fun} />
                        ))
                    }
                </div>
            </div>
            {
                showFileInfo ? (
                    <div className='review-right' style={{ height: treeHeight ? `${treeHeight}px` : '100vh' }}>
                        <b style={{display: 'block', marginBottom: 10 }}>文件信息</b>
                        { selectedInfo && selectedInfo.fileType === 'invoice' && <InvoiceInfo list={selectedInfo.detail} onEditInvoice={onEditInvoice} /> }
                        { selectedInfo && selectedInfo.fileType === 'cover' && (
                            <div className='invoice-info'>
                                <div className='info-box'>
                                    <div><label>文件大类：</label><span>{selectedInfo.parentId ? '子封面' : '主封面'}</span></div>
                                    <div><label>文件名称：</label><span>{selectedInfo.fileName}</span></div>
                                </div>
                            </div>
                        ) }
                        { selectedInfo && selectedInfo.fileType === 'attach' && (
                            <div className='invoice-info'>
                                <div className='info-box'>
                                    <div><label>文件大类：</label><span>附件</span></div>
                                    <div><label>文件名称：</label><span>{selectedInfo.fileName || '--'}</span></div>
                                </div>
                            </div>
                        ) }
                    </div>
                ) : null
            }
        </div>
    )
}

Review.propTypes = {
    treeData: PropTypes.array, // 数据源
    getNewTreeData: PropTypes.func, // 回调函数，改变treeData
    handleClick: PropTypes.func, // 状态触发事件
    getCheckedId: PropTypes.func, // 获取勾选上的ids
    treeHeight: PropTypes.number, // 内容的高度
    otherWidth: PropTypes.number, // 内容的宽度
    tips: PropTypes.string,
    handleSelectId: PropTypes.func, // 获取选中的值的id
    isShowExplain: PropTypes.bool, // 是否展示说明文字
    explainList: PropTypes.array, // 说明文字
    draggable: PropTypes.bool, // 是否可以拖动
    isEdit: PropTypes.bool, // 是否可以编辑封面编号,
    explainHeight: PropTypes.number, // 说明框的高度
    isDelete: PropTypes.bool, // 当前是否是根据删除更新treeData
    nextShowId: PropTypes.string, // 删除勾选节点包括选中节点，删除成功后，显示下一个节点
    onAddLabel: PropTypes.func, // 为文件添加标签
    onEditInvoice: PropTypes.func, //编辑发票信息
    isShowJump: PropTypes.bool,
    showFileInfo: PropTypes.bool, // 是否展示发票信息
    isShowLabel: PropTypes.bool // 是否展示标签
};

Review.defaultProps = {
    treeData: [],
    isShowExplain: false,
    explainList: [],
    isShowExplainText: true,
    draggable: true,
    isEdit: true,
    isDelete: false,
    isShowJump: false
};