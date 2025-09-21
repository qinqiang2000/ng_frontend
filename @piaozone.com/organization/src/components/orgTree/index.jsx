import React from 'react';
import { connect } from 'dva';

import { Button, Tree, Input, message} from 'antd';

const TreeNode = Tree.TreeNode;
const Search = Input.Search;

const gData = [{
	"fname": "合生创展集团有限公司",
	"fid": "0-0",
	"children": [{
		"fname": "合生房地产开发有限公司",
		"fid": "0-0-0",
		"children": [{
			"fname": "合生房地产开发有限公司上海分公司",
			"fid": "0-0-0-0"
		}, {
			"fname": "合生房地产开发有限公司广州分公司",
			"fid": "0-0-0-1"
		}, {
			"fname": "合生房地产开发有限公司北京分公司",
			"fid": "0-0-0-2"
		},{
			"fname": "合生房地产开发有限公司珠海分公司",
			"fid": "0-0-0-3"
		}]
	}, {
		"fname": "聊城合生创展房地产经纪有限公司",
		"fid": "0-0-2"
	},{
		"fname": "合生创展物业管理有限公司",
		"fid": "0-0-3"
	},{
		"fname": "合生创展商业地产管理有限公司",
		"fid": "0-0-4"
	}]
}];

const dataList = [];
const generateList = (data) => {
	for (let i = 0; i < data.length; i++) {
    	const node = data[i];
    	const key = node.key;
    	dataList.push({ key, fname: node.fname });
    	if (node.children) {
      		generateList(node.children, node.key);
    	}
  	}
};

//generateList(gData);

const getParentKey = (fname, tree) => {
	let parentKey;
  	for (let i = 0; i < tree.length; i++) {
    	const node = tree[i];
    	if (node.children) {
      		if (node.children.some(item => item.fname === fname)) {
        		parentKey = node.fid;
      		} else if (getParentKey(fname, node.children)) {
        		parentKey = getParentKey(fname, node.children);
      		}
    	}
	}
  	return parentKey;
};


const getNode = (fid, tree, result) => {

	for (let i = 0; i < tree.length; i++) {
    	const node = tree[i];
    	if(node.fid == fid){
    		return node;
    	}
	}

	for (let i = 0; i < tree.length; i++) {
    	const node = tree[i];
    	if (node.children.length > 0) {
			const resultNode = getNode(fid, node.children);
			if(resultNode){
				return resultNode;
			}
		}
	}
};


class OrgTree extends React.Component {
	constructor(props){
		super(...arguments);
		this.onSelectOrg = this.onSelectOrg.bind(this);

		const orgList = props.orgList || [];
		let selectedKeys = [];
		if(props.selectedKeys && props.selectedKeys.length > 0){
			selectedKeys = props.selectedKeys;
		}

		if(selectedKeys.length === 0){
			selectedKeys = orgList.length === 0?[]:[orgList[0].fid];
		}

		let expandedKeys = props.expandedKeys || [];
		if(expandedKeys.length === 0){
			if(orgList.length >0){
				expandedKeys = [''+orgList[0].fid]
			}
		}

		this.changeShowTreeData = this.debounce();

		this.showSearch = props.showSearch === true?true:false;
		this.style = props.style || {};
		this.state = {
			visible: props.visible === false?false:true,
			showTreeData: orgList,
			orgTreeData: orgList,
			selectedKeys: selectedKeys,
			expandedKeys: expandedKeys,
		  searchValue: '',
		  autoExpandParent: true
		}
	}

	componentWillUnmount () {
        this._isMounted = false;
    }

	componentDidMount(){
		this._isMounted = true;
    }

