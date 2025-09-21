import {
	setOperateUrl,	
	getTaxInfoFromDisk,
	ymbb
} from './diskOperate';

import {getCityNameByTaxNo, getBaseUrl} from '@piaozone.com/swjgInfo';

import { login, forwardUrl, getGxPublicKey } from './loginToGov';
import { kdRequest, paramJson, cookieHelp } from '@piaozone.com/utils';

const {setCookie, getCookie, clearCookie} = cookieHelp;

const defaultPageSize = 100;

function transformData(allData){
    return {
            
            'invoiceCode': allData[1],          //发票代码
            'invoiceType': '4',                 //进项只会有纸质专票
            'invoiceNo': allData[2],          //发票号码
            'invoiceDate': allData[3],          //开票日期                          
            'salerName': allData[4],        //销方名称
            'invoiceAmount': allData[5],          //不含税金额            
            'taxAmount': allData[6],            //税额
            'invoiceStatus': allData[7],          //发票状态
            'checkFlag': allData[8],         //是否勾选
            'selectTime': allData[9] || '',         //勾选时间
            'checkAuthenticateFlag': allData[10] || '',      //是否勾选认证
            'selectAuthenticateTime': allData[11] || '',      //勾选认证时间
            'scanAuthenticateFlag': allData[12] || '',      //是否扫码认证
            'scanAuthenticateTime': allData[13] || '',       //扫码认证时间
            'salerTaxNo': allData[14]    //销方税号            
    }    
}

function transRzformData(allData){
	return {            
            'invoiceCode': allData[1],          //发票代码
            'invoiceType': '4',                 //进项只会有纸质专票
            'invoiceNo': allData[2],          //发票号码
            'invoiceDate': allData[3],          //开票日期                          
            'salerName': allData[4],        //销方名称
            'invoiceAmount': allData[5],          //不含税金额            
            'taxAmount': allData[6],            //税额
            'invoiceStatus': allData[10] === '正常'?'0':'0',          //发票状态
            'checkFlag': '0',         //是否勾选
            'selectTime': '',         //勾选时间
            'checkAuthenticateFlag': allData[7] === '勾选认证'? '1':'0', //是否勾选认证
            'selectAuthenticateTime': allData[7] === '勾选认证'?allData[8]:'',      //勾选认证时间
            'scanAuthenticateFlag': allData[7] === '扫描认证'?'1':'0',      //是否扫码认证
            'scanAuthenticateTime': allData[7] === '扫描认证'?allData[8]:'',       //扫码认证时间
            'salerTaxNo': ''    //销方税号            
    }
}

function transOldRzformData(allData){
	return {            
            'invoiceCode': allData[1],          //发票代码
            'invoiceType': '4',                 //进项只会有纸质专票
            'invoiceNo': allData[2],          //发票号码
            'invoiceDate': allData[3],          //开票日期                          
            'salerName': allData[4],        //销方名称
            'invoiceAmount': allData[5],          //不含税金额            
            'taxAmount': allData[6],            //税额
            'invoiceStatus': allData[7] == '0'?'0':'0',          //发票状态
            'checkFlag': '0',         //是否勾选
            'selectTime': '',         //勾选时间
            'checkAuthenticateFlag': '0', //是否勾选认证
            'selectAuthenticateTime': '',      //勾选认证时间
            'scanAuthenticateFlag': '0',      //是否扫码认证
            'scanAuthenticateTime': '',       //扫码认证时间
            'salerTaxNo': allData[8] || ''    //销方税号            
    }
}

/*
 * 采集发票
 */
