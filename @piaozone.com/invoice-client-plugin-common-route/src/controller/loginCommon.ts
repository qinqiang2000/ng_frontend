import { PluginBaseController } from './pluginBaseController';
import { ETAX_LOGIN_OPTIONS, ETAX_LOGIN_ROLES, FIX_TAXNO_CITY } from '../constants';
import { getSwjgInfoByTaxNo } from '$utils/tools';

export default class LoginCommonController extends PluginBaseController {
    checkCity(funcName: string) {
        const ctx = this.ctx;
        const { decryedData } = ctx.request.body;

        const { city } = decryedData || {};
        if (!city) {
            return {
                errcode: '0001',
                description: '税号所在税局地区‘city’必填'
            };
        }
        const etaxLoginOption: any = ETAX_LOGIN_OPTIONS.find((item) => item.city === city || item.name === city);
        const { name } = etaxLoginOption || {};
        if (!name) {
            ctx.service.log.info('checkCity city', city);
            return {
                errcode: '0001',
                description: '获取税号所在税局地区异常'
            };
        }

        if (typeof ctx.service.etaxFpdkLogin[name][funcName] !== 'function') {
            ctx.service.log.info('checkCity error', name, funcName);
            return {
                errcode: '0001',
                description: `${city}地区税局登录异常`
            };
        }
        return {
            ...errcodeInfo.success,
            data: etaxLoginOption
        };
    }

    apiTest() {
        const ctx = this.ctx;

        const apis = ['stepOneLogin', 'sendShortMsg', 'login'];
        const errorCity: Array<{
            city: string;
            testDetail: Array<{
                funcName: string;
                isOk: boolean;
            }>
        }> = [];
        const autoLoginCity: Array<string> = [];
        const notSupportedCity: Array<string> = [];

        for (const option of ETAX_LOGIN_OPTIONS) {
            const { autoLogin, city, name } = option;
            const isSupported = typeof ctx.service.etaxFpdkLogin[name] !== 'undefined';
            let testDetail;
            if (isSupported) {
                if (autoLogin) {
                    testDetail = [{
                        funcName: 'login',
                        isOk: typeof ctx.service.etaxFpdkLogin[name].login === 'function'
                    }];
                } else {
                    testDetail = apis.map((funcName) => {
                        const info = {
                            funcName,
                            isOk: typeof ctx.service.etaxFpdkLogin[name][funcName] === 'function'
                        };
                        return info;
                    });
                }
            } else {
                notSupportedCity.push(city);
            }
            if (autoLogin) {
                autoLoginCity.push(city);
            }
            const testOk = testDetail ? testDetail.every((item) => item.isOk) : true;
            if (!testOk) {
                errorCity.push({
                    city,
                    testDetail
                });
            }
        }

        ctx.body = {
            ...errcodeInfo.success,
            data: {
                errorCity,
                notSupportedCity,
                autoLoginCity
            }
        };
    }

    async stepOneLogin() {
        const ctx = this.ctx;
        const { isNewTimeTaxNo } = ctx.request.query || {};
        const { decryedData } = ctx.request.body;
        const { loginAccountUid, account } = decryedData || {};
        if (isNewTimeTaxNo) {
            ctx.body = {
                ...errcodeInfo.success,
                data: loginAccountUid || account
            };
            return;
        }
        const funcName = 'stepOneLogin';
        const resCity = this.checkCity(funcName);
        if (resCity.errcode !== '0000') {
            ctx.body = resCity;
            return;
        }
        const { name } = resCity.data || {};

        const res = await ctx.service.etaxFpdkLogin[name][funcName]({ data: decryedData });
        const description = res.description || '';
        if (description.includes('密码错误') || description.includes('用户密码登录错误')) {
            await ctx.service.checkEtaxLogin.recordSendMsg('1', '1');
        } else {
            await ctx.service.checkEtaxLogin.recordSendMsg('1', '2');
        }
        ctx.body = res;
    }

