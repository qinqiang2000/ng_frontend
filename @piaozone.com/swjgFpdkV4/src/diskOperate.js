//操作税盘接口

import { crossHttp, paramJson } from '@piaozone.com/utils';
let caOperateUrl = 'http://127.0.0.1:52320/cryptctl';

//如果需要修改税盘操作地址调用这个方法
export function setOperateUrl(url){
	caOperateUrl = url;
}


export async function openDevice(passwd, url){
    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"opendevice", "args":{"userpin":passwd}},
        'url': url || caOperateUrl
    });

    if(res.errcode === '0000'){
        return {errcode:'0000'};
    }else{
        return {errcode:'7000', description: res.errmsg || res.description};
    }

}

export async function closeDevice(url){
    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"closedevice", "args":{}},
        'url': url || caOperateUrl
    });

    if(res.errcode === '0000'){
        return true;
    }else{
        return res.errmsg;
    }
}

export async function getClientHello(passwd, url){
    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"clienthello","args":{"userpin":passwd,"dwflags":0}},
        'url': url || caOperateUrl
    });

    if(res.errcode === '0000'){
        if(res.result !== ''){
            return {errcode:'0000', data: res.result};
        }else{
            return {errcode: '7000', description: '税盘操作异常'};
        }
    }else{
        return {errcode: res.errcode, description: res.errmsg || res.description};
    }
}

export async function getClientAuthCode(passwd, serverPacket, url){

    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname": "clientauth", "args":{"userpin": passwd, "strServerHello": serverPacket}},
        'url': url || caOperateUrl
    });

    if(res.errcode === '0000'){
        if(res.result !== ''){
            return {errcode:'0000', data: res.result};
        }else{
            return {errcode:'7001', description: res.errmsg || res.description};
        }
    }else{
        return {errcode:'7001', description:res.errmsg || res.description};
    }
}


export async function getTaxInfoFromDisk(passwd, type, url){   //71获取税号，27获取企业名称

    const resData = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"getcertinfo", "args":{"userpin":passwd,"cert":"","certinfono": type}},
        'url': url || caOperateUrl
    });


    if(resData.errcode === '0000' && resData.result !== ''){
        return {errcode: '0000', data:resData.result};
    }else{
        return {errcode: '7002', description:resData.errmsg || resData.description};
    }
}

// originData, passwd, flag, alg, url
export async function signDataApi(originData, passwd, flag='', alg, url) {
    var r = {
        data: originData,
        alg: "SHA1withRSA",
        flag: 4194304
    }

    const resData = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"sign", "args": r},
        'url': url || caOperateUrl
    });

    if(resData.errcode === '0000' && resData.result !== ''){
        return {errcode: '0000', data: resData.result};
    }else{
        return {errcode: '27002', description: resData.errmsg || '获取签名异常'};
    }
}