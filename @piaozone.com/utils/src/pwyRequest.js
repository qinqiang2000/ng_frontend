import { getCookie, setCookie } from './cookie_helps';
import { param } from './kdRequest';
import { consoleLog } from './tools';

const defaultTimeout = 90000;

export const errcodeInfo = {
    gatewayTimeout: {
        errcode: 'gatewayTimeout',
        description: '网关超时，请稍后再试!'
    },
    serverErr: {
        errcode: 'serverErr',
        description: '服务端异常, 请稍后再试！'
    },
    requestErr: {
        errcode: 'requestErr',
        description: '请求错误, 请检查网络或参数！'
    },
    timeoutErr: {
        errcode: 'timeoutErr',
        description: '请求超时, 请检查网络是否正常！'
    },
    abortedErr: {
        errcode: 'abortedErr',
        description: '请求错误, 用户中止了请求！'
    }
};


const createFetch = (url, options) => {
    return new Promise((resolve) => {
        const {dataType = 'json', method, headers={}, mode='cors', credentials='include', redirect = 'follow', body, onResponseProgress, callback, ...other } = options || {};
        const requestObj = {
            ...other,
            method,
            mode,
            credentials,
            redirect
        };

        const handler = (res) => {
			if(typeof callback === 'function'){
				callback(res)
			}else{
				resolve(res);
			}
        }

        const upperMethod = method.toUpperCase();

        if(dataType === 'json' || dataType === 'text'){
            requestObj.dataType = 'text';
        }

        requestObj.headers = headers;

        //GET请求不需要body参数
        if(upperMethod !== 'GET'){
            requestObj.body = body;
        }

        fetch(url, requestObj).then((response) => {
            if (response.status === 504) {
                handler(errcodeInfo.gatewayTimeout);
            } else if(response.status === 500) {
                handler(errcodeInfo.serverErr);
            } else if(response.status === 400 || response.status === 404) {
                handler(errcodeInfo.requestErr);
            } else {
                // 需要处理进度提示
                const handlerRes = (resText) => {
                    let res;
                    if(dataType === 'json') {
                        try {
                            res = JSON.parse(resText);
                        } catch (err1) {
                            consoleLog(err1);
                            res = { ...errcodeInfo.serverErr };
                        }
                        handler(res);
                    } else {
                        handler(resText);
                    }
                }

                if (typeof onResponseProgress === 'function' && typeof TextDecoder === 'function') {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let bytesReceived = 0;
                    let resText = '';
                    let conentLength = response.headers.get('content-length');
                    conentLength = parseInt(conentLength);
                    return reader.read().then(function processResult(result) {
                        if (result.done) {
                            onResponseProgress(bytesReceived, conentLength);
                            handlerRes(resText);
                            return;
                        }
                        bytesReceived += result.value.length;
                        resText += decoder.decode(result.value);
                        onResponseProgress(bytesReceived, conentLength);
                        return reader.read().then(processResult);
                    });
                } else {
                    response.text().then((resText) => {
                        handlerRes(resText);
                    }).catch ((err2) => {
                        consoleLog(err2);
                        handler(errcodeInfo.requestErr);
                    });
                }
            }
        }).catch((err3) => {
            consoleLog(err3);
            if (String.prototype.includes.call(err3, 'aborted')) {
                handler(errcodeInfo.abortedErr);
            } else {
                handler(errcodeInfo.requestErr);
            }
        });
    })
}

const __createTimeoutFetch = async (url, options) => {
    return await Promise.race([
		createFetch(url, options),
		new Promise(function(resolve){
			setTimeout(()=> {
                const res = { ...errcodeInfo.timeoutErr };
                if (typeof options.callback === 'function') {
                    options.callback(res);
                } else {
                    resolve(res);
                }
            }, options.timeout || defaultTimeout)
		})
	]);
}


