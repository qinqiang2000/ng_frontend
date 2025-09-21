//操作税盘接口

import { crossHttp } from '@piaozone.com/utils';
let caOperateUrl = 'http://127.0.0.1:52320/cryptctl';

//如果需要修改税盘操作地址调用这个方法
export function setOperateUrl(url){
	caOperateUrl = url;
}


export const ymbb = '3.1.01';

export async function openDevice(passwd){    
    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"opendevice", "args":{"userpin":passwd}},
        'url': caOperateUrl    
    });
    
    if(res.errcode === '0000'){
        return {errcode:'0000'};
    }else{
        return {errcode:'7000', description: res.errmsg || res.description};
    }
    
}

export async function closeDevice(){
    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"closedevice", "args":{}},
        'url': caOperateUrl
    });
    
    if(res.errcode === '0000'){
        return true;
    }else{
        return res.errmsg;        
    }
}

export async function getClientHello(passwd){    
    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"clienthello","args":{"userpin":passwd,"dwflags":0}},
        'url': caOperateUrl    
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

export async function getClientAuthCode(passwd, serverPacket){
    const openRes = await openDevice(passwd);
    
    if(openRes.errcode !== '0000'){
        return openRes;
    }
    
    const res = await crossHttp({
        'method': 'POST',
        'data': {"funcname": "clientauth", "args":{"userpin": passwd, "strServerHello": serverPacket}},
        'url': caOperateUrl    
    });
    
    if(res.errcode === '0000'){
        await closeDevice();
        if(res.result !== ''){
            return {errcode:'0000', data: res.result};    
        }else{
            return {errcode:'7001', description: res.errmsg || res.description};
        }
    }else{
        await closeDevice();
        return {errcode:'7001', description:res.errmsg || res.description};
    }
}


export async function getTaxInfoFromDisk(passwd, type){   //71获取税号，27获取企业名称
    const openRes = await openDevice(passwd);
    if(openRes.errcode !== '0000'){
        return openRes;
    }
    
    const resData = await crossHttp({
        'method': 'POST',
        'data': {"funcname":"getcertinfo", "args":{"userpin":passwd,"cert":"","certinfono": type}},
        'url': caOperateUrl
    });
    
    await closeDevice();
    if(resData.errcode === '0000' && resData.result !== ''){        
        return {errcode: '0000', data:resData.result};
    }else{        
        return {errcode: '7002', description:resData.errmsg || resData.description};
    }      
}