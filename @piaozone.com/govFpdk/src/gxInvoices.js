import {			
	ymbb
} from './diskOperate';

import {getCityNameByTaxNo, getBaseUrl} from '@piaozone.com/swjgInfo';

import { login, forwardUrl, getGxPublicKey, govCacheSeconds} from './loginToGov';
import {fpgxQuery} from './queryIncomeInvoice';
import { kdRequest, paramJson, cookieHelp} from '@piaozone.com/utils';
import moment from 'moment';

const {setCookie, getCookie, clearCookie} = cookieHelp;
const defaultPageSize = 100;


const fpdkHeaders = {
	'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
	'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	'Accept-Encoding': 'gzip, deflate',
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',	
	'Connection': 'Keep-Alive',
	'Cache-Control': 'no-cache'	
}
//确认税控所属期
export async function gxConfirmSkssq({taxNo, companyName, passwd, ptPasswd}){
    const city = getCityNameByTaxNo(taxNo);    
    if(!city){
        return {errcode:'taxNoErr', description: '纳税人识别号有误'};
    }
    
    let res = await sessionOutHandler({taxNo, companyName, passwd, ptPasswd});
    if(res.errcode !== '0000'){
        return res;
    }
    
    const {govToken, govCompanyType, invoiceToken} = res;
    
    res = await kdRequestAsync({
        url: forwadUrl,
        data: {
            city,
            requestURI: 'SbsqWW/hqssq.do',
            requestMethod: 'GET',
            requestData: encodeURIComponent(param({
                callback: 'jQuery' + (+ new Date()),
                cert: taxNo,
                token: govToken,
                ymbb: ymbb
            }))
        },
        method: 'POST'
    });
    
    if(res.errcode !== '0000'){
        return res;
    }
    
    if(res.data && res.data.indexOf('jQuery') !== -1){
        const resData = res.data.replace(/^jQuery[0-9_]+\(/, '').replace(/\)$/, '');
        const e = JSON.parse(resData);
        const t = e.key1;            
        if('01' === t){
            var tempToken = e.key2;
            var tempCookssq = e.key3;                
            const skssqs = tempCookssq.split(';');                
            setCookie("govToken", tempToken, govCacheSeconds);
            setCookie("skssq", tempCookssq, govCacheSeconds);
            setCookie("gxrqfw", e.key4, govCacheSeconds);
        }
    }
    
}

function getMinMaxDate(kprqs){
	let minDateIndex = 0;
	let maxDateIndex = 0;
	
	for(let i=1;i<kprqs.length;i++){
		const curDate = +new Date(kprqs[i]);
		const maxDate = +new Date(kprqs[maxDateIndex]);
		const minDate = +new Date(kprqs[minDateIndex]);
		
		if(curDate > maxDate){
			maxDateIndex = i;
		}
		
		if(curDate <minDate){
			minDateIndex = i;
		}		
	}
	
	return {min: kprqs[minDateIndex], max: kprqs[maxDateIndex]};
}

//从勾选结果中比较是否勾选状态是否变化。
function findGxResult(fpdms, fphms, target){
	const len = fpdms.length;
	const rLen = target.length;
	const result = {};
	const errorList = [];
	
	for(let i=0; i<len; i++){
		let flag = false;
		const fpdm = fpdms[i];
		const fphm = fphms[i];
		for(let j=0;j<rLen;j++){
			if(target[j].invoiceCode === fpdm && target[j].invoiceNo === fphm){
				flag = true;
				break;
			}		
		}
		if(!flag){
			errorList.push({fpdm, fphm});	
		}
				
	}
	
	if(errorList.length === 0){
		return {errcode: '0000', description:'success'};
	}else{
		return {errcode: '2000', data: errorList, description: '发票勾选保存失败！'};
	}
}

/*
 * 勾选发票
 */

