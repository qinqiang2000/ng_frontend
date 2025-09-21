import React, { useState, useEffect, useMemo } from 'react';
import { Tree, Input } from 'antd';
import PropTypes from 'prop-types';
import './fileTree.css';

const { TreeNode } = Tree;
const { Search } = Input;

export default function FileTree(props) {
    const [allFarentIds, setAllFarentIds] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [disabledUids, setDisabledUids] = useState([]);
    const {
        treeData,
        getNewTreeData,
        selectedUid,
        getselectedUid,
        collapseUids,
        getCollapseUids,
        draggable,
        treeWidth,
        treeHeight
    } = props;


    useEffect(() => {
        const data = [];
        const getFarentIds = (list) => {
            return list.map(item => {
                if (item?.children?.length) {
                    data.push(item.uid);
                    return getFarentIds(item.children);
                }
            });
        };
        getFarentIds(treeData);
        setAllFarentIds(data);
        getDisabledUids(treeData);
    }, [treeData]);

    const getDisabledUids = (list) => {
        const uids = [];
        const handleData = (arr) => {
            arr.forEach(item => {
                if (item.tag === 1) {
                    uids.push(item.uid);
                }
                if (item.children?.length) {
                    handleData(item.children);
                }
            });
        };
        handleData(list);
        setDisabledUids(uids);
    };

    const newTreeData = useMemo(() => {
        const loop = (data) =>
            data.map((item) => {
                const strTitle = item.title;
                const index = strTitle.indexOf(searchValue);
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + searchValue.length);
                const title =
                index > -1 ? (
                    <span>
                        {beforeStr}
                        <span style={{ color: 'red' }}>{searchValue}</span>
                        {afterStr}
                    </span>
                ) : (
                    <span>{strTitle}</span>
                );
                if (item.children) {
                    return {
                        ...item,
                        title,
                        children: loop(item.children)
                    };
                }
                return {
                    ...item,
                    title
                };
            });
        return loop(treeData);
    }, [searchValue, treeData]);

    const loop = (data, isChild) => {
        return data.map((item) => {
            return (
                <TreeNode
                    key={item.uid + ''}
                    title={
                        <div className='draggable-item' style={{ maxWidth: `${treeWidth}px` }}>
                            <div className={item.tag === 3 ? 'draggable-item-new' : 'draggable-item-new draggable-item-default'} />
                            <div className={item.tag === 1 ? 'draggable-item-sign draggable-item-disabled' : 'draggable-item-sign'}>
                                {item.typeName}
                            </div>
                            <div className='draggable-item-title'>{item.title}</div>
                        </div>
                    }
                >
                    {item?.children &&
                        item.children.length > 0 &&
                        loop(item.children, true)}
                </TreeNode>
            );
        });
    };

    const onDrop = (info) => {
        const dropKey = info.node.props.eventKey; // 拖拽落下的值
        const dragKey = info.dragNode.props.eventKey; // 被拖拽的值
        const dropPos = info.node.props.pos.split('-'); // 拖拽落下的位置 最外层到最里层
        const dropPosition =
            info.dropPosition - Number(dropPos[dropPos.length - 1]);
        // console.log(info, dragKey, dropKey, dropPos, dropPosition, '------------------')
        // 禁止拖拽
        if (disabledUids.includes(dragKey)) {
            return;
        }

        const loop = (data, key, callback) => {
            data.forEach((item, index, arr) => {
                if (item.uid === key) {
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
        if (
            !info.dropToGap &&
            //dropPos.length < 3 &&
            !info.dragNode.props?.children?.length
        ) {
            // Drop on the content
            console.log(1, '拖动到子级');
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.push(dragObj);
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            console.log(2);
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else {
            console.log(3, '拖动到上级');
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
        getNewTreeData && getNewTreeData(data);
    };

    const onDragEnter = () => {};

    const onSearch = (e) => {
        const { value } = e.target;
        setSearchValue(value);
    };

    return (
        <div className='draggable-tree' style={{ width: treeWidth, height: treeHeight }}>
            <div className='draggable-tree-tips'>
                <div className='draggable-tree-tips-disabled'>不可编辑</div>
                <div className='draggable-tree-tips-edit'>可编辑</div>
                <div className='draggable-tree-tips-new'>
                    <div className='draggable-tree-tips-new-sign' />
                    新增文件
                </div>
            </div>
            <div style={{ padding: 8 }}>
                <Search
                    placeholder='搜索编码/名称'
                    onChange={onSearch}
                />
            </div>
            <Tree
                draggable={draggable}
                blockNode
                onDragEnter={onDragEnter}
                onDrop={onDrop}
                selectedKeys={[selectedUid]}
                expandedKeys={allFarentIds.filter(item => !collapseUids.includes(item))}
                onSelect={(selectedKeys, e) => {
                    console.log(selectedKeys, e);
                    getselectedUid && getselectedUid(selectedKeys[0]);
                }}
                onExpand={(expandedKeys) => {
                    const uid = allFarentIds.filter(item => !expandedKeys.includes(item));
                    getCollapseUids(uid);
                }}
            >
                {loop(newTreeData, false)}
            </Tree>
        </div>
    );
}

FileTree.propTypes = {
    treeData: PropTypes.array, // 数据源
    getNewTreeData: PropTypes.func, // 回调函数，改变treeData
    selectedUid: PropTypes.string, // 当前选中值的id
    getselectedUid: PropTypes.func, // 获取选中的值的id
    collapseUids: PropTypes.array, // 默认展开的id
    getCollapseUids: PropTypes.func,
    draggable: PropTypes.bool, // 是否可以拖动
    treeHeight: PropTypes.number,
    treeWidth: PropTypes.number
};

FileTree.defaultProps = {
    treeData: []
};
