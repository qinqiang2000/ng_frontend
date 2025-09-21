const QRcode = qrcode;
const etaxNotRequiredAuthCachePreKey = 'etaxNotRequiredAuth-';

export class ScanFaceCheckService extends BaseService {
    // 检查电子税局是否需要扫脸认证
    async checkEtaxNeedAuthStatus(loginData: any) {
        const ctx = this.ctx;
        const { forceAuth } = ctx.request.query;
        ctx.service.log.info('plugin checkEtaxNeedAuthStatus');
        const { etaxAccountType = -1 } = loginData;

        // 要求需要扫脸认证
        if (forceAuth) {
            return {
                ...errcodeInfo.success,
                data: {
                    loginData,
                    needAuth: !!forceAuth
                }
            };
        }

        let needAuth = true; // 是否需要扫脸认证
        if (etaxAccountType !== -1) {
            // 已登录 查询扫脸认证状态
            const authRes = await this.getEtaxNeedAuthStatus(loginData);
            if (authRes.errcode === '91300') {
                // 登录已失效 返回失效，更新登录状态
                return authRes;
            }
            needAuth = authRes.errcode === '0000' ? authRes.data : false;
        }

        return {
            ...errcodeInfo.success,
            data: {
                loginData,
                needAuth
            }
        };
    }

    // 获取电子税局是否需要扫脸认证
    async getEtaxNeedAuthStatus(loginData: any, disableCache?: boolean) {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        const { decryedData } = ctx.request.body;
        let { noCache = false } = decryedData;
        const etaxNotRequiredAuthCacheKey = etaxNotRequiredAuthCachePreKey + pageId;
        ctx.service.log.info('getEtaxNeedAuthStatus noCache', noCache);

        // 登录成功状态时返回：电子税局账户权限,1, 有电子税局开票权限，2，有电子税局税务数字账号权限进行收票，3，开票和数字账号权限都有，4，开票和数字账户权限都没有
        if (loginData?.etaxAccountType !== 3 && loginData?.etaxAccountType !== 1) {
            return {
                ...errcodeInfo.success,
                data: false
            };
        }
        if (disableCache) {
            noCache = true;
        }
        // 走缓存
        if (!noCache) {
            const resEtaxNotRequiredAuth = await ctx.service.ntTools.getRedisInfo([etaxNotRequiredAuthCacheKey]);
            ctx.service.log.info('getEtaxNeedAuthStatus cache', resEtaxNotRequiredAuth);
            if (resEtaxNotRequiredAuth.errcode === '0000' && resEtaxNotRequiredAuth.data[0] === true) {
                // 有缓存
                return {
                    ...errcodeInfo.success,
                    data: false
                };
            }
        }

        const bodyData = {
            nsrsbh: loginData.taxNo,
            dyfs: '1'
        };
        ctx.service.log.info('查询是否需要扫脸认证参数', bodyData);
        const urlPath = '/kpfw/fjxx/v1/sxlb/search';
        const res = await ctx.service.nt.ntEncryCurl(loginData, urlPath, bodyData);
        ctx.service.log.info('查询是否需要扫脸认证返回', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const { Sfsl } = res.data || {};
        const etaxNeedAuthStatus = Sfsl === 'Y'; // Y需要扫脸认证 N不需要扫脸认证

        if (!etaxNeedAuthStatus) {
            // 扫脸认证成功的消息推送
            this.afterAuth();
            // 缓存无需扫脸认证 三小时
            ctx.service.ntTools.setRedisInfo(etaxNotRequiredAuthCacheKey, true, 3 * 60 * 60);
        }

        return {
            ...errcodeInfo.success,
            data: etaxNeedAuthStatus
        };
    }

    // 清除缓存
    async clearCacheForEtaxNotRequiredAuth() {
        const ctx = this.ctx;
        const { pageId } = ctx.request.query;
        await ctx.service.ntTools.setRedisInfo(etaxNotRequiredAuthCachePreKey + pageId, null);
        return errcodeInfo.success;
    }

    // 获取电子税局扫脸认证二维码base64
    async getEtaxFaceCheckQrInfo(loginData: any) {
        const ctx = this.ctx;
        const urlPath = '/kpfw/slrz/v1/hqemw';
        ctx.service.log.info('getEtaxFaceCheckQrInfo start');
        const res : any = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
            method: 'POST',
            dataType: 'json',
            body: {
                Nsrsbh: loginData.taxNo
            }
        });
        ctx.service.log.info('getEtaxFaceCheckQrInfo end');
        if (res.errcode !== '0000') {
            const description = res.description || '获取扫脸认证结果异常';
            if (~description.indexOf('重新登录后')) {
                return errcodeInfo.govLogout;
            }
            return res;
        }

