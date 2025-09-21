import { login, forwardUrl, getGxPublicKey, clearGovCookie } from './loginToGov';
import { kdRequest, paramJson, cookieHelp } from '@piaozone.com/utils';
import {createJsonpCallback, sleep, createFpdkHeader} from './tools';

const {setCookie, getCookie, clearCookie} = cookieHelp;

const defaultPageSize = 100;

const aoDataDict = {
    'dkgxquery': (i)=> [{"name":"sEcho","value":1},{"name":"iColumns","value":15},{"name":"sColumns","value":",,,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13},{"name":"mDataProp_14","value":14}],
    'dkycckznxfpmx': (i)=>[{"name":"sEcho","value":1},{"name":"iColumns","value":14},{"name":"sColumns","value":",,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13}],
    'dkycfpmx': (i)=>[{"name":"sEcho","value":1},{"name":"iColumns","value":15},{"name":"sColumns","value":",,,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13},{"name":"mDataProp_14","value":14}],
    'dkmx': (i)=>[{"name":"sEcho","value":1},{"name":"iColumns","value":14},{"name":"sColumns","value":",,,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12},{"name":"mDataProp_13","value":13}],
    'ckznxmx': (i)=>[{"name":"sEcho","value":1},{"name":"iColumns","value":13},{"name":"sColumns","value":",,,,,,,,,,,,"},{"name":"iDisplayStart","value":i},{"name":"iDisplayLength","value":defaultPageSize},{"name":"mDataProp_0","value":0},{"name":"mDataProp_1","value":1},{"name":"mDataProp_2","value":2},{"name":"mDataProp_3","value":3},{"name":"mDataProp_4","value":4},{"name":"mDataProp_5","value":5},{"name":"mDataProp_6","value":6},{"name":"mDataProp_7","value":7},{"name":"mDataProp_8","value":8},{"name":"mDataProp_9","value":9},{"name":"mDataProp_10","value":10},{"name":"mDataProp_11","value":11},{"name":"mDataProp_12","value":12}]
}

const getInvoiceType = function(code){
    if(code === '01'){ //增值税专用发票
        return 4;
    }else if(code === '02'){ //货运专用发票

    }else if(code === '03'){ //机动车销售发票
        return 12;
    }else if(code === '14'){ //通行费电子发票
        return 15;
    }else{ //默认专票
        return 4;
    }
}


function dkgxQueryTransformData(allData, rzzt){
	var tax_period = ''; //认证属期
	if(rzzt == '1'){
		let skssq = getCookie('skssq');
		skssq = decodeURIComponent(skssq);
		tax_period = skssq.split(';')[0];
	}
	
    return {
            'invoiceType': getInvoiceType(allData[9]), //转换为发票云发票类型
            'invoiceCode': allData[1],          //发票代码            
            'invoiceNo': allData[2],          //发票号码
            'invoiceDate': allData[3],          //开票日期                          
            'salerName': allData[4],        //销方名称
            'invoiceAmount': allData[5],          //不含税金额            
            'taxAmount': allData[6],            //税额
            'invoiceStatus': allData[8],          //发票状态0正常，2作废，4异常，1失控，3红冲，5、认证异常
            'checkFlag': allData[11],         //是否勾选
            'selectTime': allData[12] || '',         //勾选时间
            'checkAuthenticateFlag': '',      //是否勾选认证
            'selectAuthenticateTime': '',      //勾选认证时间
            'scanAuthenticateFlag': '0',      //是否扫码认证
            'scanAuthenticateTime': '',       //扫码认证时间
            'salerTaxNo': '',    //销方税号
            'taxPeriod': ''
    }    
}


function lssqTransformData(allData, rzyf, status=0){
	return {
            'invoiceType': getInvoiceType(allData[1]),                 //进项只会有纸质专票            
            'invoiceCode': allData[1],          //发票代码            
            'invoiceNo': allData[2],          //发票号码
            'invoiceDate': allData[3],          //开票日期
            'salerName': allData[4],        //销方名称
            'invoiceAmount': allData[5],          //不含税金额            
            'taxAmount': allData[6],            //税额
            'invoiceStatus': status,          //发票状态 //0正常，2作废，4异常，1失控，3红冲，5、认证异常
            'checkFlag': '1',         //是否勾选
            'selectTime': allData[8] || '',         //勾选时间
            'checkAuthenticateFlag': '1', //是否勾选认证
            'selectAuthenticateTime': allData[8] || '',      //勾选认证时间
            'scanAuthenticateFlag': '0',      //是否扫码认证
            'scanAuthenticateTime': '',       //扫码认证时间
            'salerTaxNo': '',    //销方税号
            'taxPeriod': rzyf
    }
}



function concatInvoices(invoiceArr, invoiceArr2){
    const invoiceCodeNos = invoiceArr.map((item)=>{
        return item.invoiceCode + item.invoiceNo;
    });

    const filterDats = invoiceArr2.filter((item) => {
        const k = item.invoiceCode + item.invoiceNo;        
        return invoiceCodeNos.indexOf(k) === -1;
    });

    return invoiceArr.concat(filterDats);    
}


function computeInvoicesInfo(invoices){
    let totalMoney = 0.00;
    let taxAmount = 0.00;
    let invoiceAmount = 0.00;

    for(let i=0;i<invoices.length; i++){
        taxAmount +=parseFloat(invoices[i].taxAmount);
        invoiceAmount +=parseFloat(invoices[i].invoiceAmount);
        totalMoney +=parseFloat(invoices[i].invoiceAmount) + parseFloat(invoices[i].taxAmount);
    }

    return {totalAmount: totalMoney.toFixed(2), totalTaxAmount: taxAmount.toFixed(2), invoiceAmount: invoiceAmount.toFixed(2)};
}


/*
 * 采集勾选查询发票
 */
export async function dkgxquery({baseUrl, stepHandler=f=>f, dataIndex='', searchOpt, retry=0}){
	var ymbb = getCookie('ymbb');
    let govToken = getCookie('govToken');
    if(!govToken){
    	return {errcode: '7009', description: 'CA认证失效，请重新CA登录！'};
    }
    
    let currentPage = searchOpt.currentPage || 0;
    const pageSize = searchOpt.pageSize || defaultPageSize;
    
    let curIndex = dataIndex || 0;
    let goOn = dataIndex === '' ? true: false;
    let totalMoney = 0.00;
    let result = {errcode: '0000', data: []};
    let invoices = [];
    
    const paramTemp = {
        'id': 'dkgxquery',
        'fphm':searchOpt.fphm || '',
        'fpdm':searchOpt.fpdm || '',            
        'rq_q':searchOpt['rq_q'],    //未认证时为开始开票日期，已认证时为开始确认或扫描日期 
        'rq_z':searchOpt['rq_z'],    //未认证时为结束开票日期，已认证时为结束确认或扫描日期           
        'xfsbh':searchOpt['xfsbh'] || '',  //销方税号        
        'fpzt':searchOpt['fpzt'] || '-1', //-1全部，0正常，2作废，4异常，1失控，3红冲，5、认证异常
        'fplx':searchOpt['fplx'] || '-1',  //-1全部，01增值税专用发票，02货运专用发票，03机动车发票，14通行费发票
        'rzzt': searchOpt['rzzt'] || '0', //0未认证，1已认证 
        'glzt': searchOpt['glzt'] || '-1', //管理状态
        'cert': searchOpt.cert,
        'token': govToken,
        'aoData': aoDataDict['dkgxquery'](curIndex),
        ymbb
    };
	

    do {        
        await sleep();

        let resCollect = await kdRequest({
        	url: forwardUrl,
            timeout: 60000,
            data: {            	
                requestUrl: baseUrl + 'dkgx.do?callback=' + createJsonpCallback(),                 
                requestData: paramJson(paramTemp),
                requestMethod: 'POST',
                headers: createFpdkHeader(baseUrl)
            },
            method: 'POST'
        })
        
        if(resCollect.errcode === '0000' && resCollect.data){
            const jsonData = resCollect.data;
            const key1 = jsonData.key1;
            if(key1 === "00"){
            	goOn = false;
                result = {'errcode':'1000','description':'查询失败！'+jsonData.key2, data: []};                
            }else if(key1 == "200"){
                const key3 = jsonData.key3;
                const newToken = jsonData.key2;
                setCookie('govToken', newToken);
                govToken = newToken;
                var key4 = jsonData.key4;
                if(key3){
                    const invoiceData = key3.aaData;
                    const invoiceDataLen = invoiceData.length;
                    if(invoiceDataLen > 0){
                        const datas = [];
                        for(let i=0;i<invoiceDataLen;i++){
                            const item = dkgxQueryTransformData(invoiceData[i], searchOpt['rzzt']);
                            datas.push(item);
                            totalMoney +=parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                        }

                        stepHandler({errcode:'0000', data: datas, searchOpt, dataIndex: curIndex, dataFrom: 'dkgxquery'});
                        invoices = invoices.concat(datas);
                        curIndex +=invoiceDataLen;
                    }
                    const totalNum = key2.iTotalRecords;
                    
                    if(totalNum>0){
                        if(curIndex >= totalNum){
                            goOn = false;
                        }else{
                            currentPage +=1;
                        }
                    }else{
                        goOn = false;
                        result =  {'copies':0,'errcode':'0000', totalMoney, 'description':'暂时没有可收取的发票', data: invoices};                        
                    }
                }                
            //税局token失效
            }else if(key1 === '09'){
                retry = 4;
				goOn = false;
				clearGovCookie();
                result = {'errcode':'7009', 'description': 'CA认证失效，请重新登录税控！'};
            }else if(key1 === '888'){
                goOn = false;
                retry = 4;
				clearGovCookie();
                result = {'errcode':'888', 'description': '操作频繁，请稍后再试！'};
            }else{
                goOn = false;
                result = {'errcode':'8000', 'description': '税局收票出现异常'};
            }
        }else{
            goOn = false;
            result = {'errcode':'8000', 'description': '税局收票出现异常'};
        }

    }while(goOn);

    if(result.errcode === '0000'){
        return {
            'errcode':'0000',
            'data':invoices,
            'description':'success',                                            
            'totalMoney': totalMoney.toFixed(2),
            'copies': invoices.length,
            'startDate': searchOpt['rq_q'], 
            'endDate': searchOpt['rq_z']
        };
    }else{
        if(retry > 3){
            stepHandler({'errcode': result.errcode, data: [], description: result.description, searchOpt, dataIndex: curIndex, dataFrom: 'dkgxquery'});
            return result;
        }else{
            return await dkgxquery({baseUrl, searchOpt, stepHandler}, retry+1);
        }
    }
}



//抵扣统计数据查询
export async function dktjQuery({baseUrl, searchOpt, dataIndex='', stepHandler = f=>f}, retry=0){
	let govToken = getCookie('govToken');
    if(!govToken){
    	return {errcode: '7009', description: 'CA认证失效，请重新CA登录！'};
    }
    
	var ymbb = getCookie('ymbb');
    const cert = searchOpt.cert;
	const id = searchOpt.id || 'dkmx';
    let result = {errcode: '0000', data: []};
       
    let skssq = getCookie('skssq');
    skssq = decodeURIComponent(skssq);
    const tax_period = skssq.split(';')[0];

   	let invoices = [];
   	let totalMoney = 0.00;
   	let curIndex = dataIndex || 0;
   	let totalNum = 0;   	
   	let curYear = '';
   	let curMonthInt = '';
   	let nextYear = '';
   	let nextMonthInt = '';
   	let maxYear = '';
   	let maxMonthInt = '';
   	
   	let tempDateArr = [];
   	
   	tempDateArr = searchOpt['rq_q'].split('-');
	curYear = parseInt(tempDateArr[0]);
	let curMonth = tempDateArr[1]; 
	curMonthInt = parseInt(curMonth);
   	
	tempDateArr = searchOpt['rq_z'].split('-');
	
	
   	let currentDate = new Date();
   	maxYear = currentDate.getFullYear();
   	
   	maxMonthInt = currentDate.getMonth() + 1;
	
	let limitMaxYear = maxYear;
	let limitMaxMonth = maxMonthInt;

	if(tempDateArr[0] && tempDateArr[1]){
		limitMaxYear = parseInt(tempDateArr[0]);
		limitMaxMonth = parseInt(tempDateArr[1]);
	}
	
	let tjyf = '';
    let stopFlag = dataIndex === '' ? false: true; //指定查询某一数据索引开始的100条数据，则不循环采集
    
   	do {
   		curIndex = dataIndex || 0;
	   	nextYear = curMonthInt>11?curYear+1: curYear;
	   	nextMonthInt = curMonthInt>11?1:curMonthInt + 1;
	   	const nextMonth = nextMonthInt>9?nextMonthInt:'0'+nextMonthInt;
	   	
		tjyf = curYear + '' + curMonth;
	   	
	   	do {
            let searchParam = {
                id: id, //当前所属期使用hgjksmx
                cert,
                token: govToken,
                tjyf,
                fpdm: '',
                fphm: '',                
                ymbb,
                qt: tjyf === tax_period?'dq':'wq', //当前税期
                aoData: aoDataDict[id](curIndex)
            };

            if( id === 'dkmx'){
                searchParam.xfsbh = '';
                searchParam.qrrzrq_q = '';
                searchParam.qrrzrq_z = '';
                searchParam.fply = 0;
            }else if(id === 'ckznxmx'){
                searchParam.zmbh = '';
                searchParam.xfsbh = '';
                searchParam.qrrzrq_q = '';
                searchParam.qrrzrq_z = '';
                searchParam.fply = 0;
            }else if(id === 'dkycfpmx'){
                searchParam.kprq_q = '';
                searchParam.kprq_z = '';
            }else if(id === 'dkycckznxfpmx'){
                searchParam.zmbh = '';
                searchParam.kprq_q = '';
                searchParam.kprq_z = '';
            }
			
            await sleep();
            
			let resCollect = await kdRequest({
	        	url: forwardUrl,
	            timeout: 60000,
	            data: {                
	                requestUrl: baseUrl + 'dktj.do?callback=' + createJsonpCallback(),
	                requestData: paramJson(searchParam),
                    requestMethod: 'POST',
                    headers: createFpdkHeader(baseUrl)
	            },
	            method: 'POST'
	        })
		    
		    if(resCollect.errcode === '0000'){
		        const jsonData = resCollect.data;
		        
		        const key1 = jsonData.key1;
		        if(key1 === "00"){
		            result = {'errcode':'1000','description':'查询失败！'+jsonData.key2, data: []};
		        }else if(key1 === '200'){
		        	const newToken = jsonData.key2;
		            setCookie('govToken', newToken);
		            govToken = newToken;
		            const invoiceData = jsonData.key3.aaData;		            
		            const invoiceDataLen = invoiceData.length;
		            
		            if(invoiceDataLen > 0){
                        const datas = [];
		                for(let i=0;i<invoiceDataLen;i++){
                            const item = lssqTransformData(invoiceData[i], tjyf);
                            datas.push(item);
                            totalMoney +=parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);                             
                        }

                        stepHandler({'errcode': '0000', data: datas, dataIndex: curIndex, dataFrom: 'dktjQuery', searchOpt: {...searchOpt, rq_q: curYear + '-' + curMonth + '-01'} });

                        invoices = invoices.concat(datas);
                                        
		                curIndex +=invoiceDataLen;
		            }
		            
		            totalNum = jsonData.key2.iTotalRecords;   
		            
		        }else if(key1 === '09'){
                    retry = 4;
                    stopFlag = true;
                    clearGovCookie();
                    result = {'errcode':'888', 'description': 'CA认证失效，请重新CA登录！'};
                }else if(key1 === '888'){ //操作太频繁不再重试
                    retry = 4;
                    stopFlag = true;
                    clearGovCookie();
                    result = {'errcode':'888', 'description': '操作频繁，请稍后再试！'};                    
                }
		    }else{
		    	result = {'errcode': resCollect.errcode,'description': resCollect.description, data: [], copies: 0, totalMoney: 0.00};
            }
            
		}while(curIndex < totalNum && !stopFlag);
		
		curYear = nextYear;
		curMonth = nextMonth;
	   	curMonthInt = nextMonthInt;
	   	
   	}while(!stopFlag && (nextYear<limitMaxYear || (nextYear==limitMaxYear && nextMonthInt <=limitMaxMonth)))
   	
	//如果采集发票为空，尝试重新获取三次
	if(result.errcode === '0000'){
        return { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length};
	}else{
		if(retry >3){
            const rq_q = dataIndex === ''?searchOpt.rq_q:(tjyf.substr(0, 4) + '-' + tjyf.substr(4, 2) + '-01');
            stepHandler({'errcode': result.errcode, data: [], description: result.description, dataIndex: curIndex, dataFrom: 'dktjQuery', searchOpt: {...searchOpt, rq_q: rq_q} });
			return result;
		}else{
			return await dktjQuery({baseUrl, searchOpt, stepHandler}, retry+1);
		}
	}
}


async function dktjQueryAll({baseUrl, searchOpt, dataIndex='', stepHandler = f=>f}){
    let res = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
    if(!searchOpt.id){
        //抵扣统计查询
        let tempRes = await dktjQuery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, id: 'dkmx'}} );   

        if(tempRes.errcode === '0000'){
            colRes3.data = concatInvoices(colRes3.data, tempRes.data);
        }

        tempRes = await dktjQuery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, id: 'ckznxmx'}} );

        if(tempRes.errcode === '0000'){
            res.data = concatInvoices(colRes3.data, tempRes.data);
        }

        tempRes = await dktjQuery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, id: 'dkycfpmx'}} );

        if(tempRes.errcode === '0000'){
            res.data = concatInvoices(colRes3.data, tempRes.data);
        }

        tempRes = await dktjQuery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, id: 'dkycckznxfpmx'}} );

        if(tempRes.errcode === '0000'){
            res.data = concatInvoices(colRes3.data, tempRes.data);
        }
    }else{
        res = await dktjQuery({baseUrl, stepHandler, dataIndex, searchOpt});
    }    

    return res;
}


