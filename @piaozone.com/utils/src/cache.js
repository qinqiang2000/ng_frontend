import { setCookie, clearCookie } from './cookie_helps'

//默认sessionStorage
export const setCache = function(key, value, flag){
    if(typeof value === 'object'){
        value = escape(JSON.stringify(value));
    }else{
        value = escape(value);
    }

    if(!localStorage && !sessionStorage){
        try{
            var timeout = 60*60;
            if(!isNaN(parseInt(flag))){
                timeout = flag;
            }
            setCookie(key, value, timeout);
            return true;
        }catch(e){
            return false;
        }
    }else{
        if(flag == 'localStorage' && localStorage){
            try{
                localStorage.setItem(key, value);
                return true;
            }catch(e){
                return false;
            }
        }else if(!isNaN(parseInt(flag))){ //如果传入为数字，则表示未cookie的保留时间
            try{
                setCookie(key, value, flag);
                return true;
            }catch(e){
                return false;
            }
        }else{
            try{
                sessionStorage.setItem(key, value);
                return true;
            }catch(e){
                return false;
            }
        }
    }


}

//默认sessionStorage
export const getCache = function (key, flag, type){
    if(!localStorage && !sessionStorage){
        if(type === 'string'){
            return unescape(getCookie(key));
        }else{
            try{
                var v = unescape(getCookie(key));
                return JSON.parse(v);
            }catch(e){
                return v;
            }
        }
    }else{
        if(flag == 'localStorage' && localStorage){
            if(type === 'string'){
                return unescape(localStorage.getItem(key));
            }else{
                try{
                    var v = unescape(localStorage.getItem(key));
                    return JSON.parse(v);
                }catch(e){
                    return v;
                }
            }

        }else if(flag == 'cookie' || !isNaN(parseInt(flag))){
            if(type === 'string'){
                return unescape(getCookie(key));
            }else{
                try{
                    var v = unescape(getCookie(key));
                    return JSON.parse(v);
                }catch(e){
                    return v;
                }
            }

        }else{//默认使用session storage
            if(type === 'string'){
                return unescape(sessionStorage.getItem(key));
            }else{
                try{
                    var v = unescape(sessionStorage.getItem(key));
                    return JSON.parse(v);
                }catch(e){
                    return v;
                }
            }

        }
    }
}

export const clearCache = function(key,flag){
    if(!localStorage && !sessionStorage){
        try{
            clearCookie(key);
            return true;
        }catch(e){
            return false;
        }
    }else{
        if(flag == 'localStorage' && localStorage){
            try{
                localStorage.removeItem(key);
                return true;
            }catch(e){
                return false;
            }
        }else if(flag == 'cookie' || !isNaN(parseInt(flag))){
            try{
                clearCookie(key);
                return true;
            }catch(e){
                return false;
            }
        }else{ //默认清理sessionStorage
            try{
                sessionStorage.removeItem(key);
                return true;
            }catch(e){
                return false;
            }
        }
    }

}