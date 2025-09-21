import {
    ntLockLoginPreKey,
    etaxAccountPasswdErrorPreKey,
    etaxShortMsgCodeErrorPreKey,
    etaxShortMsgCodeGetFailPreKey,
    etaxAreaShortMsgCodeSendPreKey,
    etaxShortMsgCodeOverrunPreKey,
    etaxAreaLoginLimitPreKey
} from '../constant';

export default class AutoLoginService extends BaseService {
    // 自动获取短信的登录加锁
    async lockForAutoLogin() {
        const ctx = this.ctx;
        const { tenantNo, taxNo, pageId } = ctx.request.query;
        const { etaxAccountInfo } = ctx.request.body;
        const { loginAccountUid, etaxAccount, etaxName } = etaxAccountInfo;
        // 自动登录加锁
        const lockRes = await ctx.service.redisLock.checkNtSet(ntLockLoginPreKey + pageId, 3 * 60);
        // 获取锁异常
        if (lockRes.errcode !== '0000') {
            ctx.service.log.info('lockForAutoLogin checkNtSet error', lockRes);
            return lockRes;
        }

        if (lockRes.data?.result === false) {
            return {
                ...errcodeInfo.argsErr,
                description: '当前账号正在登录中，请3分钟后再试！'
            };
        }

        // 登录过程中防止接口调用锁拦截
        ctx.request.query.ignoreLock = true;
        let res;
        try {
            await ctx.service.ntTools.logoutClear(pageId);
            await ctx.service.fpyQueryInvoices.uploadAccountInfo(3);
            res = await Promise.race([
                this.redirectLogin(etaxName, {
                    data: etaxAccount
                }),
                new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(errcodeInfo.govTimeout);
                    }, 110 * 1000);
                })
            ]);
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
        } catch (error) {
            ctx.service.log.info('redirectLogin error', error);
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
            res = errcodeInfo.govErr;
        }
        ctx.service.ntTools.setRedisInfo(etaxAreaLoginLimitPreKey + etaxName + loginAccountUid, null);
        if (res.errcode !== '0000') {
            await ctx.service.fpyQueryInvoices.uploadAccountInfo(2);
            if (~res.description.indexOf('验证码错误')) {
                // 记录验证码错误次数
                await this.recordShortMsgCodeError();
            } else {
                // 登录出现错误可能是密码错误，需要将登录设置为非自动登录，并同步到当前的客户端, 下次请求到这个客户端后将会触发手动输入
                await ctx.service.etaxLogin.loginError(res, {
                    tenantNo,
                    taxNo,
                    loginAccountUid,
                    etaxAccount
                });
            }
            return res;
        }

        // 验证码错误 两次 锁定24小时 登录成功解锁
        ctx.service.ntTools.setRedisInfo(etaxShortMsgCodeErrorPreKey + pageId, null);
        // 地区登录限制 锁定3分钟 登录成功解锁
        // ctx.service.ntTools.setRedisInfo(etaxAreaLoginLimitPreKey + etaxName + loginAccountUid, null);

        await ctx.service.fpyQueryInvoices.uploadAccountInfo(1);
        const loginInfo = pwyStore.get(etaxLoginedCachePreKey + pageId);
        return {
            ...errcodeInfo.success,
            data: loginInfo
        };
    }

    // rpa获取税号来源
    async getTaxSource() {
        const ctx = this.ctx;
        const { taxNo, access_token } = ctx.request.query;
        const { etaxAccountInfo } = ctx.request.body;
        const { loginAccountUid } = etaxAccountInfo || {};

        const requestUrl = `/rpa/etax/taxNo/resource/get?access_token=${access_token}&taxNo=${taxNo}&account=${loginAccountUid}&reqid=${ctx.uid}`;
        const url = ctx.app.config.baseUrl + requestUrl;
        const res = await ctx.helper.curl(url, {
            method: 'GET',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice'
            }
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('getTaxSource error url', url);
            ctx.service.log.info('getTaxSource error res', res);
        }
        return res;
    }

    // 获取验证码
    async getShortMsg(opt: any, retry = 0) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};
        const { url, encryData } = opt;

        const startTime = +new Date();
        ctx.service.log.info(pageId, `获取验证码开始 ${retry}`);
        const res = await ctx.helper.curl(url, {
            method: 'POST',
            dataType: 'json',
            data: encryData,
            headers: {
                'content-type': 'application/json',
                'client-platform': 'digital_invoice'
            }
        });
        ctx.service.log.info(pageId, `获取验证码结束 ${retry}`, (+new Date()) - startTime);
        if (res.errcode !== '0000') {
            // 循环4次
            if (retry < 3) {
                const resLoop: any = await this.getShortMsg(opt, retry + 1);
                return resLoop;
            }
            ctx.service.log.info(pageId, '获取验证码错误', res);
            return res;
        }
        return res;
    }

    // 获取验证码初始化
    async getShortMsgInit() {
        const ctx = this.ctx;
        const { tenantNo, client_id, taxNo, access_token } = ctx.request.query;
        const { etaxAccountInfo } = ctx.request.body;
        const { loginAccountUid, cityCode } = etaxAccountInfo || {};

        const requestUrl = `/rpa/etax/get/smsCode?access_token=${access_token}&taxNo=${taxNo}&reqid=${ctx.uid}`;
        const url = ctx.app.config.baseUrl + requestUrl;

        const requsetData = {
            cityCode,
            phoneNum: loginAccountUid,
            smsCodeSendDateTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        const encryptKey = hex_md5(tenantNo + client_id).substring(0, 16);
        const encryData = aesEncrypt(JSON.stringify(requsetData), encryptKey);

        ctx.service.log.info('getShortMsgInit url', url);
        ctx.service.log.info('getShortMsgInit data', requsetData);
        ctx.service.log.info('getShortMsgInit encryData', encryData);

        return await this.getShortMsg({
            url,
            encryData
        });
    }

    // 第三方接口可以获取到短信验证码，可以直接完成登录
    async redirectLogin(etaxName = '', opt: any) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { etaxAccountInfo = {} } = ctx.request.body;
        const { loginAccountUid } = etaxAccountInfo;

        const redirectLoginTime = +new Date();
        ctx.service.log.info('redirectLogin start');

        // 地区登录限制 锁定3分钟 自动解锁或登录成功解锁 Boolean
        await ctx.service.ntTools.setRedisInfo(etaxAreaLoginLimitPreKey + etaxName + loginAccountUid, true, 3 * 60);

        let startTime = +new Date();
        ctx.service.log.info('redirectLogin stepOneLogin start');
        let res = await ctx.service.etaxFpdkLogin[etaxName].stepOneLogin(opt);
        ctx.service.log.info('redirectLogin stepOneLogin end', +new Date() - startTime);
        if (res.errcode !== '0000') {
            const { description = '' } = res;
            if (~description.indexOf('密码错误') || ~description.indexOf('用户密码登录错误')) {
                // 密码错误 锁定24小时 手动登录成功后解锁 Boolean
                await ctx.service.ntTools.setRedisInfo(etaxAccountPasswdErrorPreKey + pageId, true, 24 * 60 * 60);
            }
            ctx.service.log.info('redirectLogin stepOneLogin error', res);
            return res;
        }

        startTime = +new Date();
        ctx.service.log.info('redirectLogin sendShortMsg start');
        res = await ctx.service.etaxFpdkLogin[etaxName].sendShortMsg(opt);
        ctx.service.log.info('redirectLogin sendShortMsg end', +new Date() - startTime);
        if (res.errcode !== '0000') {
            const { description = '' } = res;
            if (~description.indexOf('次数超限')) {
                // 验证码次数超限 锁定到次日0点 自动解锁 Boolean
                const curTime = new Date();
                const unlockTime = new Date(curTime.getFullYear(), curTime.getMonth(), curTime.getDate() + 1);
                const lockTime = (unlockTime.getTime() - curTime.getTime()) / 1000 | 0;
                await ctx.service.ntTools.setRedisInfo(etaxShortMsgCodeOverrunPreKey + pageId, true, lockTime);
            }
            ctx.service.log.info('redirectLogin sendShortMsg error', res);
            return {
                ...res,
                description: '当天短信发送次数超限，请于次日0点后再试'
            };
        }
        // 记录验证码发送
        await this.recordShortMsgCodeSend(etaxName, loginAccountUid);

        startTime = +new Date();
        ctx.service.log.info('redirectLogin getShortMsgInit start');
        res = await this.getShortMsgInit();
        ctx.service.log.info('redirectLogin getShortMsgInit end', +new Date() - startTime);
        if (res.errcode !== '0000') {
            // 记录验证码获取失败次数
            await this.recordShortMsgCodeGetFail();
            ctx.service.log.info('redirectLogin getShortMsgInit error', res);
            return {
                errorcode: '0001',
                description: '自动登录失败，获取短信验证码异常'
            };
        }
        const { smsCode } = res.data || {};
        if (!smsCode) {
            // 记录验证码获取失败次数
            await this.recordShortMsgCodeGetFail();
            ctx.service.log.info('redirectLogin getShortMsgInit smsCode error', res);
            return {
                errorcode: '0001',
                description: '自动登录失败，获取短信验证码为空'
            };
        }
        ctx.service.log.info('redirectLogin getShortMsgInit smsCode success', smsCode);
        // 验证码获取失败 三次 锁定24小时 自动获取成功解锁
        ctx.service.ntTools.setRedisInfo(etaxShortMsgCodeGetFailPreKey + pageId, null);

        startTime = +new Date();
        ctx.service.log.info('redirectLogin login start');
        res = await ctx.service.etaxFpdkLogin[etaxName].login({
            ...opt,
            data: {
                ...opt.data,
                shortMsgCode: smsCode
            }
        });
        ctx.service.log.info('redirectLogin login end', +new Date() - startTime);

        ctx.service.log.info('redirectLogin end', +new Date() - redirectLoginTime);
        return res;
    }

    // 记录验证码发送
    async recordShortMsgCodeSend(etaxName: string, loginAccountUid: string) {
        const ctx = this.ctx;
        const time = +new Date();
        const { pageId } = ctx.request.query || {};
        const key = etaxAreaShortMsgCodeSendPreKey + etaxName + loginAccountUid;
        ctx.service.log.info(pageId, 'recordShortMsgCodeSend 记录发送验证码', key, time);

        if (!etaxName || !loginAccountUid) {
            ctx.service.log.info(pageId, 'recordShortMsgCodeSend 记录发送验证码 error');
            return;
        }

        const res = await ctx.service.ntTools.getRedisInfo([
            key
        ]);

        let list: number[];
        if (res.errcode === '0000') {
            const data = res.data || [];
            list = data[0];
            if (Reflect.apply(Object.prototype.toString, list, []) === '[object Array]') {
                list.push(time);
                // 过滤掉旧数据
                // 地区验证码发送 限制半小时内发送5次 自动解锁 Array[timestamp]
                const halfAnHourAgo = time - 30 * 60 * 1000;
                list = list.filter((item) => item > halfAnHourAgo);
            } else {
                // 已失效
                list = [time];
            }
        } else {
            // 静默失败
            ctx.service.log.info(pageId, 'recordShortMsgCodeSend getRedisInfo error', res);
            list = [time];
        }
        // 地区验证码发送 限制半小时内发送5次 自动解锁 Array[timestamp]
        await ctx.service.ntTools.setRedisInfo(key, list, 30 * 60);
    }

    // 记录验证码错误次数
    async recordShortMsgCodeError() {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;

        ctx.service.log.info('recordShortMsgCodeError 记录验证码错误次数');

        const res = await ctx.service.ntTools.getRedisInfo([
            etaxShortMsgCodeErrorPreKey + pageId
        ]);

        let number;
        if (res.errcode === '0000') {
            const data = res.data || [];
            if (Reflect.apply(Object.prototype.toString, data[0], []) === '[object Number]') {
                // 次数加1
                number = data[0] + 1;
            } else {
                // 已失效
                number = 1;
            }
        } else {
            // 静默失败
            ctx.service.log.info('recordShortMsgCodeError getRedisInfo error', res);
            number = 1;
        }

        // 验证码错误 两次 锁定24小时 登录成功后解锁 Number
        await ctx.service.ntTools.setRedisInfo(etaxShortMsgCodeErrorPreKey + pageId, number, 24 * 60 * 60);
    }

    // 记录验证码获取失败次数
    async recordShortMsgCodeGetFail() {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query || {};
        const res = await ctx.service.ntTools.getRedisInfo([
            etaxShortMsgCodeGetFailPreKey + pageId
        ]);

        let number;
        if (res.errcode === '0000') {
            const data = res.data || [];
            if (Reflect.apply(Object.prototype.toString, data[0], []) === '[object Number]') {
                // 次数加1
                number = data[0] + 1;
            } else {
                // 已失效
                number = 1;
            }
        } else {
            // 静默失败
            ctx.service.log.info('recordShortMsgCodeGetFail getRedisInfo error', res);
            number = 1;
        }
        ctx.service.log.info(pageId, '记录验证码获取失败次数', number);
        // 验证码获取失败 三次 锁定24小时 自动解锁 Number
        await ctx.service.ntTools.setRedisInfo(etaxShortMsgCodeGetFailPreKey + pageId, number, 24 * 60 * 60);
    }


    // 获取当前账号登录状态 是否忽略锁的检查 默认不忽略
    async getAccountAutoLoginStatus(ignoreLock = false) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { etaxAccountInfo = {} } = ctx.request.body;
        const { loginAccountUid, etaxName } = etaxAccountInfo;

        // 是否自动登录
        let autoLogin = false;
        // 是否快捷登录
        let quickLogin = true;

        // 程序检测
        if ((typeof ctx.service.etaxFpdkLogin[etaxName].stepOneLogin !== 'function') ||
            (typeof ctx.service.etaxFpdkLogin[etaxName].sendShortMsg !== 'function') ||
            (typeof ctx.service.etaxFpdkLogin[etaxName].login !== 'function')) {
            ctx.service.log.info(
                'getAccountAutoLoginStatus function error',
                etaxName,
                typeof ctx.service.etaxFpdkLogin[etaxName].stepOneLogin,
                typeof ctx.service.etaxFpdkLogin[etaxName].sendShortMsg,
                typeof ctx.service.etaxFpdkLogin[etaxName].login
            );
            return {
                ...errcodeInfo.success,
                data: {
                    autoLogin,
                    quickLogin
                }
            };
        }

        // 自动登录检测
        const resTaxSource = await this.getTaxSource();
        ctx.service.log.info('getAccountAutoLoginStatus getTaxSource', resTaxSource);
        if (resTaxSource.errcode === '0000') {
            const { resource } = resTaxSource.data || {};
            const taxSources = {
                '1': '华盟',
                '2': '发票云'
            };
            // 1华盟 2发票云
            if (+resource === 1 || +resource === 2) {
                ctx.service.log.info('getAccountAutoLoginStatus getTaxSource', taxSources[resource as keyof typeof taxSources]);
                autoLogin = true;
            }
        }

        // 非自动登录 或者 忽略锁
        ctx.service.log.info('getAccountAutoLoginStatus', { autoLogin, ignoreLock });
        if (!autoLogin || ignoreLock) {
            return {
                ...errcodeInfo.success,
                data: {
                    autoLogin,
                    quickLogin
                }
            };
        }

        // 自动登录的锁 检测
        const resRedisInfo = await ctx.service.ntTools.getRedisInfo([
            etaxAccountPasswdErrorPreKey + pageId, // 密码错误 锁定24小时 手动登录成功后解锁 Boolean => 手动密码登录
            etaxShortMsgCodeErrorPreKey + pageId, // 验证码错误 两次 锁定24小时 登录成功后解锁 Number => 手动密码登录
            etaxShortMsgCodeGetFailPreKey + pageId, // 验证码获取失败 三次 锁定24小时 自动解锁或自动获取成功解锁 Number => 手动快捷登录
            etaxAreaShortMsgCodeSendPreKey + etaxName + loginAccountUid, // 地区验证码发送 限制半小时内发送5次 自动解锁 Array[timestamp] => 提示
            etaxShortMsgCodeOverrunPreKey + pageId, // 验证码次数超限 锁定到次日0点 自动解锁 Boolean => 提示
            etaxAreaLoginLimitPreKey + etaxName + loginAccountUid // 地区登录限制 锁定3分钟 自动解锁或登录成功解锁 Boolean => 提示
        ]);
        ctx.service.log.info('getAccountAutoLoginStatus resRedisInfo', resRedisInfo);
        if (resRedisInfo.errcode === '0000') {
            const data = resRedisInfo.data || [];
            if (data[5] === true) {
                ctx.service.log.info('getAccountAutoLoginStatus', pageId, '地区登录限制 锁定3分钟 自动解锁或登录成功解锁 Boolean => 提示');
                return {
                    errcode: '0001',
                    description: '当前账号已有业务请求，正在排队处理，请等待三分钟',
                    data: {} // 兼容erp
                };
            }
            if (data[4] === true) {
                ctx.service.log.info('getAccountAutoLoginStatus', pageId, '验证码次数超限 锁定到次日0点 自动解锁 Boolean => 提示');
                return {
                    errcode: '0001',
                    description: '当天短信发送次数超限，请于次日0点后再试',
                    data: {} // 兼容erp
                };
            }
            const resLimitSend = this.limitForShortMsgCodeSend(data[3]);
            if (resLimitSend.errcode !== '0000') {
                ctx.service.log.info('getAccountAutoLoginStatus', pageId, '地区验证码发送 限制半小时内发送5次 自动解锁 Array[timestamp] => 提示');
                return resLimitSend;
            }
            if (Reflect.apply(Object.prototype.toString, data[2], []) === '[object Number]' && data[2] > 2) {
                ctx.service.log.info('getAccountAutoLoginStatus', pageId, '验证码获取失败 三次 锁定24小时 自动解锁或自动获取成功解锁 Number => 手动快捷登录');
                autoLogin = false;
                quickLogin = true;
            }
            if (Reflect.apply(Object.prototype.toString, data[1], []) === '[object Number]' && data[1] > 1) {
                ctx.service.log.info('getAccountAutoLoginStatus', pageId, '验证码错误 两次 锁定24小时 登录成功后解锁 Number => 手动密码登录');
                autoLogin = false;
                quickLogin = false;
            }
            if (data[0] === true) {
                ctx.service.log.info('getAccountAutoLoginStatus', pageId, '密码错误 锁定24小时 手动登录成功后解锁 Boolean => 手动密码登录');
                autoLogin = false;
                quickLogin = false;
            }
        } else {
            // 静默失败
        }

        return {
            ...errcodeInfo.success,
            data: {
                autoLogin,
                quickLogin
            }
        };
    }

    // 限制短信验证码发送 数据校验
    limitForShortMsgCodeSend(data: number[]) {
        const ctx = this.ctx;

        if (Reflect.apply(Object.prototype.toString, data, []) === '[object Array]') {
            const halfAnHourAgo = +new Date() - 30 * 60 * 1000;
            const list = data.filter((item) => item > halfAnHourAgo);
            ctx.service.log.info('limitForShortMsgCodeSend halfAnHourAgo', halfAnHourAgo, list);
            if (list.length >= 5) {
                return {
                    errcode: '0001',
                    description: '使用短信验证码次数超限，请半小时后再试',
                    data: {} // 兼容erp
                };
            }
        } else {
            ctx.service.log.info('limitForShortMsgCodeSend error, Parameter not array', data);
        }

        return errcodeInfo.success;
    }
}