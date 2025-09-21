export const urlSearch = function(search=''){
    search = search.replace(/^\?/, '');
    const urlParams = {};
    const urlParamArr = search.split('&');
    for(let i=0,len = urlParamArr.length; i<len;i++){
        const param = urlParamArr[i].split('=');
        let tempValue = '';
        if(param.length > 1){
            tempValue = param[1];
        }
        urlParams[param[0]] = tempValue;
    }    
    return urlParams;
}