    async sendShortMsg() {
        const ctx = this.ctx;
        const { isNewTimeTaxNo } = ctx.request.query || {};
        const { decryedData } = ctx.request.body;
        const funcName = 'sendShortMsg';
        const resCity = this.checkCity(funcName);
        if (resCity.errcode !== '0000') {
            ctx.body = resCity;
            return;
        }
        const { name } = resCity.data || {};
        let res;
        if (isNewTimeTaxNo) {
            res = await ctx.service.newTime.login({
                ...decryedData,
                shortMsgCode: '',
                shortMsg: ''
            });
        } else {
            res = await ctx.service.etaxFpdkLogin[name][funcName]({ data: decryedData });
        }

        const description = res.description || '';
        if (description.includes('密码错误') || description.includes('用户密码登录错误')) {
            await ctx.service.checkEtaxLogin.recordSendMsg('1', '1');
        } else if (description.includes('次数超限')) {
            await ctx.service.checkEtaxLogin.recordSendMsg('5', '1');
        } else {
            await ctx.service.checkEtaxLogin.recordSendMsg('1,5', '2');
        }
        ctx.body = res;
    }

    async login() {
        const ctx = this.ctx;
        const { tenantNo, taxNo, isNewTimeTaxNo } = ctx.request.query;
        const { decryedData } = ctx.request.body;
        const { etaxAccountInfo } = ctx.request.body;
        const { loginAccountUid, companyName, isQuickLogin } = decryedData || {};
        const { etaxAccountType: initEtaxAccountType, etaxRoleType } = etaxAccountInfo || {};

        const funcName = 'login';
        const resCity = this.checkCity(funcName);
        if (resCity.errcode !== '0000') {
            ctx.body = resCity;
            return;
        }
        const { city, name, autoLogin } = resCity.data || {};
        let res;
        if (isNewTimeTaxNo) {
            res = await ctx.service.newTime.login(decryedData);
        } else {
            res = await ctx.service.etaxFpdkLogin[name][funcName]({ data: decryedData });
        }
        ctx.service.log.info('登录返回', res);
        const description = res.description || '';
        if (description.includes('密码错误') || description.includes('用户密码登录错误')) {
            await ctx.service.checkEtaxLogin.recordSendMsg('1', '1');
        } else if (description.includes('验证码错误')) {
            await ctx.service.checkEtaxLogin.recordSendMsg('2', '1');
        } else {
            await ctx.service.checkEtaxLogin.recordSendMsg('1,2', '2');
        }

        if (res.errcode !== '0000') {
            if (autoLogin) {
                // 自动登录的地区
                // 登录出现错误可能是密码错误，需要将登录设置为非自动登录，并同步到当前的客户端, 下次请求到这个客户端后将会触发手动输入
                const errRes = await ctx.service.etaxLogin.loginError(res, {
                    tenantNo,
                    taxNo,
                    loginAccountUid,
                    etaxAccount: decryedData
                });
                ctx.body = errRes;
                return;
            }
            ctx.body = res;
            return;
        }
        const { etaxAccountType, roleText } = res.data;
        const roleInfo = ETAX_LOGIN_ROLES.find((item) => item.key === roleText || item.value === roleText) || ETAX_LOGIN_ROLES[0];


        if (!isQuickLogin || initEtaxAccountType !== etaxAccountType || etaxRoleType !== roleInfo.key) {
            // 非快捷登录 账户权限不一致 账户角色不一致
            // 添加或更新服务端与客户端的电子税局账号
            const opt = {
                city,
                etaxName: name,
                autoLogin,
                taxNo,
                companyName,
                loginAccountUid,
                tenantNo,
                etaxAccount: decryedData,
                etaxAccountType
            };
            const updateRes = await ctx.service.etaxLogin.updateOrCreateEtaxAccount(opt);
            if (updateRes.errcode !== '0000') {
                ctx.body = updateRes;
                return;
            }
        }

        // 通知客户端与长链接页面
        await ctx.service.etaxLogin.afterLogin(errcodeInfo.success, loginAccountUid);

        ctx.body = res;
    }

