const crossHttp = ({
    method = 'POST',
    data = '',
    withCredentials = false,
    dataType='json',
    contentType = 'text/plain',
    timeout = 60000,
    url = 'http://127.0.0.1:52320/cryptctl',
    onTimeout,
    onError,
    success
}) => {
    return new Promise((resolve, reject) => {
        let xhr = null;
        if(XMLHttpRequest){
            xhr = new XMLHttpRequest();
        }

        if(withCredentials && typeof xhr.withCredentials !== 'undefined'){
            xhr.withCredentials = true;
        }

        if(!xhr && typeof XDomainRequest !== 'undefined'){
            // 检查是否是IE，并且使用IE的XDomainRequest
            xhr = new XDomainRequest();
        }

        if(xhr){

            try{
                xhr.timeout = timeout;
                xhr.contentLength = data.length;
            }catch(e){
                console.warn('设置超时时间异常');
            }

            try{
                xhr.contentType = contentType;
            }catch(e){
                console.warn('设置contentType异常');
            }

            xhr.onload = function(){
                let result = xhr.responseText;
                if(dataType === 'json') {
                    try{
                        result = JSON.parse(result);
                        resolve(result);
                    }catch(e){
                        //TODO handle the exception
                        resolve({description: '服务端异常', errcode: 'serverErr'});
                    }
                } else {
                    resolve(result);
                }

            };

            xhr.ontimeout = function(){
                resolve({errcode:'timeout', description:'请求超时,请安装且启动“金蝶发票管理组件”后重试！'}, xhr);
            };

            xhr.onerror = function(){
                resolve({errcode:'err', description:'请求异常,请安装且启动“金蝶发票管理组件”后重试！'},xhr);
            };

            xhr.open(method, url, true); //窗口上下文的同步模式中不支持使用 XMLHttpRequest 的 timeout 属性

            if(typeof data === 'object'){
                data = JSON.stringify(data);
            }

            if(typeof data === 'string'){
                xhr.send(data);
            }else{
                resolve({errcode:'argsErr',description:'参数格式不正确'});
            }
        }else{
            xhr = null;
            resolve({errcode:'accessErr', description:'税盘不支持访问'});
        }
    })

}

export default crossHttp;