export async function fpgxQuery({baseUrl, searchOpt, rzzt='0'}){    
    let govToken = getCookie('govToken');
    if(!govToken){
    	return {errcode: '7009', description: 'CA认证失效，请重新CA登录！'};
    }
    
    let currentPage = searchOpt.currentPage || 0;
    const pageSize = searchOpt.pageSize || defaultPageSize;
    const cert = searchOpt.cert;    
    
    let curIndex = 0;
    let goOn = true;
    let totalMoney = 0.00;
    let result;
    let invoices = [];
    
    const paramTemp = {
        'callback': 'jQuery' +(+ new Date()),
        'fphm':searchOpt.fphm || '',
        'fpdm':searchOpt.fpdm || '',            
        'rq_q':searchOpt['rq_q'],    //未认证时为开始开票日期，已认证时为开始确认或扫描日期 
        'rq_z':searchOpt['rq_z'],    //未认证时为结束开票日期，已认证时为结束确认或扫描日期           
        'xfsbh':searchOpt['xfsbh'] || '',  //销方税号
        'fpzt':searchOpt['fpzt'] || '-1', //-1全部，0正常，2作废，4异常，1失控，3红冲
        'fplx':searchOpt['fplx'] || '-1',  //-1全部，01增值税专用发票，02货运专用发票，03机动车发票，14通行费发票
        'rzzt': searchOpt['rzzt'] || '0', //0未认证，1已认证        
    };
    
    if(paramTemp.rzzt === '0'){ //未认证    	
    	paramTemp.gxzt = searchOpt.gxzt || '-1'; // -1全部，0未勾选，1已勾选
    	paramTemp.rzfs = '';
    }else if(paramTemp.rzzt === '1'){ //已认证
    	paramTemp.gxzt = '';
    	paramTemp.rzfs = searchOpt['rzfs'] || '-1'; // -1全部，0勾选认证，1扫描认证
    }
    
    do {
               
        let searchParam = paramJson(paramTemp) + '&cert='+ cert +'&token='+ govToken +'&aoData=%5B%7B%22name%22%3A%22sEcho%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22iColumns%22%2C%22value%22%3A14%7D%2C%7B%22name%22%3A%22sColumns%22%2C%22value%22%3A%22%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%22%7D%2C%7B%22name%22%3A%22iDisplayStart%22%2C%22value%22%3A'+ currentPage*defaultPageSize +'%7D%2C%7B%22name%22%3A%22iDisplayLength%22%2C%22value%22%3A'+ pageSize +'%7D%2C%7B%22name%22%3A%22mDataProp_0%22%2C%22value%22%3A0%7D%2C%7B%22name%22%3A%22mDataProp_1%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22mDataProp_2%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22mDataProp_3%22%2C%22value%22%3A3%7D%2C%7B%22name%22%3A%22mDataProp_4%22%2C%22value%22%3A4%7D%2C%7B%22name%22%3A%22mDataProp_5%22%2C%22value%22%3A5%7D%2C%7B%22name%22%3A%22mDataProp_6%22%2C%22value%22%3A6%7D%2C%7B%22name%22%3A%22mDataProp_7%22%2C%22value%22%3A7%7D%2C%7B%22name%22%3A%22mDataProp_8%22%2C%22value%22%3A8%7D%2C%7B%22name%22%3A%22mDataProp_9%22%2C%22value%22%3A9%7D%2C%7B%22name%22%3A%22mDataProp_10%22%2C%22value%22%3A10%7D%2C%7B%22name%22%3A%22mDataProp_11%22%2C%22value%22%3A11%7D%2C%7B%22name%22%3A%22mDataProp_12%22%2C%22value%22%3A12%7D%2C%7B%22name%22%3A%22mDataProp_13%22%2C%22value%22%3A13%7D%5D&ymbb=' + ymbb;
        
        let resCollect = await kdRequest({
        	url: forwardUrl,
            timeout: 30000,
            data: {            	
                requestUrl: baseUrl + 'SbsqWW/gxcx.do?' + searchParam,                   
                requestData: {},
                requestMethod: 'GET'
            },
            method: 'POST'
        })
        
        if(resCollect.errcode === '0000' && resCollect.data){
            const jsonData = resCollect.data;
            const key1 = jsonData.key1;
            if(key1 === "00"){   
            	goOn = false;
                result = {'errcode':'1000','description':'查询失败！'+jsonData.key2, data: []};                
            }else if(key1 === "01"){
                const key2 = jsonData.key2;
                const newToken = jsonData.key3;
                setCookie('govToken', newToken);
                govToken = newToken;
                var key4 = jsonData.key4;                           
                if(key2 !== ""){                                                
                    const invoiceData = key2.aaData;
                    const invoiceDataLen = invoiceData.length;
                    if(invoiceDataLen > 0){
                        for(let i=0;i<invoiceDataLen;i++){
                            invoices.push(transformData(invoiceData[i]));                            
                            totalMoney +=parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);                   
                        }
                        curIndex +=invoiceDataLen;
                    }
                    
                    const totalNum = key2.iTotalRecords;         
                    
                    if(totalNum>0){
                        if(curIndex >= totalNum){
                            result = {
                                'errcode':'0000',
                                'data':invoices,
                                'description':'success',                                            
                                'totalMoney': totalMoney.toFixed(2),
                                'copies': totalNum, 
                                'startDate': searchOpt['rq_q'], 
                                'endDate': searchOpt['rq_z']
                            }; 
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
                goOn = false;
                result = {'errcode':'7009', 'description': 'CA认证失效，请重新登录税控！'};  
            }else{
                goOn = false;
                result = {'errcode':'8000', 'description': '税局收票出现异常'};                
            }
        }else{
            goOn = false;
            result = {'errcode':'8000', 'description': '税局收票出现异常'};            
        }         
    }while(goOn);
    
    return result;
}


//采集往期认证和未到认证期的发票
export async function wdqInvoiceQuery({baseUrl, searchOpt}, retry=0){
	
	let govToken = getCookie('govToken');
    if(!govToken){
    	return {errcode: '7009', description: 'CA认证失效，请重新CA登录！'};
    }
    const cert = searchOpt.cert;
   	let result = {};
   	let invoices = [];
   	let totalMoney = 0.00;
   	let curIndex = 0;
   	let totalNum = 0;
   	
   	const resKey = await getGxPublicKey({govToken, baseUrl, taxNo: cert, funType:'03'});
   	const {ts, publickey} = resKey;
   	
   	let paramStr = paramJson({
   		callback: 'jQuery' +(+ new Date()),
   		kprq_q: searchOpt['rq_q'],
   		kprq_z: searchOpt['rq_z'],
   		fphm: searchOpt['fpdm'] || '',
   		fpdm: searchOpt['fphm'] || '',
   		cxfw: 1,
   		cert: cert,
   		token: govToken,
   		ymbb,
   		ts,
   		publickey
   	});
   	
   	do {
   		
	   	let searchParam =  paramStr + '&aoData='+encodeURIComponent('[{\"name\":\"sEcho\",\"value\":1},{\"name\":\"iColumns\",\"value\":8},{\"name\":\"sColumns\",\"value\":\",,,,,,,\"},{\"name\":\"iDisplayStart\",\"value\":'+ curIndex +'},{\"name\":\"iDisplayLength\",\"value\": 100},{\"name\":\"mDataProp_0\",\"value\":0},{\"name\":\"mDataProp_1\",\"value\":1},{\"name\":\"mDataProp_2\",\"value\":2},{\"name\":\"mDataProp_3\",\"value\":3},{\"name\":\"mDataProp_4\",\"value\":4},{\"name\":\"mDataProp_5\",\"value\":5},{\"name\":\"mDataProp_6\",\"value\":6},{\"name\":\"mDataProp_7\",\"value\":7}]');
	   	
		let resCollect = await kdRequest({
        	url: forwardUrl,
            timeout: 30000,
            data: {                
                requestUrl: baseUrl + 'SbsqWW/fpcx.do?' + searchParam,            
                requestData: {},
                requestMethod: 'GET'
            },
            method: 'POST'
        })
	    
	    if(resCollect.errcode === '0000'){
	        const jsonData = resCollect.data;	        
	        const key1 = jsonData.key1;                           
	        if(key1 === "00"){
	            result = {'errcode':'1000','description':'查询失败！'+jsonData.key2, data: []};
	        }else if(key1 === '01'){	        	
	        	const newToken = jsonData.key3;
	            setCookie('govToken', newToken);
	            govToken = newToken;
	            const invoiceData = jsonData.key2.aaData;
	            
	            const invoiceDataLen = invoiceData.length;
	            
	            if(invoiceDataLen > 0){
	                for(let i=0;i<invoiceDataLen;i++){
	                    invoices.push(transOldRzformData(invoiceData[i]));                            
	                    totalMoney +=parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);                   
	                }
	                curIndex +=invoiceDataLen;
	            }	            
	            totalNum = jsonData.key2.iTotalRecords;
	        }
	    }else{
	    	result = {'errcode': resCollect.errcode,'description': resCollect.description, data: [], copies: 0, totalMoney: 0.00};
	    }
	}while(curIndex < totalNum);
	
	result = { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length};
   	if(invoices.length !== 0){
   		return result;
   	}else{
   		if(retry > 3){
   			return result;
   		}else{
	   		return await wdqInvoiceQuery({baseUrl, searchOpt}, retry+1)
	   	}
   	}	
}

//查询已经有申报结果的发票
export async function dktjQuery({baseUrl, searchOpt}, retry=0){
	let govToken = getCookie('govToken');
    if(!govToken){
    	return {errcode: '7009', description: 'CA认证失效，请重新CA登录！'};
    }
	
    const cert = searchOpt.cert;
    
   	let result = {};
   	let invoices = [];
   	let totalMoney = 0.00;
   	let curIndex = 0;
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
   	
   	let tjyf = '';
   	
   	do {
   		curIndex = 0;
	   	nextYear = curMonthInt>11?curYear+1: curYear;	   	
	   	nextMonthInt = curMonthInt>11?1:curMonthInt + 1;
	   	const nextMonth = nextMonthInt>9?nextMonthInt:'0'+nextMonthInt;
	   	
		tjyf = curYear + '' + curMonth;
	   	
	   	do {
		   	let searchParam = 'cert=' + cert;
		    searchParam +='&callback=jQuery' + (+ new Date()),
			searchParam +='&token=' + govToken;
			searchParam +='&tjyf=' + tjyf;
			searchParam +='&oper=cx&fpdm=&fphm=&xfsbh=&qrrzrq_q=&qrrzrq_z=&fply=0';
			searchParam +='&ymbb=' + ymbb;
			
			searchParam +='&aoData='+ encodeURIComponent('[{\"name\":\"sEcho\",\"value\":1},{\"name\":\"iColumns\",\"value\":11},{\"name\":\"sColumns\",\"value\":\",,,,,,,,,,\"},{\"name\":\"iDisplayStart\",\"value\":'+ curIndex +'},{\"name\":\"iDisplayLength\",\"value\":50},{\"name\":\"mDataProp_0\",\"value\":0},{\"name\":\"mDataProp_1\",\"value\":1},{\"name\":\"mDataProp_2\",\"value\":2},{\"name\":\"mDataProp_3\",\"value\":3},{\"name\":\"mDataProp_4\",\"value\":4},{\"name\":\"mDataProp_5\",\"value\":5},{\"name\":\"mDataProp_6\",\"value\":6},{\"name\":\"mDataProp_7\",\"value\":7},{\"name\":\"mDataProp_8\",\"value\":8},{\"name\":\"mDataProp_9\",\"value\":9},{\"name\":\"mDataProp_10\",\"value\":10}]');	
		    
			let resCollect = await kdRequest({
	        	url: forwardUrl,
	            timeout: 30000,
	            data: {                
	                requestUrl: baseUrl + 'SbsqWW/dktj.do?' + searchParam,          
	                requestData: {},
	                requestMethod: 'GET'
	            },
	            method: 'POST'
	        })
		    
		    if(resCollect.errcode === '0000'){
		        const jsonData = resCollect.data;
		        
		        const key1 = jsonData.key1;                           
		        if(key1 === "00"){
		            result = {'errcode':'1000','description':'查询失败！'+jsonData.key2, data: []};
		        }else if(key1 === '01'){	        	
		        	const newToken = jsonData.key3;
		            setCookie('govToken', newToken);
		            govToken = newToken;
		            const invoiceData = jsonData.key2.aaData;
		            
		            const invoiceDataLen = invoiceData.length;
		            
		            if(invoiceDataLen > 0){
		                for(let i=0;i<invoiceDataLen;i++){
		                    invoices.push(transRzformData(invoiceData[i]));                            
		                    totalMoney +=parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);                   
		                }
		                curIndex +=invoiceDataLen;
		            }
		            
		            totalNum = jsonData.key2.iTotalRecords;   
		            
		        }
		    }else{
		    	result = {'errcode': resCollect.errcode,'description': resCollect.description, data: [], copies: 0, totalMoney: 0.00};
		    }
		}while(curIndex < totalNum);
		
		curYear = nextYear;
		curMonth = nextMonth;
	   	curMonthInt = nextMonthInt;
	   	
   	}while(nextYear<maxYear || (nextYear==maxYear && nextMonthInt <=maxMonthInt))
   	
	result = { data: invoices, errcode: '0000', description: 'success', totalMoney: totalMoney, copies: invoices.length};
	
	//如果采集发票为空，尝试重新获取三次
	if(invoices.length !== 0){
		return result;
	}else{
		if(retry >3){
			return result;
		}else{
			return await dktjQuery({taxNo, companyName, passwd, ptPasswd, searchOpt}, retry+1);	
		}
	}	
}

