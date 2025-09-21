import React from 'react';
import { connect } from 'dva';

import OrgTree from '../orgTree2.0/';

import './orgTreeLayout.css';



function getParentId(fid, tree, result = []) {

	for (let i = 0; i < tree.length; i++) {
		const node = tree[i];
		const tempFid = node.fid;
		if (tempFid == fid) {
			return [tempFid.toString()];
		} else {
			if (result.indexOf(tempFid + '') === -1 && tempFid != fid) {
				result.push(tempFid.toString());
			}

			const node = tree[i];
			if (node.children.length > 0) {
				const subResult = getParentId(fid, node.children, result);
				if (subResult && subResult.length > 0) {
					return result.concat(subResult);
				} else {
					result.splice(result.indexOf(tempFid.toString()));
				}
			} else {
				result = [];
			}

		}
	}
};

function OrgTreeLayout({ location, children, className = '', onSelectOrg = f => f, currentOrgId = '', orgList, beforeSelectOrg }) {

	return (
		<div className={className === "" ? "orgTreeLayoutNew" : "orgTreeLayoutNew " + className}>
			<div className="layoutInner">
				<div className="orgTreeContent">
					<div className="orgTreeWrapperTd">
                        <OrgTree showSearch={true} onSelectOrg={onSelectOrg} selectedKey={currentOrgId} expandedKeys={[]} />
					</div>
					<div className="wrapperContent" valign="top">
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}

function mapStateToProps(state) {
	const { orgList } = state.org;
	return {
		orgList
	};
}

export default connect(mapStateToProps)(OrgTreeLayout);