import {
	setOperateUrl,
	openDevice,
	closeDevice,
	getClientHello,
	getClientAuthCode,
	getTaxInfoFromDisk,
	ymbb
} from './diskOperate';


import {getCityNameByTaxNo, getBaseUrl} from '@piaozone.com/swjgInfo';
import { kdRequest, paramJson } from '@piaozone.com/utils';
import { cookieHelp } from '@piaozone.com/utils';

export let forwardUrl = '/portal/forward';
export let authURI = '/portal/companyAuth';
export const fpdkSecondLogin = '/portal/fpdkLogin';

const {setCookie, getCookie, clearCookie} = cookieHelp;

const retryMax = 3;
export const govCacheSeconds = 3000;
const pwyCacheSeconds = 3600 * 24 * 2.5;
const callbackStr = 'callback=jQuery' + (+ new Date);

const headers = [
	'User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',	
	'Referer: https://fpdk.jsgs.gov.cn:81/',	
	'Host: fpdk.jsgs.gov.cn:81',	
	'Content-Type: application/x-www-form-urlencoded;charset=utf-8',	
	'Connection: Keep-Alive',
	'X-Requested-With: XMLHttpRequest',
	'Cache-Control: no-cache'
];


export function setUrls({forwardURI='/portal/forward', authURI='/portal/companyAuth', caOperateUrl='http://127.0.0.1:52320/cryptctl'}){
	forwardUrl = forwardURI;
	authURI = authURI;
	setOperateUrl(caOperateUrl);
}

async function firstLogin({baseUrl, passwd, city, taxNo, clientHello}, retry=1){
    if(city){        	
    	const res = await kdRequest({
            url: forwardUrl,
            timeout: 30000,
            data: {                
                requestUrl: baseUrl + "SbsqWW/login.do",                    
                requestData: { 'callback':'jQuery'+(+ new Date()),"type": "CLIENT-HELLO", "clientHello": clientHello, "ymbb": ymbb, mmtype:'2', answer:''},
                requestMethod: 'GET'
            },
            method: 'POST'
        });
       	
        if(res){
            if(res.errcode !== '0000'){
                if(retry >retryMax){
                    return res;    
                }else{
                    return await firstLogin({baseUrl, passwd, city, taxNo, clientHello}, retry+1);
                }
                
            }                
            if(res.data){                    
                const resultData = res.data;
                if(resultData.key2 !== ''){
                    return {...resultData, errcode: '0000'};    
                }else{
                    if(retry >retryMax){
                        return {errcode: '8000', description:'企业认证异常，请重试!'};
                    }else{
                        return await firstLogin({baseUrl, passwd, city, taxNo, clientHello}, retry+1);
                    }
                }                
            }else{
                if(retry >retryMax){
                    return {errcode: '8000', description:'税局访问异常'};
                }else{
                    return await firstLogin({baseUrl, passwd, city, taxNo, clientHello}, retry+1);
                }
            }
        }else{
            if(retry >retryMax){
                return {errcode: '8000', description:'税局访问异常'};
            }else{
                return await firstLogin({baseUrl, passwd, city, taxNo, clientHello}, retry+1);
            }
        }
    }     
}

async function getPublicKey(serverRandom, taxNo, funType='01', city){    
	
    const baseUrl = getBaseUrl(city);
    const res = await kdRequest({
        url: forwardUrl,
        timeout: 30000,
        data: {
            requestUrl: baseUrl + "SbsqWW/querymm.do?callback=jQuery" + (+ new Date()) + '&cert=' + taxNo + '&funType=' + funType,
            requestData: {},
            requestMethod: 'GET'
        },
        method: 'POST'        
    })
    
    if(res){
        if(res.errcode !== '0000'){            
            return res;
        }
        
        let twoResData = res.data;        
        
        try{            
            const govPage = twoResData['page'];
            const ts = twoResData['ts'];
            let publickey = '';
            
            if(govPage != ''){
                publickey = window.$.checkTaxno(taxNo, ts, '', govPage, serverRandom);                
            }
            
            return {publickey, ts, errcode: '0000'};
        }catch(e){
            //TODO handle the exception
            return {errcode: '0003', description:'税局验证异常'};
        }
    }
          
}

