# 发票无忧税局发票抵扣组件

## 安装
```
$ npm install @piaozone.com/govFpdk --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/govFpdk --registry=http://172.18.1.117:7001
```

## 设置后端地址
```
	loginToGov.setUrls({
		forwardURI: '/portal/forward', 
		authURI: '/portal/companyAuth', 
		caOperateUrl: 'http://127.0.0.1:52320/cryptctl'
	});
	
```


## CA弹出框的使用
```

	<CaCheckDialog 
  	visible={true}  		       	
    onConfirm={this.fpdkCaLogin}  
    confirmLoading={this.state.confirmLoading}
   />

//visible: 是否显示弹出框，
//onConfirm: 弹出框确定事件，会将ca密码和平台密码传入
//confirmLoading: 请求中，防止重复点击

```

## 通过税局企业认证

```

/*
  @fid: 企业组织ID
  @taxNo: 企业税号
  @companyName: 企业名称
  @passwd: 税盘CA密码
  @ptPasswd: 勾选平台密码
  返回
  {
  	"errcode":"0000", 
 	"data": {
 		"gxrqfw": "", //勾选认证范围
 		"skssq": "", //税控所属期
 		"companyType": "", //02小规模，03一般纳税人
 		"govToken": "", //税局token
 		"baseUrl": "", //企业勾选平台根地址
 		"taxNo": "" //税号
 	}	
  }
*/

const res = await loginToGov.companyAuth({
	fid: this.fid, 
	taxNo: ftax_number, 
	companyName:ftax_name, 
	passwd: caPasswd, 
	ptPasswd:ptPasswd
});

```

## 登录税局获取govToken

```
/* 	
	@passwd: 税盘CA密码
  	@ptPasswd: 勾选平台密码
  	返回
	{
	  	"errcode":"0000", 
	 	"data": {
	 		"gxrqfw": "", //勾选认证范围
	 		"skssq": "", //税控所属期
	 		"companyType": "", //02小规模，03一般纳税人
	 		"govToken": "", //税局token
	 		"baseUrl": "", //企业勾选平台根地址
	 		"taxNo": "" //税号
	 	}	
	}
*/

const res = await loginToGov.login({
	passwd:caPasswd, 
	ptPasswd:ptPasswd
});

```

## 税局发票查询收票

```
/* 
 	开票日期必须传入，其它参数为全部时可以不传
 	{
 		"errcode": '0000',
 		"copies": 0, //份数
   		"totalMoney": 0.00, //价税合计金额
 		"data": [{
 			"invoiceCode": '',          		//发票代码
 			"invoiceType": '',         		//进项只会有纸质专票
 			"invoiceNo": '',          		//发票号码
 			"invoiceDate": '',        		//开票日期
 			"salerName": '',          		//销方名称
 			"invoiceAmount": '',      		//不含税金额
 			"taxAmount": '',          		//税额
 			"invoiceStatus": '',      		//发票状态
 			"checkFlag": '',          		//是否勾选
 			"selectTime": '',   				//勾选时间
 			"checkAuthenticateFlag": '',      //是否勾选认证
 			"selectAuthenticateTime": '',     //勾选认证时间
 			"scanAuthenticateFlag": '',      	//是否扫码认证
 			"scanAuthenticateTime": '',       //扫码认证时间
 			"salerTaxNo": ''    				//销方税号	
 		}]
 	}
 	
*/

const res = await queryIncomeInvoice.query({
	passwd: caPasswd,
	ptPasswd,
	searchOpt: {
		xfsbh: '', //销方税号
		rzzt: '', // ''全部，'0'未认证，'1'已认证     
		gxzt: '-1', //勾选状态， // -1全部，0未勾选，1已勾选
		fpzt: '-1', //发票状态 -1全部，0正常，2作废，4异常，1失控，3红冲
		fplx: '-1',  //发票类型 -1全部，01增值税专用发票，02货运专用发票，03机动车发票，14通行费发票
		rzfs: '-1', //认证方式  -1全部，0勾选认证，1扫描认证  		
		rq_q: '2018-05-01', //开票开始日期，如果未已认证，月份作为开始属期到当前属期
		rq_z: '2018-06-30'  //开票结束日期
	}
});

```

## 发票勾选

```
/*
	
	如果勾选税局提示成功, 但没有在已勾选列表中查询到传入的发票，返回 errcode非0000，data里面会返回勾不存在的代码号码列表[{fpdm, fphm}]
	如果勾选税局提示成功, 且在已勾选列表中全部能查到，返回errcode: 0000
	返回格式如下：
	{
		errcode: '0000'		
	}
	或
	{
		errcode: '3004',
		data: [{
			fpdm: '',
			fphm: ''
		}]
	}
*/
const res = await gxInvoices.gx({
	passwd: caPasswd,
	ptPasswd,
	fpdm: '4403181130=4403181130', 
	fphm: '25605306=24991421', 
	kprq: '2018-09-20=2018-09-19', 
	zt:'0' //'0'撤销勾选，'1'发票勾选
});

```

## 发票勾选认证

```

const res = await gxInvoices.gxConfirm({
	passwd: caPasswd,
	ptPasswd,
	sbzt: '' //申报状态，'' 自动判断，1未申报，2已申报
});

//返回如果errcode为：sbztUnkown，就需要用户自己选择申报状态，0000表示勾选认证成功
//res.errcode === 'sbztUnkown'
//res.errcode === '0000'

```

## License

MIT
