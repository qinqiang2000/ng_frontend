import { sleep } from '../utils/tools';
import { ntLockLoginPreKey } from '../constants';
// 截屏中间件，主要用于登录过程中出现异常时统一截屏
export default (options: lockLoginOptions = {}) => {
    return async function lockLogin(ctx: ControllerCtxType, next: Function) {
        ctx.service.log.info('start plugin lockLogin');
        const { pageId, reqid } = ctx.request.query;
        const decryedData = ctx.request.body.decryedData || {};
        // 上海新版第二步登录不需要锁，只对第一步加锁
        if (typeof decryedData.realLoginType === 'undefined') {
            await next();
            return;
        }

        // 轮询获取登录结果
        const loopQueryStatus = async() => {
            ctx.service.log.info('轮询登录状态----');
            const lockRes = await ctx.service.redisLock.query(ntLockLoginPreKey + pageId);
            if (lockRes.errcode !== '0000') {
                return lockRes;
            }
            const localLoginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
            // 已经释放锁
            if (lockRes.data?.result === false) {
                // 如果已经获取到cookie
                if (localLoginData?.loginedCookies && localLoginData?.etaxAccountType) {
                    await ctx.service.etaxFpdkLogin.common.afterLoginSuccess(pageId);
                    return {
                        ...errcodeInfo.success,
                        traceId: reqid,
                        data: ctx.service.etaxFpdkLogin.common.createLoginData(localLoginData)
                    };
                }
                return errcodeInfo.govTimeout;
            }
            await sleep(3000);
            const res : any = await loopQueryStatus();
            return res;
        };

        // 上海旧版登录加锁60s
        const lockTime = 60;
        const lockRes = await ctx.service.redisLock.checkNtSet(pageId, lockTime);
        // 获取锁异常
        if (lockRes.errcode !== '0000') {
            ctx.body = lockRes;
            return;
        }

        ctx.service.log.info('redisLock set res before', lockRes);
        // 锁失败
        if (lockRes.data?.result === false) {
            // 能自动登录的城市等待登录结果
            ctx.body = await loopQueryStatus();
            return;
        }

        try {
            await next();
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
        } catch (error) {
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
            ctx.service.log.info('服务端异常，lockLogin error', error);
            ctx.body = errcodeInfo.fpyInnerErr;
            return;
        }
    };
};