const __XMLHttpRequest = function(url, options){
	return new Promise((resolve) => {
		let xhr = new window.XMLHttpRequest();
		const { method = 'GET', body = null, dataType='json', headers, callback, onRequestProgress, onResponseProgress, onProgress } = options;

        const handler = (res) => {
			if(typeof callback === 'function'){
				callback(res)
			}else{
				resolve(res);
			}
        }

        const handlerOnProgress = (loaded = '', total = '') => {
            if (typeof onProgress === 'function') {
                try {
                    onProgress(xhr.readyState, xhr.status, loaded, total);
                } catch (error) {
                    consoleLog(error);
                }

            }
        }

        handlerOnProgress();
        xhr.open(method, url, true);
        handlerOnProgress();
		xhr.ontimeout = () => {
            handler(errcodeInfo.timeoutErr);
            handlerOnProgress();
        };

        if (typeof onRequestProgress === 'function' || typeof onProgress === 'function') {
            xhr.upload.onprogress = (evt = {}) => {
                if (typeof onRequestProgress === 'function') {
                    try {
                        onRequestProgress(evt.loaded, evt.total);
                    } catch (error) {
                        consoleLog(error);
                    }
                }
                handlerOnProgress(evt.loaded, evt.total);
            }
        }

        if (typeof onResponseProgress === 'function' || typeof onProgress === 'function' ) {
            xhr.onprogress = (evt = {}) => {
                if (typeof onResponseProgress === 'function') {
                    try {
                        onResponseProgress(evt.loaded, evt.total);
                    } catch (error) {
                        consoleLog(error);
                    }
                }
                handlerOnProgress(evt.loaded, evt.total);
            }
        }

        xhr.onreadystatechange = () => {
            handlerOnProgress();
            const readyState = xhr.readyState;
            const status = xhr.status;
            if(readyState === 4 && status === 200) {
                const resText = xhr.responseText;
                let res;
                if(dataType === 'json') {
                    try {
                        res = JSON.parse(resText);
                    } catch (err1) {
                        consoleLog(err1);
                        res = { ...errcodeInfo.serverErr };
                    }
                    handler(res);
                } else {
                    console && console.warn('xhr onreadystatechange resText', resText);
                    handler(resText);
                }
                xhr = null;
			}
        }

		xhr.onerror = (error) => {
			consoleLog('xhr error: ', error);
            handler(errcodeInfo.requestErr);
            handlerOnProgress();
		};

		if(headers && headers['Content-Type']){
			xhr.setRequestHeader('Content-Type', headers['Content-Type']);
		}

		if(headers && headers['x-csrf-token']){
			xhr.setRequestHeader('x-csrf-token', headers['x-csrf-token']);
		}

		if(dataType === 'json'){
			xhr.responseType = 'text';
        }

		xhr.timeout = options.timeout || defaultTimeout;
		if(method.toLowerCase() === 'post'){
			xhr.send(body);
		}else{
			xhr.send(null);
        }
        handlerOnProgress();
	});
}

const __XDomainRequest = async function(url, options){
	const __innerXdr = new Promise((resolve) => {
		let xdr = new window.XDomainRequest();
		const { method = 'GET', body = null, callback, dataType = 'json' } = options;
		const handler = (res) => {
			if(typeof callback === 'function'){
				callback(res)
			}else{
				resolve(res);
			}
		}

		xdr.open(method, url);

		xdr.ontimeout = () => {
			handler(errcodeInfo.timeoutErr);
		};

		xdr.onerror =  (error) => {
			consoleLog(error);
			handler(errcodeInfo.requestErr);
		};

		xdr.onload = () => {
            const resText = xhr.responseText;
            let res;
            if(dataType === 'json') {
                try {
                    res = JSON.parse(resText);
                } catch (err1) {
                    consoleLog(err1);
                    res = { ...errcodeInfo.serverErr };
                }
                handler(res);
            } else {
                handler(resText);
            }
		}

		if(method.toLowerCase() === 'post'){
			xdr.send(body);
		}else{
			xdr.send(null);
		}
	});

	return await Promise.race([
		__innerXdr,
		new Promise((r) => {
			setTimeout(() => {
                const res = { ...errcodeInfo.timeoutErr };
                if (typeof callback === 'function') {
                    callback(res);
                } else {
                    r(res);
                }
            }, options.timeout || defaultTimeout)
		})
	])
}


export const pwyFetch = async function(url, options) {
	const method = options.method || 'GET'
	let body =  options.data || options.body;
	const headers = options.headers || {};
	const upperMethod = method.toUpperCase();
    const contentType = options.contentType || 'json';

    if(contentType === 'json') {
        headers['Content-Type'] = 'application/json; charset=UTF-8';
    }

    let csrfToken = getCookie('csrfToken');
    if (!csrfToken) csrfToken = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.csrfToken;

    if (url.indexOf('?') === -1) {
        url = url + '?_csrf=' + csrfToken;
    } else {
        url = url + '&_csrf=' + csrfToken;
    }

    if (csrfToken) {
        try {
            headers['x-csrf-token'] = csrfToken;
            setCookie('csrfToken', csrfToken, 30 * 60);
        } catch (e) {
            //TODO handle the exception
            setCookie('csrfToken', csrfToken, 30 * 60);
        }
    }

    options = {...options, headers, body };

	if(upperMethod === 'GET'){
		//GET禁止缓存
        if (typeof options.disabledCache === 'undefined' || options.disabledCache === false) {
            if(url.indexOf('?') === -1){
                url = url+'?random=' + Math.random();
            }else{
                url = url+'&random=' + Math.random();
            }
        }

		if(body && typeof body === 'object'){
			body = param(body, true); //GET参数编码处理，并拼装到URl
			if(body){
				url +='&' + body;
			}
		}
	}

	if(upperMethod === 'POST' && body && typeof body === 'object' && contentType === 'json') {
		options = {...options, body: JSON.stringify(body)};
	}

	let res;
	if(window.fetch && !options.onRequestProgress && !options.disabledFetch && !options.onProgress) { // fetch不支持上传进度，但支持下载进度回调
        res = __createTimeoutFetch(url, options);
	}else if(window.XMLHttpRequest) {
		res = await __XMLHttpRequest(url, options);
	}else if(window.XDomainRequest){
		res = await __XDomainRequest(url, options);
    }
    return res;
}

//兼容以前的版本
export async function kdRequest({
	method = 'GET',
	url = '',
	data = {},
	timeout = 90000,
	dataType = 'json', //返回的数据格式
	headers = {'Content-Type': 'application/json'}
}) {
	return await pwyFetch(url, {body: data, headers, timeout, dataType, method: method.toUpperCase()});
}