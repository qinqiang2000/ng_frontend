export class Tenant extends BaseService {
    async findOne(tenantNo: string) {
        const ctx = this.ctx;
        const queryInfo = ctx.request.query || {};
        const { access_token, taxNo, reqid } = queryInfo;
        // 本地客户端直接查询本地db
        if (!ctx.app.config.IS_CLOUD_VERSION) {
            const authRes = await ctx.db.tenant.findOne(tenantNo);
            if (authRes) {
                const { otherAuth } = authRes;
                const result = JSON.parse(Buffer.from(otherAuth, 'base64').toString());
                const { client_id, client_secret } = result;
                return {
                    ...errcodeInfo.success,
                    data: {
                        client_id,
                        client_secret
                    }
                };
            }
        }
        if (queryInfo.client_id && queryInfo.encryptKey) {
            return {
                ...errcodeInfo.success,
                data: {
                    client_id: queryInfo.client_id,
                    client_secret: '',
                    tenantNo,
                    encryptKey: queryInfo.encryptKey
                }
            };
        }
        const url = ctx.app.config.baseUrl + '/rpa/cache/tokenInfo/get?access_token=' + access_token + '&taxNo=' + taxNo + '&reqid=' + reqid;
        const res = await ctx.helper.curl(url, {
            method: 'GET',
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice',
                'encType': '0',
                'content-type': 'application/json'
            }
        });
        if (res.errcode !== '0000') {
            return res;
        }

        const resData = res.data || {};
        if (resData.tenantNo !== tenantNo) {
            return {
                ...errcodeInfo.argsErr,
                description: '租户信息错误，请检查!'
            };
        }

        return {
            ...errcodeInfo.success,
            data: {
                client_id: resData.clientId,
                client_secret: '',
                tenantNo,
                encryptKey: resData.encryptKey
            }
        };
    }
}