/*eslint-disable*/
import React from 'react';
import { Tree, Input, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { getFileExtensionByName } from './utils';
import loading from './img/loading.png';
import error from './img/error.png';
import worning from './img/tips_icon.png';
import UploadStatus from './uploadStatus';
import otherIcon from './img/other_icon.png';
import Img from './Img';
import execlIcon from './img/fileIcons/excel.png';
import pdfIcon from './img/fileIcons/pdf.png';
import pptIcon from './img/fileIcons/ppt.png';
import txtIcon from './img/fileIcons/txt.png';
import wordIcon from './img/fileIcons/word.png';
import ofdIcon from './img/fileIcons/ofd.png';
import xmlcon from './img/fileIcons/ofd.png';
import zipIcon from './img/zip_icon.png';
import cover1 from './img/cover1.png';
import cover2 from './img/cover2.png';
import cover3 from './img/cover3.png';
import cover4 from './img/cover4.png';
import editIcon from './img/form.png';
import './index.css';

const { TreeNode } = Tree;

export default function DraggableTree(props) {
    const { treeData, getNewTreeData, handleClick, selectedId, getSelectedId, changeCheckedId, editId, getEditId, collapseIds, getCollapseIds, draggable, isEdit, platDataList, checkedKeys } = props;
    // const allFarentIds = platDataList.filter(item => item.itemType !== 'file').map(item => item.id);
    const allFarentIds = platDataList.filter(item => item.children && item.children.length !== 0).map(item => item.id);
    //过滤出children数组中fileType不为空的所有id
    const allTreeNodes = platDataList.filter(item => item.children && item.children.length !== 0);
    console.log('platDataList-树------allTreeNodes-----', platDataList, allTreeNodes);
    let AllClickNodes = []; //可点击节点
    for (const item of allTreeNodes) {
        // if (item.fileType) {
        //     AllClickNodes.push(item.id);
        // }
        for (const itx of item.children) {
            if (itx.fid) {
                AllClickNodes.push(itx.id);
            }
        }
    }
    AllClickNodes = [...new Set(AllClickNodes)];
    console.log('AllClickNodes-树------AllClickNodes-----', AllClickNodes);
    const onAddLabel = (item) => {
        if (props.onAddLabel && typeof props.onAddLabel === 'function') {
            props.onAddLabel(item.id);
        }
    };

    const editTile = (e, item) => {
        const { value } = e.target;
        if (!value) {
            return;
        }
        if (value === item.title) {
            getEditId('');
            return;
        }
        getNewTreeData && getNewTreeData(treeData.map(v => ({
            ...v,
            title: v.id === item.id ? value : v.title
        })), 'changeTitle');
    };

    const fileIcon = {
        'xls': execlIcon,
        'xlsx': execlIcon,
        'csv': execlIcon,
        'pdf': pdfIcon,
        'ppt': pptIcon,
        'pptx': pptIcon,
        'txt': txtIcon,
        'doc': wordIcon,
        'docx': wordIcon,
        'zip': zipIcon,
        'ofd': ofdIcon
    };

    const F_FILE_TYPE = {
        PDF: 1,
        IMG: 2,
        TXT: 3, // 其实这里的3是代表其它文件类型，只是在这里 只有txt，
        XLS: 4,
        XLSX: 4,
        DOCX: 5,
        DOC: 5,
        PPT: 6,
        PPTX: 6,
        XML: 7,
        OFD: 8
    }

    const F_FILE_TYPE_IMG = {
        [F_FILE_TYPE.PDF]: pdfIcon,
        [F_FILE_TYPE.OFD]: ofdIcon,
        [F_FILE_TYPE.IMG]: '',
        [F_FILE_TYPE.TXT]: txtIcon, // 其实这里的3是代表其它文件类型，只是在这里 只有txt，
        [F_FILE_TYPE.XLS]: execlIcon,
        [F_FILE_TYPE.XLSX]: execlIcon,
        [F_FILE_TYPE.DOC]: wordIcon,
        [F_FILE_TYPE.DOCX]: wordIcon,
        [F_FILE_TYPE.PPT]: pptIcon,
        [F_FILE_TYPE.PPTX]: pptIcon,
        [F_FILE_TYPE.XML]: xmlcon,
    }


    const onShowImgIcon = (item) => {
        const { ffileType, ffileName} = item;
        if (ffileName) {
            const endName = getFileExtensionByName(ffileName);
            if (endName) {
                return <Img src={F_FILE_TYPE_IMG[F_FILE_TYPE[endName]]} />
            }
        }
        return <Img src={F_FILE_TYPE_IMG[Number(ffileType)]} />
    }

    const loop = (data, isChild) => {
        const errorStatus = ['repeat', 'exist', 'check-error', 'duplicateInvoice', 'cancel']; // 需要提示的状态
        return data.map((item, index) => {
            // const _angle = Math.abs(item.rotateAngle);
            // const isRotate = _angle === 90 || _angle === 270;
            return (
                <TreeNode
                    key={item.id + ''}
                    className={item.itemType !== 'coverNo' ? 'tree-child-item' : ''}
                    title={(
                        <div className='draggable-item' id={item.id + ''}>
                            {item.itemType === 'file' && (
                                <>
                                    <span style={{ display: 'inline-block', alignSelf: 'center', paddingRight: 10, color: '#666' }}>{parseInt(index) + 1}</span>
                                    <div className='draggable-item-left'>
                                        {item.ffileType && (item.ffileType!= 2 || getFileExtensionByName(item.ffileName) === 'OFD') ? (
                                            onShowImgIcon(item)
                                        ) : (
                                            (!item.src || !item.localUrl) && item.type === 'info' ? (
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff' }}>无封面文件</div>
                                            ) : (
                                                <Img
                                                    src={item.localUrl || item.src}
                                                    alt={props.t('imgscan.slt')}
                                                    angle={item.rotateAngle}
                                                    style={{
                                                        transform: `rotateZ(${-item.rotateAngle}deg)`,
                                                        border: '1px solid #eaeaea'
                                                    }}
                                                />
                                            )

                                        )}
                                    </div>
                                </>
                            )}
                            <div className={item.itemType === 'file' ? 'draggable-item-right' : 'draggable-item-right draggable-item-title'}>
                                <div className='draggable-item-right-title'>
                                    {item.id === editId ? (
                                        <Input
                                            defaultValue={item.title}
                                            onClick={(e) => { e.stopPropagation(); }}
                                            onBlur={(e) => editTile(e, item)}
                                            className='draggable-input'
                                            maxLength={50}
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            {item.fileType === 'cover' ? '' : (
                                                <Tooltip title={item.title} open visible={false}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        {
                                                            item.itemType === 'coverNo' ? (
                                                                item.title ? (
                                                                    <span>{item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}</span>
                                                                ) : null
                                                            ) : null
                                                        }
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </>
                                    )}
                                    {isEdit && item.itemType === 'coverNo' && (
                                        <img
                                            src={editIcon}
                                            style={{ marginLeft: '10px', width: '14px', height: '14px' }}
                                            onClick={() => {
                                                getEditId(item.id);
                                            }}
                                        />
                                    )}
                                </div>
                                {
                                    item.itemType === 'file' ? (
                                        <div
                                            onClick={() => selectedId === item.id ? onAddLabel(item) : null}
                                            style={{ marginBottom: 20 }}
                                        >
                                            {
                                                item.title ? (
                                                    <>
                                                        <span>{item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}</span>
                                                        <span style={{ margin: '0 5px' }}>|</span>
                                                    </>
                                                ) : null
                                            }
                                            标签：<span style={{ color: selectedId === item.id ? '#3598ff' : 'rgba(0,0,0,.65)' }}>{item.labelNum || 0}</span>
                                        </div>
                                    ) : null
                                }

                                {/* 匹配 <div className='draggable-item-right-match'>{item.isMatch}</div> */}
                                {
                                    item.itemType === 'file' ? (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <UploadStatus
                                                t={props.t}
                                                errMsg={item.error}
                                                status={item.uploadStatus}
                                                tryAgain={() => this.uploadAgain(index + '-0', 'info')}
                                            />
                                        </div>

                                    ) : (
                                        <div className='draggable-item-right-status'>
                                            {errorStatus.indexOf(item.uploadStatus) !== -1 ? (
                                                <Tooltip title={item.fullStatusDes} open>
                                                    <span><img src={error} className='icon' />{item.statusDes || ''}</span>
                                                </Tooltip>
                                            ): ''}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )}
                >
                    {item?.children && item.children.length > 0 && loop(item.children, true)}
                </TreeNode>
            )
        })
    };

    const onDrop = info => {
        const dropKey = info.node.props.eventKey; // 拖拽落下的值
        const dragKey = info.dragNode.props.eventKey; // 被拖拽的值
        const dropPos = info.node.props.pos.split('-'); // 拖拽落下的位置 最外层到最里层
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        // console.log(info, dragKey, dropKey, dropPos, dropPosition, '------------------')
        // if (allFarentIds.includes(dragKey)) {
        //   return;
        // }

        const loop = (data, key, callback) => {
            data.forEach((item, index, arr) => {
                if (item.id + '' === key + '') {
                    return callback(item, index, arr);
                }
                if (item.children) {
                    return loop(item.children, key, callback);
                }
            });
        };
        const data = [...treeData];

        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });
        // 只允许二级内的拖动
        if (!info.dropToGap && dropPos.length < 3 && !info.dragNode.props?.children?.length) {
            // Drop on the content
            console.log(1, '拖动到子级')
            loop(data, dropKey, item => {
                item.children = item.children || [];
                item.children.push(dragObj);
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            console.log(2)
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else {
            console.log(3, '拖动到上级')
            let ar;
            let i;
            loop(data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }
        getNewTreeData && getNewTreeData(data, 'changeOrder');
    };

    const onDragEnter = () => { };
    return (
        <div className='draggable-tree'>
            <Tree
                checkable
                draggable={draggable}
                blockNode
                onDragEnter={onDragEnter}
                onDrop={onDrop}
                className='hide-file-icon'
                selectedKeys={[selectedId + '']}
                checkedKeys={checkedKeys.filter(item => platDataList.some(i => i.id === item))}
                expandedKeys={allFarentIds.filter(item => !collapseIds.includes(item))}
                onSelect={(selectedKeys, e) => {
                    console.log('AllClickNodes----树---selectedKeys----', AllClickNodes, selectedKeys);
                    if (!AllClickNodes.includes(selectedKeys[0])) {
                        return;
                    }
                    getSelectedId && getSelectedId(selectedKeys[0]);
                }}
                onCheck={(keys, e) => {
                    changeCheckedId && changeCheckedId(keys);
                }}
                onExpand={(expandedKeys) => {
                    const id = allFarentIds.filter(item => !expandedKeys.includes(item));
                    getCollapseIds(id)
                }}
            >
                {loop(treeData, false)}
            </Tree>
        </div>
    );
}

DraggableTree.propTypes = {
    treeData: PropTypes.array, // 数据源
    getNewTreeData: PropTypes.func, // 回调函数，改变treeData
    handleClick: PropTypes.func, // 状态触发事件
    selectedId: PropTypes.string, // 当前选中值的id
    getSelectedId: PropTypes.func, // 获取选中的值的id
    changeCheckedId: PropTypes.func, // 获取勾选上的ids
    editId: PropTypes.string, // 点击编辑时的id
    getEditId: PropTypes.func, // 获取编辑时的id
    collapseIds: PropTypes.array, // 默认展开的id
    getCollapseIds: PropTypes.func,
    draggable: PropTypes.bool, // 是否可以拖动
    isEdit: PropTypes.bool,
    platDataList: PropTypes.array,
    t: PropTypes.func
};

DraggableTree.defaultProps = {
    treeData: []
};