//获取税控所属期
export async function getQrgycx({govToken, city, taxNo}){	
	//直接请求税局
   	const baseUrl = getBaseUrl(city);
   	if(!baseUrl){
   		return {'errcode':'1000','description':'城市错误', data: []}; 
   	}
   	
   	const p = {'cert': taxNo, 'token': govToken, 'rznf':'', 'ymbb':ymbb};
   	
   	let res = await kdRequest({
        url: forwardUrl,
        timeout: 30000,
        data: {
            requestUrl: baseUrl + 'SbsqWW/qrgycx.do?callback=jQuery' + (+ new Date())+ '&' + paramJson(p),
            requestData: {},
            requestMethod: 'POST'            
        },
        method: 'POST'
   	});
    
    if(res.errcode === '0000'){    	
    	try{
    		res = res.data;
    		if(res.key1 == '01'){
    			const newToken = res.key4;//setCookie('token', res.key4, pwyCacheSeconds);
    			const skssq = res.key5;
	    		const gxrqfw =  res.key6;		    		
	    		return {errcode: '0000', govToken: newToken, gxrqfw, skssq};
    		}else{
    			return {errcode: '8000', description: '获取税控所属期出错'};
    		}
    		
    	}catch(e){
    		//TODO handle the exception
    		return {errcode: '8003', description:'税局验证异常'};	
    	}		    
    }else{
    	return {errcode: '8003', description:'税局验证异常'};
    }
}

export async function getGxPublicKey({govToken, baseUrl, taxNo, funType}){
	
	const res = await kdRequest({
        url: forwardUrl,
        timeout: 30000,
        data: {
            requestUrl: baseUrl + "SbsqWW/querymm.do?callback=jQuery" + (+ new Date()),
            requestData: {cert: taxNo, funType: funType},
            requestMethod: 'POST'            
        },
        method: 'POST'        
    })
   	
   	
    if(res){
        if(res.errcode !== '0000'){
            return res;
        }
        
        let twoResData = res.data;        
        
        try{                          
            const govPage = twoResData['page'];
            const ts = twoResData['ts'];
            let publickey = '';
            if(govPage != ''){ 
                publickey = window.checkInvConf(taxNo, govToken, ts, '', govPage);
            }
            return {publickey, ts, errcode: '0000'};
        }catch(e){
            //TODO handle the exception
            return {errcode: '0003', description:'税局验证异常'};
        }
    }
}

//通过税局登录获取token
async function secondLogin({loginType='auth', fid, companyName, mmtype='', clientAuthCode, serverRandom, ptPasswd, taxNo, ts, publickey, answer='', type=''}, retry=1){
    let param2 = {};
    
    if(mmtype === '1'){
        param2={            
            "type":"CLIENT-AUTH",
            "clientAuthCode":clientAuthCode,
            "serverRandom":serverRandom,
            "password":ptPasswd,
            "cert":taxNo,
            "ymbb":ymbb,
            "ts": ts,                   
            "publickey": publickey,
            "mmtype":"1",
        };
    }else if(mmtype === '2'){
        param2 = {            
            "type": "CLIENT-AUTH",
            "clientAuthCode": clientAuthCode,
            "serverRandom": serverRandom,
            "password": ptPasswd,
            "cert": taxNo,
            "ymbb": ymbb,
            "ts": ts,
            "publickey": publickey,
            "mmtype": "2",
            "answer": answer
        };
    }else{
        param2 = {            
            "type":"CLIENT-AUTH",
            "clientAuthCode":clientAuthCode,
            "serverRandom":serverRandom,
            "password":ptPasswd,
            "ts": ts,
            "publickey": publickey,
            "cert":taxNo,
            "ymbb":ymbb                 
        };
    }
    
    let loginRes;
    if(loginType === 'auth'){
    	loginRes = await kdRequest({
	        url: authURI,        
	        data: {
	        	fid,
	            type,            
	            ftax_number:taxNo,
	            companyName: companyName,            
	            requestUrl: 'SbsqWW/login.do?callback=jQuery' + (+ new Date()),
	            requestData: param2,
	            requestMethod: 'GET'
	        },
	        method: 'POST'
	    });	
    }else{
    	loginRes = await kdRequest({
	        url: fpdkSecondLogin,        
	        data: {	        	
	            requestData: param2	            
	        },
	        method: 'POST'
	    });	
    }
    
   	
    if(loginRes){
        if(loginRes.errcode === '0000'){
            return {errcode: '0000', data: loginRes.data};
        }else if(loginRes.errcode === '0932'){ //税局提示登录有误
            if(retry < retryMax){
                return await secondLogin({loginType, fid, companyName, mmtype, clientAuthCode, serverRandom, ptPasswd, taxNo, ts, publickey, answer, type, city}, retry+1);
            }else{
                return {errcode: '0932', data: loginRes.data, description: '税局验证异常，请重试！'};    
            }            
        }else{            
            return {errcode: '8000', description:loginRes.description};
        } 
    }              
}



/*
 * type客户端登录类型
 * fid商家后台认证时需要传企业fid
 * loginType：为auth时需要前后台台做验证处理, forward转发登录请求
 */
