import {getCityNameByTaxNo, getBaseUrl} from '@piaozone.com/swjgInfo';

import { login, forwardUrl, getGxPublicKey, govCacheSeconds, clearGovCookie} from './loginToGov';
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


//纳税人信用查询
export async function nsrcx(opt){
    const {passwd, ptPasswd, creditUrl=forwardUrl} = opt;

    const loginRes = await login({passwd, ptPasswd});
    if(loginRes.errcode !== '0000'){
    	return loginRes;
    }
    var ymbb = getCookie('ymbb');
    const { baseUrl, companyType, taxNo} = loginRes.data;
    let govToken = getCookie('govToken');
    const city = getCookie('city');

    if(companyType !== '03'){
    	return {errcode: '8001', description: '一般纳税人才能进行该操作!'}
    }

    let res = await getGxPublicKey({
    	govToken, 
    	baseUrl, 
    	taxNo, 
    	funType:'06'
    });
    
    if(res.errcode !== '0000'){
        return res;
    }

    const {publickey, ts} = res;
    
	const searchParam = paramJson({
        callback: 'jQuery' + (+ new Date()),
        cert: taxNo,
        token: govToken,
        ts,
        publickey,
        ymbb
       });
       
       res = await kdRequest({
    	url: creditUrl,
        timeout: 60000,        
        data: {
            headers: {
                ...fpdkHeaders,
                'Host': baseUrl.replace(/^.*:\/\//, '').replace(/\/$/, ''),
                'Cookie': getFpdkCookies()
            },
            requestURI: 'SbsqWW/nsrcx.do?' + searchParam,
            requestData: '',
            city: city,
            requestMethod: 'GET' 
        },
        method: 'POST'
    });
    
    if(creditUrl !== forwardUrl){
        return res;
    }else{
        if(res.errcode === '0000'){
            const jsonData = res.data;
            const key1 = jsonData.key1;
    
            if(key1=="00"){
                return {errcode: '8001', description: '获取纳税人信息失败！'};
            }else if (key1=="01") {            
                    var key2 = jsonData.key2;
                    const resultData = {};
                if(key2 == '' ){
                    return {errcode: '8003', description: '未查询到信息'};
                }else{                
                    var infoArr = key2.split('=');
                    
                    resultData.qymc = decodeURI(infoArr[0], "UTF-8");
                    resultData.sbzq = infoArr[1] == '0' ? '月': '季';
                    
                    var cktsqylx = infoArr[11];//出口退税企业类型
    
                    if(cktsqylx=='SC'){
                        resultData.cktsqylx = '1'; //生产企业
                    }else if(cktsqylx=='WM'){
                        resultData.cktsqylx = '2'; //外贸企业
                    }else if(cktsqylx=='ZF'){
                        resultData.cktsqylx = '3'; //外综服企业
                    }else{
                        resultData.cktsqylx = '';
                    }
        
                    var ylqylx = infoArr[12];//油类企业类型
    
                    if(ylqylx == 'YLJX'){
                        resultData.ylqylx = '1'; //油类经销企业
                    }else if(ylqylx == 'YLSC'){
                        resultData.ylqylx = '2'; //油类生产企业
                    }else if(ylqylx == 'YLF'){
                        resultData.ylqylx = '3'; //非油类企业
                    }
        
                    var nsrxz = infoArr[13];//纳税人资格
                    if(nsrxz == '8'){
                        resultData.nsrxz = '1'; //小规模纳税人
                    }else if(nsrxz=='5'){
                        resultData.nsrxz = '2'; //转登记纳税人
                    }else{
                        resultData.nsrxz = '3'; //一般纳税人
                    }
        
                    var tbsj = infoArr[14];///档案同步时间
                    resultData.datbsj = tbsj;
    
                    var jxqyxx = jsonData.key4;
                    var jxstr = jxqyxx.split('=');
    
                    if(ylqylx == "YLJX"){ //油类经销企业
                        if(jxstr[0] == '2'){//总分机构标识
                            resultData.zfjgbs = '分公司' + '（总公司信息：' + jxstr[2]+'，' + decodeURI(jxstr[3],"UTF-8")+'）';
                        }else if(jxstr[0]=='1'){
                            resultData.zfjgbs = '总公司';
                        }else{
                            resultData.zfjgbs = '';
                        }
    
                        if(jxstr[1]=='0'){//是否乙醇调和油企业
                            resultData.qcthyqy = '2'; //否
                        }else if(jxstr[1] == '1'){
                            resultData.qcthyqy = '1'; //是
                        }
                        
                    }else{
                        resultData.zfjgbs = '';
                        resultData.qcthyqy = '';
                    }
        
                    //20180412 增加显示是否特定企业，纳税人性质是5显示为转登记纳税人，为1且原始纳税人性质为5的、为5的增加显示转登记纳税人认定时间起、转登记纳税人认定时间止
                    var nsrxzYs = infoArr[15];
                    resultData.nsrxzYs = nsrxzYs; //原始纳税人性质  
                    resultData.nsrxz = nsrxz; //纳税人性质
                    if(nsrxz == '5' || (nsrxz=='1' && nsrxzYs=='5')){ //原始纳税人性质                
                        resultData.rdsjq = infoArr[16];
                        resultData.rdsjz = infoArr[17];
                    }else{
                        resultData.rdsjq = '';
                        resultData.rdsjz = '';
                    }
    
                    if(infoArr[18] == 'Y'){ //特定企业
                        resultData.tdqy = '1';
                    }else if(infoArr[18]=='N'){
                        resultData.tdqy = '2';
                    }
    
                    resultData.oldsh = infoArr[7]; //旧税号
                    resultData.qysh = infoArr[10]; //企业税号
                    
                    resultData.name = decodeURI(infoArr[2], "UTF-8"); //办税联系人
                    resultData.tel = infoArr[3]; //办税人手机号码
                    resultData.addr = decodeURI(infoArr[4], "UTF-8"); //办税人地址
    
                    resultData.zipcode = infoArr[5]; //办税人邮编
                    resultData.mail = infoArr[6]; //办税人地址
    
                    resultData.credit = infoArr[8];
                    
                    var token = jsonData.key3;
                    clearCookie("govToken");
                    setCookie("govToken", token, govCacheSeconds);
                    return {errcode: '0000', data: resultData}
                }
            }else if(key1 == "09"){
                clearCookie('govToken');
                return {'errcode': '1300', 'description': '登录失效，请重试!'};
            }else{
                return res;
            }
        }
    }
    
}