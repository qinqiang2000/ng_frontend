import {
	setOperateUrl,
	openDevice,
	closeDevice,
	getClientHello,
	getClientAuthCode,
	getTaxInfoFromDisk	
} from './diskOperate';

import {createJsonpCallback, createFpdkHeader} from './tools';

import {getCityNameByTaxNo, getBaseUrl} from '@piaozone.com/swjgInfo';
import { kdRequest, paramJson } from '@piaozone.com/utils';
import { cookieHelp } from '@piaozone.com/utils';

export let forwardUrl = '/portal/forward';
export let authURI = '/portal/companyAuth';
export const fpdkSecondLogin = '/portal/fpdkLogin';

const $ = require('./swjg_ext');

const {setCookie, getCookie, clearCookie} = cookieHelp;

const retryMax = 3;
export const govCacheSeconds = 3000;
const pwyCacheSeconds = 3600 * 24 * 2.5;

export function setUrls({forwardURI='/portal/forward', authURI='/portal/companyAuth', caOperateUrl='http://127.0.0.1:52320/cryptctl'}){
	forwardUrl = forwardURI;
	authURI = authURI;
	setOperateUrl(caOperateUrl);
}

async function getGloabalInfo(baseUrl, text){    
    const m = text.match(/(js\/cookies\.[a-z0-9]+\.js)/);
    if(m && m.length >0){
        
        const res = await kdRequest({
            url: forwardUrl,
            timeout: 60000,
            data: {                
                requestUrl: baseUrl.replace(/(https?:\/\/[a-zA-Z0-9\_\-:\.]+\/)(.*)$/, '$1') + m[0],
                requestData: {op: 'getText'},
                requestMethod: 'GET'
            },
            method: 'POST'
        });

        if(res.errcode === '0000'){
            var resText = res.data;
            window.FPDK_GOV_VERSION = resText.replace(/^.*VERSION\ ?=\ ?"(V[[0-9\.]+)".*$/g, '$1');
            window.FPDK_GOV_VERSION_INT = parseInt(window.FPDK_GOV_VERSION.replace(/[V\.]/g, ''));
        }
    }
}

export async function getYmbb(baseUrl){
	const res = await kdRequest({
        url: forwardUrl,
        timeout: 60000,
        data: {                
            requestUrl: baseUrl.replace(/(https?:\/\/[a-zA-Z0-9\_\-:\.]+\/)(.*)$/, '$1'),
            requestData: {op: 'getText'},
            requestMethod: 'GET',
            headers: createFpdkHeader(baseUrl)
        },
        method: 'POST'
    });
    
    if(res.errcode === '0000'){
        var resText = res.data;

        await getGloabalInfo(baseUrl, resText);

        var m = resText.match(/ymbb = "[0-9\.]*";/);

		if(m && m.length >0){            
			m = m[0].split(' = ')[1].replace(';', '').replace(/"/g, '');
			return {errcode:'0000', data: m};
		}else{
			return {errcode: '4000', description: '获取税局数据异常'};
		}	
    }else{
    	return res;
    }    
}

async function firstLogin({baseUrl, passwd, city, taxNo, clientHello, mmtype, answer}, retry=1){    
    if(city){        	
    	var ymbb = getCookie('ymbb');
    	const res = await kdRequest({
            url: forwardUrl,
            timeout: 60000,
            data: {
                city,
                baseUrl,
                requestUrl: baseUrl + "login.do?callback=" + createJsonpCallback(),                    
                requestData: paramJson({"type": "CLIENT-HELLO", "clientHello": clientHello, "ymbb": ymbb, mmtype, answer}),
                requestMethod: 'POST',
                headers: createFpdkHeader(baseUrl)
            },
            method: 'POST'
        });
       	
        if(res){
            if(res.errcode !== '0000'){
                if(retry >retryMax){
                    return res;    
                }else{
                    return await firstLogin({baseUrl, passwd, city, taxNo, clientHello, mmtype, answer}, retry+1);
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
                        return await firstLogin({baseUrl, passwd, city, taxNo, clientHello, mmtype, answer}, retry+1);
                    }
                }                
            }else{
                if(retry >retryMax){
                    return {errcode: '8000', description:'税局访问异常'};
                }else{
                    return await firstLogin({baseUrl, passwd, city, taxNo, clientHello, mmtype, answer}, retry+1);
                }
            }
        }else{
            if(retry >retryMax){
                return {errcode: '8000', description:'税局访问异常'};
            }else{
                return await firstLogin({baseUrl, passwd, city, taxNo, clientHello, mmtype, answer}, retry+1);
            }
        }
    }     
}