export async function login({passwd='', ptPasswd='', type='', fid='', taxNo='', companyName='', loginType='forward'}, clearFlag=false){
	
	
	if(passwd === ''){
		return {errcode: '3000', description:'税盘密码不能为空!'};
	}
	
	if(clearFlag){
		clearCookie('gxrqfw');
		clearCookie('skssq');
		clearCookie('govCompanyType');
		clearCookie('govToken');
		clearCookie('baseUrl');
		clearCookie('taxNo');
		clearCookie('nsrmc');
	}else{
		const oldToken = getCookie('govToken');
		const gxrqfw = getCookie('gxrqfw');
		const skssq = getCookie('skssq');
    	const companyType = getCookie('govCompanyType');
    	const baseUrl = getCookie('baseUrl');
    	const taxNo = getCookie('taxNo');
    	const nsrmc = getCookie('nsrmc');
		if(oldToken && gxrqfw && skssq && companyType && baseUrl && taxNo && nsrmc){			
	    	return {errcode: '0000', data: {gxrqfw, skssq, companyType, govToken: oldToken, baseUrl, taxNo, nsrmc}};
		}
	}
	
	
    const taxInfo = await getTaxInfoFromDisk(passwd, 71);
    
    if(taxInfo.errcode !== '0000'){            
        return taxInfo;
    }
    
    const diskTaxNo = taxInfo.data;
    
    if(loginType==='auth' && taxNo !== '' && diskTaxNo !== taxNo){
    	return {errcode: 'taxNoErr', description:'请检查税号是否与税盘一致!'};
    }
    
    const comInfo = await getTaxInfoFromDisk(passwd, 27);
    if(comInfo.errcode !== '0000'){            
        return comInfo;
    }

    const diskCompanyName = comInfo.data;
	
	if(loginType==='auth' && companyName !== '' && diskCompanyName.replaceInclude() !== companyName.replaceInclude()){
		return {errcode: 'companyNameErr', description:'请检查企业名称是否与税盘一致!'};
	}
	
    const city = getCityNameByTaxNo(diskTaxNo);
    
    if(!city){
        return {errcode: '6000', description:'请检查税号是否正确!'};        
    }
    
    const baseUrl = getBaseUrl(city);    
    const openRes = await openDevice(passwd);
    if(openRes.errcode !== '0000'){
        return openRes;
    }
    
    const clientHelloRes = await getClientHello(passwd);    
    if(clientHelloRes.errcode !== '0000'){
        return {errcode: clientHelloRes.errcode, description:clientHelloRes.description};
    }
    
    const data = await firstLogin({
    	baseUrl,
        passwd,
        city,
        taxNo: diskTaxNo,
        clientHello: clientHelloRes.data        
    }, 1);
    
    if(data.errcode === '0000'){
    	
        const serverPacket = data.key2;
        const serverRandom = data.key3;
        
        const resAuthCodeData = await getClientAuthCode(passwd, serverPacket);
        
        if(resAuthCodeData.errcode !== '0000'){            
            return resAuthCodeData;
        }
        
        const resKeyData = await getPublicKey(serverRandom, diskTaxNo, '01', city);
        
        if(resKeyData.errcode !== '0000'){
            return resKeyData;
        }
        
        const result = await secondLogin({
        	loginType,
        	fid,        	
            type,
            companyName: diskCompanyName,                    
            clientAuthCode: resAuthCodeData.data,
            serverRandom,
            ptPasswd,
            taxNo: diskTaxNo,
            ts: resKeyData.ts,
            publickey: resKeyData.publickey            
        }, 1);
        
        if(result.errcode === '0000'){        	
        	const {gxrqfw='', skssq='', key2='', key3='', companyType} = result.data;
			setCookie('gxrqfw', gxrqfw, govCacheSeconds);
			setCookie('skssq', encodeURIComponent(skssq), govCacheSeconds);
        	setCookie('govCompanyType', companyType, govCacheSeconds);
            setCookie('govToken', result.data.govToken, govCacheSeconds);
            setCookie('baseUrl', baseUrl, govCacheSeconds);
            setCookie('taxNo', diskTaxNo, govCacheSeconds);
            setCookie('nsrmc', encodeURIComponent(diskCompanyName), govCacheSeconds)
        }
        result.baseUrl = baseUrl;
        return result;
    }else{
        return data;
    }
}

//企业认证
export async function companyAuth(opt){	
	const {passwd, ptPasswd='', type='', fid='', taxNo='', companyName=''} = opt;
	if(taxNo === ''){
		return {errcode: '3000', description: '请输入正确的税号!'};
	}else if(companyName === ''){
		return {errcode: '3000', description: '认证企业名称不能为空!'};
	}else if(fid === ''){
		return {errcode: '3000', description: '认证参数不全，请检查'};
	}else{
		return login({...opt, loginType:'auth'}, true);		
	}
}
