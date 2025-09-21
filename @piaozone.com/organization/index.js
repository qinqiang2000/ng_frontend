
const BackendLayout = require('./src/components/backendLayout/');
///const Login = require('./src/components/login/');

const loginModel = require('./src/models/login');
const OrgTreeLayout = require('./src/components/orgTreeLayout/');
const OrgTree = require('./src/components/orgTree');
const MenuLeft = require('./src/components/menuLeft/');
const SellerTop = require('./src/components/sellerTop/');
const menuConfig = require('./src/components/menuLeft/menuConfig');

// 涉及到灰度发布测试，等决定全面替换时再合并
const NewOrgTreeLayout = require('./src/components/orgTreeLayout2.0/');
const NewOrgTree = require('./src/components/orgTree2.0');

module.exports = {
	BackendLayout: BackendLayout.default,	
	OrgTreeLayout: OrgTreeLayout.default,
	loginModel: loginModel.default,
	OrgTree: OrgTree.default,
	SellerTop: SellerTop.default, 
	MenuLeft: MenuLeft.default,
	menuConfig: menuConfig.default,
	NewOrgTreeLayout: NewOrgTreeLayout.default,
	NewOrgTree: NewOrgTree.default
};