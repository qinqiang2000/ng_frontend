import { PluginBaseController } from './pluginBaseController';
import { promiseTimeout } from '$utils/tools';

const adminPass = 'pwyAdminKingdee123';
export class HelperController extends PluginBaseController {
    async queryDbTenant() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        const { decryedData = {} } = checkRes.data;
        const { passwd = '' } = decryedData;
        if (!passwd || passwd !== adminPass) {
            return await this.responseJson(errcodeInfo.argsErr);
        }

        const list = await ctx.db.tenant.findAll() || [];
        return await this.responseJson({
            ...errcodeInfo.success,
            data: list.map((item: any) => {
                return {
                    tenantNo: item.tenantNo,
                    tenantName: item.tenantName,
                    auth: item.auth,
                    otherAuth: item.otherAuth
                };
            })
        });
    }

    async restartClient() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        if (!ctx.app.config.IS_CLOUD_VERSION) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '非云化客户端请手动重启!'
            });
        }
        if (!ctx.clientApp || !ctx.pwyWsClientApp) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '最新的云化客户端才支持这个功能!'
            });
        }
        const { decryedData = {} } = checkRes.data;
        const { publicKey = '' } = decryedData;
        if (!publicKey || publicKey !== ctx.app.config.publicKey) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '参数错误，请检查!'
            });
        }

        await ctx.pwyWsClientApp.close();
        try {
            const windows = BrowserWindow.getAllWindows();
            windows.forEach((win: any) => {
                if (win) {
                    const curUrl = win.webContents.getURL();
                    const title = win.getTitle();
                    if (curUrl.indexOf('.chinatax.gov.cn') !== -1) {
                        ctx.service.log.info('clear win title', curUrl, title);
                        win.close();
                    } else {
                        ctx.service.log.info('keep win title', curUrl, title);
                    }
                }
            });
        } catch (error) {
            ctx.service.log.info('close win error', error);
        }
        ctx.clientApp.relaunch();
        ctx.clientApp.exit();
        return await this.responseJson(errcodeInfo.success);
    }

    async syncTenant() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }
        const { access_token, taxNo } = ctx.request.query;
        const { decryedData = {} } = checkRes.data;
        const { passwd = '', hosts = [] } = decryedData;
        if (!passwd || passwd !== adminPass) {
            return await this.responseJson(errcodeInfo.argsErr);
        }

        for (let i = 0; i < hosts.length; i++) {
            const host = hosts[i];
            const reqid = (+new Date());
            const url = `http://${host}:30563/fpdk/etax/helper/tenant/query?access_token=${access_token}&taxNo=${taxNo}&reqid=${reqid}`;
            const res = await ctx.helper.jsonCurl(url, {
                method: 'POST',
                data: ctx.request.body
            });
            if (res.errcode === '0000') {
                const tenantList = res.data || [];
                for (let j = 0; j < tenantList.length; j++) {
                    const curData = tenantList[j];
                    const updateRes = await ctx.db.tenant.update(curData);
                    ctx.service.log.info(curData.tenantNo, updateRes);
                }
            }
        }
        return await this.responseJson(errcodeInfo.success);
    }

    async clearWins() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkRequestForLongLinkEtaxLogin();
        if (checkRes.errcode !== '0000') {
            return await this.responseJson(checkRes);
        }

        const { decryedData = {} } = checkRes.data;
        const { passwd = '' } = decryedData;
        if (!passwd || passwd !== adminPass) {
            return await this.responseJson(errcodeInfo.argsErr);
        }

        const fpdkGovWin : any = ctx.bsWindows.fpdkGovWin || {};
        const ntKeys = Object.keys(fpdkGovWin);
        for (let i = 0; i < ntKeys.length; i++) {
            const pageId = ntKeys[i];
            const nt = fpdkGovWin[pageId];
            ctx.service.log.info('clear win', pageId);
            await nt.close();
        }

        const windows = BrowserWindow.getAllWindows();
        windows.forEach((win: any) => {
            if (win) {
                const curUrl = win.webContents.getURL();
                const title = win.getTitle();
                if (curUrl.indexOf('.chinatax.gov.cn') !== -1) {
                    ctx.service.log.info('clear win title', curUrl, title);
                    win.close();
                } else {
                    ctx.service.log.info('keep win title', curUrl, title);
                }
            }
        });
        return await this.responseJson(errcodeInfo.success);
    }

    async displayNt() {
        const ctx = this.ctx;
        const { pageId, name, display, devTools } = ctx.request.query;
        let win;
        if (!pageId && !name) {
            return await this.responseJson({
                ...errcodeInfo.argsErr,
                description: '窗体pageId或name不能为空'
            });
        }
        if (pageId) {
            const fpdkGovWin = ctx.bsWindows.fpdkGovWin || {};
            win = fpdkGovWin[pageId]?.nightmareWindow.win;
        }
        if (name) {
            win = ctx.bsWindows[name]?.win;
        }
        if (!win) {
            return this.responseJson({
                ...errcodeInfo.argsErr,
                description: '窗体已经不存在'
            });
        }
        if (display === 'true') {
            win.show();
            if (devTools === 'true') {
                win.webContents.openDevTools({ 'mode': 'bottom' });
            } else if (win.webContents.isDevToolsOpened()) {
                win.webContents.closeDevTools();
            }
        } else {
            if (win.webContents.isDevToolsOpened()) {
                win.webContents.closeDevTools();
            }
            win.hide();
        }
        return await this.responseJson(errcodeInfo.success);
    }

    async pingTest() {
        const ctx = this.ctx;
        const { checkNt = '' } = ctx.request.query;
        if (checkNt === 'false') {
            return await this.responseJson(errcodeInfo.success);
        }
        const pageId = 'test-page-' + (+new Date());
        const ntRes = ctx.service.ntTools.getEtaxPage('https://img.piaozone.com/static/invoice-client/plugins/list.json', {
            id: pageId,
            ignoreGotoError: true,
            partition: pageId
        });
        const res = await promiseTimeout(ntRes, {
            timeout: 30000,
            deltaTimeout: 2000
        });
        const p = ctx.service.ntTools.closePage(pageId);
        const res2 = await promiseTimeout(p, {
            timeout: 10000,
            deltaTimeout: 2000
        });
        if (res.errcode !== '0000' || res2.errcode !== '0000') {
            ctx.service.log.info('ping 检测异常');
            return await this.responseJson(errcodeInfo.fpyInnerErr);
        }
        return await this.responseJson(errcodeInfo.success);
    }

    // 直接请求税局底层接口，提供参数、url、是否禁用加密接口
    async checkRequest() {
        const ctx = this.ctx;
        const checkRes = await ctx.service.ntTools.checkEtaxLogined({
            disabledAutoLogin: true
        });
        if (checkRes.errcode !== '0000' && checkRes.errcode !== '91300') {
            return await this.responseJson(checkRes);
        }
        const { decryedData = {} } = ctx.request.body;
        ctx.service.log.info('请求参数：decryedData', decryedData);
        const {
            optType = 1,
            returnType,
            disableEncry,
            url,
            opt
        } = decryedData;
        const loginData = checkRes.data || {};
        let res;
        if (optType === 1) {
            const res1 = await ctx.service.nt.ntCurl(loginData.pageId, url, opt, disableEncry);
            return await this.responseJson(res1);
        }

        if (optType === 2) {
            const res1 = await ctx.service.nt.ntImportExcel(loginData.pageId, url, opt);
            return await this.responseJson(res1);
        }

        if (returnType === 'file') {
            res = await ctx.service.nt.ntDownload(loginData.pageId, url, opt);
            if (res.errcode !== '0000') {
                return await this.responseJson(res);
            }
            const { filePath } = res.data || {};
            const upRes = await ctx.service.s3Upload.uploadFileToS3(filePath);
            if (upRes.errcode === '0000') {
                return await this.responseJson({
                    ...errcodeInfo.success,
                    data: {
                        url: upRes.data
                    }
                });
            }
            return await this.responseJson(upRes);
        }
        return await this.responseJson(errcodeInfo.argsErr);
    }

    async openGovPage() {
        const ctx = this.ctx;
        const { taxNo, operationType = '1', access_token, reqid } = ctx.request.query;
        const { account, fixBaseUrl = '' } = ctx.request.body;
        if (!account || !taxNo) {
            ctx.body = errcodeInfo.argsErr;
            return;
        }
        const requestBaseUrl = fixBaseUrl || ctx.app.config.baseUrl;
        const requestUrl = `/rpa/cache/tokenInfo/get?access_token=${access_token}&reqid=${reqid}&taxNo=${taxNo}`;
        const res = await ctx.helper.curl(requestBaseUrl + requestUrl, {
            dataType: 'json',
            headers: {
                'client-platform': 'digital_invoice'
            }
        });
        if (res.errcode !== '0000') {
            ctx.service.log.info('请求地址', requestBaseUrl + requestUrl);
            ctx.body = res;
            return;
        }
        const tokenData = res.data || {};
        const client_id = tokenData.clientId;
        const tenantNo = tokenData.tenantNo;

        let cookieAllInfo = ctx.request.body.cookieAllInfo;
        let etaxName = ctx.request.body.etaxName;
        let id = `${tenantNo}-${etaxName}-${account}`;
        ctx.request.query.pageId = id;
        if (!cookieAllInfo || cookieAllInfo.length === 0) {
            ctx.request.query.client_id = client_id;
            ctx.request.query.tenantNo = tenantNo;
            const resCheck = await ctx.service.newTime.prodCheckIsLogout(taxNo, account, 0, fixBaseUrl);
            if (resCheck.errcode !== '0000') {
                ctx.body = resCheck;
                return;
            }
            const resData = resCheck.data || {};
            cookieAllInfo = resData.cookieAllInfo;
            etaxName = resData.etaxName;
            id = `${tenantNo}-${etaxName}-${account}`;
        }
        if (!etaxName) {
            ctx.body = {
                ...errcodeInfo.argsErr,
                descirption: '城市信息不能为空'
            };
            return;
        }
        ctx.request.query.pageId = id;

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
            loginFrom: 'newTime',
            eUrl,
            taxNo,
            baseUrl,
            companyName: '',
            pageId: id,
            etaxAccountType: 3,
            loginedCookies,
            createTime: +new Date()
        };
        await pwyStore.set(etaxLoginedCachePreKey + id, fullInfo, 12 * 60 * 60);
        let gotoUrl = '';
        // 开票
        if (operationType === '1') {
            gotoUrl = `${baseUrl}/szzhzz/spHandler?cdlj=/blue-invoice-makeout&ruuid=` + (+new Date());
        } else {
            gotoUrl = `${baseUrl}/szzhzz/spHandler?cdlj=/digital-tax-account&ruuid=` + (+new Date());
        }
        const ntRes = await ctx.service.ntTools.getEtaxPage(gotoUrl, {
            id: id,
            partition: 'persist:' + id,
            ignoreGotoError: true
        });
        if (ntRes.errcode !== '0000') {
            ctx.body = ntRes;
            return;
        }
        const nt = ntRes.data;
        const win = nt.nightmareWindow.win;
        win.show();
        win.webContents.openDevTools({ 'mode': 'bottom' });
        ctx.body = errcodeInfo.success;
    }
}