async function getPublicKey(serverRandom, taxNo, funType='01', city, baseUrl){    
    var ymbb = getCookie('ymbb');

    if(!baseUrl){
        baseUrl = getBaseUrl(city, true);
    }
    
    const res = await kdRequest({
        url: forwardUrl,
        timeout: 60000,
        data: {
            requestUrl: baseUrl + "querymm.do?callback=" + createJsonpCallback(),
            requestData: paramJson({cert: taxNo, funType: funType}),
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
            	if(funType === '06'){                    
					publickey = $.ck(taxNo, ts,'', govPage, serverRandom);
				}else{
					publickey = $.checkTaxno(taxNo, ts,'', govPage, serverRandom);
				}               
            }
            
            return {publickey, ts, errcode: '0000'};
        }catch(e){
            console.log(e);
            //TODO handle the exception
            return {errcode: '0003', description:'税局验证异常'};
        }
    }
          
}


export async function querymmTime({govToken, baseUrl, taxNo}){
	var ymbb = getCookie('ymbb');
	const res = await kdRequest({
        url: forwardUrl,
        timeout: 60000,
        data: {
            requestUrl: baseUrl + "querymm.do",
            requestData: {cert: taxNo, token: govToken, time: 'time'},
            requestMethod: 'POST',
            headers: createFpdkHeader(baseUrl)
        },
        method: 'POST'        
    });
    return res;
}

export async function getGxPublicKey({govToken, baseUrl, taxNo, funType}){
    var ymbb = getCookie('ymbb');
    /*
	const res = await kdRequest({
        url: forwardUrl,
        timeout: 60000,
        data: {
            requestUrl: baseUrl + "querymm.do?callback=jQuery" + (+ new Date()),
            requestData: {cert: taxNo, funType: funType},
            requestMethod: 'POST',
            headers: {...headers, Referer: baseUrl, Host: baseUrl.replace(/^https?:\/\//, '').replace(/\/$/,'')}
        },
        method: 'POST'        
    })
*/

    const res = await kdRequest({
        url: forwardUrl,
        timeout: 60000,
        data: {
            requestUrl: baseUrl + "querymm.do?callback=" + createJsonpCallback(),
            requestData: 'cert='+ taxNo + '&funType=' + funType,
            requestMethod: 'POST',
            headers: createFpdkHeader(baseUrl)
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
                if(funType === '06'){
                    publickey = $.ck(taxNo, ts, '', govPage, govToken);
                }else{
                    publickey = window.checkInvConf(taxNo, govToken, ts, '', govPage);
                }
                
            }
            return {publickey, ts, errcode: '0000'};
        }catch(e){
            //TODO handle the exception
            return {errcode: '0003', description:'税局验证异常'};
        }
    }
}

