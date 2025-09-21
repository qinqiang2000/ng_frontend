import React from 'react';
import { connect } from 'dva';
import { Tree, Input } from 'antd';
import Immutable from 'immutable';
import './index.css';
const TreeNode = Tree.TreeNode;
const Search = Input.Search;

const getParentKey = (fname, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some(item => item.fname === fname)) {
                parentKey = node.ouNo;
            } else if (getParentKey(fname, node.children)) {
                parentKey = getParentKey(fname, node.children);
            }
        }
    }
    return parentKey;
};


const getNode = (ouNo, tree, result) => {

    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.ouNo == ouNo) {
            return node;
        }
    }

    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children.length > 0) {
            const resultNode = getNode(ouNo, node.children);
            if (resultNode) {
                return resultNode;
            }
        }
    }
};


class OrgTree extends React.Component {
    constructor(props) {
        super(...arguments);
        this.onSelectOrg = this.onSelectOrg.bind(this);
        this.changeShowTreeData = this.debounce();

        this.state = {
            showTreeData: [],
            selectedKeys: [],
            expandedKeys: [],
            searchValue: '',
            autoExpandParent: true
        }
    }

    componentDidMount() {
        const { selectedKey, orgList } = this.props;
        const key = orgList[0]?.ouNo;
        this.setState({
            selectedKeys: [selectedKey],
            expandedKeys: (key && [key]) || [],
            showTreeData: orgList
        });
    }

    componentDidUpdate(prevProps) {
        const { selectedKey, orgList } = this.props;
        if (selectedKey !== prevProps.selectedKey) {
            this.setState({
                selectedKeys: [selectedKey]
            });
        }
        if (
            !Immutable.is(
                Immutable.fromJS(prevProps.orgList),
                Immutable.fromJS(orgList)
            )
        ) {
            // 组织树有更新，则同步showTreeData
            this.setState({ showTreeData: orgList });
        }
    }

    onChange = (searchValue) => {
        this.setState({ searchValue });
        this.changeShowTreeData();
    }

    // 函数防抖
    debounce = () => {
        let timer = null;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const { searchValue } = this.state;
                const { orgList } = this.props;
                //loopFilterChildren会改变数据结构
                let tem = JSON.parse(JSON.stringify(orgList)); // 👍
                this.expandedKeysTem = [];
                const showTreeData = tem.filter(item => {
                    return this.loopFilterChildren(item, searchValue);
                });
                this.setState({
                    expandedKeys: this.expandedKeysTem,
                    autoExpandParent: true,
                    showTreeData
                });
            }, 500)
        }
    };

    // loop 过滤子节点
    loopFilterChildren = (item, searchValue) => {
        if (searchValue === '') {
            this.expandedKeysTem.push(item.ouNo);
            return true;
        }
        // 判断根节点是否满足
        if (item.ouName.indexOf(searchValue) > -1) {
            this.expandedKeysTem.push(item.ouNo);
            return true;
        }
        // 根据长度判断子节点是否满足
        if (item.children) {
            //这里会改变原数据结构
            item.children = item.children.filter(child => this.loopFilterChildren(child, searchValue));
            // 子节点长度 需要展开的节点
            if (item.children.length > 0) {
                this.expandedKeysTem.push(item.ouNo);
                return true;
            }
        }
    };

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });
    }

    /*
     * 选择组织节点时触发，k为选择的组织fids,为数组格式
     */
    onSelectOrg(fids) {
        const { orgList = [] } = this.props;
        if (fids && fids.length > 0) {
            this.setState({
                selectedKeys: fids
            });
            this.props.onSelectOrg(fids, getNode(fids[0], orgList));
        } else {
            this.props.onSelectOrg(this.state.selectedKeys, getNode(this.state.selectedKeys[0], orgList));
        }
    }


    render() {
        const { searchValue, expandedKeys, autoExpandParent, showTreeData, selectedKeys } = this.state;
        const { showSearch = false, style = { }, visible = true } = this.props;

        const loop = data => data.map((item) => {
            const index = item.ouName.indexOf(searchValue);
            const beforeStr = item.ouName.substr(0, index);
            const afterStr = item.ouName.substr(index + searchValue.length);

            const ouName = index > -1 ? (
                <span>
                    {beforeStr}
                    <span style={{ color: '#f50' }}>{searchValue}</span>
                    {afterStr}
                </span>
            ) : <span>{item.ouName}</span>;

            if (item.children) {
                return (
                    <TreeNode key={item.ouNo} title={ouName}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.ouNo} title={ouName} />;
        });

        if (visible) {
            return (
                <div className="organization-orgTree" style={style}>
                    {
                        showSearch ? (
                            <div className="search">
                                <Search
                                    value={searchValue}
                                    onChange={(e) => this.onChange(e.target.value)}
                                    onSearch={(v) => this.onChange(v)}
                                    placeholder="请输入企业名称"
                                />
                            </div>
                        ) : null
                    }
                    <Tree
                         className="tree"
                        onExpand={this.onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        selectedKeys={selectedKeys}
                        onSelect={this.onSelectOrg}
                    >
                        {loop(showTreeData)}
                    </Tree>
                </div>
            )
        } else {
            return null;
        }
    }
}

function mapStateToProps(state) {
    const { orgList } = state.org;
    return {
        orgList
    };
}

export default connect(mapStateToProps)(OrgTree);