export async function gx(gxInfos){
    const {passwd, ptPasswd, fpdm, fphm, kprq, zt} = gxInfos;
    const newZt = [];
    const fpdms = fpdm.split('=');
    
    if(zt === '0'){
    	for(let i=0;i<fpdms.length;i++){
    		newZt.push('0');
    	}    	
    }else if(zt === '1'){
    	for(let i=0;i<fpdms.length;i++){
    		newZt.push('1');
    	}
    }else{
    	return {errcode: '3001', description: '勾选参数错误!'};
    }
    
    const loginRes = await login({passwd, ptPasswd});
    if(loginRes.errcode !== '0000'){
    	return loginRes;
    }
    
    const { baseUrl, companyType, taxNo} = loginRes.data;
    let govToken = getCookie('govToken');
    
    if(companyType !== '03'){
    	return {errcode: '8001', description: '一般纳税人才能进行该操作!'}
    }
    
    
    let res = await getGxPublicKey({
    	govToken, 
    	baseUrl, 
    	taxNo, 
    	funType:'02'
    });
    
    if(res.errcode !== '0000'){
        return res;
    }
    
    const {publickey, ts} = res;
    
	const searchParam = paramJson({                
        fpdm,
        fphm,
        kprq,
        zt: newZt.join('='),
        callback: 'jQuery' + (+ new Date()),
        cert: taxNo,
        token: govToken,
        ts,
        publickey,
        ymbb
   	});
   	
	res = await kdRequest({
    	url: forwardUrl,
        timeout: 30000,
        data: {                
            requestUrl: baseUrl + 'SbsqWW/gxtj.do?' + searchParam,            
            requestData: {},
            requestMethod: 'GET'
        },
        method: 'POST'
    })
    
    if(res.errcode === '0000'){        
        const jsonData = res.data;
        const key1 = jsonData.key1;
        const resultTip = {'errcode':'3003','description':''};
        
        if(key1 === '001'){
            resultTip.description = '数据保存失败！';  
        }else if(key1 === '000'){
            setCookie("govToken", jsonData.key2, govCacheSeconds);
            const minMaxDate = getMinMaxDate(kprq.split('='));
            
            const fpcyRes = await fpgxQuery({
				baseUrl,				
				searchOpt: {
					cert: taxNo,
					rzzt: '0', // ''全部，'0'未认证，'1'已认证
					gxzt: zt,
			    	rq_q: minMaxDate.min,
			    	rq_z: minMaxDate.max
				}
			});
			
			if(fpcyRes.errcode === '0000'){
				const findResult = findGxResult(fpdms, fphm.split('='), fpcyRes.data);				
				if(findResult.errcode === '0000'){
					resultTip.errcode = '0000'; 
            		resultTip.description = '发票勾选保存成功！<br/>对于已勾选的发票，您还需要在“确认勾选”模块进行确认提交操作，完成发票的勾选认证';		
				}else{
					resultTip.errcode = '3004',
					resultTip.data = findResult.data;
				}
				
			}else{
				//勾选成功，但比对结果获取发票列表时失败
				resultTip.errcode = fpcyRes.errcode; 
           		resultTip.description = fpcyRes.description;	
			}
			
            
        }else if(key1 === '09'){
            clearCookie("govToken");
            resultTip.description = '会话超时，请重试！';
        }else if(key1 === '98'){
            resultTip.description = '外网调用内网异常，请重试！';
        }else{
            resultTip.description = '系统异常，错误代码为:' + key1;
        }
        return resultTip;
    }else{
        return res;
    }    
}

function getFpdkCookies(){
	const skssq = getCookie('skssq');
    const gxrqfw = getCookie('gxrqfw');
    const dqrq = moment().format('YYYY-MM-DD');
    const nsrmc = getCookie('nsrmc');
    const token = getCookie('govToken');
    
    if(token && skssq && gxrqfw){
    	return 'skssq='+ skssq +'; gxrqfw='+ gxrqfw +'; dqrq='+ dqrq +'; nsrmc='+ nsrmc +'; token=' + token;
    }else{
    	return false;
    }
}