        const { Rzid, Ewm } = res.data || {};
        if (!Rzid || !Ewm) {
            return errcodeInfo.govErr;
        }
        let base64;
        try {
            base64 = await QRcode.toDataURL(Ewm, {
                margin: 1,
                width: 256
            });
        } catch (error) {
            ctx.service.log.info('getEtaxFaceCheckQrInfo QRcode.toDataURL error', error);
            return {
                ...errcodeInfo.fpyInnerErr,
                descrption: '二维码生成异常'
            };
        }

        return {
            ...errcodeInfo.success,
            data: {
                rzid: Rzid,
                base64
            }
        };
    }

    // 获取电子税局app扫脸认证结果
    async queryEtaxFaceCheckResult(loginData: any, rdid: string) {
        const ctx = this.ctx;
        const urlPath = '/kpfw/slrz/v1/qrslrz';
        const res : any = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
            method: 'POST',
            dataType: 'json',
            body: {
                Cfcj: 'l', // 20231009新增参数
                Kjlp: '', // 20231009新增参数
                Rzid: rdid
            }
        });
        ctx.service.log.info('电子税局app 扫脸认证返回', res);
        if (res.errcode !== '0000') {
            return res;
        }
        const { Slzt } = res.data || {};
        if (Slzt === '1') {
            return errcodeInfo.eventTimeout;
        }
        if (Slzt === '3') {
            return {
                ...errcodeInfo.argsErr,
                description: '认证二维码失效，请刷新二维码后重新认证'
            };
        }
        if (Slzt === '2') {
            ctx.service.log.info('电子税局app 扫脸认证成功', loginData.pageId);
            // 消息推送
            this.afterAuth();
            // 上传认证成功状态
            ctx.service.ntTools.AuthLogsUpload(1);
            return errcodeInfo.success;
        }
        ctx.service.log.info('电子税局app扫脸认证查询异常', res);
        return errcodeInfo.govErr;
    }

    // 获取个税app扫脸认证二维码base64
    async getPernalTaxFaceCheckQrInfo(loginData: any) {
        const ctx = this.ctx;
        const urlPath = '/kpfw/slrz/v1/hqITSFaceCheckewm';
        ctx.service.log.info('getPernalTaxFaceCheckQrInfo start');
        const res : any = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
            method: 'POST',
            dataType: 'json',
            body: {
                Nsrsbh: loginData.taxNo
            }
        });
        ctx.service.log.info('getPernalTaxFaceCheckQrInfo end');
        if (res.errcode !== '0000') {
            const description = res.description || '获取扫脸认证结果异常';
            if (description.indexOf('重新登录后') !== -1) {
                return errcodeInfo.govLogout;
            }
            return res;
        }

        const { Rzid, Ewm } = res.data || {};
        if (!Rzid || !Ewm) {
            return errcodeInfo.govErr;
        }
        return {
            ...errcodeInfo.success,
            data: {
                rzid: Rzid,
                base64: 'data:image/png;base64,' + Ewm
            }
        };
    }

    // 获取个税app扫脸认证结果
    async queryPersonalTaxCheckResult(loginData: any, rdid: string) {
        const ctx = this.ctx;
        const urlPath = '/kpfw/slrz/v1/qrjgForFaceCheck';
        const res : any = await ctx.service.nt.ntCurl(loginData.pageId, urlPath, {
            method: 'POST',
            dataType: 'json',
            body: {
                Cfcj: 'l', // 20231009新增参数
                Kjlp: '', // 20231009新增参数
                Rzid: rdid
            }
        });
        ctx.service.log.info('个税app 扫脸认证返回', res);
        if (res.errcode !== '0000') {
            return res;
        }

        const { Slzt } = res.data || {};
        if (Slzt === '1') {
            return errcodeInfo.eventTimeout;
        }
        if (Slzt === '3') {
            return {
                ...errcodeInfo.argsErr,
                description: '认证二维码失效，请刷新二维码后重新认证'
            };
        }
        if (Slzt === '2') {
            ctx.service.log.info('个税app 扫脸认证成功', loginData.pageId);
            // 消息推送
            this.afterAuth();
            // 上传认证成功状态
            ctx.service.ntTools.AuthLogsUpload(1);
            return errcodeInfo.success;
        }
        ctx.service.log.info('个税app扫脸认证查询异常', res);
        return errcodeInfo.govErr;
    }

    // 扫脸认证成功的消息推送
    async afterAuth() {
        const ctx = this.ctx;
        const { taxNo, pageId } = ctx.request.query;
        const { etaxAccountInfo } = ctx.request.body;
        const loginAccountUid = etaxAccountInfo.loginAccountUid;

        // 通知长链接轮询登录成功
        const loginData = pwyStore.get(etaxLoginedCachePreKey + pageId);
        ctx.eventEmitter.emit(taxNo + '-' + loginAccountUid + '-etax-auth-success', {
            ...errcodeInfo.success,
            data: {
                ...loginData,
                needAuth: false
            }
        });
    }
}