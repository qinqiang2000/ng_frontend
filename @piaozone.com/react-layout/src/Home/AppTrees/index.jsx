
import React from 'react';
import { Tree } from 'antd';
import PropTypes from 'prop-types';

const propTypes = {
    treeData: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        title: PropTypes.string,
        children: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]),
            title: PropTypes.string
        }))
    })).isRequired,
    onSelect: PropTypes.func.isRequired
};

const { TreeNode, DirectoryTree } = Tree;

function AppTrees(props) {
    const { treeData, onSelect } = props;
    const onHandleSelect = (keys, event) => {
        if (onSelect) {
            onSelect(keys, event);
        }
    };

    const onExpand = () => {
        console.log('Trigger Expand');
    };

    return (
        <DirectoryTree multiple defaultExpandAll onSelect={onHandleSelect} onExpand={onExpand}>
            {
                treeData.map(app => {
                    const { key, title, children } = app;

                    return (
                        <TreeNode title={title} key={key}>
                            {
                                children && children.map(item => {
                                    const { key, title } = item;
                                    return (
                                        <TreeNode title={title} key={key} isLeaf />
                                    );
                                })
                            }
                        </TreeNode>
                    );
                })
            }
        </DirectoryTree>
    );
}

AppTrees.propTypes = propTypes;

export default AppTrees;
