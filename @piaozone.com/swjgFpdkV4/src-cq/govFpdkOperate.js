import { cacheHelp, cookieHelp } from '@piaozone.com/utils';
import * as diskApi from './diskApi';

import MultiPortOperateDisk from '../src/multiPortDiskOperate';
import { getApiVersion, checkTaxNo } from '../src/checkApiVersion';

const { getCache, clearCache } = cacheHelp;
const { getCookie } = cookieHelp;

export default function SwjgFpdk(opt){
    this.baseTaxNo = opt.taxNo || 'fixedTaxNo';
    let loginInfo;
    let govToken = '';
    let cachePasswd = '';
    let cachePtPasswd = '';
    let operateUrl = opt.operateUrl || '';
    if(this.baseTaxNo){
        govToken = getCookie('govToken-' + this.baseTaxNo);
        if(!govToken){ //失效，需要重新登录
            clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
        }else{
            loginInfo = getCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
            if(loginInfo){
                operateUrl = loginInfo.operateUrl;
                cachePasswd = loginInfo.passwd || '';
                cachePtPasswd = loginInfo.ptPasswd || '';
            }
        }
    }

    this.firstLoginUrl = opt.firstLoginUrl || '';
    this.secondLoginUrl = opt.secondLoginUrl || '';
    this.collectUrl = opt.collectUrl || '';
    this.onLoginSuccess = opt.onLoginSuccess;

    this.passwd = opt.passwd || cachePasswd || '';
    this.ptPasswd = opt.ptPasswd || cachePtPasswd || '';
    this.diskOperate = new MultiPortOperateDisk(); // opt.diskOperate || diskOperate;
    this.operateUrl = operateUrl;
    this.access_token = opt.access_token || '';
    if(loginInfo){
        this.loginGovInfo = loginInfo;
    }
}

SwjgFpdk.prototype = {
    validateLogin: async function(certPass){
        const versionInfo = await getApiVersion(certPass, this.operateUrl);
        if (versionInfo.errcode !== '0000') {
            return versionInfo;
        }

        const { cryptType, alg } = versionInfo.data;
        let cert = '';

        if (cryptType === 1) {
            const certInfo = await this.diskOperate.getTaxInfoFromDisk(certPass, 71, this.operateUrl);
            if (certInfo.errcode !== '0000') {
                return certInfo;
            }
            cert = certInfo.data;
        } else {
            const obj = await diskApi.getTaxInfoFromDisk(certPass, 71, this.operateUrl, alg);
            if (obj.errcode !== '0000') {
                return obj;
            }
            cert = obj.data;
        }

        const res = checkTaxNo(cert);
        if(res.errcode !== '0000') {
            return res;
        }

        return {
            errcode: '0000',
            data: {
                cryptType,
                alg,
                cert
            }
        };
    },
    firstLogin: async function(passwd='', ptPasswd='', method='POST'){
        this.passwd = passwd || this.passwd;
        this.ptPasswd = ptPasswd || this.ptPasswd;
        passwd = this.passwd;
        if(passwd == ''){
            return {
                errcode: '80401',
                description: 'CA密码不能为空'
            }
        }

        const validateRes = await this.validateLogin(passwd);
        if(validateRes.errcode !== '0000'){
            return validateRes;
        }

        const { cryptType, alg, cert } = validateRes.data;

        let clientHelloRes;

        if(cryptType == 0) {
            clientHelloRes = await diskApi.getClientHello(passwd, this.operateUrl, alg, method);
        } else {
            clientHelloRes = await this.diskOperate.getClientHello(passwd, this.operateUrl, method);
        }

        if(clientHelloRes.errcode !== '0000'){
            return clientHelloRes;
        }

        const taxNo = cert; //获取成功后，税盘税号
        const clientHello = clientHelloRes.data;

        return {
            errcode: '0000',
            data: {
                taxNo,
                clientHello
            },
            validateData: {
                taxNo,
                cryptType,
                alg
            }
        };
    },
    secondLogin: async function(passwd='', ptPasswd='', firstLoginData, validateData, method='POST'){
        const {ymbb, baseUrl, govVersionInt, serverPacket, serverRandom} = firstLoginData;
        const { alg, cryptType, taxNo } = validateData;

        this.govVersionInt = govVersionInt;

        let resAuthCodeData;
        if (cryptType == 0) {
            resAuthCodeData = await diskApi.getClientAuthCode(passwd, serverPacket, this.operateUrl, alg, method);
        } else {
            resAuthCodeData = await this.diskOperate.getClientAuthCode(passwd, serverPacket, this.operateUrl, method);
        }

        if(resAuthCodeData.errcode !== '0000'){
            return resAuthCodeData;
        }

        const clientAuthCode = resAuthCodeData.data;

        return {
            errcode: '0000',
            data: {
                ptPasswd: this.ptPasswd,
                taxNo,
                ymbb,
                baseUrl,
                govVersionInt,
                clientAuthCode,
                serverRandom
            }
        };
    },
    gxConfirmOneAfter: async function(cryptType, alg, data, method='POST'){
        const { tjsjstr='', signKey2='', tjInfo='', taxPeriod=''} = data;
        let tjsjsign = '';
        if(cryptType == 0){
            //tjsjstr+key2,pw,true,alg
            var obj = await diskApi.signDataApi(tjsjstr + signKey2, this.passwd, true, alg, this.operateUrl, method);
            if(obj.errcode === '0000'){
                tjsjsign= obj.data;
            }
        }else{
            //tjsjsign= signData(tjsjstr+key2,"",0x400000);
            tjsjsign= await this.diskOperate.signDataApi(tjsjstr + signKey2, this.passwd, '', 0x400000, this.operateUrl, method); // 应该使用signData，目前没发现cryptType为非0
        }

        if(tjsjstr && tjsjsign && tjInfo){
            return {
                errcode: '0000',
                data: {tjsjstr, tjsjsign, tjInfo, taxPeriod}
            }
        }else{
            return {
                errcode: '82345',
                description: '获取签名确认数据异常'
            }
        }
    }
}
