// 多端口操作税盘接口

import { crossHttp } from '@piaozone.com/utils';
const defaultCaOperateUrl = 'http://127.0.0.1:52320/cryptctl';

export default function MultiPortOperateDisk(opt = {}) {
    this.timeout = opt.timeout || 60000;

    this.allowPorts = opt.ports || ['52320', '61624', '50001', '50051', '50101'];
    this.caOperateUrl = ''; // 默认为空, 一旦有一个接口访问成功则修改这里的
}

MultiPortOperateDisk.prototype = {
    setOperateUrl(url) {
        this.caOperateUrl = url;
    },
    getUrlInfo: function(url) {
        const urlReg = /^(https?):\/\/([0-9.a-z]*):([0-9]*)\/(.*)$/;
        const urlMatchInfo = url.match(urlReg);
        if (urlMatchInfo.length > 2) {
            return {
                protocol: urlMatchInfo[1],
                hostname: urlMatchInfo[2],
                port: urlMatchInfo[3],
                pathname: urlMatchInfo[4]
            };
        } else {
            return false;
        }
    },
    mergeUrlInfo: function(oldInfo = {}, info = {}) {
        let { protocol, hostname, port, pathname } = oldInfo;
        protocol = info.protocol || protocol;
        hostname = info.hostname || hostname;
        port = info.port || port;
        pathname = info.pathname || pathname;
        if (pathname === '') {
            return protocol + '://' + hostname + ':' + port;
        }
        return protocol + '://' + hostname + ':' + port + '/' + pathname;
    },
    requestDisk: async function(url, data, cback) {
        if (!url) {
            url = defaultCaOperateUrl;
        } else if(this.caOperateUrl) {
            const newInfo = this.getUrlInfo(url);
            const oldInfo = this.getUrlInfo(this.caOperateUrl);
            if (!newInfo || !oldInfo) {
                cback({errcode:'3000', description: '税盘操作地址格式异常'});
                return;
            }

            // 新地址
            if (newInfo.protocol !== oldInfo.protocol || newInfo.hostname !== oldInfo.hostname) {
                this.caOperateUrl = '';
            }
        }

        if (this.caOperateUrl) {
            const res = await crossHttp({
                'method': 'POST',
                'data': data,
                'url': this.caOperateUrl
            });
            const errmsg = res.errmsg || res.description || '税盘操作异常';
            if (res.errcode === '0000') {
                if (res.result !== '') {
                    cback({ errcode:'0000', data: res.result });
                } else {
                    cback({ errcode: '7000', description: errmsg });
                }
            } else {
                cback({ errcode: res.errcode, description: errmsg });
            }
        } else {
            const urlInfo = this.getUrlInfo(url);
            let res = {};
            for (let i = 0; i < this.allowPorts.length; i++) {
                const port = this.allowPorts[i];
                const curUrl = this.mergeUrlInfo(urlInfo, { port });
                const resInner = await crossHttp({
                    'method': 'POST',
                    'data': data,
                    'url': curUrl
                });
                const errmsg = resInner.errmsg || resInner.description || '税盘操作异常';
                if (resInner.errcode === '0000') {
                    if (resInner.result !== '') {
                        this.caOperateUrl = curUrl;
                        res = { errcode:'0000', data: resInner.result };
                        break;
                    } else {
                        res = { errcode: '7000', description: errmsg };
                    }
                } else {
                    res = { errcode: resInner.errcode, description: errmsg };
                }
            }
            cback(res);
        }
    },
    getClientHello: function(passwd, url) {
        return new Promise((resolve) => {
            const data = { "funcname": "clienthello", "args": { "userpin": passwd, "dwflags": 0} };
            this.requestDisk(url, data, (res) => {
                resolve(res);
            });
        });
    },
    getClientAuthCode: function(passwd, serverPacket, url) {
        return new Promise((resolve) => {
            const data = { "funcname": "clientauth", "args": {"userpin": passwd, "strServerHello": serverPacket} };
            this.requestDisk(url, data, (res) => {
                resolve(res);
            });
        });
    },
    getTaxInfoFromDisk: function(passwd, type, url) {
        return new Promise((resolve) => {
            const data = { "funcname": "getcertinfo", "args": {"userpin": passwd, "cert": "", "certinfono": type }};
            this.requestDisk(url, data, (res) => {
                resolve(res);
            });
        });
    },
    signDataApi: function(originData, passwd, flag='', alg, url) {
        return new Promise((resolve) => {
            const r = {
                data: originData,
                alg: "SHA1withRSA",
                flag: 4194304
            };

            const data = { "funcname": "sign", "args": r};
            this.requestDisk(url, data, (res) => {
                resolve(res);
            });
        });
    },
    companyAuth: function(url, data) {
        return new Promise((resolve) => {
            this.requestDisk(url, data, (res) => {
                resolve(res);
            });
        });
    }
}