//勾选确认发票列表数据获取
export async function getGXConfirmList(gxInfos, retry=0){
	const {passwd, ptPasswd, qrzt='1'} = gxInfos;    
    
    let loginRes = await login({passwd, ptPasswd});
    
    if(loginRes.errcode !== '0000'){
    	return loginRes;
    }
    
    const { baseUrl, companyType, taxNo} = loginRes.data;
    let govToken = getCookie('govToken');
    
    if(companyType !== '03'){
    	return {errcode: '8001', description: '一般纳税人才能进行该操作!'}
    }
    let index = 0;
    let totalNum = 0;
    let invoices = [];
    let result = {};
    let totalInvoiceAmount = 0.00;
    let totalTaxAmount = 0.00;
    let totalAmount = 0.00;
    
    do {
    	let searchParam = paramJson({
			id: 'queryqrjg',
			qrzt,
			key1: taxNo,
			key2: govToken,
			ymbb
		});
		
    	searchParam +='&aoData=%5B%7B%22name%22%3A%22sEcho%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22iColumns%22%2C%22value%22%3A11%7D%2C%7B%22name%22%3A%22sColumns%22%2C%22value%22%3A%22%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%22%7D%2C%7B%22name%22%3A%22iDisplayStart%22%2C%22value%22%3A'+ index +'%7D%2C%7B%22name%22%3A%22iDisplayLength%22%2C%22value%22%3A'+ defaultPageSize +'%7D%2C%7B%22name%22%3A%22mDataProp_0%22%2C%22value%22%3A0%7D%2C%7B%22name%22%3A%22mDataProp_1%22%2C%22value%22%3A1%7D%2C%7B%22name%22%3A%22mDataProp_2%22%2C%22value%22%3A2%7D%2C%7B%22name%22%3A%22mDataProp_3%22%2C%22value%22%3A3%7D%2C%7B%22name%22%3A%22mDataProp_4%22%2C%22value%22%3A4%7D%2C%7B%22name%22%3A%22mDataProp_5%22%2C%22value%22%3A5%7D%2C%7B%22name%22%3A%22mDataProp_6%22%2C%22value%22%3A6%7D%2C%7B%22name%22%3A%22mDataProp_7%22%2C%22value%22%3A7%7D%2C%7B%22name%22%3A%22mDataProp_8%22%2C%22value%22%3A8%7D%2C%7B%22name%22%3A%22mDataProp_9%22%2C%22value%22%3A9%7D%2C%7B%22name%22%3A%22mDataProp_10%22%2C%22value%22%3A10%7D%5D'
    	
    	const res = await kdRequest({
	    	url: forwardUrl,
	    	timeout: 30000,
	    	method: 'POST',
	    	data: {
	    		headers: {
	    			...fpdkHeaders,
	    			'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
					'Cookie': getFpdkCookies()
	    		},
	    		requestUrl: baseUrl + 'SbsqWW/qrgx.do?ymbb='+ ymbb +'&callback=' + 'jQuery'+ (+ new Date()),
	    		requestMethod: 'POST',
	    		requestData: searchParam
	    	}
	    });
	    
	    if(res.errcode === '0000'){
	    	const jsonData = res.data;	        
	        const key1 = jsonData.key1;
	        if(key1 === '00'){
	        	result = {'errcode':'1000','description':'查询失败！'+jsonData.key2, data: []};
	        }else if(key1 === '01'){	        	
	        	const newToken = jsonData.key3;
	            setCookie('govToken', newToken);
	            const invoiceData = jsonData.key2.aaData;	            
	            const invoiceDataLen = invoiceData.length;
	            if(invoiceDataLen > 0){
                    for(let i=0;i<invoiceDataLen;i++){
                        invoices.push({
                        	invoiceCode: invoiceData[i][1],
                        	invoiceNo: invoiceData[i][2], 
                        	invoiceDate: invoiceData[i][3],
                        	invoiceAmount: invoiceData[i][5],
                        	taxAmount: invoiceData[i][6]
                        });
                        
                        totalInvoiceAmount +=parseFloat(invoiceData[i][5]);
                        totalTaxAmount +=parseFloat(invoiceData[i][6]);
                        totalAmount +=parseFloat(invoiceData[i][5]) + parseFloat(invoiceData[i][6]);
                    }
                    index +=invoiceDataLen;
                }
	            totalNum = jsonData.key2.iTotalRecords;
	            
	        }else if(key1 === '09'){
	        	clearCookie('govToken');
	        	result = {'errcode':'1000','description':'CA登录失效！', data: []};
	        }
	    }
    }while(index < totalNum);
    
    result = { data: invoices, errcode: '0000', description: 'success', totalTaxAmount: totalTaxAmount.toFixed(2), totalInvoiceAmount: totalInvoiceAmount.toFixed(2), totalAmount: totalAmount.toFixed(2)};
    if(invoices.length !== 0){
   		return result;
   	}else{
   		if(retry > 3){
   			return result;
   		}else{
	   		return await getGXConfirmList(gxInfos, retry+1);
	   	}
   	}
    
}