	componentWillReceiveProps(nextProps){
		const orgList = nextProps.orgList;
		let selectedKeys = [];
		if(nextProps.selectedKeys && nextProps.selectedKeys.length > 0){
			selectedKeys = nextProps.selectedKeys;
		}
		if(selectedKeys.length === 0){
			selectedKeys = orgList.length === 0?[]:[orgList[0].fid];
		}

		let expandedKeys = nextProps.expandedKeys || [];
		if(expandedKeys.length === 0){
			if(orgList.length >0){
				expandedKeys = [''+orgList[0].fid]
			}
		}

        this.setState({
        	visible: nextProps.visible === false?false:true,
			showTreeData: orgList,
        	orgTreeData: orgList,
			selectedKeys: selectedKeys,
			expandedKeys: expandedKeys
        })
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
				const {orgTreeData, searchValue} = this.state;
				//loopFilterChildren会改变数据结构
				let tem = JSON.parse(JSON.stringify(orgTreeData));
				this.expandedKeysTem = [];
				const showTreeData = tem.filter(item => {
					return this.loopFilterChildren(item, searchValue);
				});
				this.setState({
					expandedKeys: this.expandedKeysTem,
					autoExpandParent: true,
					showTreeData
				});
				console.log(this.expandedKeysTem, showTreeData)
			}, 500)
		}
	};

	// loop 过滤子节点
	loopFilterChildren = (item, searchValue) => {
		if(searchValue === '') {
			this.expandedKeysTem.push(item.fid);
			return true;
		}
		// 判断根节点是否满足
		if(item.fname.indexOf(searchValue) > -1) {
			this.expandedKeysTem.push(item.fid);
			return true;
		}
		// 根据长度判断子节点是否满足
		if(item.children){
			//这里会改变原数据结构
			item.children = item.children.filter(child => {
				// 子节点的根节点是否满足
				if(child.fname.indexOf(searchValue) > -1) {
					this.expandedKeysTem.push(child.fid);
					return true;
				}
				// 子节点的子节点是否满足 loop
				if(child.children){
					return this.loopFilterChildren(child);
				}
			})
			// 子节点长度 需要展开的节点
			if(item.children.length > 0){
				this.expandedKeysTem.push(item.fid);
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
	onSelectOrg(fids){

		if(fids && fids.length >0){
			this.setState({
				selectedKeys: fids
			});

			this.props.onSelectOrg(fids, getNode(fids[0], this.state.orgTreeData));
		}else{

			this.props.onSelectOrg(this.state.selectedKeys, getNode(this.state.selectedKeys[0], this.state.orgTreeData));
		}
	}


	render(){
		const { searchValue, expandedKeys, autoExpandParent, showTreeData, orgTreeData, selectedKeys} = this.state;


	    const loop = data => data.map((item) => {
			const index = item.fname.indexOf(searchValue);
	      	const beforeStr = item.fname.substr(0, index);
	      	const afterStr = item.fname.substr(index + searchValue.length);

	      	const fname = index > -1 ? (
		        <span>
		          {beforeStr}
		          <span style={{ color: '#f50' }}>{searchValue}</span>
		          {afterStr}
		        </span>
		    ) : <span>{item.fname}</span>;

	      	if (item.children) {
		        return (
		          <TreeNode key={item.fid} title={fname}>
		            {loop(item.children)}
		          </TreeNode>
		        );
			}
	      	return <TreeNode key={item.fid} title={fname} />;
		});

	    if(this.state.visible){
	    	return (
	    		<div className="orgTree" style={this.style}>
					{
						this.showSearch?(
							<Search 
								value={searchValue} 
								onChange={(e) => this.onChange(e.target.value)}
								onSearch={(v) => this.onChange(v)} 
								className="searchTree" 
								placeholder="请输入企业名称/纳税人识别号"
								style={{ width: '88%', justifySelf: 'center' }}
							/>
						):null
					}
				    <Tree
			          	onExpand={this.onExpand}
	          			expandedKeys={expandedKeys}
	          			autoExpandParent={autoExpandParent}
			         	selectedKeys = {selectedKeys}
			         	onSelect={this.onSelectOrg}
			        >
			          {loop(showTreeData)}
			        </Tree>
			  	</div>
	    	)
	    }else{
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


