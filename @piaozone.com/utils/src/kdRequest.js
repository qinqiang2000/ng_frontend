import { getCookie, setCookie } from './cookie_helps';

export const prePath = '/';
export const param = function(data){
	if(typeof data === 'string'){
		try{
			data = JSON.parse(data);
		}catch(e){ //非json对象
			return data;
		}
	}

	let result = [];
	for(const item in data){
		if(data.hasOwnProperty(item)){
			result.push(item+'='+ encodeURIComponent(data[item]));
		}
	}
	return result.join('&');
}


const myFetch = ({
    method='GET',
    url='',
    data='',
    mode='cors',
    timeout = 60000,
    redirect = 'follow',
    dataType='json',
    credentials='include',
    headers = {'Content-Type': 'application/json'}
}) => {
    let requestObj = {
        method,
        mode,
        credentials,
        redirect
    };

    if(method === 'GET'){
        data = param(data);
    }else if(typeof data === 'object' && dataType === 'json'){
        data = JSON.stringify(data);
    }

    if(method === 'GET'){
        if(url.indexOf('?') === -1){
            url +='?' + data;
        }else{
            url +='&' + data;
        }
    }else if(method === 'POST'){
        requestObj.body = data;
    }

    if(dataType === 'json'){
        requestObj.headers = headers;
    }

    return fetch(url, requestObj);
}

function myXhr({
    method='GET',
    url='',
    data='',
    timeout = 60000,
    credentials='include',
    contentType,
    headers,
    success
}){
    contentType = headers['Content-Type'] || 'application/json;charset=UTF-8';
    return new Promise((resolve, reject) => {
        let xhr;

        if(XMLHttpRequest){
            xhr = new XMLHttpRequest();
        }
        if(!xhr && typeof XDomainRequest !== 'undefined'){
            // 检查是否是IE，并且使用IE的XDomainRequest
            xhr = new XDomainRequest();
        }

        try{
            xhr.timeout = timeout;
            //xhr.contentLength = data.length;
        }catch(e){
            console.warn('设置超时时间异常');
        }

        xhr.ontimeout = function(){
            resolve({errcode: 'timeoutErr', description:'请求超时！'});
        };

        if(contentType){
            try{
                xhr.contentType = contentType;
            }catch(e){
                console.warn('设置contentType异常');
            }
        }

        xhr.onload = function(){
            if(xhr.readyState === 4){
                const status = xhr.status;
                if(status === 200){
                    let resData = xhr.responseText;
                    try{
                        resData = JSON.parse(resData);
                        resolve(resData);
                    }catch(e){
                    	resolve({errcode: 'innerErr', description:'返回数据出错！'});
                    }
                }else{
                	resolve({errcode: 'requestErr', description:`请求出错${status}`});
                }
            }
        };

        xhr.onerror = function(error){
            resolve({errcode: 'requestErr', description:`请求异常`});
        };

        xhr.open(method, url, true);

        try {
            xhr.setRequestHeader('Content-Type', contentType);
            if (headers['x-csrf-token']) xhr.setRequestHeader('x-csrf-token', headers['x-csrf-token']);
        } catch (error) {
            //console.log(error);
        }

        xhr.send(data);
    })
}

export async function kdRequest({
    urlPre='',
    method='GET',
    url='',
    data='',
    mode='cors',
    timeout = 60000,
    redirect = 'follow',
    dataType='json',
    credentials='include',
    handlerError,
    headers = {'Content-Type': 'application/json'}
}) {

	if(!/^http/.test(url)){
		url = urlPre + url;
	}

    let csrfToken = getCookie('csrfToken');
    if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

    if(url.indexOf('?') === -1){
    	url = url + '?_csrf=' + csrfToken;
    }else{
    	url = url + '&_csrf=' + csrfToken;
    }

    if(csrfToken){
    	try{
    		headers['x-csrf-token'] = csrfToken;
    		setCookie('csrfToken', csrfToken, 30*60);
    	}catch(e){
    		//TODO handle the exception
    		setCookie('csrfToken', csrfToken, 30*60);
    	}
    }

    if(window.fetch){ //fetch方法存在

        const response = await myFetch({
            url,
            data,
            dataType,
            headers,
            method
        });

        if(response.status !== 200) {
        	return {errcode: '5000', description: `请求出错(${response.status})`};
        }else{
    		return await response.text().then((res) => {
    			if(dataType === 'json'){
    				try{
    					res = JSON.parse(res);
    					return res;
    				}catch(e){
    					return {errcode: 'jsonErr', description: '返回数据格式异常', data: res};
    				}
    			}else{
    				return res;
    			}
           	}).catch((error) => {
            	return {errcode: 'serverErr', description: error};
            });
        }
    }else{

        if(method === 'GET'){
            data = param(data);
        }else if(typeof data === 'object' && dataType === 'json'){
            data = JSON.stringify(data);
        }

        const resData = await myXhr({
            method,
            url,
            data,
            timeout,
            credentials,
            headers
        });

        return resData;
    }
}