//获取确认汇总信息 POST
export async function getGXSumaryInfo(gxInfos){
    const {passwd, ptPasswd, baseUrl} = gxInfos;    
    
    let res = await login({passwd, ptPasswd});
    if(res.errcode !== '0000'){
        return res;
    }
    
    const taxNo = res.data.taxNo;
    let govToken = res.data.govToken;
    const defatultTip = {errcode: 'err', description:'获取汇总信息出现异常'};
    
    res = await kdRequest({
    	url: forwardUrl,
        timeout: 30000,
        data: {   
        	headers: {
    			...fpdkHeaders,
    			'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
				'Cookie': getFpdkCookies()
    		},
            requestUrl: baseUrl + 'SbsqWW/qrgx.do',            
            requestData: paramJson({                
                callback: 'jQuery'+ (+ new Date()),
                id:'queryqrhz',
                key1: taxNo, 
                key2: govToken, 
                ymbb
            }),
            requestMethod: 'POST',    
        },
        method: 'POST'
    })
    
    if(res.errcode !== '0000'){
        return res;
    }
    
    if(res.data){
        const e = res.data;
        const t = e.key1;
        const s = e.key2;
        const o = e.key4;
        if(t === '00'){
            defatultTip.errcode = 'err';
            defatultTip.description = '获取汇总信息异常，请稍后重试！';
        }else if('01' === t){
            if('' !== s){                               
                if((Number(o) > 0)){
                    let ljhzxxfs = s;
                    var r = s.split("*");
                    var i = r[0].split("~");
                    let bchxzzfs = r[0];
                    var a = r[1].split("~");
                    ljhzxxfs = r[1];
                    const signature = r[2];
                    govToken = e.key3;
                    setCookie("govToken", govToken, govCacheSeconds);
                    defatultTip.errcode = '0000';
                    defatultTip.data = {signature, bchxzzfs, ljhzxxfs, hasData: true};
                    defatultTip.description = '';
                }else{                                                                  
                    defatultTip.description = '当前没有可以确认的数据！';
                    defatultTip.errcode = '0000';
                    defatultTip.data = {hasData: false};
                }
            }
        }else if('09' === t){
            clearCookie("govToken");
            defatultTip.description = '税局请求超时，请重试';
        }
    }
    return defatultTip;
}


//查询申报状态
export async function querysbzt({passwd, ptPasswd}){
	let loginRes = await login({passwd, ptPasswd});
    if(loginRes.errcode !== '0000'){
        return res;
    }
    
    const {govToken, taxNo, baseUrl, companyType} = loginRes.data;
    
    if(companyType !== '03'){
    	return {errcode: '8001', description: '一般纳税人才能进行该操作!'}
    }
    
    const skssqs = decodeURIComponent(getCookie('skssq')).split(';');
    
    const res = await kdRequest({
    	url: forwardUrl,
        timeout: 30000,
        data: {     
        	headers: {
    			...fpdkHeaders,
    			'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
				'Cookie': getFpdkCookies()
    		},
            requestUrl: baseUrl + 'SbsqWW/qrgx.do?callback=' + 'jQuery'+ (+ new Date()),          
            requestData: 'id=querysbzt&key1='+ taxNo +'&key2=' + govToken+ '&ymbb=' + ymbb,
            requestMethod: 'POST'
        },
        method: 'POST'
    });
    if(res.errcode === '0000'){
    	const t = res.data;
		const s = t.key1;
		const o = t.key2;
		const data = {skssq: skssqs};
		if("0" == o){
			return {errcode: '7002', description: '查询您税款所属期' + skssqs[0] + '的申报状态出现异常，请稍后再试'};
		}else if("01" == s && "3" == o){
			return {errcode: 'sbztUnkown', data, description: '因未能获取到您税款所属期' + skssqs[0] + '的申报结果状态，请您选择是否已完成税款所属期'};
		}else if("01" == s && "2" == o){
			return {errcode: 'sbztFinish', data, description: '平台获取到您税款所属期' + skssqs[0] + '的申报工作已完成，本批次发票请您在下期进行勾选认证操作!'};
		}else if("01" == s && "1" == o){
			return {errcode: 'sbztUnkown', data, description: '因未能获取到您税款所属期' + skssqs[0] + '的申报结果信息有延迟，请您选择是否已完成税款所属期'};
		}else{
			return {errcode: '8001', data, description: '获取申报状态异常，请重试'};
		}
    }else{
    	return res;
    }
	
}

