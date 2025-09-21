import { ntLockLoginPreKey, ETAX_LOGIN_OPTIONS } from '../constants';
import { deleteLoginedPage } from '../utils/tools';

// 截屏中间件，主要用于登录过程中出现异常时统一截屏
export default (options: lockLoginOptions = {}) => {
    return async function lockLogin(ctx: ControllerCtxType, next: Function) {
        const { pageId, reqid, isNewTimeTaxNo } = ctx.request.query;
        ctx.service.log.info('start plugin lockLogin args', isNewTimeTaxNo, pageId);
        let autoLogin = options.autoLogin;
        let step = options.step || '';
        const lockPreKey = ntLockLoginPreKey;

        const decryedData = ctx.request.body.decryedData || {};
        const etaxName = pageId.split('-')[1];
        // 是否自动登录
        const etaxLoginOption: any = ETAX_LOGIN_OPTIONS.find((item) => item.name === etaxName);
        if (etaxLoginOption) {
            autoLogin = etaxLoginOption.autoLogin;
        }
        if (options.isShanghaiLogin) {
            // 上海新版旧版登录为自动登录
            if (typeof decryedData.realLoginType !== 'undefined') {
                autoLogin = true;
            } else {
                step = 'last'; // 上海新版登录
            }
        }

        const requestUrl = ctx.request.url;
        // 快捷方式发送验证码，也认为是第一步
        if (requestUrl.indexOf('/fpdk/etax/common/sendShortMsg') !== -1 && decryedData.isQuickLogin) {
            step = 'first';
        }
        ctx.service.log.info('登录加锁参数', autoLogin, step, etaxName);
        // 根据是否能自动登录设置锁定时间
        const lockTime = autoLogin ? 60 : 3 * 60;

        const lockRes = await ctx.service.redisLock.checkNtSet(lockPreKey + pageId, lockTime);
        // 获取锁异常
        if (lockRes.errcode !== '0000') {
            ctx.body = lockRes;
            return;
        }

        ctx.service.log.info('redisLock set res before', lockPreKey + pageId, lockRes);
        // 第一步登录必须锁成功，其它步骤有锁就行，防止其它人触发第一步登录和自动登录
        if (lockRes.data?.result === false && (step === 'first' || autoLogin)) {
            ctx.service.log.info('redisLock set res', lockRes);
            // 能自动登录的城市等待登录结果
            if (autoLogin === true) {
                ctx.body = {
                    ...errcodeInfo.argsErr,
                    description: '当前账号正在登录中，请1分钟后稍后再试！'
                };
                return;
            }

            // 不能自动登录
            const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
            if (localLoginData?.loginedCookies && localLoginData?.etaxAccountType) {
                await ctx.service.etaxFpdkLogin.common.afterLoginSuccess(pageId);
                ctx.body = {
                    ...errcodeInfo.success,
                    traceId: reqid,
                    data: ctx.service.etaxFpdkLogin.common.createLoginData(localLoginData)
                };
                return;
            }
            ctx.body = {
                ...errcodeInfo.argsErr,
                description: '当前账号正在登录中，请3分钟后再试！'
            };
            return;
        }

        const releaseLock = async() => {
            // 能自动登录，处理完成后直接释放锁
            if (autoLogin || ctx.body?.errcode !== '0000') {
                ctx.service.log.info('释放锁', autoLogin, ctx.body?.errcode);
                await ctx.service.redisLock.delete(lockPreKey + pageId);
                // 不能自动登录的城市、可能因为输入验证码错误时导致再次输入窗体不存在
                if (ctx.body?.errcode !== '0000' && autoLogin) {
                    await ctx.service.fpyQueryInvoices.uploadAccountInfo(2);
                }
                return;
            }

            if (isNewTimeTaxNo) {
                ctx.service.log.info('最后一步结束释放锁');
                await ctx.service.redisLock.delete(lockPreKey + pageId);
                return;
            }

            const ntInfo = ctx.bsWindows.fpdkGovWin;
            const nt = ntInfo ? ntInfo[pageId] : null;
            // 不能自动登录，窗体异常退出释放锁
            if (!nt || !nt.nightmareWindow?.win) {
                ctx.service.log.info('nt对象不存在直接释放Lock');
                await ctx.service.redisLock.delete(lockPreKey + pageId);
                await ctx.service.fpyQueryInvoices.uploadAccountInfo(2);
                return;
            }
            if (step === 'last') {
                ctx.service.log.info('最后一步结束释放锁');
                await ctx.service.redisLock.delete(lockPreKey + pageId);
            }
        };

        try {
            if (step === 'first' || autoLogin) {
                // 清理登录状态
                await ctx.service.ntTools.updateRemoteLoginStatus(pageId, '');
                await pwyStore.delete(etaxLoginedCachePreKey + pageId);
                // 关闭窗体
                await ctx.service.ntTools.closePage(pageId);
                // 更新已经登录page列表
                deleteLoginedPage(pageId);
            }
            // 更新为登陆中,1登录成功，2、登录失效，3登录中
            await ctx.service.fpyQueryInvoices.uploadAccountInfo(3);
            ctx.service.log.info('开始登录');
            await next();
            ctx.service.log.info('登录结束，开始释放锁');
            await releaseLock();
            ctx.service.log.info('释放锁结束');
        } catch (error) {
            await releaseLock();
            ctx.service.log.info('服务端异常，lockLogin error', error);
            ctx.body = errcodeInfo.fpyInnerErr;
            return;
        }
    };
};