//获取税控所属期
export async function getQrgycx({govToken, city, taxNo, baseUrl}){
    
	var ymbb = getCookie('ymbb');
    //直接请求税局
    if(!baseUrl){
        baseUrl = getBaseUrl(city, true);
    }
    
       
   	if(!baseUrl){
   		return {'errcode':'1000','description':'城市错误', data: []}; 
    }

    //await querymmTime({govToken, baseUrl, taxNo});

    let pkInfo = {ts: '', publickey: ''};
    if(window.FPDK_GOV_VERSION_INT < 4000){
        pkInfo = await getGxPublicKey({govToken, baseUrl, taxNo, funType: '06'});

        if(pkInfo.errcode !== '0000'){
            return pkInfo;
        }
    }

    

   	const p = {'cert': taxNo, 'token': govToken, 'rznf':'', 'ymbb':ymbb, ts: pkInfo.ts, publickey: pkInfo.publickey, id: 'qrgycx'};
   	
   	let res = await kdRequest({
        url: forwardUrl,
        timeout: 60000,
        data: {
            requestUrl: baseUrl + 'qrgycx.do?callback=' + createJsonpCallback(),
            requestData: paramJson(p),
            requestMethod: 'POST',
            headers: createFpdkHeader(baseUrl)
        },
        method: 'POST'
   	});
    
    if(res.errcode === '0000'){    	
    	try{
    		res = res.data;
    		if(res.key1 == '01' || (window.FPDK_GOV_VERSION_INT >= 4000 && res.key1 == '200')){
    			const newToken = res.key4;//setCookie('token', res.key4, pwyCacheSeconds);
    			const skssq = res.key5;
                const gxrqfw =  res.key6;	     
                setCookie('govToken', newToken, govCacheSeconds);
    		return {errcode: '0000', description: 'success', data: {skssq, gxrqfw, govToken: newToken}};
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



//通过税局登录获取token
async function secondLogin({loginType='auth', city, fid, companyName, mmtype='', answer='', clientAuthCode, serverRandom, ptPasswd, taxNo, ts, publickey, type='', baseUrl}, retry=1){
    let param2 = {};
    var ymbb = getCookie('ymbb');
    var currdate = new Date().getTime();
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
            currdate
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
            "answer": answer,
            currdate
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
            "ymbb":ymbb,
            currdate
        };
    }
    
    let loginRes;
    if(loginType === 'auth'){
    	loginRes = await kdRequest({
	        url: authURI,        
	        data: {
                city,
                baseUrl,
	        	fid,
	            type,            
	            ftax_number:taxNo,
	            companyName: companyName,            
	            requestUrl: 'login.do?callback=' + createJsonpCallback(),
	            requestData: paramJson(param2),
                requestMethod: 'POST',
                headers: createFpdkHeader(baseUrl)
	        },
	        method: 'POST'
        });	
     
    }else{
        
    	loginRes = await kdRequest({
	        url: forwardUrl,        
	        data: {
                city,
                baseUrl,
                requestUrl: baseUrl + 'login.do?callback=' + createJsonpCallback(),
                requestData: paramJson(param2),
                requestMethod: 'POST',
                headers: createFpdkHeader(baseUrl)
	        },
	        method: 'POST'
        });	
    }
    
    if(loginRes){
       
        if(loginRes.errcode === '0000'){

            const resultData = loginRes.data;
            const rezt = resultData.key1;

            //一般纳税人或者小规模纳税人
            if(rezt === '03' || rezt === '02'){
                

                let tokens = resultData.key2;
                let companyType = '03';
                if(tokens[5] =='1' && tokens[8] =='2'){ //小规模企业                    
                    companyType = '02';
                }

                //企业认证不需要获取税期
                if(loginType === 'auth'){
                    return {
                        errcode: '0000', 
                        data: {
                            ...resultData,
                            baseUrl, 
                            companyType,
                            taxNo
                        }
                    };
                }else{
                    
                    let qrgycxRes = {errcode: '0000', data: {}};
                    
                    if(rezt === '03'){
                        qrgycxRes = await getQrgycx({govToken:tokens, taxNo: taxNo, city, baseUrl});	
                    }else{
                        companyType = '02';
                    }
                    
                    if(qrgycxRes.errcode === '0000'){
                        return {
                            errcode: '0000', 
                            data: {
                                ...resultData, 
                                companyType, 
                                ...qrgycxRes.data, 
                                baseUrl, 
                                taxNo
                            }
                        };
                    }else{                    
                        return {errcode: qrgycxRes.errcode, description: '获取税控所属期异常!'};
                    }
                }                        
            }else if(rezt === '05'){
                return {description:'平台密码错误次数超过十次，请联系税务机关解锁或明天再试！', errcode: '7005'};
            }else if(rezt === '04'){
                return {description:'平台密码不正确！', errcode: '7004'};
            }else if(rezt === '08'){
                return { description:'平台密码不能为空！', errcode: '7008'};
            }else if(rezt === '00'){                
                return {description: resultData.key2, errcode:'7000'};
            }else{        	
                return {description: '企业认证出现异常, 请稍后再试!', errcode:'8000'};
            }            
        }else if(loginRes.errcode === '0932'){ //税局提示登录有误
            
            if(retry < retryMax){
                return await secondLogin({loginType, city, fid, companyName, mmtype, clientAuthCode, serverRandom, ptPasswd, taxNo, ts, publickey, answer, type, baseUrl}, retry+1);
            }else{
                return {errcode: '0932', data: loginRes.data, description: '税局验证异常，请重试！'};    
            }    
            
        }else{            
            return {errcode: '8000', description:loginRes.description};
        } 
    }              
}

export async function clearGovCookie() {
    clearCookie('ymbb');
    clearCookie('gxrqfw');
    clearCookie('skssq');
    clearCookie('govCompanyType');
    clearCookie('govToken');
    clearCookie('baseUrl');
    clearCookie('taxNo');
    clearCookie('nsrmc');
}


/*
 * type客户端登录类型
 * fid商家后台认证时需要传企业fid
 * loginType：为auth时需要前后台台做验证处理, forward转发登录请求
 */
export async function login({passwd='', ptPasswd='', type='', fid='', taxNo='', companyName='', loginType='forward', city='', baseUrl=''}, clearFlag=false){
    
	if(passwd === ''){
		return {errcode: '3000', description:'税盘密码不能为空!'};
    }
    
    const taxInfo = await getTaxInfoFromDisk(passwd, 71);

    if(taxInfo.errcode !== '0000'){            
        return taxInfo;
    }

    const diskTaxNo = taxInfo.data;

	if(clearFlag){
        clearGovCookie();
	}else{
        const oldTaxNo = getCookie('taxNo');
        if(diskTaxNo !== oldTaxNo){
            clearGovCookie();
        }else{
            const oldToken = getCookie('govToken');
            const gxrqfw = getCookie('gxrqfw');
            const skssq = getCookie('skssq');
            const companyType = getCookie('govCompanyType');
            if(baseUrl === ''){
                baseUrl = getCookie('baseUrl');
            }    	
            const taxNo = getCookie('taxNo');
            const nsrmc = getCookie('nsrmc');
            if(oldToken && gxrqfw && skssq && companyType && baseUrl && taxNo && nsrmc){			
                return {errcode: '0000', data: {gxrqfw, skssq, companyType, govToken: oldToken, baseUrl, taxNo, nsrmc}};
            }
        }
		
	}
	
    
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
    
    if(city === ''){
        city = getCityNameByTaxNo(diskTaxNo);
    }
    
    if(!city){
        return {errcode: '6000', description:'请检查税号是否正确!'};        
    }
    
    if(baseUrl === ''){
        baseUrl = getBaseUrl(city, true);        
    }
    
    const openRes = await openDevice(passwd);
    if(openRes.errcode !== '0000'){
        return openRes;
    }
    
    setCookie('city', encodeURIComponent(city), govCacheSeconds);
    
    const ymbbRes = await getYmbb(baseUrl);
    if(ymbbRes.errcode !== '0000'){
    	return ymbbRes;
    }
    
    var ymbb = ymbbRes.data;
    
    setCookie('ymbb', ymbb, govCacheSeconds);
    
    const clientHelloRes = await getClientHello(passwd);    
    if(clientHelloRes.errcode !== '0000'){
        return {errcode: clientHelloRes.errcode, description:clientHelloRes.description};
    }
    
    const data = await firstLogin({
    	baseUrl,
        passwd,
        city,
        mmtype: '2',
        answer: '',
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
        
        const funType = window.FPDK_GOV_VERSION_INT >= 4000 ? '01':'06';
		
        const resKeyData = await getPublicKey(serverRandom, diskTaxNo, funType, city);
        
        
        if(resKeyData.errcode !== '0000'){
            return resKeyData;
        }
        
        const result = await secondLogin({
            baseUrl,
            city,
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
        	const {gxrqfw='', skssq='', key2='', key3='', companyType, govToken} = result.data;
			setCookie('gxrqfw', gxrqfw, govCacheSeconds);
			setCookie('skssq', encodeURIComponent(skssq), govCacheSeconds);
        	setCookie('govCompanyType', companyType, govCacheSeconds);
            setCookie('govToken', govToken, govCacheSeconds);
            setCookie('baseUrl', baseUrl, govCacheSeconds);
            setCookie('taxNo', diskTaxNo, govCacheSeconds);
            setCookie('nsrmc', encodeURIComponent(diskCompanyName), govCacheSeconds);
            
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


export async function companyAuthNew(opt){
    const {passwd, fid='', taxNo='', companyName='', url=''} = opt;
    let city = opt.city || '';
    let baseUrl = opt.baseUrl || '';

	if(taxNo === ''){
		return {errcode: 'argsErr', description: '企业税号不能为空!'};
	}else if(companyName === ''){
		return {errcode: 'argsErr', description: '认证企业名称不能为空!'};
	}else if(fid === ''){
		return {errcode: 'argsErr', description: '认证参数不全，请检查'};
	}else{

        if(passwd === ''){
            return {errcode: 'argsErr', description:'税盘密码不能为空!'};
        }
        
        const taxInfo = await getTaxInfoFromDisk(passwd, 71);
    
        if(taxInfo.errcode !== '0000'){
            return taxInfo;
        }
    
        const diskTaxNo = taxInfo.data;

        if(diskTaxNo !== taxNo){
            return {errcode: 'argsErr', description:'请检查税号是否与税盘一致!'};
        }
        
        const comInfo = await getTaxInfoFromDisk(passwd, 27);
        if(comInfo.errcode !== '0000'){            
            return comInfo;
        }
    
        const diskCompanyName = comInfo.data;
        
        if(diskCompanyName.replaceInclude() !== companyName.replaceInclude()){
            return {errcode: 'argsErr', description:'请检查企业名称是否与税盘一致!'};
        }

        if(city === ''){
            city = getCityNameByTaxNo(diskTaxNo);
        }
        
        if(!city){
            return {errcode: 'argsErr', description:'请检查税号是否正确!'};
        }
        
        if(baseUrl === ''){
            baseUrl = getBaseUrl(city, true);
        }


        const ymbbRes = await getYmbb(baseUrl);
        if(ymbbRes.errcode !== '0000'){
            return ymbbRes;
        }
        
        var ymbb = ymbbRes.data;
        
        setCookie('ymbb', ymbb, govCacheSeconds);
        
        const clientHelloRes = await getClientHello(passwd);    
        if(clientHelloRes.errcode !== '0000'){
            return {errcode: clientHelloRes.errcode, description:clientHelloRes.description};
        }
        
       
        const firstLoginRes = await kdRequest({
            url,
            timeout: 60000,
            data: {
                city,
                baseUrl,                
                requestUrl: baseUrl + "login.do",                    
                requestData: paramJson({ 'callback': createJsonpCallback(), "type": "CLIENT-HELLO", "clientHello": clientHelloRes.data, "ymbb": ymbb, mmtype:'2', answer:''}),
                requestMethod: 'GET',
                headers: createFpdkHeader(baseUrl)
            },
            method: 'POST'
        });

		return firstLoginRes;
	}
}