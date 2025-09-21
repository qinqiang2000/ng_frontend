//操作税盘接口

import { crossHttp } from './crossHttp';
import { paramJson } from '@piaozone.com/utils';
let caOperateUrl = 'http://127.0.0.1:52320/cryptctl';

//如果需要修改税盘操作地址调用这个方法
export function setOperateUrl(url){
	caOperateUrl = url;
}

const getApi = async(url, data, o, method='POST') => {
    const res = await crossHttp({
        'method': method,
        'data': paramJson(data),
        'contentType': 'application/x-www-form-urlencoded;charset=UTF-8',
        'url': url
    });
    return res;
}


export async function getVersionApi(flag, url, method='POST') {
    if(!url) {
        url = caOperateUrl;
    }

    const ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
	var apiUrl = 'https://' + ip + ':28000/api/getVersion';
    const data = {
        crosFlag: 0
    };
        
	return await getApi(apiUrl, data, method);
}


export async function verifyPinApi(passwd, flag, alg, url, method='POST'){
    passwd = encodeURIComponent(passwd);
    if(!url) {
        url = caOperateUrl;
    }

	const ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
    const apiUrl = 'https://' + ip + ':28000/api/verifyPin';

	const data = 0 == alg ? {
		password: passwd,
		dwProvType: 1
	} : {
		password: passwd,
		dwProvType: 2050,
		strContainer: '//SM2/SM2CONTAINER0002'
    };
    
    const res = await getApi(apiUrl, data, method);
    
    if (res.code == 0) {        
        return {errcode:'0000', data: '0'};
    } else {
        const errMsg = res.msg +   '(错误代码：' + res.code + ')';
        return {errcode: '7000', description: errMsg};
    }
}

export async function getClientHello(passwd, url, alg, method='POST'){
    if(!url) {
        url = caOperateUrl;
    }

    const ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
    const apiUrl = 'https://' + ip + ':28000/api/clientHello';
    const data = 0 == alg ? {
		authType: 0,
		dwProvType: 1
	} : {
		authType: 0,
		dwProvType: 2050,
		strContainer: '//SM2/SM2CONTAINER0002'
	}; 
    
    const res = await getApi(apiUrl, data, method);
    
    if (res.code == 0) {        
        if (res.clientHello){
            return {errcode:'0000', data: res.clientHello};
        } else {
            return {errcode: '7000', description: '税盘操作异常'};
        }        
    } else {
        const errMsg = res.msg +   '(错误代码：' + res.code + ')';
        return {errcode: '7000', description: errMsg};
    }
}

export async function getClientAuthCode(passwd, serverPacket, url, alg, method='POST'){
    if(!url) {
        url = caOperateUrl;
    }

    const ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
    const apiUrl = 'https://' + ip +':28000/api/clientAuth';
    const data = 0 == alg ? {
		password: passwd,
		serverHello: serverPacket,
		dwProvType: 1
	} : {
		password: passwd,
		serverHello: serverPacket,
		dwProvType: 2050,
		strContainer: '//SM2/SM2CONTAINER0002'
    };

    const res = await getApi(apiUrl, data, method);
    
    if (res.code == 0) {        
        if (res.clientAuth){
            return {errcode:'0000', data: res.clientAuth};
        } else {
            return {errcode: '7000', description: '税盘操作异常'};
        }        
    } else {
        const errMsg = res.msg +   '(错误代码：' + res.code + ')';
        return {errcode: '7000', description: errMsg};
    }
}


export async function getTaxInfoFromDisk(passwd, type, url, alg, method='POST'){   //71获取税号，27获取企业名称
    if(!url) {
        url = caOperateUrl;
    }

    const ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
    const apiUrl = 'https://'+ ip +':28000/api/readCertInfo';
    
    const data = 0 == alg ? {
		certInfoNo: type,
		dwProvType: 1
	} : {
		certInfoNo: type,
		dwProvType: 2050,
		strContainer: '//SM2/SM2CONTAINER0002'
    }
    
    const res = await getApi(apiUrl, data, method);
    
    if (res.code == 0) {
        if (res.certInfo){
            return {errcode:'0000', data: res.certInfo};
        } else {
            return {errcode: '7000', description: '税盘操作异常'};
        }        
    } else {
        const errMsg = res.msg +   '(错误代码：' + res.code + ')';
        return {errcode: '7000', description: errMsg};
    }
}

export async function signDataApi(originData, passwd, flag, alg, url, method='POST'){
    if(!url) {
        url = caOperateUrl;
    }

    const ip = url.replace(/https?:\/\/(.*?)\:.*/, '$1');
    const apiUrl = 'https://'+ ip +':28000/api/signData';

    let data = 0 == alg ? {
        password: passwd,
		data: originData,
		signAlgId: 'SHA1withRSA',
		dwFlag: '0x400000',
		dwProvType: 1
	} : {
        password: passwd,
		data: originData,
		signAlgId: 'GBECSM3',
		dwFlag: '0x400000',
		dwProvType: 2050,
		strContainer: '//SM2/SM2CONTAINER0002'
    };
    
    const res = await getApi(apiUrl, data, method);
    
    if (res.code == 0) {
        if (res.p7Signature){
            return {errcode:'0000', data: res.p7Signature};
        } else {
            return {errcode: '7000', description: '税盘操作异常'};
        }        
    } else {
        const errMsg = res.msg +   '(错误代码：' + res.code + ')';
        return {errcode: '7000', description: errMsg};
    } 
}