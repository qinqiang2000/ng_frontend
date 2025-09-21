
export const getCookie = function(name){
	var nameEQ=name+'=';
	var str=document.cookie.split(';');

	for(var i=0;i<str.length;i++){
		var c=str[i];
		while(c.charAt(0)===' '){
			c=c.substring(1,c.length);
		}
		if(c.indexOf(nameEQ) === 0){
			return unescape(c.substring(nameEQ.length,c.length));
		}
	}
	return '';
}

export const clearCookie = function(name) {
	setCookie(name, '', -1);
}

export const setCookie = function(name, value, seconds, otherStr = '') {
	seconds = seconds || 0;
	var expires = "";
	if(seconds !== 0 ){
		var date = new Date();
		date.setTime(date.getTime()+(seconds*1000));
        expires = "; expires="+date.toGMTString();
        if (otherStr) {
            expires +='; ' + otherStr;
        }
	}
	document.cookie = name+"="+escape(value)+expires +"; path=/";
}

export const clearAllCookie = function(){
	var strCookie = document.cookie;
	var arrCookie = strCookie.split("; ");

	for(var i=0,len = arrCookie.length;i<len;i++){ // 遍历cookie数组，处理每个cookie对
	    var arr = arrCookie[i].split("=");
	    if(arr.length>0){
	    	setCookie(arr[0],'',-1);
	    }
	}
}

