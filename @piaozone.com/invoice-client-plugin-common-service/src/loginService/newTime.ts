import { getSwjgInfoByCityName } from '../utils/swjgInfo';

const encrypt = aesEncrypt;
const newTimeBaseUrl = 'https://v2.test.newtimeai.com';
// 新时代相关
export class NewTime extends BaseService {
    // 开通和修改新时代服务
    async openNewTime(account: string, actionType = '0', fixBaseUrl = '') {
        const ctx = this.ctx;
        const { access_token, taxNo, encryptKey, reqid } = ctx.request.query;
        const baseUrl = (fixBaseUrl || ctx.app.config.baseUrl) + '/m28/bill/digital/switch/tax/channel';
        const url = `${baseUrl}?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}`;
        const data = {
            taxNo,
            account,
            productType: '0',
            channelType: '1',
            actionType
        };

        const encryData = encrypt(JSON.stringify(data), encryptKey);
        const res = await ctx.helper.curl(url, {
            dataType: 'json',
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST',
            data: encryData
        });
        // 修改是第二步骤操作，直接返回
        if (actionType === '1') {
            return res;
        }

        // 新增可能因为已经存在需要重新调用修改
        if (res.errcode !== '0000') {
            const res2: any = await this.openNewTime(account, '1', fixBaseUrl);
            return res2;
        }
        return res;
    }

    async prodCheckIsLogout(taxNo: string, account: string, retry = 0, fixBaseUrl = '') {
        const ctx = this.ctx;
        const { access_token, operationType, reqid, tenantNo, client_id, pageId, taxNo: queryTaxNo } = ctx.request.query || {};
        const baseUrl = fixBaseUrl || ctx.app.config.baseUrl;
        const basePath = `${baseUrl}/rpa/etax/newera/getDpCookie`;
        const newTimeUrl = `${basePath}?access_token=${access_token}&taxNo=${queryTaxNo}&operationType=${operationType}&reqid=${reqid}`;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const requestParam: any = {
            taxNo,
            account,
            client_id,
            tenantNo
        };
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        const res = await ctx.helper.curl(newTimeUrl, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        // 登录失效状态码为0203
        ctx.service.log.info('新通道登录失效检测返回', pageId, res);
        const resDescription = res.description || '';
        if (retry !== 0 || res.errcode === '0000') {
            return res;
        }

        // 新时代登录失效也会返回这个提示
        if (res.errcode === '91300' || res.errcode === '0302' || resDescription.includes('未登录') ||
        resDescription.includes('重新登录') || resDescription.includes('该税号不支持调用该接口') ||
        resDescription.includes('重新调用登录接口') || resDescription.includes('cookie为空')) {
            if (!res.currentTaxNo || res.currentTaxNo === taxNo) {
                return errcodeInfo.govLogout;
            }
            await ctx.service.ntTools.closePage(pageId);
            return {
                ...errcodeInfo.argsErr,
                description: `当前账号正在被税号${res.currentTaxNo}使用, 请稍后再试!`,
                needSwitch: true
            };
        }

        if (!resDescription.includes('未获取到纳税人信息') && !resDescription.includes('未获取纳税人信息')) {
            return res;
        }

        const res2 = await this.openNewTime(account);
        ctx.service.log.info('开通新时代返回', pageId, res2);
        if (res2.errcode !== '0000') {
            return res2;
        }
        const res3: any = await this.prodCheckIsLogout(taxNo, account, 1, fixBaseUrl);
        return res3;
    }

    async updateLoginCookie(newLoginFullInfo : any = {}, loginData: any = {}) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { etaxName, cookieAllInfo, taxNo } = newLoginFullInfo;
        const baseUrl = etaxName ? `https://dppt.${etaxName}.chinatax.gov.cn:8443` : '';
        const eUrl = etaxName ? `https://etax.${etaxName}.chinatax.gov.cn` : '';
        const expirationDate : any = (+new Date() + 1000 * 60 * 60 * 24) / 1000;
        const cookieAttr = {
            domain: '.chinatax.gov.cn',
            hostOnly: false,
            path: '/',
            secure: true,
            httpOnly: false,
            expirationDate: parseInt(expirationDate),
            sameSite: 'unspecified'
        };
        const loginedCookies = [];
        for (let i = 0; i < cookieAllInfo.length; i++) {
            const item = cookieAllInfo[i];
            if (item.name === 'dzfp-ssotoken' || item.name === 'SSO_SECURITY_CHECK_TOKEN') {
                loginedCookies.push({
                    ...item,
                    ...cookieAttr
                });
            }
        }
        const fullInfo = {
            ...loginData,
            loginFrom: 'newTime',
            eUrl,
            taxNo,
            baseUrl,
            companyName: loginData.companyName || '',
            pageId: pageId,
            etaxAccountType: loginData.etaxAccountType || 3,
            loginedCookies,
            createTime: loginData.createTime || +new Date()
        };
        await pwyStore.set(etaxLoginedCachePreKey + pageId, fullInfo, 12 * 60 * 60);
        await ctx.service.ntTools.updateRemoteLoginStatus(pageId, fullInfo);
        return {
            ...errcodeInfo.success,
            data: fullInfo
        };
    }