    // 企业认证
    async companyAuth() {
        const ctx = this.ctx;
        const { pageId, taxNo: queryTaxNo } = ctx.request.query;
        // 参数校验
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            await this.responseJson(checkRes);
            return;
        }
        const { decryedData } = checkRes.data;
        const data = decryedData;
        const { taxNo, account } = decryedData || {};
        let city: string;
        // 常量里是否有该税号
        const obj = FIX_TAXNO_CITY.find((i) => i.taxNo === taxNo);
        ctx.service.log.info('companyAuth obj', obj);
        if (obj) {
            city = obj.city;
        } else {
            // 获取缓存
            city = pwyStore.get('etaxCompanyAuthArea-' + taxNo);
            ctx.service.log.info('companyAuth etaxCompanyAuthArea', city);
        }
        if (city && typeof city === 'string') {
            data.city = city;
        }
        const requsetCityInfo = ETAX_LOGIN_OPTIONS.find((item) => item.city === data.city);
        ctx.service.log.info('匹配到的城市信息', taxNo, requsetCityInfo);
        // 传参城市为主，税号所在城市为辅
        let cityInfo: any = {};
        if (requsetCityInfo?.name) {
            cityInfo = requsetCityInfo;
        } else {
            const taxNoCityInfo = getSwjgInfoByTaxNo(taxNo);
            ctx.service.log.info('根据税号匹配到的城市信息', taxNoCityInfo);
            cityInfo = taxNoCityInfo;
        }

        ctx.service.log.info('城市信息', cityInfo);
        if (!cityInfo?.name) {
            return await this.responseJson({
                errcode: '0001',
                description: '获取税号所在税局地区异常'
            });
        }
        let isNewTimeTaxNo = false;
        const { tenantNo } = ctx.request.query || {};
        if (data.companyName) {
            isNewTimeTaxNo = true;
            ctx.request.query.isNewTimeTaxNo = true;
            ctx.request.query.pageId = `${tenantNo}-${cityInfo.name}}-${account}`;
        } else {
            ctx.request.query.isNewTimeTaxNo = false;
        }
        ctx.service.log.info('pageId', ctx.request.query.pageId);
        /*
        const grayRes = await ctx.service.newTime.isGrayTaxNo(queryTaxNo);
        if (grayRes.errcode !== '0000') {
            return await this.responseJson(grayRes);
        }
        const isNewTimeTaxNo = grayRes.data !== 'notSupport';
        ctx.service.log.info('是否走新通道', isNewTimeTaxNo);
        */

        // 清理登录状态
        await pwyStore.delete(etaxLoginedCachePreKey + pageId);
        await ctx.service.nt.clearNtCookies(pageId);
        let resAuth;
        // if rpa 企业认证 else 新时代企业认证
        if (!isNewTimeTaxNo) {
            const etaxServiceCity = ctx.service.etaxFpdkLogin[cityInfo.name];
            if (etaxServiceCity) {
                if (etaxServiceCity.checkAccount) {
                    resAuth = await etaxServiceCity.checkAccount({ data });
                } else if (cityInfo.autoLogin && etaxServiceCity.login) {
                    resAuth = await etaxServiceCity.login({ data });
                } else if (!cityInfo.autoLogin && etaxServiceCity.stepOneLogin) {
                    resAuth = await etaxServiceCity.stepOneLogin({ data });
                } else {
                    resAuth = {
                        ...errcodeInfo.argsErr,
                        description: `${cityInfo.city}地区的企业认证异常`
                    };
                }
            } else {
                resAuth = {
                    ...errcodeInfo.argsErr,
                    description: `暂不支持${cityInfo.city}地区的企业认证`
                };
            }
        } else {
            resAuth = await ctx.service.newTime.checkAccount({
                ...data,
                city: cityInfo.city,
                shortMsgCode: '',
                shortMsg: ''
            });
        }
        // 成功 处理返回的信息
        if (resAuth.errcode === '0000') {
            resAuth = {
                ...errcodeInfo.success,
                description: '企业认证成功！'
            };
        } else {
            resAuth = {
                ...resAuth,
                city: cityInfo.city
            };
        }

        await this.responseJson(resAuth);
    }
}