//查询进项发票数据
export async function query({passwd='', ptPasswd='', searchOpt, dataIndex, dataFrom='', stepFinish}){
	
	if(passwd === ''){
		return {errcode:'3000', description:'CA密码不能为空！'};
    }
    
    const res = await login({passwd, ptPasswd});
       
    const stepHandler = (d) =>{
        if(typeof stepFinish === 'function'){
            try {
                stepFinish(d);
            } catch (error) {
                console.warn(error);
            }
        }
    }
	
   	let invoices = [];
   	
   	if(res.errcode === '0000'){
   		var ymbb = getCookie('ymbb');
   		const baseUrl = res.data.baseUrl;   		
   		searchOpt.cert = res.data.taxNo;
   		let colRes1 = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
   		let colRes2 = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
   		let colRes3 = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
           
   		const rzzt = searchOpt.rzzt || '';
   		//如果为空，表示采集所有发票
   		if(rzzt === ''){
            if(dataFrom === ''){
                //抵扣勾选界面全部未勾选
                colRes1 = await dkgxquery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, rzzt: '0'}});	   		
                //抵扣勾选界面全部已勾选
                colRes2 = await dkgxquery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, rzzt:'1'}});
                //抵扣统计查询
                colRes3 = await dktjQueryAll({baseUrl, stepHandler, dataIndex, searchOpt}); 
                
            }else if(dataFrom === 'dkgxquery'){
                //发票勾选界面全部未认证数据
                colRes1 = await dkgxquery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, rzzt: '0'}});
                //发票勾选界面全部已认证数据
                colRes2 = await dkgxquery({baseUrl, stepHandler, dataIndex, searchOpt: {...searchOpt, rzzt:'1'}});
            }else if(dataFrom === 'dktjQuery'){
                colRes3 = await dktjQueryAll({baseUrl, searchOpt, stepHandler, dataIndex});
            }
	   		
   		}else if(rzzt === '0'){
            colRes1 = await dkgxquery({baseUrl, searchOpt, stepHandler, dataIndex}); 			
   		}else if(rzzt === '1'){
            colRes3 = await dktjQueryAll({baseUrl, searchOpt, stepHandler, dataIndex});
   		}
   		
   		if(colRes1.errcode === '0000' && colRes1.data.length >0){
   			invoices = concatInvoices(invoices, colRes1.data);
   		}
   		
   		if(colRes2.errcode === '0000' && colRes2.data.length >0){
   			invoices = concatInvoices(invoices, colRes2.data);
   		}
   		
   		if(colRes3.errcode === '0000' && colRes3.data.length > 0){
   			invoices = concatInvoices(invoices, colRes3.data);
   		}
   		
   		
   		if(colRes1.errcode !== '0000' && colRes2.errcode !== '0000' && colRes3.errcode !== '0000'){   			
   			return colRes1;
   		}else{
            const totalInfo = computeInvoicesInfo(invoices);
   			return {
   				errcode: '0000',
   				data: invoices,
   				copies: invoices.length,
                totalMoney: totalInfo.totalAmount,
                ...totalInfo
   			}
   		}   		
   	}else{
   		return res;
   	}
    
}