    // 判断新时代是否已经登录失效
    async checkIsLogout(account: string, taxNo?: string, clearFlag?: boolean) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { pageId } = queryInfo;
        let loginData: any = {};
        // 如果不需要清理旧的登录信息，则可以使用旧缓存
        if (!clearFlag) {
            loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        }
        const curTaxNo = taxNo || loginData?.taxNo || queryInfo.taxNo || '';
        if (!curTaxNo) {
            ctx.service.log.info('登录信息不存在');
            return errcodeInfo.govLogout;
        }
        const resCheck = await this.prodCheckIsLogout(curTaxNo, account);
        const resData = resCheck.data || {};
        if (resCheck.errcode === '0000') {
            if (resData.cookieAllInfo && resData.etaxName) {
                const res = await this.updateLoginCookie(resData, loginData);
                return res;
            }
            ctx.service.log.info('新时代登录检测返回异常', resCheck);
            return errcodeInfo.govErr;
        }
        if (resCheck.errcode !== '91300') {
            ctx.service.log.info('新时代查询cookie返回异常', curTaxNo, account, resCheck);
        }
        return resCheck;
    }

    async isGrayTaxNo(bodyTaxNo?: string) {
        const ctx = this.ctx;
        const { access_token, reqid } = ctx.request.query || {};
        const baseUrl = ctx.app.config.baseUrl;
        const taxNo = bodyTaxNo || ctx.request.query.taxNo;
        // 判断是否在灰度列表
        const queryGrayUrl = baseUrl + `/fpdk-gov/fpdk/etax/login/newtime/taxNo/get?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}`;
        const listRes = await ctx.helper.curl(queryGrayUrl, {
            method: 'GET',
            dataType: 'json'
        });

        if (listRes.errcode !== '0000') {
            return listRes;
        }
        const { taxNoList = [] } = listRes.data || {};
        if (taxNoList === 'all') {
            return errcodeInfo.success;
        }
        // 不在灰度列表
        if (!taxNoList.includes(taxNo)) {
            return {
                ...errcodeInfo.success,
                data: 'notSupport'
            };
        }
        return errcodeInfo.success;
    }

    async getNewTimeToken() {
        const ctx = this.ctx;
        const requestUrl = 'http://user.test.newtimeai.com:8080/user-center/userApi/userLogin';
        const requestData = {
            data: {
                assessKey: 'jd',
                assessSecret: '12345678',
                needCheckCode: false
            }
        };
        const options = {
            method: 'POST',
            contentType: 'json',
            data: requestData,
            dataType: 'json'
        };
        const res = await ctx.helper.curl(requestUrl, options);
        return res;
    }

    async requestNewTimeTestEnv(requestUrl: string, requestData: any) {
        const ctx = this.ctx;
        let newTimeToken = pwyStore.get('newTimeTestToken');
        if (!newTimeToken) {
            const tokenRes = await this.getNewTimeToken();
            if (!tokenRes.data?.token) {
                return {
                    ...errcodeInfo.govErr,
                    description: tokenRes.message
                };
            }
            newTimeToken = tokenRes.data.token;
            await pwyStore.set('newTimeTestToken', newTimeToken, 2 * 60 * 60);
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'token': newTimeToken
            },
            data: requestData,
            dataType: 'json'
        };
        const res = await ctx.helper.curl(requestUrl, options);
        ctx.service.log.fullInfo('requestNewTimeTestEnv返回', requestUrl, options, res);
        // token失效
        if (res.code === 2004 || res.code === 2012) {
            pwyStore.delete('newTimeTestToken');
            const res2: any = await this.requestNewTimeTestEnv(requestUrl, options);
            return res2;
        }
        return res;
    }

    // 新时代正式登录
    async newTimeProdLogin(opt: any = {}, retry = 0) {
        const ctx = this.ctx;
        const { pageId, access_token, tenantNo, client_id, operationType = '', reqid, taxNo: queryTaxNo } = ctx.request.query || {};
        const taxNo = opt.taxNo || queryTaxNo;
        const baseUrl = ctx.app.config.baseUrl;
        const account = opt.loginAccountUid || opt.account;
        const password = opt.accountPasswd || '';
        const smsCode = opt.shortMsgCode || opt.shortMsg || '';
        const basePath = `${baseUrl}/rpa/etax/newera/issueLogin`;
        const newTimeUrl = `${basePath}?access_token=${access_token}&taxNo=${queryTaxNo}&operationType=${operationType}&reqid=${reqid}`;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const requestParam: any = {
            taxNo,
            account,
            password,
            authCode: smsCode,
            client_id,
            tenantNo
        };
        if (opt.companyName) {
            requestParam.companyName = opt.companyName;
        }
        if (opt.city) {
            requestParam.city = opt.city;
        }
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        const res = await ctx.helper.curl(newTimeUrl, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        ctx.service.log.info('prod新通道登录返回', pageId, newTimeUrl, res);
        const resDescription = res.description || '';
        if (retry !== 0 || res.errcode === '0000') {
            return res;
        }

        if (!resDescription.includes('未获取到纳税人信息') && !resDescription.includes('未获取纳税人信息')) {
            return res;
        }

        const res2 = await this.openNewTime(account);
        ctx.service.log.info('开通新时代返回', pageId, res2);
        if (res2.errcode !== '0000') {
            return res2;
        }
        const res3: any = await this.newTimeProdLogin(opt, 1);
        return res3;
    }

    // 新时代正式环境切换税号
    async newTimeProdSwitch(opt: any = {}, retry = 0) {
        const ctx = this.ctx;
        const { account, taxNo } = opt;
        const { pageId, access_token, tenantNo, client_id, operationType = '1' } = ctx.request.query || {};
        const cityPageArr = pageId.split('-');
        const etaxName = cityPageArr[1];
        const baseUrl = ctx.app.config.baseUrl;
        const cityInfo: any = getSwjgInfoByCityName(etaxName);
        const cityCode = cityInfo.code;
        const newTimeUrl = `${baseUrl}/rpa/etax/newera/switch/company?access_token=${access_token}&taxNo=${taxNo}&operationType=${operationType}`;
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const requestParam: any = {
            taxNo,
            account,
            cityCode,
            tenantNo,
            clientId: client_id
        };
        const encryData = encrypt(JSON.stringify(requestParam), encryptKey);
        const res = await ctx.helper.curl(newTimeUrl, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            },
            data: encryData
        });
        ctx.service.log.info('prod新通道切换返回', pageId, res);
        if (retry !== 0 || res.errcode === '0000') {
            return res;
        }

        const resDescription = res.description || '';
        if (res.errcode !== '0000') {
            ctx.service.log.info('切换异常，税号切换参数', pageId, requestParam);
        }

        if (resDescription.includes('未登录') || resDescription.includes('重新登录') || resDescription.includes('重新调用登录接口')) {
            return errcodeInfo.govLogout;
        }

        if (!resDescription.includes('未获取到纳税人信息') && !resDescription.includes('未获取到切换后纳税人信息') && !resDescription.includes('未获取纳税人信息')) {
            return res;
        }

        const res2 = await this.openNewTime(account);
        ctx.service.log.info('开通新时代返回', pageId, res2);
        if (res2.errcode !== '0000') {
            return res2;
        }
        const res3: any = await this.newTimeProdSwitch(opt, 1);
        return res3;
    }

    async checkAccount(opt = {}) {
        const res = await this.newTimeProdLogin(opt);
        return res;
    }

    async login(opt : any = {}) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};
        const taxNo = opt.taxNo || ctx.request.query.taxNo;
        const cityPageArr = pageId.split('-');
        const etaxName = cityPageArr[1];
        const account = opt.loginAccountUid || opt.account;
        const smsCode = opt.shortMsgCode || opt.shortMsg || '';
        const res = await this.newTimeProdLogin(opt);
        if (res.errcode !== '0000') {
            return res;
        }
        const autoLoginList = [
            'tianjin',
            'zhejiang',
            'hubei',
            'guangdong'
        ];
        if (!autoLoginList.includes(etaxName) && !smsCode) {
            return errcodeInfo.success;
        }
        const queryRes = await this.checkIsLogout(account, taxNo, true);
        if (queryRes.errcode === '91300') {
            ctx.service.log.info('登录成功后，查询登录状态返回登录失效');
            return errcodeInfo.govErr;
        }
        if (queryRes.errcode !== '0000') {
            return queryRes;
        }
        ctx.service.nt.getNt(queryRes.data);
        return {
            ...errcodeInfo.success,
            data: {
                taxNo,
                taxPeriod: '',
                skssq: '',
                gxrqfw: '',
                gxczjzrq: '',
                companyType: '03',
                companyName: '',
                homeUrl: '',
                etaxAccountType: 3
            }
        };
    }

    // 通过新时代切换
    async swtichCompany(opt: any) {
        const ctx = this.ctx;
        const { cityPageId } = ctx.request.query;
        const { taxNo: newTaxNo, account } = opt;
        const res = await this.newTimeProdSwitch({ taxNo: newTaxNo, account });
        if (res.errcode !== '0000') {
            return res;
        }

        const queryRes = await this.checkIsLogout(account, newTaxNo, true);
        if (queryRes.errcode !== '0000') {
            return queryRes;
        }
        // 新时代切换后需要关闭窗口重新打开
        await ctx.service.ntTools.closePage(cityPageId);
        await ctx.service.nt.getNt(queryRes.data);
        return errcodeInfo.success;
    }
}