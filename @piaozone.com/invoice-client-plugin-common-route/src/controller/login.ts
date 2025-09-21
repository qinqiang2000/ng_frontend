import { PluginBaseController } from './pluginBaseController';
import { ntLockLoginPreKey, ntLockPreKey, ntLockRequestPreKey } from '../constants';

export default class LoginController extends PluginBaseController {
    async login() {
        const ctx = this.ctx;
        ctx.service.log.info('请求参数', ctx.request.body);
        const { fpdk_type } = ctx.request.query;
        // 全电平台
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined({
                disabledCache: true
            });
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const resData = checkRes.data;
            return await this.responseJson({
                ...errcodeInfo.success,
                data: {
                    skssq: resData.skssq,
                    gxrqfw: resData.gxrqfw,
                    companyType: resData.companyType,
                    companyName: resData.companyName,
                    taxNo: resData.taxNo,
                    baseUrl: resData.homeUrl,
                    etaxAccountType: resData.etaxAccountType
                }
            });
        }

        const checkRes = await ctx.service.ntTools.checkIsLogined({
            disabledAutoLogin: true,
            disabledCheckNt: true
        });
        ctx.service.log.info('登录状态检测返回', checkRes);
        if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
            return await this.responseJson(checkRes, false);
        }
        const { taxNo = '' } = checkRes.data;
        if (!taxNo) {
            ctx.service.log.info('参数配置错误');
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '参数错误，请检查税控设备是否连接正常!'
            });
        }
        const res = await ctx.service.fpdkLogin.diskLogin(taxNo);
        if (res.errcode !== '0000') {
            ctx.service.log.info('登录异常', res);
            ctx.service.ntTools.closePage(taxNo);
        }
        await this.responseJson(res);
    }

    async secondLogin() {
        const ctx = this.ctx;
        ctx.service.log.info('请求参数', ctx.request.body);
        const checkRes = await ctx.service.ntTools.checkIsLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const cacheInfo = checkRes.data;
        const res = {
            ...errcodeInfo.success,
            data: {
                companyType: cacheInfo.companyType,
                companyName: cacheInfo.companyName,
                skssq: cacheInfo.skssq,
                gxrqfw: cacheInfo.gxrqfw,
                baseUrl: cacheInfo.baseUrl,
                etaxAccountType: cacheInfo.etaxAccountType
            }
        };
        await this.responseJson(res);
    }

    async getSkssq() {
        const ctx = this.ctx;
        ctx.service.log.info('plugin getSkssq --- 请求参数', ctx.request.body);

        const { fpdk_type } = ctx.request.query;
        if (fpdk_type === '3' || fpdk_type === '4') {
            const checkRes = await ctx.service.ntTools.checkEtaxLogined();
            if (checkRes.errcode !== '0000') {
                return await this.responseJson(checkRes, false);
            }
            const loginData = checkRes.data;
            const decryedData = ctx.request.body.decryedData || {};
            ctx.service.log.info('请求参数: decryedData', decryedData);
            const res = await ctx.service.etaxLogin.getSkssq(loginData.pageId);
            if (res.errcode === '0000') {
                ctx.service.log.info('获取属期返回', res);
                const dqsqData = res.data;
                const loginDataRes = await ctx.service.ntTools.queryRemoteLoginStatus(loginData.pageId);
                if (loginDataRes.errcode !== '0000') {
                    ctx.service.log.info('获取登录状态异常', loginDataRes);
                    return await this.responseJson(loginDataRes);
                }
                const nextLoginData = {
                    ...loginDataRes.data,
                    skssq: dqsqData.skssq || '',
                    gxrqfw: dqsqData.gxrqfw || '',
                    gxczjzrq: dqsqData.gxczjzrq || '',
                    taxPeriod: dqsqData.taxPeriod || ''
                };
                const updateRes = await ctx.service.ntTools.updateRemoteLoginStatus(loginData.pageId, nextLoginData);
                if (updateRes.errcode !== '0000') {
                    ctx.service.log.info('更新登录状态异常', loginDataRes);
                    return await this.responseJson(updateRes);
                }
                await pwyStore.set(etaxLoginedCachePreKey + loginData.pageId, nextLoginData, 12 * 60 * 60);
            }
            return await this.responseJson(res);
        }

        const checkRes = await ctx.service.ntTools.checkIsLogined();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes, false);
        }
        const cacheInfo = checkRes.data;
        const res = {
            ...errcodeInfo.success,
            data: {
                skssq: cacheInfo.skssq,
                gxrqfw: cacheInfo.gxrqfw
            }
        };
        await this.responseJson(res);
    }

    async getLoginType() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined({
            disabledAutoLogin: true
        });
        if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
            return await this.responseJson(checkRes);
        }
        let loginData = checkRes.data || {};
        const { pageId } = ctx.request.query;
        // 身份认证
        const { decryedData = {} } = ctx.request.body || {};
        const { checkAuth } = decryedData;
        let needAuth; // 是否需要身份认证
        // 是否需要校验身份认证状态
        if (checkAuth === true) {
            const authRes = await ctx.service.scanFaceCheck.checkEtaxNeedAuthStatus(loginData);
            if (authRes.errcode !== '0000' && authRes.errcode !== '91300') {
                return await this.responseJson(authRes);
            }
            if (authRes.errcode === '91300') {
                // 清除登录状态
                await ctx.service.ntTools.updateRemoteLoginStatus(pageId, '');
                pwyStore.delete(etaxLoginedCachePreKey + pageId);
                needAuth = true;
                loginData = {};
            } else {
                needAuth = authRes.data.needAuth;
                loginData = authRes.data.loginData;
            }
        }

        const { etaxAccountInfo = {} } = ctx.request.body;
        // 当前账号非自动登录
        let loginType = '';
        if (!etaxAccountInfo.autoLogin) {
            const resAutoLogin = await ctx.service.checkEtaxLogin.getAccountAutoLoginStatus();
            ctx.service.log.info('getAccountAutoLoginStatus res', resAutoLogin);
            if (resAutoLogin.errcode !== '0000') {
                await this.responseJson(resAutoLogin);
            }
            const { autoLogin, quickLogin, resource } = resAutoLogin.data || {};
            const description = resAutoLogin.description || '';
            if (description.includes('当前账号正在登录中') && resource !== 0) {
                etaxAccountInfo.autoLogin = true; // 这种登录中的状态修复为可以自动登录
                // 电子税局登录页面登录方式 默认快捷登录 3编辑
                loginType = quickLogin ? null : '3';
            } else {
                // 修改自动登录状态
                etaxAccountInfo.autoLogin = !!autoLogin;
                // 电子税局登录页面登录方式 默认快捷登录 3编辑
                loginType = quickLogin ? null : '3';
            }
        }

        const res = await ctx.service.etaxLogin.createLoginResult(loginData, etaxAccountInfo, {
            needAuth,
            loginType
        });
        await this.responseJson(res);
    }

    // 长轮询获取web登录结果
    async getWebLoginStatus() {
        const ctx = this.ctx;
        const res = await ctx.service.etaxLogin.getWebLoginStatus();
        await this.responseJson(res);
    }

    // 税局页面通过后台cookie重新打开
    async etaxLoginOpen() {
        const ctx = this.ctx;
        const bodyData = ctx.request.body || {};
        const { pageId = '' } = bodyData.data || {};
        const res = await ctx.service.etaxFpdkLogin.common.reOpenEtaxPage(pageId);
        await this.responseJson(res);
    }

    async relaseLock() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            return this.responseJson(checkRes);
        }
        const { pageId } = ctx.request.query;
        await ctx.service.redisLock.delete(ntLockPreKey + pageId);
        await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
        return this.responseJson(errcodeInfo.success);
    }

    async keepAlive() {
        const ctx = this.ctx;
        const { access_token, taxNo } = ctx.request.query || {};
        const { pageId = '', keepAliveType } = ctx.request.body;
        const listArr = pageId.split('-');
        const tenantNo = listArr[0] || '';
        const cityPageId = pageId;
        ctx.service.log.info('cityPageId', cityPageId);
        const tempLoginData = await pwyStore.get(etaxLoginedCachePreKey + cityPageId);
        if (!tempLoginData || !tempLoginData.baseUrl) {
            return await this.responseJson({
                ...errcodeInfo.success,
                data: false,
                description: '登录已失效'
            });
        }
        const tokenCheckRes = await ctx.service.fpyTokenInfo.getTokenInfo(access_token, 4, taxNo);
        if (tokenCheckRes.errcode !== '0000') {
            return await this.responseJson({
                ...errcodeInfo.success,
                data: false,
                description: tokenCheckRes.description
            });
        }
        const client_id = tokenCheckRes.data ? tokenCheckRes.data.client_id : '';
        const isNewTimeTaxNo = tempLoginData?.loginFrom === 'newTime';
        ctx.request.query.isNewTimeTaxNo = isNewTimeTaxNo;
        const account = pageId.split('-').splice(2).join('-');
        ctx.request.query.cityPageId = cityPageId;
        ctx.request.query.pageId = cityPageId;
        ctx.request.query.realPageId = pageId;
        ctx.request.query.client_id = client_id;
        // 租户id 基本都要
        ctx.request.query.tenantNo = tenantNo;
        ctx.request.query.taxNo = taxNo;

        const requestLockValue = pwyStore.get(ntLockRequestPreKey + pageId);
        if (requestLockValue) {
            if ((+new Date()) - parseInt(requestLockValue.split('_')[0]) < 300000) {
                return await this.responseJson({
                    ...errcodeInfo.success,
                    data: ctx.service.etaxFpdkLogin.common.createLoginData(tempLoginData),
                    description: '当前可能正在处理业务不需要执行保活'
                });
            }
            pwyStore.delete(ntLockRequestPreKey + pageId);
        }

        const decryedData = {
            taxNo,
            account,
            roleText: tempLoginData.roleText,
            keepAliveType
        };
        ctx.request.body.decryedData = decryedData;
        const res = await ctx.service.etaxFpdkLogin.common.commonPreCheck(decryedData);
        return await this.responseJson(res);
    }

    async switchCompany() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        const { taxNo } = ctx.request.query || {};
        const { decryedData = {} } = checkRes.data;
        const { account } = decryedData;
        const roleType = decryedData.roleType;
        if (!account) {
            return {
                ...errcodeInfo.argsErr,
                description: '账号信息不能为空'
            };
        }
        const res = await ctx.service.switchCompany.switch({
            account,
            taxNo,
            roleType
        });
        if (res.errcode === '91300') {
            return await this.responseJson({
                ...errcodeInfo.govErr,
                description: '切换失败，请重新登录!'
            });
        }
        return await this.responseJson(res);
    }
}
