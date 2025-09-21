import { getUUId } from '$utils/getUid';
export class RedisLock extends BaseService {
    async checkNtSet(k: string, t: number = 10 * 60) {
        const ctx = this.ctx;
        const lockRes = await this.set(k, (+new Date()), t);
        // 获取锁异常
        if (lockRes.errcode !== '0000' || lockRes.data?.result === true) {
            return lockRes;
        }
        /*
        const ntInfo = ctx.bsWindows.fpdkGovWin;
        const nt = ntInfo ? ntInfo[pageId] : null;
        const lockValue = lockRes.data?.value || (+new Date());
        // 不能自动登录，窗体异常退出超过15s自动释放锁
        if ((!nt || !nt.nightmareWindow.win) && ((+new Date()) - parseInt(lockValue)) > 30000) {
            ctx.service.log.info('nt对象不存在且浏览器对象不存在需要释放Lock，防止登录过程中客户端重启后需要等待较长时间才能登录');
            await ctx.service.redisLock.delete(ntLockLoginPreKey + pageId);
            const lockRes2 = await this.set(ntLockLoginPreKey + pageId, (+new Date()), t);
            return lockRes2;
        }
        */
        return lockRes;
    }

    async set(k: string, v: string | number, t: number = 10 * 60) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, tenantNo } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const baseUrl = ctx.app.config.baseUrl;
        const authRes = await ctx.service.tenant.findOne(tenantNo);
        if (authRes.errcode !== '0000') {
            return authRes;
        }
        const result = authRes.data || {};
        const originKey = tenantNo + result.client_id;
        const encryptKey = hex_md5(originKey).substring(0, 16);
        const data = {
            key: k,
            value: v,
            validTime: t
        };
        const encryData = aesEncrypt(JSON.stringify(data), encryptKey);
        const url = `${baseUrl}/rpa/cache/lock/get?reqid=${reqid}&access_token=${access_token}&taxNo=${taxNo}`;
        ctx.service.log.info('获取资源锁', k);
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
            ctx.service.log.info('获取资源锁url', url);
            ctx.service.log.info('获取资源锁, param', data, originKey, encryptKey);
            ctx.service.log.info('获取资源锁返回', res);
        }
        return res;
    }

    async query(k: string) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const baseUrl = ctx.app.config.baseUrl;
        const url = `${baseUrl}/rpa/cache/lock/query?reqid=${reqid}&access_token=${access_token}&taxNo=${taxNo}&key=${k}`;
        const res = await ctx.helper.curl(url, {
            method: 'GET',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'content-type': 'application/json'
            }
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('query lock url', url);
            ctx.service.log.info('query lock 异常', res);
        }
        return res;
    }

    async delete(k: string) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, tenantNo, client_id } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const baseUrl = ctx.app.config.baseUrl;
        if (!tenantNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '租户参数错误'
            };
        }
        const authRes = await ctx.service.tenant.findOne(tenantNo);
        if (authRes.errcode !== '0000') {
            return authRes;
        }
        const result = authRes.data || {};
        const encryptKey = hex_md5(tenantNo + result.client_id).substring(0, 16);
        const data = {
            key: k
        };
        const encryData = aesEncrypt(JSON.stringify(data), encryptKey);
        const url = `${baseUrl}/rpa/cache/lock/release?reqid=${reqid}&access_token=${access_token}&taxNo=${taxNo}`;
        ctx.service.log.info('释放资源锁', k);
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
            ctx.service.log.info('释放资源锁url', url);
            ctx.service.log.info('释放资源锁参数', data, encryptKey);
            ctx.service.log.info('释放资源锁返回', res);
        }

        return res;
    }

    async expireLock(expireMillis = 3 * 60 * 1000, waitMillis = 0) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, tenantNo, client_id, pageId } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const baseUrl = ctx.app.config.baseUrl;
        const originKey = tenantNo + client_id;
        const encryptKey = hex_md5(originKey).substring(0, 16);
        const { etaxAccountInfo = {} } = ctx.request.body;
        const { loginAccountUid, cityCode } = etaxAccountInfo;
        const data = {
            lockPrefix: 'newera_switch_taxNo_Lock_2',
            cityCode,
            account: loginAccountUid,
            taxNo,
            expireMillis,
            waitMillis
        };
        const encryData = aesEncrypt(JSON.stringify(data), encryptKey);
        const url = `${baseUrl}/rpa/switch/company/lock/tryRedisLock?reqid=${reqid}&access_token=${access_token}&taxNo=${taxNo}`;
        ctx.service.log.info('获取延长资源锁', pageId);
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
            ctx.service.log.info('延长资源锁url', url);
            ctx.service.log.info('延长资源锁, param', data, originKey, encryptKey);
            ctx.service.log.info('延长资源锁返回', res);
        }
        return res;
    }

    async releaseExpireLock() {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, tenantNo, client_id, pageId } = queryInfo;
        const reqid = queryInfo.reqid || getUUId();
        const baseUrl = ctx.app.config.baseUrl;
        const originKey = tenantNo + client_id;
        const encryptKey = hex_md5(originKey).substring(0, 16);
        const { etaxAccountInfo = {} } = ctx.request.body;
        const { loginAccountUid, cityCode } = etaxAccountInfo;
        const data = {
            lockPrefix: 'newera_switch_taxNo_Lock_2',
            cityCode,
            account: loginAccountUid,
            taxNo
        };
        const encryData = aesEncrypt(JSON.stringify(data), encryptKey);
        const url = `${baseUrl}/rpa/switch/company/lock/releaseLock?reqid=${reqid}&access_token=${access_token}&taxNo=${taxNo}`;
        ctx.service.log.info('释放延长资源锁', pageId);
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
            ctx.service.log.info('释放延长资源锁url', url);
            ctx.service.log.info('释放延长资源锁, param', data, originKey, encryptKey);
            ctx.service.log.info('释放延长资源锁返回', res);
        }
        return res;
    }
}
