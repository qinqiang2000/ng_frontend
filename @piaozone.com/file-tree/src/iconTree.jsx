import React, { useState, useEffect } from 'react';
import { Tree } from 'antd';
import PropTypes from 'prop-types';
import './iconTree.css';

const { TreeNode } = Tree;

export default function IconTree(props) {
    const [allFarentIds, setAllFarentIds] = useState([]);
    const {
        treeData,
        selectedId,
        getSelectedId,
        collapseIds,
        getCollapseIds,
        treeWidth,
        treeHeight
    } = props;


    useEffect(() => {
        const data = [];
        const getFarentIds = (list) => {
            return list.map(item => {
                if (item?.children?.length) {
                    data.push(item.id);
                    return getFarentIds(item.children);
                }
            });
        };
        getFarentIds(treeData);
        setAllFarentIds(data);
        getDisabledUids(treeData);
    }, [treeData]);

    const getDisabledUids = (list) => {
        const ids = [];
        const handleData = (arr) => {
            arr.forEach(item => {
                if (item.tag === 1) {
                    ids.push(item.id);
                }
                if (item.children?.length) {
                    handleData(item.children);
                }
            });
        };
        handleData(list);
    };

    const loop = (data, isChild, level) => {
        return data.map((item) => {
            return (
                <TreeNode
                    key={item.id + ''}
                    title={
                        <div className='icon-item' style={{ maxWidth: `${treeWidth}px` }}>
                            <div className={level === 0 ? 'icon-item-title-first icon-item-title' : 'icon-item-title'}>{item.title}</div>
                            {
                                item.tipTitle && (
                                    <div
                                        className='icon-item-tip'
                                        style={{ border: `1px solid ${item.tipColor}`, background: item.tipBackgroup, color: item.tipColor }}
                                    >
                                        {item.tipTitle}
                                    </div>
                                )
                            }
                        </div>
                    }
                >
                    {item?.children &&
                        item.children.length > 0 &&
                        loop(item.children, true, level + 1)}
                </TreeNode>
            );
        });
    };

    function findLastLeafOrFirstChild(tree, targetId) {
        for (const node of tree) {
            if (node.id === targetId) {
                // 检查当前节点是否有子节点
                if (node.children && node.children.length > 0) {
                    // 返回父节点下的第一个叶子节点
                    const firstLeaf = findFirstLeaf(node.children);
                    if (firstLeaf) {
                        return firstLeaf.id;
                    }
                } else {
                    // 返回当前节点（叶子节点）
                    return node.id;
                }
            } else if (node.children && node.children.length > 0) {
                // 继续递归查找子节点
                const result = findLastLeafOrFirstChild(node.children, targetId);
                if (result !== null) {
                    return result; // 找到叶子节点或父节点的最后一级节点的第一个节点
                }
            }
        }
      
        return null; // 没有找到匹配的节点
    };
      
    function findFirstLeaf(nodes) {
        for (const node of nodes) {
            if (!node.children || node.children.length === 0) {
                // 找到叶子节点，返回它
                return node;
            } else {
                // 继续递归查找子节点
                const firstLeaf = findFirstLeaf(node.children);
                if (firstLeaf) {
                    return firstLeaf;
                }
            }
        }
      
        return null; // 没有找到叶子节点
    };

    const handleSelectId = (id) => {
        const newId = findLastLeafOrFirstChild(treeData, id);
        getSelectedId && getSelectedId(newId);
    };

    return (
        <div className='icon-tree' style={{ width: treeWidth, height: treeHeight }}>
            <Tree
                blockNode
                selectedKeys={[selectedId]}
                expandedKeys={allFarentIds.filter(item => !collapseIds.includes(item))}
                onSelect={(selectedKeys) => handleSelectId(selectedKeys[0])}
                onExpand={(expandedKeys) => {
                    const uid = allFarentIds.filter(item => !expandedKeys.includes(item));
                    getCollapseIds(uid);
                }}
            >
                {loop(treeData, false, 0)}
            </Tree>
        </div>
    );
}

IconTree.propTypes = {
    treeData: PropTypes.array, // 数据源
    selectedId: PropTypes.string, // 当前选中值的id
    getSelectedId: PropTypes.func, // 获取选中的值的id
    collapseIds: PropTypes.array, // 默认展开的id
    getCollapseIds: PropTypes.func,
    treeHeight: PropTypes.number,
    treeWidth: PropTypes.number
};

IconTree.defaultProps = {
    treeData: []
};
