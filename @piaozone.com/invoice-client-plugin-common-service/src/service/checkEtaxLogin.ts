/* eslint-disable complexity */
import { ntLockLoginPreKey, ETAX_LOGIN_OPTIONS, etaxOpenApi } from '../constant';
import { getUUId } from '$utils/getUid';
import { sleep, accountHidePart } from '$utils/tools';
import { getSwjgInfoByCityName } from '../utils/swjgInfo';

export class CheckEtaxLogin extends BaseService {
    // 获取验证码
    async getShortMsg(sendTime: string) {
        const ctx = this.ctx;
        const { etaxAccountInfo = {} } = ctx.request.body;
        const { loginAccountUid, cityCode } = etaxAccountInfo;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, tenantNo, client_id, pageId } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const requestUrl = `/rpa/etax/get/smsCode?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}`;
        const url = ctx.app.config.baseUrl + requestUrl;
        const requsetData = {
            cityCode,
            phoneNum: loginAccountUid,
            smsCodeSendDateTime: sendTime
        };
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = aesEncrypt(JSON.stringify(requsetData), encryptKey);
        let res: any = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            data: encryData,
            headers: {
                'content-type': 'application/json',
                'client-platform': 'digital_invoice'
            }
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('获取验证码异常', pageId, res);
            const time = moment(sendTime, 'YYYY-MM-DD HH:mm:ss').valueOf();
            if ((+new Date()) - time > 5 * 60 * 1000) {
                ctx.service.log.info('获取验证码结束', pageId, (+new Date()) - time);
                return res;
            }
            // 避免死循环
            await sleep(10000);
            res = await this.getShortMsg(sendTime);
            return res;
        }
        ctx.service.log.info('获取验证码返回', pageId, res);
        if (!res.data?.smsCode) {
            return {
                errorcode: '0001',
                description: '自动登录失败，获取短信验证码为空'
            };
        }
        return res;
    }

    async shortMsgAutoLogin() {
        const ctx = this.ctx;
        const { etaxAccountInfo } = ctx.request.body;
        const { etaxAccount, etaxName } = etaxAccountInfo;
        const { pageId, isNewTimeTaxNo, taxNo } = ctx.request.query || {};
        let res;

        if (!isNewTimeTaxNo) {
            res = await ctx.service.etaxFpdkLogin[etaxName].stepOneLogin({
                data: etaxAccount
            });
            ctx.service.log.info('第一步登录返回', pageId, res);
            const resDescription = res.description || '';
            if (res.errcode !== '0000') {
                if (resDescription.includes('密码错误') || resDescription.includes('用户密码登录错误')) {
                    await this.recordSendMsg('1', '1');
                }
                return res;
            }
            // 释放密码错误
            await this.recordSendMsg('1', '2');
        }
        // 发送前记录
        res = await this.recordSendMsg('4', '1');
        if (res.errcode !== '0000') {
            return res;
        }
        const startTime = res.data?.time || moment().format('YYYY-MM-DD HH:mm:ss');
        ctx.service.log.info('开始发送验证码', pageId, taxNo);
        res = await ctx.service.etaxFpdkLogin[etaxName].sendShortMsg({
            data: {
                ...etaxAccount,
                shortMsgCode: '',
                shortMsg: ''
            }
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('发送验证码失败', pageId, res);
            const description = res.description || '';
            if (description.includes('密码错误') || description.includes('用户密码登录错误')) {
                await this.recordSendMsg('1', '1');
                return res;
            }
            if (description.includes('次数超限')) {
                await this.recordSendMsg('5', '1');
                return {
                    ...res,
                    description: '当天短信发送次数超限，请于次日0点后再试'
                };
            }
            if (description.includes('未获取到当前纳税人所属省份') || description.includes('纳税人识别号错误') || description.includes('请确认录入的信息是否正确')) {
                // 释放密码错误、次数超限, 半小时发送5次清空
                await this.recordSendMsg('1,4,5', '2');
                return res;
            }
            // 释放密码错误、次数超限
            await this.recordSendMsg('1,5', '2');
            return res;
        }
        ctx.service.log.info('发送验证码成功, 开始获取验证码', pageId);
        // 释放密码错误、次数超限
        await this.recordSendMsg('1,5', '2');
        const getRes: any = await this.getShortMsg(startTime);
        // 获取验证码异常
        if (getRes.errcode !== '0000') {
            ctx.service.log.info('获取验证码异常', pageId, getRes);
            await this.recordSendMsg('3', '1');
            return getRes;
        }
        if (!getRes.data?.smsCode) {
            ctx.service.log.info('获取验证码返回为空', pageId, getRes);
            await this.recordSendMsg('3', '1');
            return {
                ...errcodeInfo.fpyInnerErr,
                description: '验证码获取失败'
            };
        }
        // 释放获取验证码失败
        await this.recordSendMsg('3', '2');
        const smsCode = getRes.data?.smsCode;
        ctx.service.log.info('获取验证码成功', pageId);
        res = await ctx.service.etaxFpdkLogin[etaxName].login({
            data: {
                ...etaxAccount,
                shortMsgCode: smsCode,
                shortMsg: smsCode
            }
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('验证码登录异常', pageId, res);
            const description = res.description || '';
            if (description.includes('验证码错误')) {
                // 记录验证码错误
                await this.recordSendMsg('2', '1');
                return res;
            }
        }
        ctx.service.log.info('验证码登录成功', pageId);
        // 解锁验证码错误
        await this.recordSendMsg('2', '2');
        return res;
    }

    async lockForAutoLogin(type: number) {
        const ctx = this.ctx;
        const { etaxAccountInfo } = ctx.request.body;
        const { etaxAccount, etaxName } = etaxAccountInfo;
        const { pageId, tenantNo, taxNo } = ctx.request.query || {};
        const lockTime = type === 1 ? 60 : 5 * 60;
        const lockRes = await ctx.service.redisLock.checkNtSet(ntLockLoginPreKey + pageId, lockTime);
        // 获取锁异常
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }

        if (lockRes.data?.result === false) {
            return {
                ...errcodeInfo.argsErr,
                description: '当前账号正在登录中，稍后再试！'
            };
        }

        ctx.request.query.ignoreLock = true;
        // 修改为登陆中
        await ctx.service.fpyQueryInvoices.uploadAccountInfo(3);
        let res;
        try {
            // 可以自动登录的城市
            if (type === 1) {
                const etaxService = ctx.service.etaxFpdkLogin[etaxName];
                if (!etaxAccount || !etaxAccount.accountPasswd) {
                    return {
                        ...errcodeInfo.argsErr,
                        description: '当前账号信息有误，请重新编辑账号更新!'
                    };
                }
                res = await etaxService.login({
                    data: etaxAccount
                });
            } else {
                res = await this.shortMsgAutoLogin();
            }
        } catch (error) {
            ctx.service.log.info('自动登录出现异常', error);
            await ctx.service.fpyQueryInvoices.uploadAccountInfo(2);
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
            return errcodeInfo.govErr;
        }
        if (res.errcode !== '0000') {
            await ctx.service.fpyQueryInvoices.uploadAccountInfo(2);
            // 登录出现错误可能是密码错误，需要将登录设置为非自动登录，并同步到当前的客户端, 下次请求到这个客户端后将会触发手动输入
            const errRes = await ctx.service.etaxLogin.loginError(res, {
                tenantNo: tenantNo,
                taxNo: taxNo,
                loginAccountUid: etaxAccountInfo.loginAccountUid,
                etaxAccount
            });
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
            return errRes;
        }

        await ctx.service.fpyQueryInvoices.uploadAccountInfo(1);
        const loginInfo = pwyStore.get(etaxLoginedCachePreKey + pageId);
        await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
        return {
            ...errcodeInfo.success,
            data: loginInfo
        };
    }

    // type 解锁类型 支持逗号分割传多个
    // type: 1、密码错误，2、验证码错误，3、验码获取失败，4、地区验码发送限制5次，5、验证码次数超限，6、地区登录限制,7、发送验证码,
    // action: ：1、记录、2、解锁
    async recordSendMsg(type: string, action: '1'|'2') {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};

        const tipList = ['密码错误', '验证码错误', '验码获取失败', '30分钟内发送限制最多5次', '验证码次数超限', '地区登录限制'];
        const actionTip = action === '1' ? '记录' : '释放';
        const typeList = type.split(',');
        const typeStrList = [];
        for (let i = 0; i < typeList.length; i++) {
            const typeIndex = typeList[i];
            typeStrList.push(tipList[parseInt(typeIndex) - 1]);
        }
        const typeStr = typeStrList.join(',');
        ctx.service.log.info(`验证码自动登录: ${actionTip} ${typeStr}`, pageId);

        const { decryedData = {} } = ctx.request.body;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, tenantNo, client_id } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const baseUrl = ctx.app.config.baseUrl;
        const originKey = tenantNo + client_id;
        const encryptKey = hex_md5(originKey).substring(0, 16);
        const etaxName = pageId.split('-')[1];
        const cityInfo: any = getSwjgInfoByCityName(etaxName);
        const loginAccountUid = decryedData.loginAccountUid || decryedData.account;
        const data = {
            cityName: cityInfo.city,
            cityCode: cityInfo.code,
            account: loginAccountUid,
            type: type,
            action
        };
        const encryData = aesEncrypt(JSON.stringify(data), encryptKey);
        const url = `${baseUrl}/rpa/etax/handle/record/sendCode?reqid=${reqid}&access_token=${access_token}&taxNo=${taxNo}`;
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'content-type': 'application/json'
            },
            data: encryData
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('记录发送验证码参数', pageId, data);
            ctx.service.log.info('记录发送验证码返回', pageId, res);
        }

        return res;
    }

    // 检测是否允许自动发送验证码
    async checkAllowAutoSendMsg() {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};
        const { decryedData = {} } = ctx.request.body;
        const etaxName = pageId.split('-')[1];
        const cityInfo: any = getSwjgInfoByCityName(etaxName);
        const loginAccountUid = decryedData.loginAccountUid || decryedData.account;

        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, tenantNo, client_id } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const baseUrl = ctx.app.config.baseUrl;
        const originKey = tenantNo + client_id;
        const encryptKey = hex_md5(originKey).substring(0, 16);
        const data = {
            cityName: cityInfo.city,
            cityCode: cityInfo.code,
            account: loginAccountUid
        };
        const encryData = aesEncrypt(JSON.stringify(data), encryptKey);
        const url = `${baseUrl}/rpa/etax/check/allow/sendCode?reqid=${reqid}&access_token=${access_token}&taxNo=${taxNo}`;
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'content-type': 'application/json'
            },
            data: encryData
        });
        ctx.service.log.info('查询是否自动发送验证码返回', res);
        if (res.errcode !== '0000') {
            ctx.service.log.info('查询是否自动发送验证码异常，参数', data);
        }

        return res;
    }

    async getLoginUrl(auth_code: string, opt : any = {}) {
        const ctx = this.ctx;
        const { taxNo } = ctx.request.query || {};
        const { etaxAccountInfo } = ctx.request.body;
        const { checkAuth = false, loginType = null } = opt;
        const { tenantNo, loginAccountUid } = etaxAccountInfo;
        // longLinkName
        const resName = await ctx.service.ntTools.getLongLinkName(tenantNo);
        if (resName.errcode !== '0000') {
            return resName;
        }
        const longLinkName = resName.data;

        // web地址
        const resUrl = await ctx.service.etaxLogin.getEtaxLoginWebUrl({
            auth_code,
            taxNo,
            longLinkName,
            checkAuth,
            loginAccountUid,
            loginType
        });
        ctx.service.log.info('获取推送链接，返回', resUrl);
        if (resUrl.errcode !== '0000') {
            return resUrl;
        }
        return resUrl;
    }

    async pushWxMsg(auth_code: string, opt : any = {}) {
        const ctx = this.ctx;
        const { taxNo, access_token, fpdk_type = 3, client_id, operationType, pageId } = ctx.request.query;
        const { etaxAccountInfo, decryedData } = ctx.request.body;
        const { checkAuth = false, name = '' } = opt;
        const { tenantNo, loginAccountUid, city } = etaxAccountInfo;
        const returnErrcodeInfo = checkAuth ? errcodeInfo.govAuthFail : errcodeInfo.govLogout;
        const typeText = checkAuth ? '扫脸认证' : '登录';
        const description = `账号${accountHidePart(loginAccountUid)}在电子税局${typeText}已失效`;
        const fpdkType = +(fpdk_type || decryedData.fpdkType);
        // 查询税局账号和公众号绑定信息
        const resWxRelation = await ctx.service.webService.wxRelationQueryInfo({
            taxNo,
            loginAccountUid
        }, access_token);
        ctx.service.log.info('查询税局账号和公众号绑定信息', resWxRelation);
        if (resWxRelation.errcode !== '0000') {
            return resWxRelation;
        }
        const { bindFlag, openId } = resWxRelation.data || {};
        const pushKey = `pushWsMsg-${pageId}-${taxNo}-${openId}`;
        const lockRes = await ctx.service.redisLock.checkNtSet(pushKey, 60 * 60);
        // 获取锁异常
        if (lockRes.errcode !== '0000') {
            ctx.service.log.info('公众号消息限制1小时异常', pushKey, lockRes);
            return lockRes;
        }
        if (lockRes.data?.result === false) {
            ctx.service.log.info('公众号消息限制1小时最多发送一次', pushKey);
            return {
                ...returnErrcodeInfo,
                description: `${description}，请通知该用户在金蝶发票云公众号中完成${typeText}操作。`,
                lastPushUid: ctx.uid,
                lastPushOpenId: openId
            };
        }
        // 是否已绑定
        if (bindFlag === 1) {
            // FIXME 账号与租户绑定 解决模板消息无法获取租户信息的问题 企业信息-企业账号-微信绑定，绑定账号并绑定租户功能发版后可去除
            const resWxBind = await ctx.service.webService.weChatUserBindTenant({
                openId,
                tenantNo
            }, access_token);
            if (resWxBind.errcode !== '0000') {
                ctx.service.log.info('查询绑定关系异常', resWxBind, openId, tenantNo);
                return resWxBind;
            }
            // 发送模板消息 不传longLinkName由长链接去识别，保证模板消息永久有效
            const isOpen = etaxOpenApi.some((url) => ~ctx.request.url.indexOf(url));
            const sendMsgData = {
                openId, // 微信openId
                area: city, // 模板展示的城市
                authCode: auth_code, // 临时授权
                taxNo, // 税号
                longLinkName: name, // 传空字符串
                checkAuth, // 是否身份认证
                loginAccountUid: encodeURI(loginAccountUid), // 账号
                clientId: client_id, // 微信授权时识别账号所属税号
                fpdk_type: fpdkType, // 统计用
                operationType: operationType === '1' ? '1' : operationType === '2' ? '2' : isOpen ? '1' : '2' // 操作类型 默认收票 2收票 1开票
            };
            const resWxSendMsg = await ctx.service.webService.wxRelationQuerySendMsg(sendMsgData, access_token);
            if (resWxSendMsg.errcode !== '0000') {
                ctx.service.log.info('发送模板消息异常', sendMsgData, resWxSendMsg);
                return resWxSendMsg;
            }
            ctx.service.log.info('发送模板消息成功');
            return {
                ...returnErrcodeInfo,
                description: `${description}，已向用户${accountHidePart(loginAccountUid)}绑定的微信用户推送服务号消息，请通知该用户在金蝶发票云公众号中完成${typeText}操作。`,
                lastPushUid: ctx.uid,
                lastPushOpenId: openId
            };
        }
        ctx.service.log.info('未绑定不需要推送');
        return {
            ...errcodeInfo.success,
            description: '未绑定公众号不需要推送'
        };
    }

    // 登录失效通知
    async logoutNotice(opt : any = {}) {
        const ctx = this.ctx;
        const { needLogin = true, checkAuth = false } = opt;
        const { fetchOrigin, fpdk_type = 3 } = ctx.request.query || {};
        const { etaxAccountInfo, decryedData } = ctx.request.body;
        const returnErrcodeInfo = checkAuth ? errcodeInfo.govAuthFail : errcodeInfo.govLogout;
        const typeText = checkAuth ? '扫脸认证' : '登录';
        const description = `电子税局${typeText}已失效`;
        const { loginAccountUid, autoLogin, city, etaxRoleType } = etaxAccountInfo;
        const fpdkType = +(fpdk_type || decryedData.fpdkType);
        const authCodeRes = await ctx.service.fpyTokenInfo.getAuthCode({
            loginAccountUid,
            city,
            etaxRoleType,
            needLogin,
            autoLogin
        });

        if (authCodeRes.errcode !== '0000') {
            ctx.service.log.info('获取authCode异常', authCodeRes);
            return authCodeRes;
        }

        const auth_code = authCodeRes.auth_code;
        const loginUrlRes = await this.getLoginUrl(auth_code, opt);
        if (loginUrlRes.errcode !== '0000') {
            return loginUrlRes;
        }

        const loginWebUrl = loginUrlRes.data;

        // 本地直接弹出登录框
        if (fetchOrigin === 'local') {
            await ctx.service.ntTools.createEtaxLoginWin(loginWebUrl);
            return {
                ...returnErrcodeInfo,
                description: `${description}，请在客户端${typeText}后重新操作！`,
                isLocalClient: true,
                data: {
                    scanFaceCheckUrl: loginWebUrl
                }
            };
        }

        // 星瀚和星空eas调用
        if (fpdkType === 4 || fpdkType === 3) {
            const res = await this.pushWxMsg(auth_code, opt);
            // 推送成功
            if (res.lastPushOpenId) {
                return res;
            }
        }

        // 云化
        if (ctx.app.config.IS_CLOUD_VERSION) {
            return {
                ...returnErrcodeInfo,
                description: `${description}，请用浏览器打开该地址：${loginWebUrl}，完成${typeText}后重新操作！`,
                data: {
                    scanFaceCheckUrl: loginWebUrl
                }
            };
        }

        if (fpdkType === 4) {
            // 星瀚直接返回 不显示本地登录弹窗
            return returnErrcodeInfo;
        }

        await ctx.service.ntTools.createEtaxLoginWin(loginWebUrl);
        return {
            ...returnErrcodeInfo,
            description: `${description}，请在客户端${typeText}后重新操作！`,
            isLocalClient: true,
            data: {
                scanFaceCheckUrl: loginWebUrl
            }
        };
    }

    async getAccountAutoLoginStatus() {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};
        const etaxName = pageId.split('-')[1];
        const cityInfo = ETAX_LOGIN_OPTIONS.filter((item) => {
            return item.name === etaxName;
        })[0];

        let autoLogin = false;
        // 允许自动登录的城市
        if (cityInfo.autoLogin) {
            autoLogin = true;
        }
        // 是否快捷登录，密码没有出现错误，可以快捷登录
        const quickLogin = true;
        if ((typeof ctx.service.etaxFpdkLogin[etaxName].stepOneLogin !== 'function') &&
            (typeof ctx.service.etaxFpdkLogin[etaxName].sendShortMsg !== 'function') &&
            (typeof ctx.service.etaxFpdkLogin[etaxName].login !== 'function')) {
            ctx.service.log.info('getAccountAutoLoginStatus etaxName', etaxName);
            return {
                ...errcodeInfo.success,
                data: {
                    autoLogin,
                    quickLogin
                }
            };
        }

        const resTaxSource = await ctx.service.autoLogin.getTaxSource();
        if (resTaxSource.errcode !== '0000') {
            return resTaxSource;
        }
        let resource = resTaxSource?.data?.resource || '0';
        resource = parseInt(resource);
        // 1华盟 2发票云 3 企享云托管
        if (resource === 1 || resource === 2 || resource === 3) {
            ctx.service.log.info('查询短信自动登录配置', resource);
            autoLogin = true;
        }

        // 不能自动登录直接返回，通过城市和短信是否托管判断
        if (!autoLogin) {
            return {
                ...errcodeInfo.success,
                data: {
                    resource,
                    autoLogin,
                    quickLogin
                }
            };
        }

        // 检查短信的发送情况
        const res = await this.checkAllowAutoSendMsg();
        ctx.service.log.info('checkAllowAutoSendMsg res', res);
        if (res.errcode !== '0000') {
            if (resource !== 1) {
                const loginType = quickLogin ? null : '3';
                await this.logoutNotice({ loginType });
            }
            return {
                ...res,
                data: {
                    resource,
                    autoLogin: false,
                    quickLogin
                }
            };
        }

        const resData = res.data || {};
        // 发送短信没有异常，可以正常自动登录
        if (resData.autoLogin && resData.quickLogin) {
            return {
                ...errcodeInfo.success,
                description: res.description,
                data: {
                    resource,
                    autoLogin: true,
                    quickLogin: true
                }
            };
        }

        if (resource !== 1) {
            const loginType = quickLogin ? null : '3';
            await this.logoutNotice({ loginType });
        }

        return {
            ...errcodeInfo.success,
            description: res.description,
            data: {
                resource,
                autoLogin: false,
                quickLogin
            }
        };
    }

    // 检测当前电子税局的登录状态
    async check(opt: any = {}) {
        const ctx = this.ctx;
        const requestBody = ctx.request.body || {};
        const queryInfo = ctx.request.query || {};
        let pageId = queryInfo.pageId;
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        let nt = ntInfo ? ntInfo[pageId] : null;
        const { disabledAutoLogin } = opt;
        let etaxAccountInfo = requestBody.etaxAccountInfo;
        if (!etaxAccountInfo || !pageId) {
            const checkRes = await ctx.service.ntTools.checkRequest(ctx.isEncrypt);
            if (checkRes.errcode !== '0000') {
                return checkRes;
            }
            const checkData = checkRes.data || {};
            pageId = checkData.pageId;
            etaxAccountInfo = checkData.etaxAccountInfo;
            nt = ntInfo ? ntInfo[pageId] : null;
        }
        const loginDataRes = await ctx.service.ntTools.queryRemoteLoginStatus(pageId);
        if (loginDataRes.errcode !== '0000') {
            return loginDataRes;
        }
        let loginData = loginDataRes.data || {};
        const { autoLogin } = etaxAccountInfo;
        const etaxName = etaxAccountInfo.etaxName;
        ctx.service.log.info('已登录企业', pageId, loginData?.taxNo);
        ctx.service.log.info('当前企业', pageId, queryInfo.taxNo);
        ctx.service.log.info('自动登录信息', etaxName, autoLogin);
        // 禁止自动登录时,登录失效时直接返回,不再重新登录电子税局
        if (disabledAutoLogin && (!loginData || !loginData.loginedCookies)) {
            return errcodeInfo.govLogout;
        }
        // 不需要进一步校验登录，如果有信息直接返回
        if (disabledAutoLogin && !ctx.request.body.decryedData?.checkAuth && loginData?.loginedCookies) {
            return {
                ...errcodeInfo.success,
                data: loginData
            };
        }

        if (loginData && loginData.loginedCookies) {
            if (loginData.loginFrom === 'newTime') {
                ctx.request.query.isNewTimeTaxNo = true;
            } else {
                ctx.request.query.isNewTimeTaxNo = false;
            }
        }
        let needSwitch = loginData?.taxNo && loginData.taxNo !== queryInfo.taxNo;
        // nt对象已经被清理，需要重新获取最新的cookie信息
        if (loginData?.loginFrom === 'newTime' && !nt) {
            const decryedData = ctx.request.body.decryedData;
            const account = decryedData.account || decryedData.loginAccountUid;
            const res = await ctx.service.newTime.checkIsLogout(account);
            if (res.errcode === '91300') {
                return res;
            }
            // 返回需要切换
            if (res.needSwitch) {
                needSwitch = res.needSwitch;
            } else if (res.errcode === '0000') {
                loginData = res.data;
                needSwitch = loginData?.taxNo && loginData.taxNo !== queryInfo.taxNo;
            } else {
                pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
            }
        } else {
            pwyStore.set(etaxLoginedCachePreKey + pageId, loginData, 12 * 60 * 60);
        }
        ctx.service.log.info('是否需要切换', needSwitch);
        // 已经获取过锁
        if (ctx.request.query?.pageId && ctx.request.query?.getExpireLock) {
            return {
                ...errcodeInfo.success,
                data: loginData
            };
        }
        const lockRes = await ctx.service.redisLock.expireLock(3 * 60 * 1000, 0);
        if (lockRes.errcode !== '0000') {
            return lockRes;
        }
        const { isLock, currentTaxNo } = lockRes.data || {};
        if (!isLock) {
            return {
                ...errcodeInfo.argsErr,
                description: `当前账号正在被税号${currentTaxNo}使用, 请稍后再试!`
            };
        }
        // 新时代登录共用的税号，如果不存在cookie，查询新时代获取最新的cookie
        const { decryedData } = ctx.request.body || {};
        const isNewTimeTaxNo = ctx.request.query.isNewTimeTaxNo;
        const currentAccount = decryedData?.account || decryedData?.loginAccountUid;
        ctx.service.log.info('currentAccount', currentAccount, isNewTimeTaxNo, loginData.taxNo);
        // 获取到锁标志，需要到请求处理结束时释放锁
        ctx.request.query.getExpireLock = '1';
        // 有登录状态，但需要切换
        if (needSwitch && typeof ctx.service.switchCompany?.switch === 'function') {
            // 不自动登录
            if (disabledAutoLogin) {
                return {
                    ...errcodeInfo.success,
                    data: loginData
                };
            }
            ctx.service.log.info('先尝试切换', etaxAccountInfo.etaxAccount, queryInfo.taxNo);
            // 先尝试切换
            const res = await ctx.service.switchCompany.switch({
                account: etaxAccountInfo.etaxAccount?.loginAccountUid || etaxAccountInfo.etaxAccount?.account,
                taxNo: queryInfo.taxNo,
                forceSwitch: needSwitch
            });
            ctx.service.log.info('切换返回', res);
            const resDescription = res.description || '';
            if (resDescription.includes('账号正在登录中')) {
                return {
                    ...res,
                    description: '当前账号正在切换税号中, 请稍后再试!'
                };
            }
            if (res.errcode !== '0000') {
                return res;
            }
            loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        }

        // 不需要登录接口验证，并且当前已经存在登录缓存则直接使用
        if (loginData && loginData.loginedCookies) {
            return {
                ...errcodeInfo.success,
                data: loginData
            };
        }
        const etaxService = ctx.service.etaxFpdkLogin[etaxName];
        if (!etaxService) {
            return {
                ...errcodeInfo.argsErr,
                description: '暂时不支持该城市的电子税局访问'
            };
        }
        // 查询自动登录源
        const cityInfo = ETAX_LOGIN_OPTIONS.filter((item) => {
            return item.name === etaxName;
        })[0];

        // 查询是否可以通过自动获取验证码登录
        const resAutoLogin = await this.getAccountAutoLoginStatus();
        const resAutoLoginData = resAutoLogin.data || {};

        ctx.service.log.info('查询是否可以自动登录返回', resAutoLogin);

        // 支持自动获取验证码登录
        if (resAutoLoginData.autoLogin && resAutoLoginData.quickLogin) {
            if (cityInfo.autoLogin) {
                return await this.lockForAutoLogin(1);
            }
            // 验证码自动登录
            return await this.lockForAutoLogin(2);
        }

        const resource2 = parseInt(resAutoLoginData.resource);
        if (resource2 === 1 || resource2 === 2 || resource2 === 3) {
            return {
                ...errcodeInfo.argsErr,
                description: resAutoLogin.description
            };
        }
        const loginType = resAutoLoginData.quickLogin ? null : '3';
        return await this.logoutNotice({ loginType });
    }
}