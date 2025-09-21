import React from 'react';
import { connect } from 'dva';

import OrgTree from '../orgTree/';

import './orgTreeLayout.css';



function getParentId(fid, tree, result=[]){
	
	for (let i = 0; i < tree.length; i++) {
    	const node = tree[i];     	
    	const tempFid = node.fid;
    	if(tempFid == fid){
    		return [tempFid.toString()];
    	}else{
    		if(result.indexOf(tempFid+'') === -1 && tempFid != fid){
    			result.push(tempFid.toString());	
    		} 
    		
	    	const node = tree[i];
	    	if (node.children.length > 0) {		
				const subResult = getParentId(fid, node.children, result);
				if(subResult && subResult.length >0){
					return result.concat(subResult);
				}else{														
					result.splice(result.indexOf(tempFid.toString()));					
				}
			}else{
				result = [];
			}
				
    	}    	
	}			
};

function OrgTreeLayout({ location, children, className='', onSelectOrg=f=>f, currentOrgId=[], orgList}) {
	
	return (
		<div className={className===""?"orgTreeLayout":"orgTreeLayout "+className}>
			<table className="layoutInner">	
				<tbody>
				<tr className="orgTreeContent">
					<td style={{width: 244}} width="244" valign="top" className="orgTreeWrapperTd">
						<div className="orgTreeWrapper">
							<OrgTree onSelectOrg={onSelectOrg} selectedKeys={[currentOrgId]} expandedKeys={getParentId(currentOrgId, orgList)} />
						</div>
					</td>
					<td className="wrapperContent" valign="top">
						{children}
					</td>
				</tr>
				</tbody>
			</table>
    	</div>
	)
}

function mapStateToProps(state) {
  const {orgList} = state.org;
  return {  	
  	orgList
  };
}

export default connect(mapStateToProps)(OrgTreeLayout);