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
	constructor(){
		super(...arguments);
		this.onSelectOrg = this.onSelectOrg.bind(this);
		
		const orgList = this.props.orgList || [];
		let selectedKeys = [];
		if(this.props.selectedKeys && this.props.selectedKeys.length > 0){
			selectedKeys = this.props.selectedKeys; 
		}
		
		if(selectedKeys.length === 0){
			selectedKeys = orgList.length === 0?[]:[orgList[0].fid];
		}
		
		let expandedKeys = this.props.expandedKeys || [];
		if(expandedKeys.length === 0){
			if(orgList.length >0){
				expandedKeys = [''+orgList[0].fid]
			}
		}
		
		this.showSearch = this.props.showSearch === true?true:false;
		this.style = this.props.style || {};
		this.state = {
			visible: this.props.visible === false?false:true,
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
        	orgTreeData: orgList,
			selectedKeys: selectedKeys,
			expandedKeys: expandedKeys,
        })
    }
	
	onChange = (e) => {
	    const value = e.target.value;
	    const expandedKeys = dataList.map((item) => {
	    	if (item.fname.indexOf(value) > -1) {
	        	return getParentKey(item.fname, gData);
	      	}
	      	return null;
	    }).filter((item, i, self) => item && self.indexOf(item) === i);
	    
    	this.setState({
	      	expandedKeys,
	      	searchValue: value,
	      	autoExpandParent: true,
    	});
	}
	
	onExpand = (expandedKeys) => {
	    this.setState({
	    	expandedKeys,
	    	autoExpandParent: true,
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
		const { searchValue, expandedKeys, autoExpandParent, orgTreeData, selectedKeys} = this.state;
		
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
		          <TreeNode key={item.fid} title={item.fname}>
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
							<Search style={{ marginBottom: 8 }} onChange={this.onChange} className="searchTree" placeholder="搜索组织树"/>
						):null
					}
				    <Tree
			          	onExpand={this.onExpand}
	          			expandedKeys={expandedKeys}
	          			autoExpandParent={true}		          
			         	selectedKeys = {selectedKeys}
			         	onSelect={this.onSelectOrg}
			        >
			          {loop(orgTreeData)}
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
	
  	