//查询进项发票数据
export async function query({passwd='', ptPasswd='', searchOpt}){
	if(passwd === ''){
		return {errcode:'3000', description:'CA密码不能为空！'};
	}
   	const res = await login({passwd, ptPasswd});
   	
   	let invoices = [];
   	let copies = 0;
   	let totalMoney = 0.00;
   	
   	if(res.errcode === '0000'){
   		const baseUrl = res.data.baseUrl;   		
   		searchOpt.cert = res.data.taxNo;
   		let colRes1 = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
   		let colRes2 = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
   		let colRes3 = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
   		let colRes4 = {errcode: '0000', data:[], copies:0, totalMoney:0.00};
   		const rzzt = searchOpt.rzzt || '';
   		//如果为空，表示采集所有发票
   		if(rzzt === ''){
   			//发票勾选界面全部未认证数据
	   		colRes1 = await fpgxQuery({baseUrl, searchOpt: {...searchOpt, rzzt: '0'}});
	   		
	   		//发票勾选界面全部已认证数据
	   		colRes2 = await fpgxQuery({baseUrl, searchOpt: {...searchOpt, rzzt:'1'}});
	   		//抵扣统计查询已认证
	   		colRes3 = await dktjQuery({baseUrl, searchOpt});
	   		
	   		//未到期发票查询
	   		colRes4 = await wdqInvoiceQuery({baseUrl, searchOpt});
   		}else if(rzzt === '0'){
   			colRes1 = await fpgxQuery({baseUrl, searchOpt});
   			colRes4 = await wdqInvoiceQuery({baseUrl, searchOpt});
   		}else if(rzzt === '1'){   			
	   		colRes2 = await fpgxQuery({baseUrl, searchOpt});	   		
	   		colRes3 = await dktjQuery({baseUrl, searchOpt});
   		}
   		
   		
   		if(colRes1.errcode === '0000' && colRes1.data.length >0){
   			invoices = colRes1.data;
   			copies = colRes1.copies;
   			totalMoney = parseFloat(colRes1.totalMoney);
   		}
   		
   		if(colRes2.errcode === '0000' && colRes2.data.length >0){
   			invoices = invoices.concat(colRes2.data);
   			copies +=colRes2.copies;
   			totalMoney = totalMoney + parseFloat(colRes2.totalMoney);
   		}
   		
   		if(colRes3.errcode === '0000'){
   			invoices = invoices.concat(colRes3.data);
   			copies +=colRes3.copies;
   			totalMoney = totalMoney + parseFloat(colRes3.totalMoney);
   		}
   		
   		if(colRes4.errcode === '0000'){
   			invoices = invoices.concat(colRes4.data);
   			copies +=colRes4.copies;
   			totalMoney = totalMoney + parseFloat(colRes4.totalMoney);
   		}
   		totalMoney = totalMoney.toFixed(2);
   		
   		if(colRes1.errcode !== '0000' && colRes2.errcode !== '0000' && colRes3.errcode !== '0000' && colRes4.errcode !== '0000'){   			
   			return colRes1;
   		}else{
   			return {
   				errcode: '0000',
   				data: invoices,
   				copies,
   				totalMoney 
   			}
   		}   		
   	}else{
   		return res;
   	}
    
}