//选择已申报时，需要回滚所有已勾选发票到未勾选状态
export async function rollback({passwd, ptPasswd}){
	
	let loginRes = await login({passwd, ptPasswd});
    if(loginRes.errcode !== '0000'){
        return res;
    }
    
    const {govToken, taxNo, baseUrl, companyType} = loginRes.data;
    
    if(companyType !== '03'){
    	return {errcode: '8001', description: '一般纳税人才能进行该操作!'}
    }
    
    const skssqs = decodeURIComponent(getCookie('skssq')).split(';');
    
    const res = await kdRequest({
    	url: forwardUrl,
        timeout: 30000,
        data: {     
        	headers: {
    			...fpdkHeaders,
    			'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
				'Cookie': getFpdkCookies()
    		},
            requestUrl: baseUrl + 'SbsqWW/qrgx.do?callback=' + 'jQuery'+ (+ new Date()),          
            requestData: 'id=rollback&key1='+ taxNo +'&key2=' + govToken+ '&ymbb=' + ymbb,
            requestMethod: 'POST'
        },
        method: 'POST'
    });
    
    if(res.errcode === '0000'){
    	const e = res.data;
    	const t = e.key1;
		if("01" == t){
			clearCookie("govToken");
			setCookie("govToken", e.key2, govCacheSeconds);
			setCookie("skssq", e.key3, govCacheSeconds);
			
			return {errcode: '0000', description: 'success'};
		}else if('09' == t){
			clearCookie("govToken");
			return {errcode: '1300', description: 'CA会话失效，请重试！'};
		}else{
			return {errcode: '1300', description: '更换您的税款所属期出现异常，请重试!'};
		}
    }else{
    	return res;
    }
	
}

/*
 * 勾选确认
 */
export async function gxConfirm(gxInfos){
	
	const {passwd, ptPasswd, fpdm, fphm} = gxInfos;
	let sbzt = gxInfos.sbzt || '';
	let res = await login({passwd, ptPasswd}, true);
    if(res.errcode !== '0000'){
        return res;
    }
    
    const {govToken, taxNo, baseUrl, companyType} = res.data;
    
    if(companyType !== '03'){
    	return {errcode: '8001', description: '一般纳税人才能进行该操作!'}
    }
    
    const skssqs = decodeURIComponent(getCookie('skssq')).split(';');
    
    if(skssqs[0] !== skssqs[2] ){
    	if(sbzt === '3'){
    		return {'errcode': 'stopGoOn', description: '请先确定当前税控所属期的申报状态，再进行确认！'};
    	}else{
    		const sbztRes = await querysbzt({passwd, ptPasswd});
    		
    		//获取申报状态
	    	if(sbztRes.errcode === 'sbztUnkown' && sbzt !== '1' && sbzt !== '2'){    		
	    		return sbztRes;
	    	}else if(sbzt.errcode === 'sbztFinish'){
	    		sbzt = '2';
	    	}else if(sbzt === ''){
	    		return sbztRes;
	    	}
	    	
	    	/*暂时屏蔽，回滚数据后续测试
	    	//选择已申报完成, 需要将已勾选的发票回滚到未勾选状态
	    	if(sbzt === '2'){
	    		const rollbackRes = await rollback({passwd, ptPasswd});
	    		if(rollbackRes.errcode !== '0000'){
	    			return rollbackRes;
	    		}
	    	}
	    	*/
    	}
    	
    }
    
    const sumaryRes = await getGXSumaryInfo({passwd, ptPasswd, baseUrl});
    
    if(sumaryRes.errcode !== '0000'){
    	return sumaryRes;
    }
    
    const {signature, hasData} = sumaryRes.data;
    
    if(!hasData){
    	return {errcode:'3000', description: '当前没有可以确认的发票!'};
    }
    
    const searchParam = paramJson({
        id:'commitqrxx', 
        key1: taxNo, 
        key2: getCookie('govToken'), 
        signature, 
        ymbb
    });
    
    res = await kdRequest({
    	url: forwardUrl,
        timeout: 30000,
        data: {
        	headers: {
    			...fpdkHeaders,
    			'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
				'Cookie': getFpdkCookies()
    		},
            requestUrl: baseUrl + 'SbsqWW/qrgx.do?callback=' + 'jQuery'+ (+ new Date()),            
            requestData: searchParam,
            requestMethod: 'GET'
        },
        method: 'POST'
    })
    
    
    if(res.errcode === '0000'){
    	setCookie("govToken", res.token, govCacheSeconds);          
    }
    return res;   
    
}