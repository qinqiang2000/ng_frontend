# 发票查验和发票抵扣平台信息获取

## 安装
```
$ npm install @piaozone.com/swjgInfo --registry=http://172.18.1.117:7001
//或者
$ cnpm install @piaozone.com/swjgInfo --registry=http://172.18.1.117:7001

```

## 使用方式

```js
	import { getBaseUrl, getCityNameByTaxNo, getCityInfo, getFpdkCitys } from '@piaozone.com/swjgInfo';

	//根据城市名称获取发票抵扣平台地址	
	getBaseUrl('深圳');
	
	//根据税号获取抵扣平台对应的城市名称
	getCityNameByTaxNo('91440300358768292H');

	//根据城市获取对应的查验平台信息
	const res = getCityInfo('深圳');

	//返回结果
	{
		'code':'4403',
		'sfmc':'深圳',
		'Ip':'https://fpcy.szgs.gov.cn:443',
		'address':'https://fpcy.szgs.gov.cn:443'
	}

	//获取发票抵扣平台的城市列表，可用于用户自主选择城市
	const res = getFpdkCitys();
	
	//res返回结果
	[{
		city: '深圳', //城市名称
		url: 'https://fpdk.szgs.gov.cn/' //发票抵扣平台地址
	}]

```

