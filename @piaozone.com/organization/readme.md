# 发票无忧组织公共层

## 安装
```
$ npm install @piaozone.com/organization --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/organization --registry=http://172.18.1.117:7001
```

## 后台Layout调用方法

```js

//后台Layout获取，已自动失效菜单获取，登录和登出
import { BackendLayout } from '@piaozone.com/organization';

<BackendLayout 
	pageName="basicInfo-orgList"
	contentCls="orgList"
	history={history}
	onSave = {() =>f=>f}	
	navList={
		[{'text':'组织列表 ', 'to':'/'}, {'text':subTitle, 'to':'/'}]
}>

// pageName用于控制菜单的图标和子菜单名称，用-分割
// contentCls 界面的样式类
// history={history} 必须将history传入这个属性，路由跳转需要
// onSave 底部菜单保存事件，如果不传入，底部可以自己控制
// navList 导航面包屑，有to参数的可以点击跳转

```

## 在组件内部获取用户信息

```
function mapStateToProps(state) {  
  const { loginInfo, currentOrgId, currentOrgName } = state.login;
  
  return {
  	loginInfo,
  	currentOrgId, 
  	currentOrgName
  };
}

export default connect(mapStateToProps)(ComName);

// 绑定到具体组件后，即可获取到用户信息
// loginInfo数据格式如下
{
	"uid": 15005532,
	"phoneNumber": "13714803025",
	"nickname": "毕红波",
	"fuserId": 31,
	"system": 1,
	"isOrg": 1,
	"faffiliatedOrgId": 14,
	"faffiliatedOrgname": "ggg",
	"rootOrgId": 14,
	"ftype": 2,
	"rootOrgName": "ggg"
}

//currentOrgId为当前组织Id, currentOrgName为当前组织名称
//login state里面还可以获取到当前所属组织currentBelongOrgId，当前所属组织名称：currentBelongOrgName

```

## 在组件内部获取菜单信息（格式和获取用户信息一致）
```
function mapStateToProps(state) {  
  const { menuInfo } = state.menu;
  
  return {
  	menuInfo
  };
}

export default connect(mapStateToProps)(ComName);

// 绑定到具体组件后，即可获取到菜单信息
// 数据格式如下
[
	{
		"children":[
			{					
				"fid":2,
				"fmenu_name":"sksb",
				"foperator_url":"/business-cms-web/basic/taxDevice",					
				"fpermission_name":"税控设备"
			}
		],
		"fid":1,
		"foperator_url":"",
		"fmenu_name":"basicInfo",
		"fpermission_name":"基础数据"
	}
]

```

## License

MIT
