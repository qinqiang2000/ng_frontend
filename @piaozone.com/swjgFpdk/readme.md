# 发票无忧税局发票抵扣组件

## 安装

```js

$ npm install @piaozone.com/govFpdk --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/govFpdk --registry=http://172.18.1.117:7001

```

## 设置后端地址

```js
	loginToGov.setUrls({
		forwardURI: '/portal/forward', 
		authURI: '/portal/companyAuth', 
		caOperateUrl: 'http://127.0.0.1:52320/cryptctl'
	});
	
```


## 登录税局获取govToken

```js
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

```js
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
    },
    dataIndex: '', //指定数据的索引index，默认为空，不为空时将从该index采集100条的数据
    dataFrom: '', //默认为空，采集全部数据源，数据来源，支持（fpgxQuery，dktjQuery，wdqInvoiceQuery）
    stepFinish: function(result){
        if(result.errcode === '0000'){
            console.log(result.data) // errcode为0000时，对发票数据进行入库
        }else{
            console.log(result); //{errcode: '', description:'', searchOpt: searchOpt, dataFrom: '', dataIndex: ''}; 可以显示出每次收票的错误，点击时通过searchOpt获取采集发票时的参数
        }
        
    }
});

```

## 发票勾选

```js
/*
	
	如果勾选税局提示成功, 但没有在已勾选列表中查询到传入的发票，返回 errcode非0000，data里面会返回勾不存在的代码号码列表[{fpdm, fphm}]
	如果勾选税局提示成功, 且在已勾选列表中全部能查到，返回errcode: 0000
	返回格式如下：
	{
		errcode: '0000',
		data: {			
			'success': [{
				fpdm: '',
				fphm: ''
			}]
		}		
	}
	或
	{
		errcode: '3004',
		data: {
			'fail': [{
				fpdm: '',
				fphm: '',
			}], 
			'success': [{
				fpdm: '',
				fphm: ''
			}]
		}
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

```js

const res = await gxInvoices.gxConfirm({
	passwd: caPasswd,
	ptPasswd,
	sbzt: '' //申报状态，'' 自动判断，1未申报，2已申报
});

//返回如果errcode为：sbztUnkown，就需要用户自己选择申报状态，0000表示勾选认证成功
//res.errcode === 'sbztUnkown'
//res.errcode === '0000'
//res.errcode === 'noInvoices' //没有需要认证的发票

```

## 获取税盘信息

```js
const {diskOperate} = require('@piaozone.com/swjgFpdk');

const res = diskOperate.getTaxInfoFromDisk(caPasswd, type); //type为71获取税号，27获取企业名称

//res返回格式 {errcode: '0000', data:'result'};

```


## 企业信息查询

```js
	const { companyCredit } = require('@piaozone.com/swjgFpdk');
	
	let res  = await companyCredit.getCompanyCredit({
		passwd: caPasswd,
		ptPasswd: ptPasswd,
		creditUrl: '' //后台的更新地址
	});

	//返回格式

	//20180412 增加显示是否特定企业，纳税人性质是5显示为转登记纳税人，为1且原始纳税人性质为5的、为5的增加显示转登记纳税人认定时间起、转登记纳税人认定时间止

	{
		"errcode": "0000", //'8003', 未查询到信息
		"data": {
			"qymc": '', //企业名称 
			"sbzq": "月", //申报周期，月或季
			"cktsqylx": "", ///出口退税企业类型，可能为空, //1、生成企业，2、外贸企业，3、外综服企业
			"ylqylx": "1",  //1、油类经销企业，2、油类生产企业，3、非油类企业
			"nsrxz": "3", // 1、小规模纳税人，2、转登记纳税人、3、一般纳税人
			"datbsj": "2019-03-10 05:57:56", //档案同步时间
			"nsrxzYs": "5", //原纳税人性质			
			"tdqy": "2", //1、特定企业，2、非特定企业
			"oldsh": "", //旧税号
			"qysh": "91440300358768292H", //企业税号
			"name": "", //办税人员名称
			"tel": "", //办税人员手机号
			"addr": "", //办税人员地址
			"zipcode": "", //办税人员邮编
			"mail": "", //办税人员邮箱地址
			"credit": "B", //纳税信用等级
			"zfjgbs": "", //油类经销企业, 总分机构标识，非油类经销企业为空
			"qcthyqy": "", //油类经销企业，是否乙醇调和油企业,1、是，2、否，非油类经销企业为空
			"rdsjq": "", //转登记纳税人认定时间起
			"rdsjz": "", //转登记纳税人认定时间止
		}
	}




```

## License

MIT
