import { kdRequest, cacheHelp, cookieHelp, urlHandler } from '@piaozone.com/utils';
// import * as diskOperate from './diskOperate';
import MultiPortOperateDisk from './multiPortDiskOperate';

import * as diskApi from './diskApi';
import { getApiVersion, checkTaxNo } from './checkApiVersion';

const { setCache, getCache, clearCache } = cacheHelp;
const { setCookie, getCookie, clearCookie } = cookieHelp;

const govCacheSeconds = 2800;
const defaultTimeout = 70000;

export default function SwjgFpdk(opt){
    this.baseTaxNo = opt.taxNo || 'fixedTaxNo';
    this.fpdkType = opt.fpdkType ? parseInt(opt.fpdkType) : 1;
    if (typeof opt.showLogin === 'function') {
        this.showLogin = opt.showLogin;
    }
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
            } else { // 对应的localStorage存储失效
                clearCookie('govToken-' + this.baseTaxNo);
            }
        }
    }

    this.firstLoginUrl = opt.firstLoginUrl || '';
    this.secondLoginUrl = opt.secondLoginUrl || '';
    this.collectUrl = opt.collectUrl || '';
    this.onLoginSuccess = opt.onLoginSuccess;

    this.passwd = opt.passwd || cachePasswd || '';
    this.ptPasswd = opt.ptPasswd || cachePtPasswd || '';
    if (opt.ports && opt.ports.length > 0) {
        this.diskOperate = new MultiPortOperateDisk({ ports: opt.ports }); // opt.diskOperate || diskOperate;
    } else {
        this.diskOperate = new MultiPortOperateDisk(); // opt.diskOperate || diskOperate;
    }

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
    setConfirmPass: function(confirmPasswd) {
        this.confirmPasswd = confirmPasswd;
    },
    login: async function(passwd='', ptPasswd='', access_token=this.access_token, opt = {}) {
        const etaxInfo = getCache('etax-login-info');
        const { loginType, loginAccount, loginUrl } = etaxInfo || {};
        if (loginType === 1 && loginAccount && loginUrl) {
            const res = await this.autoCustomLogin(loginUrl, loginAccount);
            return res;
        }

        if (loginType === 2) {
            if (typeof this.showLogin === 'function') {
                this.showLogin();
            }
            return {
                errcode: '91300',
                description: '登录失效，请重新登录'
            };
        }

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
        // const taxInfo = await this.diskOperate.getTaxInfoFromDisk(passwd, 71, this.operateUrl);
        let clientHelloRes;

        if(cryptType == 0) {
            clientHelloRes = await diskApi.getClientHello(passwd, this.operateUrl, alg);
        } else {
            clientHelloRes = await this.diskOperate.getClientHello(passwd, this.operateUrl);
        }

        if(clientHelloRes.errcode !== '0000'){
            return clientHelloRes;
        }

        const taxNo = cert; //获取成功后，税盘税号
        const clientHello = clientHelloRes.data;
        const headersJson = {
            'Content-Type': 'application/json'
        };
        if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.param_sign) {
            headersJson['x-csrf-token'] = window.__INITIAL_STATE__.param_sign;
        }
        const res1 = await kdRequest({
            url: access_token ? this.firstLoginUrl + '?access_token=' + access_token: this.firstLoginUrl,
            timeout: 60000,
            method: 'POST',
            headers: headersJson,
            data: {
                alg,
                taxNo,
                clientHello,
                ...opt
            }
        })

        if(res1.errcode !== '0000'){
            return res1;
        }

        const {ymbb, baseUrl, govVersionInt, serverPacket, serverRandom} = res1.data;
        this.govVersionInt = govVersionInt;

        let resAuthCodeData;
        if (cryptType == 0) {
            resAuthCodeData = await diskApi.getClientAuthCode(passwd, serverPacket, this.operateUrl, alg);
        } else {
            resAuthCodeData = await this.diskOperate.getClientAuthCode(passwd, serverPacket, this.operateUrl);
        }

        if(resAuthCodeData.errcode !== '0000'){
            return resAuthCodeData;
        }
        let sbhData;
        if (cryptType == 0) {
            sbhData = await diskApi.getTaxInfoFromDisk(passwd, 70, this.operateUrl, alg);
        } else {
            sbhData = await this.diskOperate.getTaxInfoFromDisk(passwd, 70, this.operateUrl);
        }

        if (sbhData.errcode !== '0000') {
            return sbhData;
        }

        const clientAuthCode = resAuthCodeData.data;
        const sbh = sbhData.data;
        const res2 = await kdRequest({
            url: access_token ? this.secondLoginUrl + '?access_token=' + access_token: this.secondLoginUrl,
            timeout: defaultTimeout,
            method: 'POST',
            headers: headersJson,
            data: {
                alg,
                ptPasswd: this.ptPasswd,
                taxNo,
                ymbb,
                baseUrl,
                govVersionInt,
                clientAuthCode,
                serverRandom,
                sbh,
                ...opt
            }
        });

        if(res2.errcode === '0000'){
            this.access_token = access_token;
            const {skssq, gxrqfw, companyName, companyType} = res2.data;
            this.loginGovInfo = {
                passwd: this.passwd,
                ptPasswd: this.ptPasswd,
                taxNo,
                govVersionInt,
                skssq,
                gxrqfw,
                companyName,
                companyType,
                alg,
                cryptType,
                baseUrl,
                operateUrl: this.operateUrl
            }

            setCookie('govToken-' + this.baseTaxNo, 'govToken', govCacheSeconds); //失效控制
            setCache('loginGovInfo-' + this.baseTaxNo, this.loginGovInfo, 'localStorage');

            const resInfo = {...res2, data: {...res2.data, taxNo: taxNo} };

            if(typeof this.onLoginSuccess === 'function'){
                this.onLoginSuccess(resInfo);
            }

            return resInfo;
        }else{
            return res2;
        }
    },
    checkIsLogin: async function(fpdkType = 1, loginGovInfo) {
        fpdkType = parseInt(fpdkType);
        // 软证书，不需要登录直接可以使用
        if (fpdkType === 2) {
            return true;
        }

        const ck = getCache('etax-login-info');
        if (ck && ck.loginAccount && ck.checkLoginUrl) {
            const res = await kdRequest({
                url: ck.checkLoginUrl + '?fpdk_type=3',
                timeout: defaultTimeout,
                data: ck.loginAccount,
                method: 'POST'
            });
            if (res.data && res.data.taxPeriod) {
                this.fpdkType = 3;
                return true;
            }
            return false;
        }

        if (!loginGovInfo) {
            return false;
        }

        if (fpdkType === 1 && this.passwd) {
            return true;
        }
        return false;
    },
    autoCustomLogin: async function(url, opt = {}) {
        const res = await kdRequest({
            url: url + '?fpdk_type=3',
            timeout: defaultTimeout,
            data: opt,
            method: 'POST'
        });
        if (res.errcode === '0000') {
            this.customLoginFinish(res);
        }
        return res;
    },
    // 自定义登录
    setCustomLogin: function({ loginAccount = {}, loginUrl = '', loginType = 2, checkLoginUrl }) {
        setCache('etax-login-info',  {
            loginAccount,
            loginUrl,
            loginType,
            checkLoginUrl
        });
    },
    customLoginFinish: function(res) {
        if(res.errcode === '0000') {
            this.fpdkType = 3;
            const { skssq, gxrqfw, companyName, companyType, taxNo } = res.data;
            this.loginGovInfo = {
                fpdkType: 3,
                taxNo,
                skssq,
                gxrqfw,
                companyName,
                companyType
            };

            setCookie('govToken-' + this.baseTaxNo, 'govToken', govCacheSeconds); //失效控制
            setCache('loginGovInfo-' + this.baseTaxNo, this.loginGovInfo, 'localStorage');
            if(typeof this.onLoginSuccess === 'function'){
                this.onLoginSuccess(res);
            }
            return res;
        }
        return res;
    },
    holiCommonRequest: async function(url, opt = {}) {
        try {
            const res = await kdRequest({
                url,
                timeout: defaultTimeout,
                data: opt,
                method: 'POST'
            });
            return res;
        } catch (error) {
            return {
                errcode: 'arr',
                description: '请求异常，请稍后再试！'
            }
        }
    },
    commonRequest: async function(url, opt = {}){
        if (this.fpdkType === 2) {
            const holiRes = await this.holiCommonRequest(url, opt);
            return holiRes;
        }

        const { passwd=this.passwd, ptPasswd=this.ptPasswd } = opt;
        const urlArr = url.split('?');
        let access_token = '';
        if(urlArr.length === 2){
            access_token = urlHandler.urlSearch(urlArr[1]).access_token;
        }
        let newUrl = url;
        if (url.indexOf('?') !== -1) {
            newUrl = url + '&fpdk_type=' + this.fpdkType;
        } else {
            newUrl = url + '?fpdk_type=' + this.fpdkType;
        }
        let res;
        try {
            res = await kdRequest({
                url: newUrl,
                timeout: defaultTimeout,
                data: opt,
                method: 'POST'
            });
        } catch (error) {
            return {
                errcode: 'arr',
                description: '请求异常，请稍后再试！'
            }
        }

        if(res.errcode === '91300'){
            clearCookie('govToken-' + this.baseTaxNo);
            clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
            this.loginGovInfo = null;
            res = await this.login(passwd, ptPasswd, access_token);
            if(res.errcode !== '0000'){
                return res;
            }else{
                try {
                    res = await kdRequest({
                        url: newUrl,
                        timeout: defaultTimeout,
                        data: opt,
                        method: 'POST'
                    });
                } catch (error) {
                    return {
                        errcode: 'arr',
                        description: '请求异常，请稍后再试！'
                    }
                }
                return res;
            }
        }else{
            return res;
        }
    },
    holiTaxQueryInvoices: async function(url, opt) {
        const { continueFlag, clientType, stepFinish } = opt;
        let goOn = typeof continueFlag === 'undefined' ? true : continueFlag; //连续请求标志
        var stepFinishHanlder = (stepRes) => {
            if(typeof stepFinish === 'function') {
                try {
                    stepFinish({
                        endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                        errcode: stepRes.errcode,
                        description: stepRes.description,
                        totalNum: stepRes.totalNum || 0,
                        data: stepRes.data || [],
                        invoiceInfo: stepRes.invoiceInfo || {},
                        queryArgs: typeof stepRes.queryArgs === 'undefined' ? { //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                            searchOpt: opt.searchOpt,
                            dataFrom: dataFrom || '',
                            dataFromIndex,
                            dataIndex,
                            ...otherOpt,
                            name
                        }: stepRes.queryArgs
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }
        let { serialNo='', versionNo='', dataIndex = 0, searchOpt, dataFromIndex=0, dataFrom = '', ...otherOpt } = opt;
        do {
            const res = await kdRequest({
                url,
                timeout: defaultTimeout,
                data: {
                    continueFlag,
                    serialNo,
                    clientType,
                    versionNo,
                    dataIndex,
                    dataFromIndex,
                    dataFrom,
                    ...otherOpt,
                    searchOpt
                },
                method: 'POST'
            });
            stepFinishHanlder(res);
            if(typeof res.nextDataFromIndex !== 'undefined') {
                if (res.endFlag) {
                    goOn = false;
                } else {
                    dataIndex = res.nextDataIndex || 0;
                    dataFromIndex = res.nextDataFromIndex || 0;
                    serialNo = res.serialNo;
                    if (res.queryArgs) {
                        name = res.queryArgs.name;
                    }
                }
            } else {
                goOn = false;
            }

        } while(goOn);

    },
    queryInvoices: async function(url, opt){
        if (this.fpdkType === 2) {
            const res1 = await this.holiTaxQueryInvoices(url, opt);
            return res1;
        }

        const {continueFlag, clientType, stepFinish, passwd=this.passwd, ptPasswd=this.ptPasswd} = opt;
        let goOn = typeof continueFlag === 'undefined'?true:continueFlag; //连续请求标志
        let res;
        let name = '--';
        let { serialNo='', versionNo='', dataIndex=0, searchOpt, dataFromIndex=0, dataFrom='', ...otherOpt } = opt;
        const urlArr = url.split('?');
        let access_token = '';
        if(urlArr.length === 2){
            access_token = urlHandler.urlSearch(urlArr[1]).access_token;
        }
        let newUrl = url;
        if (url.indexOf('?') !== -1) {
            newUrl = url + '&fpdk_type=' + this.fpdkType;
        } else {
            newUrl = url + '?fpdk_type=' + this.fpdkType;
        }
        var stepFinishHanlder = (stepRes)=>{
            if(typeof stepFinish === 'function'){
                try {
                    stepFinish({
                        endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                        errcode: stepRes.errcode,
                        description: stepRes.description,
                        totalNum: stepRes.totalNum || 0,
                        data: stepRes.data || [],
                        invoiceInfo: stepRes.invoiceInfo || {},
                        queryArgs: typeof stepRes.queryArgs === 'undefined' ? { //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                            searchOpt: opt.searchOpt,
                            dataFrom: dataFrom || '',
                            dataFromIndex,
                            dataIndex,
                            ...otherOpt,
                            name
                        }: stepRes.queryArgs
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }

        do {
            res = await kdRequest({
                url: newUrl,
                timeout: defaultTimeout,
                data: {
                    continueFlag,
                    serialNo,
                    clientType,
                    versionNo,
                    dataIndex,
                    dataFromIndex,
                    dataFrom,
                    ...otherOpt,
                    searchOpt
                },
                method: 'POST'
            });

            if(res.errcode === '91300'){
                clearCookie('govToken-' + this.baseTaxNo);
                clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
                res = await this.login(passwd, ptPasswd, access_token);
                if(res.errcode !== '0000'){
                    stepFinishHanlder(res);
                    break;
                }

                res = await kdRequest({
                    url: newUrl,
                    timeout: defaultTimeout,
                    data: {
                        continueFlag,
                        serialNo,
                        clientType,
                        versionNo,
                        dataIndex,
                        dataFromIndex,
                        dataFrom,
                        ...otherOpt,
                        searchOpt
                    },
                    method: 'POST'
                });

                stepFinishHanlder(res);
            }else{
                stepFinishHanlder(res);
            }

            if(typeof res.nextDataFromIndex !== 'undefined'){
                if(res.endFlag){
                    goOn = false;
                }else{
                    dataIndex = res.nextDataIndex || 0;
                    dataFromIndex = res.nextDataFromIndex || 0;
                    serialNo = res.serialNo;
                    if(res.queryArgs) {
                        name = res.queryArgs.name;
                    }
                }
            }else{
                goOn = false;
            }

        }while(goOn);

        return res;
    },
    gxInvoices: async function(url, opt){
        let res;
        if (this.fpdkType === 2) {
            res = await this.holiCommonRequest(url, opt);
        } else {
            res = await this.commonRequest(url, opt);
        }
        return res;
    },
    bdkGxInvoices: async function(url, opt) {
        let res;
        if (this.fpdkType === 2) {
            res = await this.holiCommonRequest(url, opt);
        } else {
            res = await this.commonRequest(url, opt);
        }
        return res;
    },
    _gxConfirmTwo: async function(url, opt){
        const res = await this.commonRequest(url, opt);
        return res;
    },
    gxConfirm: async function(url, opt={}) {
        if (this.fpdkType === 2) {
            const resHoli = await this.holiCommonRequest(url, opt);
            return resHoli;
        }
        const { sbzt='' } = opt;

        // 电子税局和旧版只需要确认一次
        if(this.govVersionInt <4000 || this.fpdkType === 3){
            const res = await this.commonRequest(url, {
                sbzt
            });
            return res;
        }
        const { cryptType, alg } = this.loginGovInfo;
        const res = await this.commonRequest(url, {});
        if(res.errcode !== '0000'){
            return res;
        }

        const { tjsjstr='', signKey2='', tjInfo='', taxPeriod=''} = res.data;
        let tjsjsign = '';

        if(cryptType == 0){
            //tjsjstr+key2,pw,true,alg
            var obj = await diskApi.signDataApi(tjsjstr + signKey2, this.passwd, true, alg, this.operateUrl);
            if(obj.errcode === '0000'){
                tjsjsign= obj.data;
            }
        }else{
            //tjsjsign= signData(tjsjstr+key2,"",0x400000);
            tjsjsign= await this.diskOperate.signDataApi(tjsjstr + signKey2, this.passwd, '', 0x400000, this.operateUrl); // 应该使用signData，目前没发现cryptType为非0
        }

        if(tjsjstr && tjsjsign && tjInfo){
            return await this._gxConfirmTwo(url, {...opt, tjsjstr, tjsjsign, tjInfo, taxPeriod, password: this.confirmPasswd });
        }else{
            return {
                errcode: '82345',
                description: '获取签名确认数据异常'
            }
        }
    },
    jxxDownloadApply: async function(url, opt){
        const { continueFlag, stepFinish, passwd=this.passwd, ptPasswd=this.ptPasswd, searchOpt } = opt;
        let res;
        let index = opt.index || 0;
        let goOn = typeof continueFlag === 'undefined'? true : continueFlag; //连续请求标志
        const urlArr = url.split('?');
        let access_token = '';
        if(urlArr.length === 2){
            access_token = urlHandler.urlSearch(urlArr[1]).access_token;
        }

        var stepFinishHanlder = (stepRes)=>{
            if(typeof stepFinish === 'function'){
                try {
                    stepFinish({
                        endFlag: typeof stepRes.endFlag === 'undefined' ? true : stepRes.endFlag,
                        errcode: stepRes.errcode,
                        description: stepRes.description,
                        nextIndex: stepRes.nextIndex || opt.index,
                        queryArgs: typeof stepRes.queryArgs === 'undefined' ? { //保证queryArgs里面一定有值，如果没有则服务端异常，需要重新完整采集
                            searchOpt: opt.searchOpt,
                            index: opt.index
                        }: stepRes.queryArgs
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        }
        let newUrl = url;
        if (url.indexOf('?') !== -1) {
            newUrl = url + '&fpdk_type=' + this.fpdkType;
        } else {
            newUrl = url + '?fpdk_type=' + this.fpdkType;
        }
        do {
            res = await kdRequest({
                url: newUrl,
                timeout: defaultTimeout,
                data: {
                    continueFlag,
                    index,
                    searchOpt
                },
                method: 'POST'
            });

            if(res.errcode === '91300'){
                clearCookie('govToken-' + this.baseTaxNo);
                clearCache('loginGovInfo-' + this.baseTaxNo, 'localStorage');
                res = await this.login(passwd, ptPasswd, access_token);
                if(res.errcode !== '0000'){
                    stepFinishHanlder(res);
                    break;
                }

                res = await kdRequest({
                    url: newUrl,
                    timeout: defaultTimeout,
                    data: {
                        continueFlag,
                        index,
                        searchOpt
                    },
                    method: 'POST'
                });

                stepFinishHanlder(res);
            }else{
                stepFinishHanlder(res);
            }

            if(typeof res.nextIndex !== 'undefined'){
                if(res.endFlag){
                    goOn = false;
                }else{
                    index = res.nextIndex || 0;
                }
            }else{
                goOn = false;
            }
        } while(goOn);

        return res;
    },
    getDownloadList: async function(url, opt){
        const {fplx=0, sjlx=0, sqrqq='', sqrqz='', pageSize} = opt;
        if(this.govVersionInt <4000){
            return {
                errcode: '83333',
                description: '新版本税局系统才支持该功能, 请等待税局升级后再试'
            }
        }

        const res = await this.commonRequest(url, {
            fplx,
            sjlx,
            sqrqq,
            sqrqz,
            pageSize
        });

        return res;
    },
    downloadWithPath: async function(url, opt){
        const {jymm} = opt;
        if(this.govVersionInt <4000){
            return {
                errcode: '83333',
                description: '新版本税局系统才支持该功能, 请等待税局升级后再试'
            }
        }

        const res = await this.commonRequest(url, {
            urlPath: opt.urlPath,
            jymm
        });

        return res;
    }
}
