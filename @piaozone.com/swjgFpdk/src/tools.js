import { cookieHelp } from '@piaozone.com/utils';

const { getCookie } = cookieHelp;

export function createJsonpCallback(){
    var d = new Date().getTime();
    var r = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        return (d + Math.random()*10)%10 | 0;
    });

    return 'jQuery11020' + r + '_' + d;
}

export function sleep(time=3000){
    return new Promise(function(resolve, reject){
        window.setTimeout(function(){
            resolve();
        }, time)
    })
    
}

function getLoginCookies(){	    
    const nsrmc = getCookie('nsrmc');
    const token = getCookie('token');
    let cookieResult = ['XCSFXS=@%23%24%25%21@%23'];

    if(nsrmc){
        cookieResult.push('nsrmc='+ escape(nsrmc));
    }

    if(token){
        cookieResult.push('token=' + escape(token));
    }

    return cookieResult.join('; ');

}

function getFpdkCookies(){
	const skssq = getCookie('skssq');
    const gxrqfw = getCookie('gxrqfw');
    const dqrq = moment().format('YYYY-MM-DD');
    const nsrmc = getCookie('nsrmc');
    const token = getCookie('govToken');

    
    if(token && skssq && gxrqfw){        
    	return 'skssq='+ escape(skssq) +'; gxrqfw='+ escape(gxrqfw) +'; dqrq='+ dqrq +'; nsrmc='+ escape(nsrmc) + '; token=' + escape(token) + '; XCSFXS=@%23%24%25%21@%23';
    }else{
    	return '';
    }
}

export function createFpdkHeader(baseUrl, cookieFlag='login', contentType='application/x-www-form-urlencoded;charset=utf-8'){    
    return {
        'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
        'Referer': baseUrl.replace(/(https?:\/\/[a-zA-Z0-9\_\-:\.]+\/)(.*)$/, '$1'),
        'Host': baseUrl.replace(/^https?:\/\//, '').replace(/\/$/,'').replace(/\/.*$/g, ''),
        'Content-Type': contentType,
        'Connection': 'Keep-Alive',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Cookie': cookieFlag === 'login'?getLoginCookies():getFpdkCookies()
    };
}